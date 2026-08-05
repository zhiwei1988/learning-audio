/**
 * Reusable beam-pattern explorer — pick an array geometry and a frequency,
 * see the polar response, the directivity it actually buys, and the self-noise
 * it costs.
 *
 * Usage:
 *   <div class="beam" data-beam
 *        data-title="选一种阵列，看它在这个频率上真的指向了谁"
 *        data-modes='[{"id":"sum","label":"相加式"},{"id":"diff","label":"差分式"}]'
 *        data-counts='[2,4,8]'
 *        data-spacings='[10,21.25,40,80]'
 *        data-freqs='[300,500,1000,2000,4000,8000]'
 *        data-preset='{"mode":"sum","count":2,"spacing":21.25,"freq":500}'>
 *   </div>
 *   <script defer src="../assets/beam-pattern.js"></script>
 *
 * Two beamformer families, because they fail in opposite directions:
 *   sum  — broadside delay-and-sum, N mics. Needs aperture; grows grating
 *          lobes once spacing passes half a wavelength.
 *   diff — endfire first-order differential (cardioid), 2 mics. Works at any
 *          size, but its equalizer amplifies sensor noise as frequency drops.
 *
 * Reusable beyond microphones: speaker arrays, any aperture-vs-wavelength
 * argument where the answer is a polar plot.
 */
const BP_C = 343;
const BP_CX = 160;
const BP_CY = 152;
const BP_R = 116;
const BP_FLOOR = -25;

function bpSvg(name, attrs, text) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
}

/** Magnitude at angle psi (deg) off the look direction, normalised to 1 on axis. */
function bpResponse(mode, psiDeg, count, spacingMm, freq) {
  const kd = (2 * Math.PI * freq * (spacingMm / 1000)) / BP_C;
  if (mode === "diff") {
    const theta = (psiDeg * Math.PI) / 180;
    const norm = Math.sin(kd);
    if (Math.abs(norm) < 1e-9) return 1;
    return Math.abs(Math.sin((kd * (1 + Math.cos(theta))) / 2) / norm);
  }
  const theta = ((90 - psiDeg) * Math.PI) / 180;
  const phase = kd * Math.cos(theta);
  const den = Math.sin(phase / 2);
  if (Math.abs(den) < 1e-9) return 1;
  return Math.abs(Math.sin((count * phase) / 2) / (count * den));
}

/** Array gain against a spherically isotropic (diffuse) noise field, in dB. */
function bpDirectivityIndex(mode, count, spacingMm, freq) {
  const steps = 720;
  let acc = 0;
  for (let i = 0; i < steps; i++) {
    const axisDeg = ((i + 0.5) * 180) / steps;
    const psi = mode === "diff" ? axisDeg : 90 - axisDeg;
    const m = bpResponse(mode, psi, count, spacingMm, freq);
    acc += m * m * Math.sin((axisDeg * Math.PI) / 180) * (Math.PI / steps);
  }
  return 10 * Math.log10(1 / Math.max(acc / 2, 1e-9));
}

/** Array gain against uncorrelated sensor noise, in dB. Negative = self-noise amplified. */
function bpWhiteNoiseGain(mode, count, spacingMm, freq) {
  if (mode === "diff") {
    const kd = (2 * Math.PI * freq * (spacingMm / 1000)) / BP_C;
    return 10 * Math.log10(Math.max(2 * Math.sin(kd) ** 2, 1e-9));
  }
  return 10 * Math.log10(count);
}

/** Full −3 dB beamwidth in degrees, or null when the pattern never drops that far. */
function bpBeamwidth(mode, count, spacingMm, freq) {
  for (let psi = 0.5; psi <= 180; psi += 0.5) {
    if (bpResponse(mode, psi, count, spacingMm, freq) < Math.SQRT1_2) return psi * 2;
  }
  return null;
}

function bpFmtHz(f) {
  return f >= 1000 ? `${(f / 1000).toFixed(f % 1000 ? 1 : 0)} kHz` : `${f} Hz`;
}

function bpFmtMm(mm) {
  return `${mm % 1 ? mm.toFixed(2) : mm} mm`;
}

/** Typographic minus, so readouts match the prose. */
function bpFmtDb(db) {
  return `${db >= 0.05 ? "+" : ""}${db.toFixed(1)} dB`.replace("-", "−");
}

