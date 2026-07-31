/**
 * Interactive: convert MEMS mic datasheet numbers into product-facing levels.
 * Mounts on elements with data-mic-calc.
 */
function mountMicCalc(root) {
  if (root.dataset.mounted) return;
  root.dataset.mounted = "1";

  root.innerHTML = `
    <div class="calc-grid">
      <label>SNR <span class="hint">dB(A)，相对 94 dB SPL</span>
        <input type="number" data-snr value="65" min="50" max="80" step="0.5" />
      </label>
      <label>AOP <span class="hint">dB SPL @ 典型 10% THD</span>
        <input type="number" data-aop value="120" min="100" max="140" step="1" />
      </label>
      <label>灵敏度（可选） <span class="hint">数字麦 dBFS @ 94 dB SPL</span>
        <input type="number" data-sens value="-26" min="-40" max="-10" step="0.5" />
      </label>
    </div>
    <div class="calc-out" data-out></div>
  `;

  const snrEl = root.querySelector("[data-snr]");
  const aopEl = root.querySelector("[data-aop]");
  const sensEl = root.querySelector("[data-sens]");
  const out = root.querySelector("[data-out]");

  function render() {
    const snr = Number(snrEl.value);
    const aop = Number(aopEl.value);
    const sens = Number(sensEl.value);
    if (![snr, aop, sens].every(Number.isFinite)) {
      out.textContent = "请输入有效数字。";
      return;
    }
    const noiseFloor = 94 - snr; // dB SPL equivalent input noise (approx, A-weighted if SNR is)
    const dyn = aop - noiseFloor;
    const impliedMaxFromSens = 94 - sens; // digital mic: max SPL ≈ 94 − sensitivity_dBFS (peak mapping)
    const match =
      Math.abs(impliedMaxFromSens - aop) <= 2
        ? "与 AOP 基本一致（数字麦常见映射）"
        : `由灵敏度反推的满幅声压约 ${impliedMaxFromSens.toFixed(0)} dB SPL，与 AOP ${aop} 不完全一致——读 datasheet 时核对定义（峰值/RMS、1% vs 10% THD）`;

    out.innerHTML = `
      <table class="ref">
        <thead><tr><th>推导量</th><th>数值</th><th>产品含义</th></tr></thead>
        <tbody>
          <tr>
            <td>等效输入噪声 EIN ≈ 94 − SNR</td>
            <td><strong>${noiseFloor.toFixed(1)} dB SPL</strong></td>
            <td>比这还轻的声音会被麦自噪声淹没（理想条件）</td>
          </tr>
          <tr>
            <td>动态范围 ≈ AOP − EIN</td>
            <td><strong>${dyn.toFixed(1)} dB</strong></td>
            <td>从「刚压过底噪」到「开始严重失真」的可用声压跨度</td>
          </tr>
          <tr>
            <td>数字灵敏度 ↔ 满幅</td>
            <td>灵敏度 ${sens} dBFS</td>
            <td>${match}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  [snrEl, aopEl, sensEl].forEach((el) => el.addEventListener("input", render));
  render();
}

document.querySelectorAll("[data-mic-calc]").forEach(mountMicCalc);
