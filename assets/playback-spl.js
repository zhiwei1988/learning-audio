/**
 * Playback SPL chain calculator — turns a loudspeaker datasheet + a supply rail
 * into "how loud at the listener, and which ceiling stopped you".
 *
 * Two accounts are reported side by side, because they move in opposite
 * directions: the loudness account (SPL margin over ambient) and the echo
 * account (the ERLE ceiling that speaker distortion imposes on the AEC).
 *
 * Usage:
 *   <div class="pbspl" data-playback-spl
 *        data-title="..."
 *        data-presets='[{"label":"...","note":"...","values":{"sens":89,"refCm":10,
 *                        "imp":8,"vcc":12,"rated":1,"dist":3,"amb":55,"thd":10,
 *                        "strategy":"open"}}]'
 *        data-note="...">
 *   </div>
 *   <script defer src="../assets/playback-spl.js"></script>
 *
 * Reusable for any "sensitivity + power + distance → SPL, and which limit binds"
 * argument: siren/horn selection, enclosure changes, supply-rail changes,
 * speaker A vs speaker B.
 *
 * Math (all first-party sourced, see lesson 9):
 *   S@1m   = S@ref + 20·log10(refDistance / 1 m)          [inverse-square law]
 *   P_amp  = Vcc² / (2·R)                                  [ideal BTL, max sine]
 *   crest  = 12 dB for speech → peak/average power = 10^1.2 ≈ 15.85
 *   SPL    = S@1m + 10·log10(P_avg) − 20·log10(D)
 *   ERLEmax = −20·log10(THD)                               [distortion has no reference]
 */
const PB_CREST_DB = 12;
const PB_CREST = Math.pow(10, PB_CREST_DB / 10); // ≈ 15.85

const PB_FIELDS = [
  { key: "sens", label: "喇叭灵敏度 S", hint: "datasheet 的 sound pressure level，dB", min: 60, max: 120, step: 0.5 },
  { key: "refCm", label: "灵敏度的测试距离", hint: "datasheet 写 10 cm 就填 10，写 1 m 填 100", min: 1, max: 200, step: 1 },
  { key: "imp", label: "喇叭阻抗 R", hint: "Ω", min: 1, max: 32, step: 0.1 },
  { key: "vcc", label: "功放供电 Vcc", hint: "V，BTL 桥接输出", min: 1.8, max: 48, step: 0.1 },
  { key: "rated", label: "喇叭额定功率", hint: "W，连续（IEC-60268-5）", min: 0.05, max: 60, step: 0.05 },
  { key: "dist", label: "听音距离 D", hint: "m，人站在哪儿", min: 0.2, max: 30, step: 0.1 },
  { key: "amb", label: "环境噪声", hint: "dB(A)，现场实测", min: 20, max: 90, step: 1 },
  { key: "thd", label: "该电平下的 THD", hint: "%，datasheet 或实测", min: 0.1, max: 40, step: 0.1 },
];

const PB_STRATEGIES = [
  {
    key: "safe",
    label: "保守：峰值不超额定",
    blurb: "不知道喇叭的峰值能力时唯一安全的假设——把语音的峰压在额定功率以下。",
  },
  {
    key: "open",
    label: "放开峰值：平均不超额定",
    blurb: "允许语音的峰冲到额定功率的 15.8 倍，只保证平均功率不超额定。需要 Smart Amp 或厂商给出的峰值 SOA 背书，否则是赌。",
  },
];

function pbSvgEl(name, attrs, text) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
}

function pbFmt(v, d = 1) {
  return Number(v).toFixed(d);
}

function pbW(w) {
  if (w >= 1) return `${pbFmt(w, 2)} W`;
  if (w >= 0.01) return `${pbFmt(w, 3)} W`;
  return `${(w * 1000).toFixed(1)} mW`;
}

