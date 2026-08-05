/**
 * Reusable multi-ledger budget — one set of choices, several accounts settled
 * at once, so you can see *which* wall you hit first.
 *
 * budget-builder.js answers "how much of one resource am I spending?".
 * This one answers "the same knob moves four numbers — which one runs out?".
 *
 * Usage:
 *   <div class="mledger" data-mledger
 *        data-title="拨一拨，看四本账同时动"
 *        data-choices='[{"name":"回声尾长","note":"AEC","default":3,
 *                        "options":[{"label":"32 ms","d":{"mips":32.8,"mem":81.1}},
 *                                   {"label":"8 kHz","mul":{"mips":0.5}}]}]'
 *        data-ledgers='[{"key":"mips","label":"算力","unit":"MIPS","cap":200,
 *                        "capLabel":"C5517 @200 MHz","soft":160,"softLabel":"留 20% 余量"},
 *                       {"key":"usd","label":"BOM 增量","unit":"$","decimals":2}]'
 *        data-derived='[{"label":"核心功耗","unit":"mW","from":"mips",
 *                        "steps":[{"upto":75,"v":26.9,"note":"1.05 V · 75 MHz"}],
 *                        "over":"这颗芯片跑不动"}]'
 *        data-presets='[{"label":"方案商默认","pick":[3,0,0,0]}]'>
 *   </div>
 *   <script defer src="../assets/multi-ledger.js"></script>
 *
 * An option contributes `d` (added to each ledger) and/or `mul` (a multiplier
 * applied to the whole ledger — use for global scalings like sample rate).
 * A ledger without `cap` renders as a bare number: an account you watch but
 * do not have a hard limit for.
 *
 * A `derived` ledger is not summed — it is *looked up* from another ledger's
 * total through a step table. That is how you model a resource sold in tiers
 * (voltage/frequency steps, amplifier classes, bandwidth plans): the price
 * jumps at the step, not at the margin.
 *
 * Reusable beyond MIPS: memory, board area, power, BOM cost, bitrate.
 */
const ML_X0 = 6;
const ML_X1 = 634;
const ML_BAR_Y = 16;
const ML_BAR_H = 22;
const ML_HEIGHT = 56;

function mlSvg(name, attrs, text) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
}

function mlFmt(v, unit, decimals) {
  const d = decimals == null ? 1 : decimals;
  const n = Math.abs(v) < 1e-9 ? 0 : v;
  return `${Number.isInteger(n) ? n : n.toFixed(d)} ${unit}`;
}

