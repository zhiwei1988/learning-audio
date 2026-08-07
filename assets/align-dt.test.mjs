// node --test assets/align-dt.test.mjs
// 对齐截取工具的验收测试：合成已知偏移/增益的 WAV，断言对齐误差与电平计算。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readWav, writeWav, findOffsetSamples, rmsDbfs, cutAligned, aHSDT } from './align-dt.mjs';

// 种子化 LCG——与 ab-repeat.js 同一做法：可复现的「随机」
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (1664525 * s + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
}

const SR = 16000;

function noiseBurst(seed, n, amp = 0.5) {
  const rnd = lcg(seed);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = rnd() * amp;
  return out;
}

// 把 ref 以 gain 嵌进长为 total 的底噪缓冲、起点 offset
function embed(ref, offset, total, gain, noiseAmp, seed = 7) {
  const rec = noiseBurst(seed, total, noiseAmp);
  for (let i = 0; i < ref.length; i++) rec[offset + i] += ref[i] * gain;
  return rec;
}

test('WAV 读写往返：16-bit PCM mono', () => {
  const samples = noiseBurst(1, SR); // 1 s
  const buf = writeWav(samples, SR);
  const back = readWav(buf);
  assert.equal(back.sampleRate, SR);
  assert.equal(back.samples.length, samples.length);
  let maxErr = 0;
  for (let i = 0; i < samples.length; i++) maxErr = Math.max(maxErr, Math.abs(back.samples[i] - samples[i]));
  assert.ok(maxErr < 1 / 32768 + 1e-7, `量化误差 ${maxErr} 超过 1 LSB`);
});

test('立体声 WAV 混为单声道读取', () => {
  const L = noiseBurst(2, 1000), R = noiseBurst(3, 1000);
  const inter = new Float32Array(2000);
  for (let i = 0; i < 1000; i++) { inter[2 * i] = L[i]; inter[2 * i + 1] = R[i]; }
  const buf = writeWav(inter, SR, 2);
  const back = readWav(buf);
  assert.equal(back.samples.length, 1000);
  assert.ok(Math.abs(back.samples[0] - (L[0] + R[0]) / 2) < 1e-3);
});

test('findOffsetSamples：干净嵌入，偏移 0.5 s，样本级命中', () => {
  const ref = noiseBurst(11, SR * 2); // 2 s 参考
  const rec = embed(ref, SR / 2, SR * 4, 0.8, 0);
  assert.equal(findOffsetSamples(ref, rec), SR / 2);
});

test('findOffsetSamples：带底噪 + 衰减 20 dB，误差 ≤ 1 样本', () => {
  const ref = noiseBurst(12, SR * 2);
  const rec = embed(ref, 12345, SR * 5, 0.1, 0.03); // 增益 0.1（−20 dB），底噪 0.03
  const got = findOffsetSamples(ref, rec);
  assert.ok(Math.abs(got - 12345) <= 1, `偏移 ${got}，期望 12345`);
});

test('rmsDbfs：满幅正弦 = −3.01 dBFS', () => {
  const n = SR;
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = Math.sin((2 * Math.PI * 1000 * i) / SR);
  assert.ok(Math.abs(rmsDbfs(s, 0, n) - -3.01) < 0.02);
});

test('cutAligned：同一参考窗在两段录音里截出同一内容', () => {
  const ref = noiseBurst(21, SR * 3);
  const recA = embed(ref, 4000, SR * 5, 0.5, 0.01, 8);
  const recB = embed(ref, 22000, SR * 5, 0.5, 0.01, 9);
  const win = { startSec: 1.0, endSec: 2.0 };
  const cutA = cutAligned(ref, recA, win);
  const cutB = cutAligned(ref, recB, win);
  assert.equal(cutA.length, SR);
  // 两段截出的内容都应与参考窗强相关（同一句话），残差远小于信号
  const refWin = ref.subarray(SR, 2 * SR);
  for (const cut of [cutA, cutB]) {
    let sig = 0, err = 0;
    for (let i = 0; i < SR; i++) {
      sig += (refWin[i] * 0.5) ** 2;
      err += (cut[i] - refWin[i] * 0.5) ** 2;
    }
    assert.ok(10 * Math.log10(sig / err) > 20, '截取内容与参考窗偏差过大');
  }
});

test('aHSDT：双讲录音比单讲低 6 dB → 差值 ≈ 6 dB', () => {
  const ref = noiseBurst(31, SR * 3);
  const st = embed(ref, 3000, SR * 5, 0.5, 0.005, 10); // 单讲
  const dt = embed(ref, 9000, SR * 5, 0.5 * Math.pow(10, -6 / 20), 0.005, 11); // 双讲被压 6 dB
  const { diffDb } = aHSDT(ref, st, dt, { startSec: 0.5, endSec: 2.5 });
  assert.ok(Math.abs(diffDb - 6) < 0.3, `差值 ${diffDb.toFixed(2)} dB，期望 6 dB`);
});
