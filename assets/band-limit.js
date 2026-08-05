/**
 * Reusable band-limit visualizer — shows which parts of the speech spectrum
 * survive a given sampling rate / codec, on a log frequency axis.
 *
 * Usage:
 *   <div class="band-limit" data-band-limit
 *        data-title="选一种编码，看它砍掉了什么"
 *        data-options='[{"label":"G.711 @ 8 kHz","cut":3400,"note":"..."}]'
 *        data-features='[{"lo":85,"hi":255,"label":"基频 F0","why":"..."}]'>
 *   </div>
 *   <script defer src="../assets/band-limit.js"></script>
 *
 * An option may set "dir":"low" to shade everything BELOW the cut instead of
 * above it — that is the loudspeaker case (nothing survives under Fo), as
 * opposed to the codec case (nothing survives above Nyquist).
 *
 * Reusable beyond codecs: microphone frequency response, speaker LFRO,
 * algorithm bandwidth — anything that answers "what falls off the edge?".
 */
const BL_MIN = 50;
const BL_MAX = 20000;
const BL_X0 = 118;
const BL_X1 = 620;
const BL_ROW_TOP = 44;
const BL_ROW_H = 30;

function blX(f) {
  const t = (Math.log10(f) - Math.log10(BL_MIN)) / (Math.log10(BL_MAX) - Math.log10(BL_MIN));
  return BL_X0 + Math.max(0, Math.min(1, t)) * (BL_X1 - BL_X0);
}

function blFmt(f) {
  return f >= 1000 ? `${(f / 1000).toFixed(f % 1000 ? 1 : 0)}k` : String(f);
}

function svgEl(name, attrs, text) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
}

function mountBandLimit(root) {
  if (root.dataset.mounted) return;
  root.dataset.mounted = "1";

  const options = JSON.parse(root.dataset.options || "[]");
  const features = JSON.parse(root.dataset.features || "[]");
  const title = root.dataset.title || "带宽对照";

  const height = BL_ROW_TOP + features.length * BL_ROW_H + 56;

  root.innerHTML = `
    <p class="bl-title"></p>
    <div class="bl-controls"></div>
    <svg class="bl-svg" viewBox="0 0 640 ${height}" role="img"></svg>
    <p class="bl-note"></p>
  `;
  root.querySelector(".bl-title").textContent = title;

  const controls = root.querySelector(".bl-controls");
  const svg = root.querySelector(".bl-svg");
  const note = root.querySelector(".bl-note");

  const axisY = BL_ROW_TOP + features.length * BL_ROW_H + 6;

  // Static layer: feature bands + axis
  features.forEach((f, i) => {
    const y = BL_ROW_TOP + i * BL_ROW_H;
    svg.appendChild(svgEl("text", { x: BL_X0 - 8, y: y + 14, class: "bl-row", "text-anchor": "end" }, f.label));
    svg.appendChild(svgEl("rect", {
      x: blX(f.lo), y, width: Math.max(2, blX(f.hi) - blX(f.lo)), height: 20,
      rx: 4, class: "bl-band"
    }));
    svg.appendChild(svgEl("text", {
      x: blX(f.lo) + 6, y: y + 14, class: "bl-band-label"
    }, `${blFmt(f.lo)}–${blFmt(f.hi)} Hz`));
  });

  svg.appendChild(svgEl("line", { x1: BL_X0, y1: axisY, x2: BL_X1, y2: axisY, class: "bl-axis" }));
  [100, 300, 1000, 3400, 7000, 20000].forEach((f) => {
    svg.appendChild(svgEl("line", { x1: blX(f), y1: axisY - 4, x2: blX(f), y2: axisY + 4, class: "bl-axis" }));
    svg.appendChild(svgEl("text", { x: blX(f), y: axisY + 18, class: "bl-tick", "text-anchor": "middle" }, `${blFmt(f)}Hz`));
  });

  // Dynamic layer: the cut
  const lost = svgEl("rect", { x: BL_X1, y: 26, width: 0, height: axisY - 30, rx: 4, class: "bl-lost" });
  const cutLine = svgEl("line", { x1: BL_X1, y1: 22, x2: BL_X1, y2: axisY, class: "bl-cut" });
  const cutLabel = svgEl("text", { x: BL_X1, y: 16, class: "bl-cut-label", "text-anchor": "middle" }, "");
  svg.appendChild(lost);
  svg.appendChild(cutLine);
  svg.appendChild(cutLabel);

  function select(opt, btn) {
    controls.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === btn));
    const low = opt.dir === "low";
    const x = blX(opt.cut);
    lost.setAttribute("x", low ? BL_X0 : x);
    lost.setAttribute("width", Math.max(0, low ? x - BL_X0 : BL_X1 - x));
    cutLine.setAttribute("x1", x);
    cutLine.setAttribute("x2", x);
    cutLabel.setAttribute("x", Math.max(BL_X0 + 44, Math.min(x, BL_X1 - 44)));
    cutLabel.textContent = `截止 ≈ ${blFmt(opt.cut)}Hz`;

    const dropped = features.filter((f) => (low ? f.lo < opt.cut : f.hi > opt.cut));
    const partly = dropped.filter((f) => (low ? f.hi > opt.cut : f.lo < opt.cut)).map((f) => f.label);
    const gone = dropped.filter((f) => (low ? f.hi <= opt.cut : f.lo >= opt.cut)).map((f) => f.label);
    const parts = [];
    if (gone.length) parts.push(`整段丢失：${gone.join("、")}`);
    if (partly.length) parts.push(`被削去${low ? "下" : "上"}半段：${partly.join("、")}`);
    if (!parts.length) parts.push("语音相关频段全部保留");
    note.innerHTML = `<strong>${opt.label}</strong> — ${parts.join("；")}。${opt.note ? " " + opt.note : ""}`;
  }

  options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bl-btn";
    btn.textContent = opt.label;
    btn.addEventListener("click", () => select(opt, btn));
    controls.appendChild(btn);
    if (i === 0) queueMicrotask(() => select(opt, btn));
  });
}

document.querySelectorAll("[data-band-limit]").forEach(mountBandLimit);
