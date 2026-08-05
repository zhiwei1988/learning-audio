/**
 * Reusable ordering drill — retrieval practice for pipelines and sequences.
 *
 * Usage:
 *   <div class="order-drill" data-order-drill
 *        data-title="练习 · 排出处理顺序"
 *        data-prompt="按上行（拾音）处理链的正确顺序点选。"
 *        data-items='["A","B","C"]'          <!-- CORRECT order -->
 *        data-why='["why A is 1st","why B is 2nd","why C is 3rd"]'
 *        data-done="全部正确。">
 *   </div>
 *   <script type="module" src="../assets/order-drill.js"></script>
 *
 * Feedback is immediate: a correct pick locks into its slot and reveals the
 * reason it belongs there; a wrong pick flashes and, on the second miss at the
 * same position, nudges with the expected item's reason.
 */
function shuffled(list) {
  const out = list.map((v, i) => ({ v, i }));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Never hand the learner the answer already in order.
  if (out.length > 1 && out.every((o, idx) => o.i === idx)) return shuffled(list);
  return out;
}

function mountOrderDrill(root) {
  if (root.dataset.mounted) return;
  root.dataset.mounted = "1";

  const items = JSON.parse(root.dataset.items || "[]");
  const why = JSON.parse(root.dataset.why || "[]");
  const title = root.dataset.title || "排序练习";
  const prompt = root.dataset.prompt || "";
  const done = root.dataset.done || "全部正确。";

  root.innerHTML = `
    <h3></h3>
    <p class="od-prompt"></p>
    <ol class="od-slots"></ol>
    <div class="od-pool"></div>
    <div class="od-feedback"></div>
    <button type="button" class="od-reset">重来一次</button>
  `;
  root.querySelector("h3").textContent = title;
  root.querySelector(".od-prompt").textContent = prompt;

  const slots = root.querySelector(".od-slots");
  const pool = root.querySelector(".od-pool");
  const feedback = root.querySelector(".od-feedback");
  const reset = root.querySelector(".od-reset");

  let next = 0;
  let missesHere = 0;

  function start() {
    next = 0;
    missesHere = 0;
    feedback.className = "od-feedback";
    feedback.textContent = "";
    slots.innerHTML = "";
    pool.innerHTML = "";

    items.forEach(() => {
      const li = document.createElement("li");
      li.className = "od-slot";
      li.innerHTML = `<span class="od-slot-body">？</span>`;
      slots.appendChild(li);
    });

    shuffled(items).forEach(({ v, i }) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "od-chip";
      chip.textContent = v;
      chip.dataset.index = String(i);
      chip.addEventListener("click", () => pick(chip, i));
      pool.appendChild(chip);
    });
  }

  function pick(chip, index) {
    if (index === next) {
      chip.disabled = true;
      chip.classList.add("placed");
      const slot = slots.children[next];
      slot.classList.add("filled");
      slot.querySelector(".od-slot-body").textContent = items[index];
      feedback.className = "od-feedback show-good";
      feedback.textContent = why[index] || "正确。";
      next += 1;
      missesHere = 0;
      if (next === items.length) {
        feedback.textContent = done;
        pool.classList.add("cleared");
      }
      return;
    }

    missesHere += 1;
    chip.classList.add("miss");
    setTimeout(() => chip.classList.remove("miss"), 420);
    feedback.className = "od-feedback show-bad";
    feedback.textContent =
      missesHere === 1
        ? "还不是它。先问：这一步的输入必须是什么状态？"
        : `提示 · 第 ${next + 1} 步：${why[next] || ""}`;
  }

  reset.addEventListener("click", () => {
    pool.classList.remove("cleared");
    start();
  });

  start();
}

document.querySelectorAll("[data-order-drill]").forEach(mountOrderDrill);