function mountBeamPattern(root) {
  if (root.dataset.mounted) return;
  root.dataset.mounted = "1";

  const modes = JSON.parse(root.dataset.modes || '[{"id":"sum","label":"相加式"},{"id":"diff","label":"差分式"}]');
  const counts = JSON.parse(root.dataset.counts || "[2,4,8]");
  const spacings = JSON.parse(root.dataset.spacings || "[10,21.25,40,80]");
  const freqs = JSON.parse(root.dataset.freqs || "[300,500,1000,2000,4000,8000]");
  const preset = JSON.parse(root.dataset.preset || "{}");

  const state = {
    mode: preset.mode || modes[0].id,
    count: preset.count || counts[0],
    spacing: preset.spacing != null ? preset.spacing : spacings[0],
    freq: preset.freq || freqs[Math.floor(freqs.length / 2)],
  };

  root.innerHTML = `
    <p class="beam-title"></p>
    <div class="beam-controls"></div>
    <div class="beam-body">
      <svg class="beam-svg" viewBox="0 0 320 332" role="img"></svg>
      <table class="beam-readout"><tbody></tbody></table>
    </div>
    <p class="beam-verdict"></p>
  `;
  root.querySelector(".beam-title").textContent = root.dataset.title || "波束图";

  const controls = root.querySelector(".beam-controls");
  const svg = root.querySelector(".beam-svg");
  const readout = root.querySelector(".beam-readout tbody");
  const verdict = root.querySelector(".beam-verdict");

  function addRow(label, values, key, format) {
    const row = document.createElement("div");
    row.className = "beam-row";
    row.dataset.key = key;
    const tag = document.createElement("span");
    tag.className = "beam-row-label";
    tag.textContent = label;
    row.appendChild(tag);
    values.forEach((v) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "beam-btn";
      btn.dataset.value = String(v);
      btn.textContent = format(v);
      btn.addEventListener("click", () => {
        state[key] = typeof v === "number" ? v : String(v);
        render();
      });
      row.appendChild(btn);
    });
    controls.appendChild(row);
    return row;
  }

  const modeRow = modes.length > 1
    ? addRow("阵列类型", modes.map((m) => m.id), "mode", (id) => modes.find((m) => m.id === id).label)
    : null;
  const countRow = addRow("麦克风数", counts, "count", (n) => `${n} 支`);
  addRow("间距", spacings, "spacing", bpFmtMm);
  addRow("频率", freqs, "freq", bpFmtHz);

  function drawFrame() {
    svg.textContent = "";
    [-20, -15, -10, -5].forEach((db) => {
      svg.appendChild(bpSvg("circle", {
        cx: BP_CX, cy: BP_CY, r: BP_R * (1 + db / -BP_FLOOR), class: "beam-ring"
      }));
    });
    svg.appendChild(bpSvg("circle", { cx: BP_CX, cy: BP_CY, r: BP_R, class: "beam-ring beam-ring-outer" }));
    for (let a = 0; a < 360; a += 30) {
      const rad = (a * Math.PI) / 180;
      svg.appendChild(bpSvg("line", {
        x1: BP_CX, y1: BP_CY,
        x2: BP_CX + BP_R * Math.sin(rad), y2: BP_CY - BP_R * Math.cos(rad),
        class: "beam-spoke"
      }));
    }
    [[0, "0°"], [90, "90°"], [180, "180°"], [270, "270°"]].forEach(([a, label]) => {
      const rad = (a * Math.PI) / 180;
      svg.appendChild(bpSvg("text", {
        x: BP_CX + (BP_R + 14) * Math.sin(rad),
        y: BP_CY - (BP_R + 14) * Math.cos(rad) + 4,
        class: "beam-axis-label", "text-anchor": "middle"
      }, label));
    });
    svg.appendChild(bpSvg("text", {
      x: BP_CX, y: BP_CY - BP_R - 22, class: "beam-look", "text-anchor": "middle"
    }, "↑ 说话人方向"));
    svg.appendChild(bpSvg("text", {
      x: 8, y: 326, class: "beam-scale"
    }, `外圈 0 dB，每圈 −5 dB，中心 −${-BP_FLOOR} dB`));
  }

  function drawArraySchematic() {
    const n = state.mode === "diff" ? 2 : state.count;
    const step = 9;
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * step;
      const cx = state.mode === "diff" ? BP_CX : BP_CX + off;
      const cy = state.mode === "diff" ? BP_CY - off : BP_CY;
      svg.appendChild(bpSvg("circle", { cx, cy, r: 2.6, class: "beam-mic" }));
    }
    svg.appendChild(bpSvg("text", {
      x: 8, y: 312, class: "beam-scale"
    }, state.mode === "diff" ? "红点 = 麦克风，端射（示意，不按比例）" : "红点 = 麦克风，边射（示意，不按比例）"));
  }

  function drawPattern() {
    const pts = [];
    for (let psi = -180; psi <= 180; psi += 1) {
      const mag = bpResponse(state.mode, psi, state.count, state.spacing, state.freq);
      const db = 20 * Math.log10(Math.max(mag, 1e-6));
      const r = BP_R * Math.max(0, (db - BP_FLOOR) / -BP_FLOOR);
      const rad = (psi * Math.PI) / 180;
      pts.push(`${(BP_CX + r * Math.sin(rad)).toFixed(2)},${(BP_CY - r * Math.cos(rad)).toFixed(2)}`);
    }
    svg.appendChild(bpSvg("polygon", { points: pts.join(" "), class: "beam-lobe" }));
  }

  function render() {
    if (state.mode === "diff") state.count = 2;
    countRow.classList.toggle("beam-row-off", state.mode === "diff");

    controls.querySelectorAll(".beam-row").forEach((row) => {
      row.querySelectorAll(".beam-btn").forEach((btn) => {
        btn.classList.toggle("on", btn.dataset.value === String(state[row.dataset.key]));
      });
    });
    if (modeRow) {
      modeRow.querySelectorAll(".beam-btn").forEach((btn) => {
        btn.classList.toggle("on", btn.dataset.value === state.mode);
      });
    }

    drawFrame();
    drawPattern();
    drawArraySchematic();

    const n = state.mode === "diff" ? 2 : state.count;
    const aperture = (n - 1) * state.spacing;
    const di = bpDirectivityIndex(state.mode, n, state.spacing, state.freq);
    const wng = bpWhiteNoiseGain(state.mode, n, state.spacing, state.freq);
    const bw = bpBeamwidth(state.mode, n, state.spacing, state.freq);
    const fAlias = BP_C / (2 * (state.spacing / 1000));
    const fCut = BP_C / (4 * (state.spacing / 1000));

    const rows = [
      ["阵列孔径", aperture > 0 ? bpFmtMm(Number(aperture.toFixed(2))) : "—"],
      ["指向性指数 DI", bpFmtDb(di)],
      ["白噪声增益 WNG", bpFmtDb(wng)],
      ["−3 dB 波束宽度", bw ? `${Math.round(bw)}°` : "无（全向）"],
      [
        state.mode === "diff" ? "差分截止频率 c/4d" : "空间混叠频率 c/2d",
        bpFmtHz(Math.round(state.mode === "diff" ? fCut : fAlias)),
      ],
    ];
    readout.innerHTML = "";
    rows.forEach(([k, v]) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.textContent = k;
      const td = document.createElement("td");
      td.textContent = v;
      tr.append(th, td);
      readout.appendChild(tr);
    });

    const parts = [];
    let tone = "good";
    if (di < 0) {
      tone = "bad";
      parts.push(`DI 是负的（${bpFmtDb(di)}）——在 ${bpFmtHz(state.freq)} 上阵列反而<strong>衰减了正前方</strong>，比一支全向麦还糟。`);
    } else if (di < 1) {
      tone = "bad";
      parts.push(`DI 只有 ${di.toFixed(1)} dB——在 ${bpFmtHz(state.freq)} 上，这套阵列基本还是全向的，波束成形什么都没买到。`);
    } else if (di < 4) {
      tone = "warn";
      parts.push(`DI ${di.toFixed(1)} dB：有一点指向性，但不足以在评审桌上当卖点。`);
    } else {
      parts.push(`DI ${di.toFixed(1)} dB：等于把弥散噪声压低 ${di.toFixed(1)} dB，混响半径拉远约 ${Math.pow(10, di / 20).toFixed(1)} 倍。`);
    }
    if (state.mode === "sum" && state.freq > fAlias) {
      tone = "bad";
      parts.push(`频率已越过 c/2d = ${bpFmtHz(Math.round(fAlias))}：图上与主瓣一样高的那几瓣是栅瓣（grating lobe），侧面的噪声会被原样收进来。`);
    }
    if (state.mode === "diff" && state.freq > fCut) {
      tone = "bad";
      parts.push(`频率已越过差分式的上限 c/4d = ${bpFmtHz(Math.round(fCut))}：指向图开始变形，再往上到 c/2d 时正前方会被直接抵消。`);
    }
    if (state.mode === "diff" && wng < -6) {
      if (tone === "good") tone = "warn";
      parts.push(`代价：WNG ${bpFmtDb(wng)}——麦克风自身的底噪被放大了 ${(-wng).toFixed(1)} dB。指向性是拿信噪比换的。`);
    }
    verdict.className = "beam-verdict " + tone;
    verdict.innerHTML = parts.join(" ");
  }

  render();
}

document.querySelectorAll("[data-beam]").forEach(mountBeamPattern);
