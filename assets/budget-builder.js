/**
 * Reusable budget builder — spend a scarce resource across the stages of a
 * pipeline and watch the running total move against hard thresholds.
 *
 * Usage:
 *   <div class="budget" data-budget
 *        data-title="拖动每一档，看总数怎么变"
 *        data-unit="ms"
 *        data-items='[{"name":"抖动缓冲","own":false,"note":"接收侧",
 *                      "default":1,
 *                      "options":[{"label":"20 ms","v":20},{"label":"60 ms","v":60}]}]'
 *        data-thresholds='[{"at":150,"label":"G.114 透明区","tone":"good","verdict":"..."}]'
 *        data-over="越过最后一条线时说的话"
 *        data-presets='[{"label":"典型出厂配置","pick":[1]}]'>
 *   </div>
 *   <script defer src="../assets/budget-builder.js"></script>
 *
 * `own:false` marks a line you do not control (network transit, the far end).
 * Those segments render muted, and the summary reports the controllable
 * subtotal separately — the number that actually belongs in a design review.
 *
 * Reusable beyond latency: MIPS budget, bitrate budget, BOM cost, power.
 */
const BG_X0 = 8;
const BG_X1 = 632;
const BG_BAR_Y = 30;
const BG_BAR_H = 28;
const BG_HEIGHT = 84;

function bgSvg(name, attrs, text) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
}

function bgFmt(v, unit) {
  if (v <= 0) return `0 ${unit}`;
  if (v < 1) return `≈0 ${unit}`;
  return `${v % 1 ? v.toFixed(1) : v} ${unit}`;
}