function mountPlaybackSpl(root) {
  if (root.dataset.mounted) return;
  root.dataset.mounted = "1";

  const title = root.dataset.title || "放音链路：能出多大声，谁先到天花板";
  const presets = JSON.parse(root.dataset.presets || "[]");
  const footNote = root.dataset.note || "";

  const state = Object.assign(
    { sens: 89, refCm: 10, imp: 8, vcc: 12, rated: 1, dist: 3, amb: 55, thd: 10, strategy: "open" },
    presets[0] ? presets[0].values : {}
  );

  root.innerHTML = `
    <p class="pb-title"></p>
    <div class="pb-presets"></div>
    <div class="pb-grid"></div>
    <div class="pb-strategy"></div>
    <p class="pb-strategy-blurb"></p>
    <svg class="pb-svg" viewBox="0 0 640 132" role="img"></svg>
    <div class="pb-steps"></div>
    <div class="pb-verdicts"></div>
    <p class="pb-note"></p>
  `;

  root.querySelector(".pb-title").textContent = title;
  root.querySelector(".pb-note").innerHTML = footNote;

  const presetBox = root.querySelector(".pb-presets");
  const grid = root.querySelector(".pb-grid");
  const stratBox = root.querySelector(".pb-strategy");
  const stratBlurb = root.querySelector(".pb-strategy-blurb");
  const svg = root.querySelector(".pb-svg");
  const steps = root.querySelector(".pb-steps");
  const verdicts = root.querySelector(".pb-verdicts");

  const inputs = {};
  PB_FIELDS.forEach((f) => {
    const label = document.createElement("label");
    label.innerHTML = `${f.label} <span class="hint">${f.hint}</span>`;
    const input = document.createElement("input");
    input.type = "number";
    input.min = f.min;
    input.max = f.max;
    input.step = f.step;
    input.value = state[f.key];
    input.addEventListener("input", () => {
      const v = Number(input.value);
      if (Number.isFinite(v)) {
        state[f.key] = v;
        presetBox.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
        render();
      }
    });
    inputs[f.key] = input;
    label.appendChild(input);
    grid.appendChild(label);
  });

  PB_STRATEGIES.forEach((s) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pb-btn";
    btn.dataset.strategy = s.key;
    btn.textContent = s.label;
    btn.addEventListener("click", () => {
      state.strategy = s.key;
      presetBox.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
      render();
    });
    stratBox.appendChild(btn);
  });

  presets.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pb-preset";
    btn.textContent = p.label;
    btn.title = p.note || "";
    btn.addEventListener("click", () => {
      Object.assign(state, p.values);
      PB_FIELDS.forEach((f) => (inputs[f.key].value = state[f.key]));
      render();
      presetBox.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === btn));
    });
    presetBox.appendChild(btn);
    if (i === 0) queueMicrotask(() => btn.classList.add("on"));
  });

  // ---- ceiling chart geometry (x axis is average power in dBW) ----
  const PB_X0 = 176;
  const PB_X1 = 604;
  const PB_LO = -30;
  const PB_HI = 20;
  const pbX = (dbw) => PB_X0 + ((Math.max(PB_LO, Math.min(PB_HI, dbw)) - PB_LO) / (PB_HI - PB_LO)) * (PB_X1 - PB_X0);

  function render() {
    const { sens, refCm, imp, vcc, rated, dist, amb, thd, strategy } = state;

    // 1. normalize datasheet sensitivity to 1 W / 1 m
    const refM = refCm / 100;
    const distCorr = 20 * Math.log10(refM / 1);
    const s1 = sens + distCorr;

    // 2. amplifier ceiling: max undistorted sine power, then de-rate by crest factor
    const pAmpPeak = (vcc * vcc) / (2 * imp);
    const pAmpAvg = pAmpPeak / PB_CREST;

    // 3. speaker ceiling, depending on what you dare assume about peaks
    const pSpkAvg = strategy === "safe" ? rated / PB_CREST : rated;

    const ceilings = [
      { name: "功放供电", detail: `Vcc²/(2R) = ${pbW(pAmpPeak)} 峰值 ÷ 15.8`, w: pAmpAvg },
      {
        name: strategy === "safe" ? "喇叭（峰值锁在额定）" : "喇叭（热限，平均）",
        detail: strategy === "safe" ? `额定 ${pbW(rated)} ÷ 15.8` : `额定 ${pbW(rated)}`,
        w: pSpkAvg,
      },
    ];
    const pUse = Math.min(...ceilings.map((c) => c.w));
    const binder = ceilings.find((c) => c.w === pUse);

    // 4. down the chain to the listener
    const spl1m = s1 + 10 * Math.log10(pUse);
    const splD = spl1m - 20 * Math.log10(dist);
    const target = amb + 10;
    const margin = splD - target;

    // 5. the other account: distortion is echo the AEC has no reference for
    const erleMax = -20 * Math.log10(thd / 100);

    // ---- strategy buttons ----
    stratBox.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.strategy === strategy));
    stratBlurb.textContent = PB_STRATEGIES.find((s) => s.key === strategy).blurb;

    // ---- ceiling bars ----
    svg.innerHTML = "";
    svg.appendChild(pbSvgEl("line", { x1: PB_X0, y1: 96, x2: PB_X1, y2: 96, class: "pb-axis" }));
    [-30, -20, -10, 0, 10, 20].forEach((t) => {
      svg.appendChild(pbSvgEl("line", { x1: pbX(t), y1: 92, x2: pbX(t), y2: 100, class: "pb-axis" }));
      svg.appendChild(pbSvgEl("text", { x: pbX(t), y: 114, class: "pb-tick", "text-anchor": "middle" }, `${t}`));
    });
    svg.appendChild(pbSvgEl("text", { x: (PB_X0 + PB_X1) / 2, y: 128, class: "pb-tick", "text-anchor": "middle" }, "允许的平均电功率（dB，相对 1 W）"));

    ceilings.forEach((c, i) => {
      const y = 20 + i * 34;
      const isBinder = c === binder;
      const dbw = 10 * Math.log10(c.w);
      svg.appendChild(pbSvgEl("text", { x: PB_X0 - 10, y: y + 13, class: "pb-row", "text-anchor": "end" }, c.name));
      svg.appendChild(pbSvgEl("rect", { x: PB_X0, y, width: Math.max(2, pbX(dbw) - PB_X0), height: 20, rx: 4, class: isBinder ? "pb-bar pb-bar-bind" : "pb-bar" }));
      svg.appendChild(pbSvgEl("text", { x: pbX(dbw) + 8, y: y + 14, class: isBinder ? "pb-val pb-val-bind" : "pb-val" }, `${pbW(c.w)}${isBinder ? "  ← 它先到" : ""}`));
    });

    // ---- step-by-step derivation, one conversion per row ----
    const rows = [
      ["① datasheet 灵敏度归一到 1 m", `${pbFmt(sens)} dB @1W/${refCm} cm，加 20·log₁₀(${pbFmt(refM, 2)} ÷ 1)`, `${pbFmt(s1)} dB @1W/1m`, ""],
      ["② 功放的不失真峰值功率", `${pbFmt(vcc)}² ÷ (2 × ${pbFmt(imp)})`, pbW(pAmpPeak), ""],
      ["③ 语音峰均比 12 dB → 折算平均", `${pbW(pAmpPeak)} ÷ 15.8`, `${pbW(pAmpAvg)} 平均`, ""],
      ["④ 喇叭允许的平均功率", ceilings[1].detail, pbW(pSpkAvg), ""],
      ["⑤ 两个天花板取小者", `min(${pbW(pAmpAvg)}, ${pbW(pSpkAvg)})`, pbW(pUse), `${binder.name}先到`],
      ["⑥ 1 m 处的声压级", `${pbFmt(s1)} + 10·log₁₀(${pbFmt(pUse, 3)})`, `${pbFmt(spl1m)} dB SPL`, ""],
      ["⑦ 走到 D 米", `${pbFmt(spl1m)} − 20·log₁₀(${pbFmt(dist)})`, `${pbFmt(splD)} dB SPL`, ""],
      ["⑧ 听得清的门槛", `环境 ${pbFmt(amb, 0)} dB(A) + 10`, `${pbFmt(target)} dB SPL`, "低于它就是「听不清」"],
      ["⑨ 响度余量", `${pbFmt(splD)} − ${pbFmt(target)}`, `${margin >= 0 ? "+" : "−"}${pbFmt(Math.abs(margin))} dB`, margin >= 0 ? "达标" : "不达标"],
      ["⑩ 失真给 ERLE 的天花板", `−20·log₁₀(${pbFmt(thd)}%)`, `${pbFmt(erleMax)} dB`, "AEC 再好也过不去"],
    ];

    steps.innerHTML = `
      <table class="ref">
        <thead><tr><th>步骤</th><th>算式</th><th>结果</th><th>读数</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (r, i) =>
                `<tr${i === 8 || i === 9 ? ' class="pb-key"' : ""}><td>${r[0]}</td><td class="pb-eq">${r[1]}</td><td><strong>${r[2]}</strong></td><td class="pb-read">${r[3]}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    // ---- two accounts, opposite signs ----
    const loudOk = margin >= 0;
    const loudClass = loudOk ? "good" : margin > -6 ? "warn" : "bad";
    const loudText = loudOk
      ? `在 ${pbFmt(dist)} m 处比环境噪声高 ${pbFmt(margin)} dB，够用。`
      : `在 ${pbFmt(dist)} m 处比「听得清」的门槛还差 ${pbFmt(-margin)} dB。要补上它，需要把电功率提高 ${pbFmt(-margin)} dB（${pbFmt(Math.pow(10, -margin / 10), 1)} 倍），或者换一颗灵敏度高 ${pbFmt(-margin)} dB 的喇叭。`;

    let behaviour;
    let echoClass;
    if (erleMax >= 30) {
      behaviour = "留得住 30 dB 以上的 ERLE——不是失真在拖后腿";
      echoClass = "good";
    } else if (erleMax >= 25) {
      behaviour = "刚好压在「远场可用」的下沿（业界惯例 25–30 dB ERLE）";
      echoClass = "warn";
    } else {
      behaviour = "低于业界惯例的 25 dB。残留回声会逼 NLP 加大压制，双讲被切掉 → P.340 Behaviour 3 风险";
      echoClass = "bad";
    }

    verdicts.innerHTML = `
      <div class="pb-verdict pb-${loudClass}">
        <span class="pb-vlabel">响度账</span>
        <strong>${pbFmt(splD)} dB SPL @ ${pbFmt(dist)} m</strong>，门槛 ${pbFmt(target)}。${loudText}
      </div>
      <div class="pb-verdict pb-${echoClass}">
        <span class="pb-vlabel">回声账</span>
        <strong>ERLE 上限 ${pbFmt(erleMax)} dB</strong>（THD ${pbFmt(thd)}%）。${behaviour}。
      </div>
    `;
  }

  render();
}

document.querySelectorAll("[data-playback-spl]").forEach(mountPlaybackSpl);