function mountLedger(root) {
  if (root.dataset.mounted) return;
  root.dataset.mounted = "1";

  const choices = JSON.parse(root.dataset.choices || "[]");
  const ledgers = JSON.parse(root.dataset.ledgers || "[]");
  const derived = JSON.parse(root.dataset.derived || "[]");
  const presets = JSON.parse(root.dataset.presets || "[]");
  const title = root.dataset.title || "预算表";

  const picks = choices.map((c) => c.default || 0);

  root.innerHTML = `
    <p class="ml-title"></p>
    <div class="ml-presets"></div>
    <table class="ml-table"><tbody></tbody></table>
    <div class="ml-ledgers"></div>
    <p class="ml-derived"></p>
    <p class="ml-verdict"></p>
  `;
  root.querySelector(".ml-title").textContent = title;

  const presetBar = root.querySelector(".ml-presets");
  const tbody = root.querySelector(".ml-table tbody");
  const ledgerBox = root.querySelector(".ml-ledgers");
  const derivedLine = root.querySelector(".ml-derived");
  const verdict = root.querySelector(".ml-verdict");

  const deltaCells = [];
  const selects = [];

  choices.forEach((choice, i) => {
    const tr = document.createElement("tr");
    if (choice.fixed) tr.classList.add("fixed");

    const th = document.createElement("th");
    th.innerHTML = `<span class="ml-name"></span>${choice.note ? '<span class="ml-note"></span>' : ""}`;
    th.querySelector(".ml-name").textContent = choice.name;
    if (choice.note) th.querySelector(".ml-note").textContent = choice.note;

    const pickCell = document.createElement("td");
    if (choice.options.length > 1) {
      const sel = document.createElement("select");
      choice.options.forEach((o, oi) => {
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
      pickCell.innerHTML = `<span class="ml-single"></span>`;
      pickCell.querySelector(".ml-single").textContent = choice.options[0].label;
    }

    const deltaCell = document.createElement("td");
    deltaCell.className = "ml-delta";
    deltaCells[i] = deltaCell;

    tr.append(th, pickCell, deltaCell);
    tbody.appendChild(tr);
  });

  const views = ledgers.map((led) => {
    const wrap = document.createElement("div");
    wrap.className = "ml-ledger";
    wrap.innerHTML = `
      <div class="ml-head">
        <span class="ml-led-name"></span>
        <span class="ml-num"></span>
      </div>
      ${led.cap ? `<svg class="ml-svg" viewBox="0 0 640 ${ML_HEIGHT}" role="img"></svg>` : ""}
    `;
    wrap.querySelector(".ml-led-name").textContent = led.label;
    ledgerBox.appendChild(wrap);
    return {
      num: wrap.querySelector(".ml-num"),
      svg: wrap.querySelector(".ml-svg"),
      wrap,
    };
  });

  presets.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ml-preset";
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
    const chosen = choices.map((c, i) => c.options[picks[i]]);

    const totals = {};
    ledgers.forEach((led) => {
      const sum = chosen.reduce((acc, o) => acc + ((o.d && o.d[led.key]) || 0), 0);
      const mul = chosen.reduce((acc, o) => acc * ((o.mul && o.mul[led.key]) || 1), 1);
      totals[led.key] = sum * mul;
    });

    chosen.forEach((o, i) => {
      const parts = ledgers
        .map((led) => {
          if (o.mul && o.mul[led.key] != null) return `×${o.mul[led.key]} ${led.unit}`;
          const v = (o.d && o.d[led.key]) || 0;
          return v ? mlFmt(v, led.unit, led.decimals) : null;
        })
        .filter(Boolean);
      deltaCells[i].textContent = parts.length ? parts.join(" · ") : "—";
    });

    ledgers.forEach((led, li) => {
      const view = views[li];
      const total = totals[led.key];
      const mul = chosen.reduce((acc, o) => acc * ((o.mul && o.mul[led.key]) || 1), 1);

      if (!led.cap) {
        view.num.textContent = mlFmt(total, led.unit, led.decimals);
        view.num.className = "ml-num";
        return;
      }

      const pct = (total / led.cap) * 100;
      view.num.innerHTML =
        `<strong>${total.toFixed(led.decimals == null ? 1 : led.decimals)}</strong>` +
        ` / ${mlFmt(led.cap, led.unit, led.decimals)} · ` +
        `<span class="ml-pct">${pct.toFixed(0)}%</span>`;
      view.num.className =
        "ml-num " + (pct > 100 ? "over" : pct > (led.warnAt || 90) ? "tight" : "ok");

      const scale = Math.max(total, led.cap) * 1.04;
      const x = (v) => ML_X0 + (v / scale) * (ML_X1 - ML_X0);
      const svg = view.svg;
      svg.textContent = "";
      svg.appendChild(mlSvg("rect", {
        x: ML_X0, y: ML_BAR_Y, width: ML_X1 - ML_X0, height: ML_BAR_H,
        rx: 4, class: "ml-track"
      }));

      let cursor = 0;
      chosen.forEach((o, i) => {
        const v = ((o.d && o.d[led.key]) || 0) * mul;
        const w = x(cursor + v) - x(cursor);
        if (w > 0.4) {
          const seg = mlSvg("rect", {
            x: x(cursor), y: ML_BAR_Y, width: w, height: ML_BAR_H,
            class: choices[i].fixed ? "ml-seg ml-seg-fixed" : "ml-seg"
          });
          if (!choices[i].fixed) seg.setAttribute("opacity", String(0.95 - (i % 4) * 0.19));
          seg.appendChild(mlSvg("title", {}, `${choices[i].name} · ${mlFmt(v, led.unit, led.decimals)}`));
          svg.appendChild(seg);
        }
        cursor += v;
      });

      if (led.soft) {
        svg.appendChild(mlSvg("line", {
          x1: x(led.soft), y1: ML_BAR_Y - 5, x2: x(led.soft), y2: ML_BAR_Y + ML_BAR_H + 4,
          class: "ml-soft"
        }));
        svg.appendChild(mlSvg("text", {
          x: x(led.soft), y: ML_BAR_Y - 8, class: "ml-soft-label", "text-anchor": "middle"
        }, led.softLabel || "余量线"));
      }

      svg.appendChild(mlSvg("line", {
        x1: x(led.cap), y1: ML_BAR_Y - 5, x2: x(led.cap), y2: ML_BAR_Y + ML_BAR_H + 4,
        class: "ml-cap"
      }));
      svg.appendChild(mlSvg("text", {
        x: x(led.cap), y: ML_BAR_Y + ML_BAR_H + 16,
        class: "ml-cap-label", "text-anchor": x(led.cap) > 560 ? "end" : "middle"
      }, led.capLabel || "上限"));
    });

    derivedLine.innerHTML = derived
      .map((dv) => {
        const src = totals[dv.from] || 0;
        const step = dv.steps.find((s) => src <= s.upto);
        if (!step) return `<span class="ml-d-over">${dv.label}：${dv.over || "超出可选档位"}</span>`;
        return `${dv.label}：<strong>${step.v} ${dv.unit}</strong>` +
          (step.note ? `<span class="ml-d-note">（${step.note}）</span>` : "");
      })
      .join("<br />");

    const capped = ledgers.filter((l) => l.cap);
    const ranked = capped
      .map((l) => ({ l, pct: (totals[l.key] / l.cap) * 100 }))
      .sort((a, b) => b.pct - a.pct);
    const worst = ranked[0];

    if (!worst) {
      verdict.className = "ml-verdict";
      verdict.textContent = "";
    } else if (worst.pct > 100) {
      verdict.className = "ml-verdict bad";
      verdict.innerHTML =
        `<strong>跑不下。</strong>${worst.l.label}要 ` +
        `${mlFmt(totals[worst.l.key], worst.l.unit, worst.l.decimals)}，` +
        `只有 ${mlFmt(worst.l.cap, worst.l.unit, worst.l.decimals)}。` +
        `这一档得换芯片，或者砍配置。`;
    } else {
      const left = worst.l.cap - totals[worst.l.key];
      verdict.className = "ml-verdict " + (worst.pct > (worst.l.warnAt || 90) ? "warn" : "good");
      verdict.innerHTML =
        `先撞的墙是<strong>${worst.l.label}</strong>——已用 ${worst.pct.toFixed(0)}%，` +
        `只剩 ${mlFmt(left, worst.l.unit, worst.l.decimals)}。` +
        (ranked[1]
          ? `（第二紧的是${ranked[1].l.label}，${ranked[1].pct.toFixed(0)}%。）`
          : "");
    }
  }

  render();
}

document.querySelectorAll("[data-mledger]").forEach(mountLedger);
