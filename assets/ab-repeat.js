/**
 * Reusable A/B repeatability simulator — "is the difference you measured real?"
 *
 * Usage:
 *   <div class="abrep" data-ab-repeat
 *        data-title="同一个真实差异，两种测法"
 *        data-unit="dB"
 *        data-labels='["配置 A","配置 B"]'
 *        data-truths='[0.2,0.5,1,2]'
 *        data-withins='[0.2,0.5,1]'
 *        data-biases='[0,0.5,1.5]'
 *        data-repeats='[1,3,10,30]'
 *        data-preset='{"truth":0.5,"within":0.5,"bias":1.5,"n":3,"design":"split"}'>
 *   </div>
 *   <script defer src="../assets/ab-repeat.js"></script>
 *
 * The model behind it is the one that decides whether any comparison holds up:
 * every measurement carries two independent errors.
 *   within — repeat-to-repeat scatter inside one session
 *   bias   — a whole-session offset (room, gain, level, listener panel, weather)
 *
 * "split"  measures A in one session and B in another, so the difference eats
 *          two independent biases and no amount of repeating removes them.
 * "paired" measures A and B back-to-back inside each repeat, so the shared bias
 *          cancels in the difference and repeats actually buy precision.
 *
 *   split  95% error bar = 1.96 · √(2·bias² + 2·within²/n)
 *   paired 95% error bar = 1.96 · within · √(2/n)
 *
 * Reusable for any A vs B claim measured with noise: mic A vs mic B, algorithm
 * versions, bitrate rungs, MOS panels, before/after a firmware change.
 */
const AR_X0 = 74;
const AR_X1 = 606;
const AR_SY0 = 24;
const AR_SY1 = 168;
const AR_DY = 232;
const AR_TRIALS = 2000;

function arSvg(name, attrs, text) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
}

const arNum = (v, d = 2) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(d);

/** Seeded LCG + Box-Muller, so "重掷" is the only thing that changes the draw. */
function arRandom(seed) {
  let s = seed >>> 0 || 1;
  const uniform = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  return () => {
    const u = Math.max(uniform(), 1e-12);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * uniform());
  };
}

/**
 * One run of the whole experiment. Returns each side's raw measurements, so the
 * scatter can show the bias visibly moving the clouds around.
 */
function arRun(cfg, gauss) {
  const { truth, within, bias, n, design } = cfg;
  const a = [];
  const b = [];
  const biasA = design === "split" ? gauss() * bias : 0;
  const biasB = design === "split" ? gauss() * bias : 0;
  for (let i = 0; i < n; i++) {
    // Paired: A and B are measured back-to-back, so they share this repeat's drift.
    const shared = design === "paired" ? gauss() * bias : 0;
    a.push(truth + biasA + shared + gauss() * within);
    b.push(0 + biasB + shared + gauss() * within);
  }
  const mean = (xs) => xs.reduce((p, c) => p + c, 0) / xs.length;
  return { a, b, meanA: mean(a), meanB: mean(b), diff: mean(a) - mean(b) };
}

const arErrorBar = ({ within, bias, n, design }) =>
  1.96 *
  Math.sqrt(design === "split" ? 2 * bias ** 2 + (2 * within ** 2) / n : (2 * within ** 2) / n);

/** Rerun the experiment many times: how often would this design mislead you? */
function arOutcomes(cfg) {
  const gauss = arRandom(20260804);
  const half = arErrorBar(cfg);
  let right = 0;
  let none = 0;
  let flipped = 0;
  for (let t = 0; t < AR_TRIALS; t++) {
    const d = arRun(cfg, gauss).diff;
    if (Math.abs(d) <= half) none++;
    else if (d > 0 === cfg.truth > 0) right++;
    else flipped++;
  }
  return {
    right: (right / AR_TRIALS) * 100,
    none: (none / AR_TRIALS) * 100,
    flipped: (flipped / AR_TRIALS) * 100,
  };
}

