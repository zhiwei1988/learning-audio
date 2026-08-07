// 双讲用例「同一句话对齐截取」工具（第 11 课首用）。
// 手工对齐的窗口错位是 a_H,S,DT / ERLE 差值法最大的误差项（3–5 dB，超过 P.340 3 dB 档宽）；
// 本工具用互相关把对齐做到样本级，把该误差项从账上划掉。
//
// 用法（离线，node 运行，零依赖）：
//   node assets/align-dt.mjs <参考素材.wav> <单讲录音.wav> [双讲录音.wav] [--window 起,止(秒)] [--json]
// 单个录音：报参考素材在录音中的偏移 + 指定窗的 RMS dBFS。
// 两个录音：同一参考窗在两段录音里各截一刀，报 a_H,S,DT = 单讲电平 − 双讲电平。
//
// 口径：全部电平为数字域 dBFS（满幅 = 0），只用于「同场、同素材、成对」的差值——绝对值不外报。

import { readFileSync } from 'node:fs';

// ---------- WAV ----------

export function readWav(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0, false) !== 0x52494646 || dv.getUint32(8, false) !== 0x57415645) {
    throw new Error('不是 RIFF/WAVE 文件');
  }
  let pos = 12, fmt = null, dataOff = -1, dataLen = 0;
  while (pos + 8 <= dv.byteLength) {
    const id = dv.getUint32(pos, false), size = dv.getUint32(pos + 4, true);
    if (id === 0x666d7420) { // 'fmt '
      fmt = {
        format: dv.getUint16(pos + 8, true),
        channels: dv.getUint16(pos + 10, true),
        sampleRate: dv.getUint32(pos + 12, true),
        bits: dv.getUint16(pos + 22, true),
      };
    } else if (id === 0x64617461) { // 'data'
      dataOff = pos + 8; dataLen = size;
    }
    pos += 8 + size + (size & 1);
  }
  if (!fmt || dataOff < 0) throw new Error('缺 fmt 或 data 块');
  const { format, channels, sampleRate, bits } = fmt;
  const bytes = bits / 8;
  const frames = Math.floor(dataLen / (bytes * channels));
  const samples = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let acc = 0;
    for (let c = 0; c < channels; c++) {
      const off = dataOff + (i * channels + c) * bytes;
      let v;
      if (format === 3 && bits === 32) v = dv.getFloat32(off, true);
      else if (format === 1 && bits === 16) v = dv.getInt16(off, true) / 32768;
      else if (format === 1 && bits === 32) v = dv.getInt32(off, true) / 2147483648;
      else if (format === 1 && bits === 24) {
        v = ((dv.getUint8(off) | (dv.getUint8(off + 1) << 8) | (dv.getInt8(off + 2) << 16)) / 8388608);
      } else throw new Error(`不支持的 WAV 格式：format=${format} bits=${bits}`);
      acc += v;
    }
    samples[i] = acc / channels;
  }
  return { sampleRate, samples };
}

export function writeWav(samples, sampleRate, channels = 1) {
  const frames = samples.length / channels;
  const dataLen = frames * channels * 2;
  const buf = Buffer.alloc(44 + dataLen);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataLen, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels, 22); buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * channels * 2, 28); buf.writeUInt16LE(channels * 2, 32);
  buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(dataLen, 40);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return buf;
}

// ---------- FFT 互相关 ----------

function fft(re, im, inverse) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 1 : -1) * 2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

// 参考素材在录音中的起始偏移（样本数）：corr = IFFT(FFT(rec)·conj(FFT(ref)))，取 argmax
export function findOffsetSamples(ref, rec) {
  let n = 1;
  while (n < ref.length + rec.length) n <<= 1;
  const ar = new Float64Array(n), ai = new Float64Array(n);
  const br = new Float64Array(n), bi = new Float64Array(n);
  ar.set(rec); br.set(ref);
  fft(ar, ai, false); fft(br, bi, false);
  for (let i = 0; i < n; i++) {
    const r = ar[i] * br[i] + ai[i] * bi[i];   // rec · conj(ref)
    const m = ai[i] * br[i] - ar[i] * bi[i];
    ar[i] = r; ai[i] = m;
  }
  fft(ar, ai, true);
  let best = 0, bestV = -Infinity;
  const maxLag = rec.length - 1;
  for (let i = 0; i <= maxLag; i++) if (ar[i] > bestV) { bestV = ar[i]; best = i; }
  return best;
}

