/**
 * Lightweight quiz component for lessons.
 * Usage:
 *   <div class="quiz" data-quiz
 *        data-prompt="..."
 *        data-options='["A text","B text","C text","D text"]'
 *        data-answer="0"
 *        data-explain-correct="..."
 *        data-explain-wrong="...">
 *   </div>
 *   <script type="module" src="../assets/quiz.js"></script>
 *
 * Options should be equal length when possible (no formatting hints).
 */
function mountQuiz(el) {
  if (el.dataset.mounted) return;
  el.dataset.mounted = "1";

  const prompt = el.dataset.prompt || "";
  const options = JSON.parse(el.dataset.options || "[]");
  const answer = Number(el.dataset.answer);
  const explainCorrect = el.dataset.explainCorrect || "正确。";
  const explainWrong = el.dataset.explainWrong || "再想一想信号链上的位置。";
  const title = el.dataset.title || "练习";

  el.innerHTML = "";

  const h = document.createElement("h3");
  h.textContent = title;
  el.appendChild(h);

  const p = document.createElement("p");
  p.className = "prompt";
  p.textContent = prompt;
  el.appendChild(p);

  const box = document.createElement("div");
  box.className = "options";
  el.appendChild(box);

  const fb = document.createElement("div");
  fb.className = "feedback";
  el.appendChild(fb);

  options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "opt";
    btn.textContent = text;
    btn.addEventListener("click", () => {
      const buttons = box.querySelectorAll("button.opt");
      buttons.forEach((b) => (b.disabled = true));
      if (i === answer) {
        btn.classList.add("correct");
        fb.className = "feedback show-good";
        fb.textContent = explainCorrect;
      } else {
        btn.classList.add("wrong");
        buttons[answer]?.classList.add("correct");
        fb.className = "feedback show-bad";
        fb.textContent = explainWrong;
      }
    });
    box.appendChild(btn);
  });
}

document.querySelectorAll("[data-quiz]").forEach(mountQuiz);