function mountAbRepeat(root) {
  if (root.dataset.mounted) return;
  root.dataset.mounted = "1";

  const unit = root.dataset.unit || "dB";
  const labels = JSON.parse(root.dataset.labels || '["配置 A","配置 B"]');
  const truths = JSON.parse(root.dataset.truths || "[0.2,0.5,1,2]");
  const withins = JSON.parse(root.dataset.withins || "[0.2,0.5,1]");
  const biases = JSON.parse(root.dataset.biases || "[0,0.5,1.5]");
  const repeats = JSON.parse(root.dataset.repeats || "[1,3,10,30]");
  const preset = JSON.parse(root.dataset.preset || "{}");

  const cfg = {
    truth: preset.truth ?? truths[1],
    within: preset.within ?? withins[1],
    bias: preset.bias ?? biases[biases.length - 1],
    n: preset.n ?? repeats[1],
    design: preset.design || "split",
  };
  let seed = 7;

  root.innerHTML = `
    <p class="ar-title"></p>
    <div class="ar-controls">
      <div class="ar-row" data-key="design"><span class="ar-row-label">测试设计</span></div>
      <div class="ar-row" data-key="truth"><span class="ar-row-label">真实差异</span></div>
      <div class="ar-row" data-key="within"><span class="ar-row-label">单次抖动</span></div>
      <div class="ar-row" data-key="bias"><span class="ar-row-label">场次偏置</span></div>
      <div class="ar-row" data-key="n"><span class="ar-row-label">各测几次</span></div>
    </div>
    <svg class="ar-svg" viewBox="0 0 640 296" role="img"></svg>
    <div class="ar-foot">
      <table class="ar-readout"><tbody></tbody></table>
      <button type="button" class="ar-reroll">↻ 重新做一次这个实验</button>
    </div>
    <p class="ar-verdict"></p>
  `;
  root.querySelector(".ar-title").textContent = root.dataset.title || "";

  const rows = {
    design: [
      { v: "split", label: "分开测（A 今天，B 明天）" },
      { v: "paired", label: "配对测（同一场交替）" },
    ],
    truth: truths.map((v) => ({ v, label: `${arNum(v, 1)} ${unit}` })),
    within: withins.map((v) => ({ v, label: `±${v} ${unit}` })),
    bias: biases.map((v) => ({ v, label: v === 0 ? `无` : `±${v} ${unit}` })),
    n: repeats.map((v) => ({ v, label: `${v} 次` })),
  };

  for (const [key, opts] of Object.entries(rows)) {
    const row = root.querySelector(`.ar-row[data-key="${key}"]`);
    for (const opt of opts) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ar-btn";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        cfg[key] = opt.v;
        seed++;
        render();
      });
      row.appendChild(btn);
      opt.btn = btn;
    }
  }

  root.querySelector(".ar-reroll").addEventListener("click", () => {
    seed++;
    render();
  });

  const svg = root.querySelector(".ar-svg");
  const tbody = root.querySelector(".ar-readout tbody");
  const verdict = root.querySelector(".ar-verdict");

  function render() {
    for (const [key, opts] of Object.entries(rows)) {
      opts.forEach((o) => o.btn.classList.toggle("on", cfg[key] === o.v));
    }

    const run = arRun(cfg, arRandom(seed * 2654435761));
    const half = arErrorBar(cfg);
    const out = arOutcomes(cfg);

    svg.textContent = "";

    // ---------------------------------------------------------- scatter
    const pts = [...run.a, ...run.b];
    const lo = Math.min(...pts, -0.5);
    const hi = Math.max(...pts, cfg.truth + 0.5);
    const pad = (hi - lo) * 0.15 || 0.5;
    const sy = (v) => AR_SY1 - ((v - lo + pad) / (hi - lo + 2 * pad)) * (AR_SY1 - AR_SY0);
    const colX = (i) => AR_X0 + 40 + (i / Math.max(cfg.n - 1, 1)) * (AR_X1 - AR_X0 - 90);

    svg.appendChild(arSvg("text", { x: AR_X0 - 8, y: AR_SY0 + 4, class: "ar-cap", "text-anchor": "end" }, `测得值 (${unit})`));

    // A tight race puts the two mean lines almost on top of each other, so the
    // labels get pushed apart — the lines themselves must stay where they are.
    const gap = sy(run.meanB) - sy(run.meanA);
    const nudge = Math.abs(gap) < 14 ? (14 - Math.abs(gap)) / 2 : 0;

    [{ key: "a", mean: run.meanA, cls: 0, lift: gap >= 0 ? -nudge : nudge },
     { key: "b", mean: run.meanB, cls: 1, lift: gap >= 0 ? nudge : -nudge }].forEach((s) => {
      svg.appendChild(arSvg("line", {
        x1: AR_X0, y1: sy(s.mean), x2: AR_X1 - 44, y2: sy(s.mean), class: `ar-mean ar-c${s.cls}`,
      }));
      svg.appendChild(arSvg("text", {
        x: AR_X1 - 38, y: sy(s.mean) + 4 + s.lift, class: `ar-series ar-f${s.cls}`,
      }, labels[s.cls]));
      run[s.key].forEach((v, i) => {
        svg.appendChild(arSvg("circle", {
          cx: colX(i) + (s.cls === 0 ? -5 : 5), cy: sy(v), r: cfg.n > 12 ? 2.6 : 3.6,
          class: `ar-dot ar-d${s.cls}`,
        }));
      });
    });

    svg.appendChild(arSvg("text", {
      x: (AR_X0 + AR_X1) / 2, y: AR_SY1 + 22, class: "ar-cap", "text-anchor": "middle",
    }, `每台各测 ${cfg.n} 次${cfg.design === "paired" ? "（同场交替，两组一起漂）" : "（分两场，各自漂各自的）"}`));

    // -------------------------------------------------------- difference
    const span = Math.max(Math.abs(run.diff) + half, Math.abs(cfg.truth), 0.4) * 1.2;
    const dx = (v) => (AR_X0 + AR_X1) / 2 + (v / span) * ((AR_X1 - AR_X0) / 2 - 30);

    svg.appendChild(arSvg("text", { x: AR_X0 - 8, y: AR_DY - 22, class: "ar-cap", "text-anchor": "end" }, "差值"));
    svg.appendChild(arSvg("line", { x1: dx(-span), y1: AR_DY, x2: dx(span), y2: AR_DY, class: "ar-axis" }));
    svg.appendChild(arSvg("line", { x1: dx(0), y1: AR_DY - 30, x2: dx(0), y2: AR_DY + 16, class: "ar-zero" }));
    // Zero and truth get their own rows: they collide horizontally whenever the
    // true difference is small, which is exactly the case worth looking at.
    svg.appendChild(arSvg("text", { x: dx(0), y: AR_DY + 29, class: "ar-cap", "text-anchor": "middle" }, "0 = 两台一样"));

    const crossesZero = Math.abs(run.diff) <= half;
    svg.appendChild(arSvg("rect", {
      x: dx(run.diff - half), y: AR_DY - 9, width: Math.max(dx(run.diff + half) - dx(run.diff - half), 2),
      height: 18, rx: 3, class: `ar-bar ${crossesZero ? "ar-bar-bad" : "ar-bar-good"}`,
    }));
    svg.appendChild(arSvg("line", {
      x1: dx(run.diff), y1: AR_DY - 13, x2: dx(run.diff), y2: AR_DY + 13, class: "ar-diff",
    }));
    svg.appendChild(arSvg("text", {
      x: dx(run.diff), y: AR_DY - 19, class: "ar-diff-label", "text-anchor": "middle",
    }, `测得 ${arNum(run.diff)}`));
    svg.appendChild(arSvg("line", {
      x1: dx(cfg.truth), y1: AR_DY + 10, x2: dx(cfg.truth), y2: AR_DY + 38, class: "ar-truth",
    }));
    svg.appendChild(arSvg("text", {
      x: dx(cfg.truth), y: AR_DY + 50, class: "ar-truth-label", "text-anchor": "middle",
    }, `真值 ${arNum(cfg.truth, 1)}`));

    // ---------------------------------------------------------- readout
    const formula =
      cfg.design === "paired"
        ? `1.96 × ${cfg.within} × √(2/${cfg.n})`
        : `1.96 × √(2×${cfg.bias}² + 2×${cfg.within}²/${cfg.n})`;
    tbody.innerHTML = `
      <tr><th>本次测到的差值</th><td>${arNum(run.diff)} ${unit}</td></tr>
      <tr><th>95% 误差棒（半宽）<span class="ar-sub">${formula}</span></th><td>±${half.toFixed(2)} ${unit}</td></tr>
      <tr><th>场次偏置进不进差值</th><td class="ar-word">${
        cfg.design === "paired" ? "抵消掉了" : `两份，共 ±${(1.96 * Math.SQRT2 * cfg.bias).toFixed(2)}`
      }</td></tr>
      <tr><th>把这场实验重做 ${AR_TRIALS} 次</th><td class="ar-word">${out.right.toFixed(
      0
    )}% 对 / ${out.none.toFixed(0)}% 测不出 / ${out.flipped.toFixed(0)}% 反了</td></tr>
    `;

    // ---------------------------------------------------------- verdict
    const floor = 1.96 * Math.SQRT2 * cfg.bias;
    if (crossesZero) {
      verdict.className = "ar-verdict bad";
      verdict.innerHTML =
        `误差棒跨过 0 —— <strong>这次测不出差别</strong>。真实差异 ${arNum(cfg.truth, 1)} ${unit} 确实存在，` +
        `但比误差棒 ±${half.toFixed(2)} 小，被抖动淹没了。` +
        (cfg.design === "split" && floor > Math.abs(cfg.truth)
          ? `<br />注意：分开测时误差棒<strong>压不到 ±${floor.toFixed(2)} 以下</strong>——` +
            `再加测多少次都没用，场次偏置是地板。<strong>要改的是设计，不是次数。</strong>`
          : `<br />把「各测几次」加大，或改用配对测。`);
    } else if (run.diff > 0 === cfg.truth > 0) {
      verdict.className = "ar-verdict good";
      verdict.innerHTML =
        `误差棒不跨 0 —— <strong>这次结论成立，方向也对</strong>。` +
        (out.right < 80
          ? `但看最后一行：同样的设计重做 ${AR_TRIALS} 次，<strong>只有 ${out.right.toFixed(
              0
            )}%</strong> 会得到这个结论。<br /><strong>这次你运气不错，不代表这个测法可靠。</strong>`
          : `而且看最后一行：同样的设计重做 ${AR_TRIALS} 次，<strong>${out.right.toFixed(
              0
            )}% 都会得到这个结论</strong>——这次不是运气，<strong>这个测法站得住</strong>。`);
    } else {
      verdict.className = "ar-verdict bad";
      verdict.innerHTML =
        `误差棒不跨 0，于是你会写进报告——<strong>但方向是反的</strong>。` +
        `真值是 ${arNum(cfg.truth, 1)}，你测到 ${arNum(run.diff)}。` +
        `<br /><strong>这是最坏的一种失败：它看起来像个结论。</strong>`;
    }
  }

  render();
}

document.querySelectorAll("[data-ab-repeat]").forEach(mountAbRepeat);