// ---------- 电平与截取 ----------

export function rmsDbfs(samples, start = 0, end = samples.length) {
  let acc = 0;
  for (let i = start; i < end; i++) acc += samples[i] * samples[i];
  return 10 * Math.log10(acc / (end - start));
}

// 同一参考窗（相对参考素材的秒区间）在录音里截出对应片段
export function cutAligned(ref, rec, { startSec, endSec }, sampleRate = 16000, offset = null) {
  const off = offset ?? findOffsetSamples(ref, rec);
  const a = off + Math.round(startSec * sampleRate);
  const b = off + Math.round(endSec * sampleRate);
  if (a < 0 || b > rec.length) throw new Error(`对齐窗越界：偏移 ${off}，窗 [${a}, ${b}]，录音长 ${rec.length}`);
  return rec.subarray(a, b);
}

// a_H,S,DT = 单讲电平 − 双讲电平（同一参考窗，成对）
export function aHSDT(ref, stRec, dtRec, win, sampleRate = 16000) {
  const stOffset = findOffsetSamples(ref, stRec);
  const dtOffset = findOffsetSamples(ref, dtRec);
  const st = rmsDbfs(cutAligned(ref, stRec, win, sampleRate, stOffset));
  const dt = rmsDbfs(cutAligned(ref, dtRec, win, sampleRate, dtOffset));
  return { stDbfs: st, dtDbfs: dt, diffDb: st - dt, stOffset, dtOffset };
}

// ---------- CLI ----------

function loadWav(path) {
  const { sampleRate, samples } = readWav(readFileSync(path));
  return { sampleRate, samples };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const wIdx = args.indexOf('--window');
  const win = wIdx >= 0 ? (([a, b]) => ({ startSec: +a, endSec: +b }))(args[wIdx + 1].split(',')) : null;
  const files = args.filter((a, i) => !a.startsWith('--') && (wIdx < 0 || i !== wIdx + 1));
  if (files.length < 2 || !win) {
    console.error('用法: node assets/align-dt.mjs <参考.wav> <单讲录音.wav> [双讲录音.wav] --window 起,止 [--json]');
    process.exit(1);
  }
  const ref = loadWav(files[0]);
  const st = loadWav(files[1]);
  if (st.sampleRate !== ref.sampleRate) throw new Error('采样率不一致——先重采样到同一口径');
  let out;
  if (files.length >= 3) {
    const dt = loadWav(files[2]);
    if (dt.sampleRate !== ref.sampleRate) throw new Error('采样率不一致——先重采样到同一口径');
    const r = aHSDT(ref.samples, st.samples, dt.samples, win, ref.sampleRate);
    out = {
      window: win,
      singleTalk: { offsetSamples: r.stOffset, dbfs: +r.stDbfs.toFixed(2) },
      doubleTalk: { offsetSamples: r.dtOffset, dbfs: +r.dtDbfs.toFixed(2) },
      aHSDT_dB: +r.diffDb.toFixed(2),
    };
    if (!json) {
      console.log(`单讲窗电平  ${out.singleTalk.dbfs} dBFS（偏移 ${r.stOffset} 样本）`);
      console.log(`双讲窗电平  ${out.doubleTalk.dbfs} dBFS（偏移 ${r.dtOffset} 样本）`);
      console.log(`a_H,S,DT = ${out.aHSDT_dB} dB（查 P.340 表定档；本数仅供同场成对比较）`);
    }
  } else {
    const offset = findOffsetSamples(ref.samples, st.samples);
    const dbfs = rmsDbfs(cutAligned(ref.samples, st.samples, win, ref.sampleRate, offset));
    out = { window: win, offsetSamples: offset, dbfs: +dbfs.toFixed(2) };
    if (!json) console.log(`偏移 ${offset} 样本，窗电平 ${dbfs.toFixed(2)} dBFS`);
  }
  if (json) console.log(JSON.stringify(out, null, 2));
}