function mountBudget(root) {
  if (root.dataset.mounted) return;
  root.dataset.mounted = "1";

  const items = JSON.parse(root.dataset.items || "[]");
  const thresholds = JSON.parse(root.dataset.thresholds || "[]").sort((a, b) => a.at - b.at);
  const presets = JSON.parse(root.dataset.presets || "[]");
  const unit = root.dataset.unit || "ms";
  const overText = root.dataset.over || "";
  const title = root.dataset.title || "预算表";

  const picks = items.map((it) => it.default || 0);

  root.innerHTML = `
    <p class="bg-title"></p>
    <div class="bg-presets"></div>
    <table class="bg-table"><tbody></tbody></table>
    <svg class="bg-svg" viewBox="0 0 640 ${BG_HEIGHT}" role="img"></svg>
    <p class="bg-summary"></p>
    <p class="bg-verdict"></p>
  `;
  root.querySelector(".bg-title").textContent = title;

  const presetBar = root.querySelector(".bg-presets");
  const tbody = root.querySelector(".bg-table tbody");
  const svg = root.querySelector(".bg-svg");
  const summary = root.querySelector(".bg-summary");
  const verdict = root.querySelector(".bg-verdict");

  const valueCells = [];
  const selects = [];

  items.forEach((item, i) => {
    const tr = document.createElement("tr");
    if (item.own === false) tr.classList.add("external");

    const th = document.createElement("th");
    th.innerHTML = `<span class="bg-name"></span>${item.note ? '<span class="bg-note"></span>' : ""}`;
    th.querySelector(".bg-name").textContent = item.name;
    if (item.note) th.querySelector(".bg-note").textContent = item.note;

    const pickCell = document.createElement("td");
    if (item.options.length > 1) {
      const sel = document.createElement("select");
      item.options.forEach((o, oi) => {
        const opt = document.createElement("option");
        opt.value = String(oi);
        opt.textContent = o.label;
        sel.appendChild(opt);
      });
      sel.value = String(picks[i]);
      sel.addEventListener("change", () => {
        picks[i] = Number(sel.value);
        render();
      });
      selects[i] = sel;
      pickCell.appendChild(sel);
    } else {
      pickCell.innerHTML = `<span class="bg-fixed"></span>`;
      pickCell.querySelector(".bg-fixed").textContent = item.options[0].label;
    }

    const valCell = document.createElement("td");
    valCell.className = "bg-val";
    valueCells[i] = valCell;

    tr.append(th, pickCell, valCell);
    tbody.appendChild(tr);
  });

  const totalRow = document.createElement("tr");
  totalRow.className = "bg-total-row";
  totalRow.innerHTML = `<th>合计</th><td></td><td class="bg-val bg-total"></td>`;
  tbody.appendChild(totalRow);
  const totalCell = totalRow.querySelector(".bg-total");

  presets.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bg-preset";
    btn.textContent = p.label;
    btn.addEventListener("click", () => {
      p.pick.forEach((v, i) => {
        if (i < picks.length) picks[i] = v;
      });
      selects.forEach((sel, i) => {
        if (sel) sel.value = String(picks[i]);
      });
      render();
    });
    presetBar.appendChild(btn);
  });

  function render() {
    const vals = items.map((it, i) => it.options[picks[i]].v);
    const total = vals.reduce((a, b) => a + b, 0);
    const ownTotal = vals.reduce((a, b, i) => a + (items[i].own === false ? 0 : b), 0);

    vals.forEach((v, i) => {
      valueCells[i].textContent = bgFmt(v, unit);
    });
    totalCell.textContent = bgFmt(total, unit);

    const maxThreshold = thresholds.length ? thresholds[thresholds.length - 1].at : total;
    const scale = Math.max(total, maxThreshold) * 1.06 || 1;
    const x = (v) => BG_X0 + (v / scale) * (BG_X1 - BG_X0);

    svg.textContent = "";
    svg.appendChild(bgSvg("rect", {
      x: BG_X0, y: BG_BAR_Y, width: BG_X1 - BG_X0, height: BG_BAR_H,
      rx: 5, class: "bg-track"
    }));

    let cursor = 0;
    vals.forEach((v, i) => {
      const w = x(cursor + v) - x(cursor);
      if (w > 0.4) {
        const seg = bgSvg("rect", {
          x: x(cursor), y: BG_BAR_Y, width: w, height: BG_BAR_H,
          class: items[i].own === false ? "bg-seg bg-seg-ext" : "bg-seg"
        });
        if (items[i].own !== false) seg.setAttribute("opacity", String(0.95 - (i % 4) * 0.18));
        seg.appendChild(bgSvg("title", {}, `${items[i].name} · ${bgFmt(v, unit)}`));
        svg.appendChild(seg);
      }
      cursor += v;
    });

    thresholds.forEach((t) => {
      if (t.at > scale) return;
      const flip = t.at / scale > 0.62;
      svg.appendChild(bgSvg("line", {
        x1: x(t.at), y1: BG_BAR_Y - 8, x2: x(t.at), y2: BG_BAR_Y + BG_BAR_H + 6,
        class: "bg-line"
      }));
      svg.appendChild(bgSvg("text", {
        x: x(t.at) + (flip ? -4 : 4), y: BG_BAR_Y - 12,
        class: "bg-line-label", "text-anchor": flip ? "end" : "start"
      }, `${t.at} ${unit} · ${t.label}`));
    });

    svg.appendChild(bgSvg("text", {
      x: Math.min(x(total), BG_X1 - 4), y: BG_BAR_Y + BG_BAR_H + 18,
      class: "bg-total-label", "text-anchor": total / scale > 0.85 ? "end" : "middle"
    }, bgFmt(total, unit)));

    const ranked = vals
      .map((v, i) => ({ v, name: items[i].name }))
      .sort((a, b) => b.v - a.v);
    const topTwo = ranked.slice(0, 2);
    const topSum = topTwo.reduce((a, b) => a + b.v, 0);

    summary.innerHTML =
      `最大两项：<strong>${topTwo.map((t) => `${t.name} ${bgFmt(t.v, unit)}`).join(" + ")}</strong>` +
      ` = 总数的 <strong>${Math.round((topSum / (total || 1)) * 100)}%</strong>。` +
      `<br />你能控制的部分：<strong>${bgFmt(ownTotal, unit)}</strong>` +
      `（其余 ${bgFmt(total - ownTotal, unit)} 在设备之外）。`;

    const hit = thresholds.find((t) => total <= t.at);
    verdict.className = "bg-verdict " + (hit ? hit.tone || "warn" : "bad");
    verdict.textContent = hit ? hit.verdict : overText;
  }

  render();
}

document.querySelectorAll("[data-budget]").forEach(mountBudget);
