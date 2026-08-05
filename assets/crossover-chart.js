/**
 * Reusable crossover chart — two configurations plotted against a swept
 * interference level, with the point where the winner flips marked.
 *
 * Usage:
 *   <div class="crossover" data-crossover
 *        data-title="加不加波束成形，取决于环境有多吵"
 *        data-signal="48"
 *        data-x='{"from":20,"to":65,"label":"环境噪声","unit":"dB(A)"}'
 *        data-y='{"label":"实际信噪比","unit":"dB"}'
 *        data-series='[{"label":"单支麦","diffuse":0,"fixed":25},
 *                      {"label":"加差分式波束成形","diffuse":-4.7,"fixed":36.3}]'>
 *   </div>
 *   <script defer src="../assets/crossover-chart.js"></script>
 *
 * Each series models the audio case that keeps recurring: some noise scales
 * with the swept level and some does not.
 *   noise = (x + diffuse) ⊕ fixed        (⊕ = power sum)
 *   y     = signal − noise
 * `diffuse` is the gain applied to the swept term (array gain / DI, negative
 * means suppressed); `fixed` is the constant floor in the same units as x
 * (microphone self-noise after whatever the configuration does to it).
 *
 * Reusable wherever one option trades a fixed penalty for a scaling benefit:
 * NS on/off, mic A vs mic B, near vs far placement.
 */
const CO_X0 = 62;
const CO_X1 = 618;
const CO_Y0 = 22;
const CO_Y1 = 238;

function coSvg(name, attrs, text) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
}

const coPowerSum = (...db) => 10 * Math.log10(db.reduce((a, b) => a + 10 ** (b / 10), 0));

function mountCrossover(root) {
  if (root.dataset.mounted) return;
  root.dataset.mounted = "1";

  const series = JSON.parse(root.dataset.series || "[]");
  const xCfg = JSON.parse(root.dataset.x || '{"from":0,"to":60}');
  const yCfg = JSON.parse(root.dataset.y || "{}");
  const signal = Number(root.dataset.signal || 0);

  const at = (s, x) => signal - coPowerSum(x + (s.diffuse || 0), s.fixed);

  const xs = [];
  for (let x = xCfg.from; x <= xCfg.to + 1e-9; x += (xCfg.to - xCfg.from) / 200) xs.push(x);

  const ys = series.flatMap((s) => xs.map((x) => at(s, x)));
  const yLo = Math.floor(Math.min(...ys) / 5) * 5;
  const yHi = Math.ceil(Math.max(...ys) / 5) * 5;

  const px = (x) => CO_X0 + ((x - xCfg.from) / (xCfg.to - xCfg.from)) * (CO_X1 - CO_X0);
  const py = (y) => CO_Y1 - ((y - yLo) / (yHi - yLo || 1)) * (CO_Y1 - CO_Y0);

  // Where the second series overtakes the first.
  let cross = null;
  if (series.length === 2) {
    for (let i = 1; i < xs.length; i++) {
      const prev = at(series[1], xs[i - 1]) - at(series[0], xs[i - 1]);
      const curr = at(series[1], xs[i]) - at(series[0], xs[i]);
      if (prev < 0 !== curr < 0) {
        cross = xs[i - 1] + ((xs[i] - xs[i - 1]) * -prev) / (curr - prev);
        break;
      }
    }
  }

  root.innerHTML = `
    <p class="co-title"></p>
    <svg class="co-svg" viewBox="0 0 640 288" role="img"></svg>
    <p class="co-note"></p>
  `;
  root.querySelector(".co-title").textContent = root.dataset.title || "";
  const svg = root.querySelector(".co-svg");

  if (cross != null) {
    svg.appendChild(coSvg("rect", {
      x: CO_X0, y: CO_Y0, width: px(cross) - CO_X0, height: CO_Y1 - CO_Y0, class: "co-zone co-zone-bad"
    }));
    svg.appendChild(coSvg("rect", {
      x: px(cross), y: CO_Y0, width: CO_X1 - px(cross), height: CO_Y1 - CO_Y0, class: "co-zone co-zone-good"
    }));
  }

  const yStep = Math.max(5, Math.round((yHi - yLo) / 5 / 5) * 5);
  for (let y = yLo; y <= yHi; y += yStep) {
    svg.appendChild(coSvg("line", { x1: CO_X0, y1: py(y), x2: CO_X1, y2: py(y), class: "co-grid" }));
    svg.appendChild(coSvg("text", {
      x: CO_X0 - 8, y: py(y) + 3.5, class: "co-tick", "text-anchor": "end"
    }, String(y).replace("-", "−")));
  }
  const xStep = Math.max(5, Math.round((xCfg.to - xCfg.from) / 5 / 5) * 5);
  for (let x = Math.ceil(xCfg.from / xStep) * xStep; x <= xCfg.to; x += xStep) {
    svg.appendChild(coSvg("text", { x: px(x), y: CO_Y1 + 16, class: "co-tick", "text-anchor": "middle" }, `${x}`));
  }
  svg.appendChild(coSvg("line", { x1: CO_X0, y1: CO_Y1, x2: CO_X1, y2: CO_Y1, class: "co-axis" }));

  svg.appendChild(coSvg("text", {
    x: (CO_X0 + CO_X1) / 2, y: CO_Y1 + 34, class: "co-axis-label", "text-anchor": "middle"
  }, `${xCfg.label || ""} ${xCfg.unit ? `(${xCfg.unit})` : ""}`.trim()));
  svg.appendChild(coSvg("text", {
    x: 14, y: (CO_Y0 + CO_Y1) / 2, class: "co-axis-label", "text-anchor": "middle",
    transform: `rotate(-90 14 ${(CO_Y0 + CO_Y1) / 2})`
  }, `${yCfg.label || ""} ${yCfg.unit ? `(${yCfg.unit})` : ""}`.trim()));

  series.forEach((s, i) => {
    const pts = xs.map((x) => `${px(x).toFixed(1)},${py(at(s, x)).toFixed(1)}`).join(" ");
    svg.appendChild(coSvg("polyline", { points: pts, class: `co-line co-line-${i}` }));
    const endY = py(at(s, xCfg.to));
    svg.appendChild(coSvg("text", {
      x: CO_X1 - 6, y: endY - 7, class: `co-series-label co-series-${i}`, "text-anchor": "end"
    }, s.label));
  });

  if (cross != null) {
    svg.appendChild(coSvg("line", {
      x1: px(cross), y1: CO_Y0, x2: px(cross), y2: CO_Y1, class: "co-cross"
    }));
    svg.appendChild(coSvg("text", {
      x: px(cross), y: CO_Y0 - 6, class: "co-cross-label", "text-anchor": "middle"
    }, `翻转点 ≈ ${Math.round(cross)} ${xCfg.unit || ""}`));
  }

  const note = root.querySelector(".co-note");
  if (cross != null) {
    note.innerHTML =
      `左侧（比 ${Math.round(cross)} ${xCfg.unit || ""} 安静）：<strong>${series[0].label}</strong>更好——` +
      `此时限制你的是固定底噪，不是环境噪声。<br />` +
      `右侧（比 ${Math.round(cross)} ${xCfg.unit || ""} 吵）：<strong>${series[1].label}</strong>更好，` +
      `最多领先 <strong>${(at(series[1], xCfg.to) - at(series[0], xCfg.to)).toFixed(1)} dB</strong>。`;
  }
  if (root.dataset.note) note.innerHTML += `<br /><span class="meta">${root.dataset.note}</span>`;
}

document.querySelectorAll("[data-crossover]").forEach(mountCrossover);
