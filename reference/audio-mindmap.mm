<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="网络摄像机音频">
    <richcontent TYPE="NOTE"><html><head/><body><p>拾音 · 放音 · 全双工</p></body></html></richcontent>
    <node TEXT="声学基础" POSITION="left" COLOR="#6B7280" FOLDED="false">
      <edge COLOR="#6B7280" WIDTH="2"/>
      <node TEXT="拾音 / Capture · 放音 / Playback">
        <richcontent TYPE="NOTE"><html><head/><body><p>上行采环境声，下行放远端声</p><p>摄像机麦克风采集环境声（上行）；喇叭播出远端语音/告警（下行）。双向对讲 = 同时或交替使用两者。</p></body></html></richcontent>
      </node>
      <node TEXT="SPL · Sound Pressure Level">
        <richcontent TYPE="NOTE"><html><head/><body><p>声压级，整个音频世界的量尺</p><p>声压级，单位 dB SPL。0 dB SPL ≈ 人耳听阈；正常对话约 60–70 dB SPL（1 m）；94 dB SPL = 1 Pa，是麦克风灵敏度测试的标准参考声压。</p></body></html></richcontent>
      </node>
      <node TEXT="Inverse square law · 平方反比定律">
        <richcontent TYPE="NOTE"><html><head/><body><p>离远一倍，直达声就小一截</p><p>点声源的直达声随距离扩散，距离每翻一倍，声压级 −6 dB（ΔL = 20·log₁₀(d₂/d₁)）。从 1 m 走到 4 m 丢 12 dB。这是远场问题的全部起点，也是波束成形补不回来的那一部分。</p></body></html></richcontent>
        <node TEXT="⚡ 距离 ×2 → −6 dB ｜ 定义"/>
      </node>
      <node TEXT="Reverberation · 混响 · Dereverberation · 去混响">
        <richcontent TYPE="NOTE"><html><head/><body><p>墙面反射叠加，声音变糊的来源</p><p>混响不是噪声，是语音自己的回声——同一段话经墙面反射、晚几十毫秒再回来一次，频谱与原声相同。 数学上收到的信号是语音与房间冲激响应的卷积，冲激响应可拆成早期反射（无害，甚至提升响度）与晚期混响（有害）。 为什么 NS 治不了它：降噪假设噪声与语音无关、且相对稳定，可在说话间隙估出再减掉。混响三条全不满足——间隙里最响…</p></body></html></richcontent>
      </node>
      <node TEXT="Critical distance · 混响半径">
        <richcontent TYPE="NOTE"><html><head/><body><p>直达声与混响声相等的那个距离</p><p>房间里直达声与混响声一样大的那个距离。走到它以外，收到的主要不再是那个人的直达声，而是墙面反射（后果见 混响）。指向性把它往外推 10DI/20 倍——DI 4.8 dB → 1.7 倍。这才是 DI 的产品价值：可用范围推远了多少，而不是「增益几个 dB」。</p></body></html></richcontent>
      </node>
      <node TEXT="Far-field · 远场">
        <richcontent TYPE="NOTE"><html><head/><body><p>远到直达声不再占优的区间</p><p>声源距离麦较远（房间对讲、走廊）。直达声随距离每翻倍 −6 dB（平方反比定律）。摄像机内置麦多半是远场难题：直达声弱、混响与噪声占比高。远场做不好通常不是算法不聪明，是信噪比在进算法之前就已经不够了。可动的三处：装得更近、环境更安静、麦克风 SNR 更高；波束成形只补其中一小块。</p></body></html></richcontent>
      </node>
    </node>
    <node TEXT="硬件" POSITION="left" COLOR="#2563EB" FOLDED="false">
      <edge COLOR="#2563EB" WIDTH="2"/>
      <node TEXT="拾音器件" COLOR="#2563EB" FOLDED="false">
        <node TEXT="SNR · Signal-to-Noise Ratio · 信噪比">
          <richcontent TYPE="NOTE"><html><head/><body><p>麦克风自己有多安静</p><p>datasheet 上的 SNR 是器件固有的噪声底指标，不是你录到的那段音频的信噪比。 它的定义是标准参考声压与麦克风自噪声之间的差——ADI：「the difference between its inherent self noise level and a standard reference pressur…</p></body></html></richcontent>
          <node TEXT="⚡ 在 94 dB SPL 下测的 ｜ 第 2 课锚点"/>
        </node>
        <node TEXT="AOP · Acoustic Overload Point">
          <richcontent TYPE="NOTE"><html><head/><body><p>多大声开始削波</p><p>声过载点：失真达到阈值（常 10% THD）时的声压级。门铃/门口大喊、关门声需要高 AOP，否则爆音失真。</p></body></html></richcontent>
        </node>
        <node TEXT="Sensitivity · 灵敏度">
          <richcontent TYPE="NOTE"><html><head/><body><p>给定声压下输出多大电平</p><p>单位声压产生的输出大小。模拟麦：dBV；数字麦：dBFS。灵敏度高不代表音质好；远场可能需要更高有效增益，近场高灵敏度易削波。</p></body></html></richcontent>
        </node>
        <node TEXT="Dynamic Range · 动态范围">
          <richcontent TYPE="NOTE"><html><head/><body><p>最轻到最响能覆盖多宽</p><p>可线性再现的最强声与最弱声之差。麦克风上常 ≈ AOP − 噪声底。系统动态范围由最弱一环（麦/ADC/算法/编码）决定。</p></body></html></richcontent>
          <node TEXT="⚡ = AOP − EIN ｜ 定义"/>
        </node>
        <node TEXT="EIN · Equivalent Input Noise · 等效输入噪声（自噪声）">
          <richcontent TYPE="NOTE"><html><head/><body><p>麦的自噪声折算回声压</p><p>麦克风自身的电子噪声，换算成「相当于多大的声音」，单位 dB SPL：EIN ≈ 94 − SNR。SNR 65 dB(A) 的麦 → EIN 29 dB SPL，相当于机内永远开着一台 29 dB 的嘶嘶声。常见误读：把 datasheet 的 SNR 当成录音的信噪比。那个数是在 94 dB SPL（贴耳大喊）下…</p></body></html></richcontent>
          <node TEXT="⚡ = 94 − SNR (dB) ｜ 定义"/>
        </node>
        <node TEXT="THD · Total Harmonic Distortion">
          <richcontent TYPE="NOTE"><html><head/><body><p>器件把信号弄脏了多少</p><p>总谐波失真：输出里非原信号谐波所占的比例。拾音侧，AOP 常定义为 THD 达到 10%（有的规格用 1%）时的声压——看 AOP 时务必核对 THD 判据。 放音侧它更关键：谐波在参考信号里不存在，线性 AEC 无法预测它没见过的东西，于是这部分回声原封不动留在残差里。由此得到一条硬天花板： ERLE上限 ≈ −2…</p></body></html></richcontent>
        </node>
        <node TEXT="PDM / I²S">
          <richcontent TYPE="NOTE"><html><head/><body><p>数字麦到主控的两种传输格式</p><p>数字麦常见接口。PDM：脉冲密度调制，需时钟与抽滤；I²S：更接近 PCM 采样流。影响布线、抗扰与 SoC 对接，不直接等于音质优劣。</p></body></html></richcontent>
        </node>
        <node TEXT="麦克风一致性 · Sensitivity &amp; phase matching">
          <richcontent TYPE="NOTE"><html><head/><body><p>阵列里每颗麦必须长得一样</p><p>阵列级 MEMS 麦的标称匹配度：灵敏度 ±1 dB、相位 ±2°（Infineon IM69D130）。为什么这么苛刻：15 mm 间距在 400 Hz 上总共只有 6.3° 的相位差（Knowles AN-26），匹配误差必须远小于它。失配会填平零点、让指向图从心形跑向其他形状。物理尺寸受限时，相位匹配决定指向性…</p></body></html></richcontent>
        </node>
        <node TEXT="Isolation · 喇叭→麦隔离（dB）">
          <richcontent TYPE="NOTE"><html><head/><body><p>结构上先把回声挡掉多少 dB</p><p>只有喇叭响时，喇叭侧电平减去麦侧电平（dB）。越大耦合越弱。数字法用 reference vs raw mic；声学法用声级计两点。与 ERL 相关但不与声学 SPL 混比。</p></body></html></richcontent>
        </node>
      </node>
      <node TEXT="放音器件" COLOR="#2563EB" FOLDED="false">
        <node TEXT="喇叭灵敏度 · Speaker sensitivity">
          <richcontent TYPE="NOTE"><html><head/><body><p>1 W 输入能出多大声</p><p>给定电功率下喇叭能出多大声。行业标准写法是 dB SPL @ 1 W / 1 m，但微型喇叭普遍在 10 cm 量——两者差 20 dB，条件栏不看就会误判整整一个数量级的产品力。 归一化：S₁ₘ = S_ref + 20·log₁₀(d_ref ÷ 1 m)。10 cm 减 20 dB，30 cm 减 10.5 d…</p></body></html></richcontent>
          <node TEXT="⚡ 常在 10 cm 测，换算 1 m 要 −20 dB ｜ 第 9 课陷阱"/>
        </node>
        <node TEXT="共振频率 · Fo · Resonant frequency">
          <richcontent TYPE="NOTE"><html><head/><body><p>喇叭发不出声的下边界</p><p>喇叭振膜系统的自然共振点。Fo 以下辐射效率迅速塌掉，所以 datasheet 常把频响下限直接写成「Fo ~ 20 kHz」——意思是 Fo 以下基本不发声。 摄像机用的密闭微型喇叭 Fo 常在 700–1000 Hz，意味着男女声基频整段缺失（85–255 Hz）。 产品用法：基频缺失影响音色（薄、像从盒子里传出…</p></body></html></richcontent>
          <node TEXT="⚡ 频响下限写的是 Fo，不是可用下限 ｜ 第 9 课陷阱"/>
        </node>
        <node TEXT="峰均比 · Crest factor">
          <richcontent TYPE="NOTE"><html><head/><body><p>峰值比平均高出多少</p><p>一段信号的峰值比它的有效值（RMS）高多少 dB。语音约 12 dB（压得死的流行乐约 6 dB，鼓组 15–20 dB），功率上是 10^(12/10) ≈ 15.8 倍。 它决定了放音链上两个天花板要看不同的量：功放怕峰值（顶到供电就削波），喇叭音圈怕平均（发热是能量的积分）。 产品用法：拿到任何一个「功率」数字…</p></body></html></richcontent>
          <node TEXT="⚡ 语音约 12 dB ｜ 第 9 课"/>
        </node>
        <node TEXT="BTL · Bridge-tied load · 桥接负载">
          <richcontent TYPE="NOTE"><html><head/><body><p>两路反相驱动，功率翻四倍</p><p>喇叭两端各接一个半桥、反相驱动的接法，摄像机功放的默认形态。相比单端接法电压翻倍、功率四倍，且不需要输出隔直电容。 理想最大不削波正弦功率：P = Vcc² / (2R)。12 V / 8 Ω → 9 W；5 V / 8 Ω → 1.6 W。 产品用法：这是功放天花板的算法。实际再打八折（MOS 导通电阻、电感直流电…</p></body></html></richcontent>
        </node>
        <node TEXT="Smart Amp · 智能功放">
          <richcontent TYPE="NOTE"><html><head/><body><p>实时测振膜位移与音圈温度</p><p>用实时电流/电压感测（I/V sensing）反推音圈温度与振膜位移，在两者未到限时允许远超「连续额定功率」的峰值输出。它把喇叭的峰值上限从查表变成量出来。 估温：注入 60 Hz 导频音求直流电阻 RE，铜电阻随温度线性上升。估位移：由反电动势配自适应滤波器在线更新喇叭模型。 敢这么做的依据是热时间常数——音圈要数…</p></body></html></richcontent>
          <node TEXT="⚡ 峰值上限 +9.5 dB ｜ TI 实测"/>
        </node>
        <node TEXT="Excursion · 振膜位移">
          <richcontent TYPE="NOTE"><html><head/><body><p>推太狠会撞到机械极限</p><p>振膜前后运动的幅度（常记 Xmax）。超限会撞底、异响、悬边永久变形。位移在低频最大——同样声压，频率越低振膜跑得越远。 产品用法：微型喇叭 datasheet 通常不给 Xmax，这正是保守设计要把峰值锁在额定功率、白白损失近 10 dB 的原因。也是给放音链加高通滤波（切掉 Fo 以下）的理由——那段能量只产生位…</p></body></html></richcontent>
        </node>
        <node TEXT="SOA · Safe Operating Area · 安全工作区">
          <richcontent TYPE="NOTE"><html><head/><body><p>不烧不撞的电流电压边界</p><p>由喇叭表征（characterization）得出的边界：最大振膜位移与最高音圈温度。Smart Amp 的护栏就是它。 产品用法：SOA 是「这颗喇叭装在这个腔体里」的结果，换腔体就要重做。评审时的正确问法不是「Smart Amp 能大几 dB」（没人能答），而是「表征在我们自己的结构上做过吗？峰值功率上限多少瓦？」</p></body></html></richcontent>
          <node TEXT="⚡ 额定功率是断续信号测的 ｜ 第 9 课陷阱"/>
        </node>
        <node TEXT="热时间常数 · Thermal time constant">
          <richcontent TYPE="NOTE"><html><head/><body><p>音圈发热到触发限功率要多久</p><p>温度跟上功率变化所需的时间尺度，τ = Rt · Ct（热阻 × 热容）。TI 对一颗手机微型喇叭的实测：音圈 4.22 秒，磁体 411.8 秒。 产品用法：这是Smart Amp 敢放开峰值的物理依据——语音的峰只有几十毫秒，来不及把音圈加热。datasheet 那个「60 秒开 / 120 秒关」的额定功率测法…</p></body></html></richcontent>
        </node>
      </node>
    </node>
    <node TEXT="评测" POSITION="left" COLOR="#EA580C" FOLDED="false">
      <edge COLOR="#EA580C" WIDTH="2"/>
      <node TEXT="方法" COLOR="#EA580C" FOLDED="false">
        <node TEXT="Repeatability · 可复现性">
          <richcontent TYPE="NOTE"><html><head/><body><p>消声室买的是这个，不是「准」</p><p>同一件事重复做，能不能得到同一个数。注意它和「准确」是两回事：一把偏了 3 dB 但每次都偏 3 dB 的尺，做对比测试完全够用。 消声室买的就是它，不是「真实」。ITU-T P.340 §5.4 开头就写着 「For the repeatability of the tests, the environment ……</p></body></html></richcontent>
        </node>
        <node TEXT="场次偏置 · Session bias">
          <richcontent TYPE="NOTE"><html><head/><body><p>换一次场，整体就偏一点</p><p>整场一起偏的那个量：换了一天、挪了 2 cm、动过增益旋钮、空调开了、功放热了、换了一批评分的人。 它的可怕之处是加测次数消不掉——重复 30 次只是把这一场的偏置测得更精确。能消掉它的只有配对。 对照：单次抖动是同一场内连测两次的差别，那个才是次数能压住的。</p></body></html></richcontent>
        </node>
        <node TEXT="误差棒 · Error bar · 最小可分辨差异">
          <richcontent TYPE="NOTE"><html><head/><body><p>小于它的差异不能当差异</p><p>你测到的差值，真值有 95% 的可能落在这段区间里。规则只有一条：区间跨过 0，就不能说「B 比 A 好」——因为「一样好」也在区间里。 配对测：半宽 = 1.96 × 单次抖动 × √(2 / 次数) 分开测：半宽 = 1.96 × √(2 × 场次偏置² + 2 × 单次抖动² / 次数) 第二式第一项没有「次数…</p></body></html></richcontent>
          <node TEXT="⚡ 分开测的地板 = 1.96·√2·场次偏置 ｜ 第 8 课"/>
        </node>
        <node TEXT="配对测试 · Paired comparison · 配对四规则">
          <richcontent TYPE="NOTE"><html><head/><body><p>同场、同序、同源、同人</p><p>把 A 和 B 放进同一场测，让共同的漂移在相减时抵消。四条规则： ① 同一场：同一次开机、同一房间、连续测完，绝不「今天 A 明天 B」。 ② 同一素材：同一个音频文件由喇叭播出——真人是不可复现的声源。 ③ 同一参照：每场都测一次不变的东西（未处理原声，或一台从不改动的基准机），它是这一场的零点。 ④ 报差值：写…</p></body></html></richcontent>
        </node>
        <node TEXT="ACR · DCR · CCR · 三种听音测试范式">
          <richcontent TYPE="NOTE"><html><head/><body><p>打绝对分、打损伤分、打对比分</p><p>ACR（absolute category rating）：单独放一段，打 1–5 绝对分。最常见，也最容易漂。 DCR（degradation category rating）：先放原声再放处理后的，评「劣化到什么程度」。 CCR（comparison category rating）：连着放 A 和 B，问「后一…</p></body></html></richcontent>
        </node>
        <node TEXT="ITU-T P.501 · 测试信号">
          <richcontent TYPE="NOTE"><html><head/><body><p>别拿自己随手录的语音当激励</p><p>电话与语音应用的标准测试信号：真人语音素材、噪声序列、CSS 复合信号、扫频。ITU 官网免费下载。 P.340 §5.5 规定免提测试的信号必须符合它——也就是说，实验室那四条昂贵的要求里，有一条你今天就能零成本满足。 产品用法：全项目统一素材并版本入库。各测各的素材，等于每次都在换变量。</p></body></html></richcontent>
        </node>
      </node>
      <node TEXT="指标" COLOR="#EA580C" FOLDED="false">
        <node TEXT="MOS · 平均意见分 · DMOS · 差值分">
          <richcontent TYPE="NOTE"><html><head/><body><p>绝对分不可复现，差值分才可复现</p><p>MOS（mean opinion score）：一群人给一段音频打 1–5 分的平均。行业通用语言，但绝对值不可跨场比较。 DMOS：这段音频的分减去同一场里参照条件的分。 实证：700 条同样素材、五个不同的日子、每天换一批人 —— 绝对 MOS 的五次一致性 ICC 0.719（勉强），DMOS 0.907（可用…</p></body></html></richcontent>
        </node>
        <node TEXT="SNRI / DSN · ITU-T G.160 降噪指标">
          <richcontent TYPE="NOTE"><html><head/><body><p>降噪到底降了多少、伤了多少</p><p>SNRI = 信噪比改善；NPLR = 语音附近的噪声电平下降；DSN = 两者之差（压噪时有没有连语音一起压）；TNLR = 长停顿段总噪声下降。这套只衡量噪声，不衡量语音质量与失真。</p></body></html></richcontent>
        </node>
        <node TEXT="S-MOS / N-MOS / G-MOS · 3QUEST（ETSI EG 202 396-3）">
          <richcontent TYPE="NOTE"><html><head/><body><p>语音、背景、整体分开打分</p><p>带噪场景下把听感拆成三个分：S-MOS 语音质量、N-MOS 噪声残留质量、G-MOS 综合。必须成对读 S 与 N——只看 G-MOS 会把完全不同的取舍算成同一个分数。</p></body></html></richcontent>
        </node>
        <node TEXT="DNSMOS · SIG / BAK / OVRL · ViSQOL">
          <richcontent TYPE="NOTE"><html><head/><body><p>不用人耳的客观替代分</p><p>DNSMOS P.835（Microsoft）：不需要参考信号的神经网络打分，一次给三个数——SIG（语音本身的质量）、BAK（背景噪声有多碍事）、OVRL（综合）。与人耳评分相关性 0.94（SIG）/ 0.98（BAK、OVRL）。 三个数正是 S-MOS / N-MOS / G-MOS 那套「成对报数」思路的另…</p></body></html></richcontent>
        </node>
        <node TEXT="dBPa">
          <richcontent TYPE="NOTE"><html><head/><body><p>以 1 Pa 为参考的电平口径</p><p>以 1 帕斯卡（Pa）为 0 点的声压级刻度。而 1 Pa 就是麦克风 datasheet 里那个 94 dB SPL，所以换算只有一步：dB SPL = 94 + dBPa。 电话与免提行业用它，是因为这类测试的电平天生都在 94 dB SPL 以下，写成负数比写 SPL 顺手。 几个要认得的值：−4.7 dBPa…</p></body></html></richcontent>
        </node>
        <node TEXT="双讲衰减量 · Attenuation range in double talk">
          <richcontent TYPE="NOTE"><html><head/><body><p>P.340 把「全双工」变成可查表的等级</p><p>本机说话人送出去的电平，在对方也在说话时比只有本机在说话时低了多少 dB。它天生是一个差值——两个电平的绝对刻度在相减时抵消，所以不需要校准过的绝对测量。 ITU-T P.340 §8 用它给全双工分级（送话方向）：Behaviour 1 ≤3 dB = 真全双工；2a 3–6；2b 6–9；2c 9–12；Beha…</p></body></html></richcontent>
        </node>
      </node>
    </node>
    <node TEXT="编码与网络" POSITION="right" COLOR="#0891B2" FOLDED="false">
      <edge COLOR="#0891B2" WIDTH="2"/>
      <node TEXT="奈奎斯特频率 · Nyquist frequency">
        <richcontent TYPE="NOTE"><html><head/><body><p>采样率决定能留住多高的音</p><p>采样率 ÷ 2 = 系统能记录的最高频率。8 kHz 采样 → 4 kHz 上限（实际电话带 300–3400 Hz）。这是一堵墙：任何后级算法都无法补回被采样率切掉的频段。</p></body></html></richcontent>
        <node TEXT="⚡ 可用带宽 = fs / 2 ｜ 定义"/>
      </node>
      <node TEXT="窄带 / 宽带 · Narrowband / Wideband">
        <richcontent TYPE="NOTE"><html><head/><body><p>8 kHz 够听懂，16 kHz 才自然</p><p>窄带 = 300–3400 Hz（G.711 / G.726 @8 kHz 采样，安防行业默认）。宽带 = 50–7000 Hz（ITU-T G.722 定义，需 ≥16 kHz 采样）。差别不是「音质好一点」，是齿擦音这一整类信息在不在。</p></body></html></richcontent>
      </node>
      <node TEXT="齿擦音 · Sibilants /s/ /f/ /sh/">
        <richcontent TYPE="NOTE"><html><head/><body><p>最先被带宽切掉的那批高频辅音</p><p>清擦音，能量主要在 4 kHz 以上。窄带下被整段切掉，于是元音全在、句子能懂，但念姓名、车牌、数字、验证码时开始出错。这是识别带宽问题最可靠的症状（区别于 SNR / AEC / AGC 问题）。</p></body></html></richcontent>
      </node>
      <node TEXT="G.711 · G.726 · AAC">
        <richcontent TYPE="NOTE"><html><head/><body><p>从窄带低延到宽带高质的三档</p><p>G.711：8 kHz、8 bit 对数压扩、64 kbps，逐样本编码故算法时延≈0——安防对讲选它是拿音质换时延与互通性。G.726：ADPCM，16–40 kbps，同样窄带低时延。AAC：全带高音质，但见 算法时延。</p></body></html></richcontent>
      </node>
      <node TEXT="ONVIF 音频 · Profile T audio">
        <richcontent TYPE="NOTE"><html><head/><body><p>行业到底承诺了哪几种编码</p><p>ONVIF 功能矩阵里音频全部是 C（Conditional）而非 M——不要求摄像机有音频。唯一约束：如果支持，G.711 与 AAC 至少其一。AudioEncoderConfiguration 只有 Encoding / Bitrate（kbps）/ SampleRate（kHz）/ SessionTimeou…</p></body></html></richcontent>
      </node>
      <node TEXT="ptime · 打包时长">
        <richcontent TYPE="NOTE"><html><head/><body><p>一个网络包里装多少毫秒的声音</p><p>一个 RTP 包里装多少毫秒音频。VoIP 默认 20 ms（G.711 下即 50 包/秒）。调小能降时延，代价是包速率与头部开销上升。它还是抖动缓冲的计量单位——典型抖动缓冲取 3×ptime，所以减小 ptime 往往能连带压掉更大的一块。</p></body></html></richcontent>
      </node>
      <node TEXT="Jitter buffer · 抖动缓冲">
        <richcontent TYPE="NOTE"><html><head/><body><p>拿时延换不卡顿</p><p>接收侧为了抹平网络包到达时间不均而攒的一段音频。时延账里通常最大的一项，典型 3×ptime ≈ 60 ms，弱网自适应可涨到上百毫秒。它是为抗抖动买的保险，保费直接记在时延上。规格书必须写明：静态还是自适应，以及弱网下的上限。</p></body></html></richcontent>
      </node>
    </node>
    <node TEXT="算法" POSITION="right" COLOR="#7C3AED" FOLDED="false">
      <edge COLOR="#7C3AED" WIDTH="2"/>
      <node TEXT="AEC · 全双工" COLOR="#7C3AED" FOLDED="false">
        <node TEXT="AEC · Acoustic Echo Cancellation">
          <richcontent TYPE="NOTE"><html><head/><body><p>把喇叭放出去、又被麦收回的声音减掉</p><p>声学回声消除：估计喇叭→麦克风的声学路径，从拾音中减掉「自己刚播出去的声音」。全双工对讲的核心。失败听感：回音、啸叫、远端听到自己。</p></body></html></richcontent>
        </node>
        <node TEXT="Reference · Far-end reference">
          <richcontent TYPE="NOTE"><html><head/><body><p>送去做减法的那一路远端信号</p><p>AEC 用来建模回声的「已知播放信号」副本。没有可信参考（或延迟/音量与真实功放不一致），AEC 无法对齐。这是 AEC 与 NS 的分水岭。</p></body></html></richcontent>
        </node>
        <node TEXT="Double-talk · 双讲">
          <richcontent TYPE="NOTE"><html><head/><body><p>两边同时说话，最难的那一刻</p><p>近端与远端同时说话。麦信号混有本端语音与回声；滤波器应减慢或暂停适应，否则会损伤本端语音。全双工真门槛用例。</p></body></html></richcontent>
        </node>
        <node TEXT="Echo tail · 回声尾长">
          <richcontent TYPE="NOTE"><html><head/><body><p>回声要拖多久才衰干净</p><p>喇叭→麦路径上，回声能量拖到可忽略的时长。量法：扫频反卷积得 h(t)，按峰值下 −40/−60 dB 或噪声底读时间；也可互相关粗测、看收敛 FIR 系数、或加长 taps 看 ERLE 拐点。贴硬墙往往比自由场更长（墙反射把中后段抬高）。算法规格里的 40/128 ms 是覆盖预算，不是测得值。门口反射、强耦合更…</p></body></html></richcontent>
        </node>
        <node TEXT="Tap · 抽头">
          <richcontent TYPE="NOTE"><html><head/><body><p>自适应滤波器的长度单位</p><p>FIR / 自适应滤波器里一个延迟点上的可调系数。N taps = N 个系数 = 能「记住」过去 N 个采样；可覆盖尾长 ≈ N / fs（如 640 taps @16 kHz ≈ 40 ms）。taps 越多，尾长预算越长，算力也越高。</p></body></html></richcontent>
        </node>
        <node TEXT="FIR · Finite Impulse Response（有限冲激响应）">
          <richcontent TYPE="NOTE"><html><head/><body><p>AEC 用来建模回声路径的滤波器</p><p>有限冲激响应滤波器：输出 = 过去有限个输入采样的加权和。AEC 线性部分常用自适应 FIR 拟合喇叭→麦路径；长度（taps）决定可覆盖的 echo tail。</p></body></html></richcontent>
        </node>
        <node TEXT="ERL · Echo Return Loss（回声回损）">
          <richcontent TYPE="NOTE"><html><head/><body><p>结构与距离先帮你压掉多少</p><p>回声路径回损（AEC 关、近端静）：L_Rout − L_Sin（播放参考相对上行麦上的回声）。越大越好；免提大音量可为负。数字通路上常与「喇叭→麦隔离 dB」同一测法。测结构时必须关 AEC。</p></body></html></richcontent>
        </node>
        <node TEXT="ERLE · Echo Return Loss Enhancement（回声回损改善）">
          <richcontent TYPE="NOTE"><html><head/><body><p>算法又额外压掉多少</p><p>AEC 额外提供的回声衰减（算法指标）：AEC 前/后回声功率比。别和结构 ERL 比大小。线性部分常见约 20–30 dB 量级；再高常靠 NLP。 它有一个来自硬件的上限：喇叭的谐波失真不在参考信号里，AEC 消不掉，所以 ERLE ≤ −20·log₁₀(THD)。算法再好也过不去这条线——这时该改的是腔体（提…</p></body></html></richcontent>
          <node TEXT="⚡ ≤ −20·log₁₀(THD) ｜ 第 9 课推导"/>
        </node>
        <node TEXT="RES / NLP · Residual / Non-linear processing（残差 / 非线性处理）">
          <richcontent TYPE="NOTE"><html><head/><body><p>线性滤波器减不掉的那部分</p><p>线性 AEC（FIR）之后对残余回声与非线性伪影（喇叭失真等）的抑制。过猛：语音断续、空洞；过弱：大音量仍回。此处 NLP ≠ 自然语言处理。</p></body></html></richcontent>
        </node>
        <node TEXT="Full-duplex / Half-duplex">
          <richcontent TYPE="NOTE"><html><head/><body><p>能不能同时说，产品级的分水岭</p><p>全双工：双方可同时说听（依赖 AEC）。半双工：同一时刻只允许一个方向，用按住说话或 VAD 切换。竞品「自然对讲」通常指全双工。</p></body></html></richcontent>
        </node>
      </node>
      <node TEXT="NS · AGC · 链序" COLOR="#7C3AED" FOLDED="false">
        <node TEXT="HPF · High-pass Filter（高通滤波）">
          <richcontent TYPE="NOTE"><html><head/><body><p>切掉直流与低频隆隆声</p><p>处理链最前一级，切掉两类无用低频：直流偏置（DC offset，0 Hz 的固定偏置，听不见但占动态范围）与低频隆隆声（rumble，几十 Hz 以下的一团能量）。来源包括风噪、云台马达与结构振动、以及经外壳固体传导的触碰噪声（handling noise：碰机器、擦拭、雨点打壳）。拐点定太高会让人声变薄。</p></body></html></richcontent>
        </node>
        <node TEXT="NS / ANR · Noise Suppression（噪声抑制）">
          <richcontent TYPE="NOTE"><html><head/><body><p>压稳态噪声，代价是语音也被削</p><p>削弱环境噪声（空调、风、马路）。无播放参考，靠谱域估计噪声底再逐频带衰减——这是它与 AEC 的分水岭。本质是一笔交易：压噪越多，语音失真越大。位于 AEC 之后、AGC 之前。</p></body></html></richcontent>
        </node>
        <node TEXT="AGC · Automatic Gain Control（自动增益控制）">
          <richcontent TYPE="NOTE"><html><head/><body><p>把忽大忽小的音量拉平</p><p>把忽大忽小的语音电平拉进目标窗口。由 attack（压下去多快）→ hold（保持多久）→ release（回升多慢）三个时间常数刻画，通常 release 比 attack 慢 2–3 个数量级。上行链放最后；无法还原采集端已削波的信号。</p></body></html></richcontent>
        </node>
        <node TEXT="处理链顺序 · Chain order">
          <richcontent TYPE="NOTE"><html><head/><body><p>HPF → AEC → NS → AGC，顺序错了全错</p><p>上行：HPF → AEC → NS → AGC。下行：AGC/限幅 → 分叉给喇叭与 AEC 参考。约束来自 AEC——它前面不能有非线性处理，也不能有会跳变的增益，否则滤波器把增益变化当成回声路径突变而反复重收敛。</p></body></html></richcontent>
        </node>
        <node TEXT="Musical noise · 音乐噪声">
          <richcontent TYPE="NOTE"><html><head/><body><p>降噪过头后的「水下叮当」声</p><p>谱减类降噪的典型伪影：噪声被压后残留孤立、闪烁的谱峰，听感像金属「叮叮」声或水声。是 NS 开太猛的签名之一。</p></body></html></richcontent>
        </node>
        <node TEXT="Aggressiveness · 降噪激进度">
          <richcontent TYPE="NOTE"><html><head/><body><p>它是一根滑杆，不是一个开关</p><p>NS 在「压噪声」与「保语音」之间的那根滑杆。激进：噪声干净、语音削坏；保守：语音完整、噪声漏出。综合分相同的两台机可以坐在滑杆的两端——这就是必须成对报指标的原因。</p></body></html></richcontent>
        </node>
        <node TEXT="Pumping / Breathing · 呼吸感">
          <richcontent TYPE="NOTE"><html><head/><body><p>AGC 时间常数没配好的听感</p><p>AGC release 太快导致的伪影：语句间隙里增益迅速回升，底噪一波波涌上来，像有人在喘气。摄像机上典型投诉是「夜里安静时沙沙声一阵阵」。</p></body></html></richcontent>
        </node>
      </node>
      <node TEXT="波束成形" COLOR="#7C3AED" FOLDED="false">
        <node TEXT="Beamforming · 波束成形">
          <richcontent TYPE="NOTE"><html><head/><body><p>用多麦换方向性，换不到距离</p><p>用多支麦克风之间声音到达时间的差别，把某个方向来的声音对齐相加（增强），其他方向的因对不齐而相消。产出是一个「只朝某方向听」的虚拟麦克风。它买的是方向，不是距离——把麦克风数量换算成拾音米数的说法都站不住。</p></body></html></richcontent>
        </node>
        <node TEXT="相加式 Delay-and-sum · 差分式 Differential">
          <richcontent TYPE="NOTE"><html><head/><body><p>大孔径换增益 vs 小孔径换指向</p><p>两种做指向性的路子，失败方式相反。相加式：对齐后相加，对不相关噪声增益 10·log₁₀(N)（2 支 +3 dB），但要孔径——摄像机尺寸在语音频段上基本拿不到指向性。差分式（也叫超指向 superdirective）：相减再均衡，2 厘米间距就能做出心形指向，DI 稳定 4.8–6 dB，代价是低频 WNG 严重…</p></body></html></richcontent>
        </node>
        <node TEXT="Aperture · 孔径">
          <richcontent TYPE="NOTE"><html><head/><body><p>阵列尺寸相对波长有多大</p><p>阵列最外两支麦之间的距离，L = (N−1)·d。它决定低频下限：想在频率 f 上有指向性，大致要求 L ≳ c/2f。300 Hz 需要 57 cm——这就是摄像机做不了低频指向的物理原因。</p></body></html></richcontent>
        </node>
        <node TEXT="Spatial aliasing · 空间混叠 / Grating lobe · 栅瓣">
          <richcontent TYPE="NOTE"><html><head/><body><p>间距太大，高频长出栅瓣</p><p>相邻间距超过半波长后，波束图上长出与主瓣一样高的假主瓣（栅瓣），侧面噪声被原样收进来。起点 f = c / 2d：d=21.25 mm → 8.1 kHz，d=80 mm → 2.1 kHz。它决定高频上限，和孔径一头一尾夹住阵列的可用带宽。</p></body></html></richcontent>
        </node>
        <node TEXT="DI · Directivity Index · 指向性指数">
          <richcontent TYPE="NOTE"><html><head/><body><p>指向性换来多少等效信噪比</p><p>在四面八方均匀来噪声（弥散场）的环境里，阵列相对一支全向麦能压低多少 dB。一阶差分阵列上限约 4.8–6 dB（心形 4.8、超心形 6.0）。要按频率给曲线，不要单个数字——单个数字通常挑的是最好看的频点。</p></body></html></richcontent>
        </node>
        <node TEXT="WNG · White Noise Gain · 白噪声增益">
          <richcontent TYPE="NOTE"><html><head/><body><p>差分阵列为指向性付出的自噪声代价</p><p>阵列对各路互不相关的噪声（主要是麦克风自噪声，也包括风噪）的增益。相加式 +10·log₁₀(N)，永远为正；差分式在低频严重为负（20 mm@500 Hz ≈ −12 dB），因为均衡器要把极小的差值拉平，顺带把底噪一起放大。只报 DI 不报 WNG，等于只报收入不报支出。</p></body></html></richcontent>
        </node>
      </node>
    </node>
    <node TEXT="预算" POSITION="right" COLOR="#059669" FOLDED="false">
      <edge COLOR="#059669" WIDTH="2"/>
      <node TEXT="时延账" COLOR="#059669" FOLDED="false">
        <node TEXT="Mouth-to-ear · 嘴到耳时延">
          <richcontent TYPE="NOTE"><html><head/><body><p>唯一对用户成立的那个时延</p><p>从说话人张嘴到听话人耳朵听见，全部环节的单向总延迟：空气 + 麦/ADC + 采集缓冲 + 算法块 + 编解码 + 打包 + 网络单程 + 抖动缓冲 + 播放缓冲。这是唯一该写进规格书的时延指标。不是编码时延，不是 ping，也不是 ping 的一半。听到任何单个时延数字，第一句话都应该是「这一段是哪一段？」</p></body></html></richcontent>
        </node>
        <node TEXT="G.114 标尺 · One-way transmission time">
          <richcontent TYPE="NOTE"><html><head/><body><p>判断时延好坏的行业刻度</p><p>ITU-T 定的全行业时延共同标尺（单向 mouth-to-ear）：≤150 ms 基本透明（消费级对讲的现实目标）；150–400 ms「可接受，但前提是使用方知情」；&gt;400 ms 规划上不应超过。另有常被忽略的一句：高交互性任务在约 100 ms 就已明显变难。对照 Fraunhofer 给交互式双向通信的高…</p></body></html></richcontent>
          <node TEXT="⚡ &lt; 150 ms 好 / &gt; 400 ms 不可接受 ｜ ITU-T G.114"/>
        </node>
        <node TEXT="Group delay · 群延迟">
          <richcontent TYPE="NOTE"><html><head/><body><p>不同频率被拖慢的程度不一样</p><p>器件本身引入的固有延迟。数字 MEMS 麦典型 6 µs @1 kHz（Infineon IM69D130）——比声音走过 1 米空气还小五百倍。结论：换更贵的麦克风对时延毫无帮助，时延几乎全在缓冲里。</p></body></html></richcontent>
        </node>
        <node TEXT="块长 / 帧长 · Block size / Frame size">
          <richcontent TYPE="NOTE"><html><head/><body><p>每次处理多少毫秒，直接进账</p><p>一次交给下一级多少音频。采集缓冲（DMA 块）常见 20 ms，改成 10 ms 直接白赚 10 ms，代价是中断频率翻倍。算法侧：WebRTC 的音频处理模块（APM）固定按 10 ms 帧处理。块长是时延账里最容易改、也最容易被忽略的一项。</p></body></html></richcontent>
        </node>
        <node TEXT="算法时延 · Algorithmic delay">
          <richcontent TYPE="NOTE"><html><head/><body><p>编解码器为压缩预先要囤的那点声音</p><p>编码器攒够一帧才能开始编所产生的固有延迟，换更快的 CPU 消不掉。AAC-LC ≥55 ms @48 kHz（Fraunhofer：对双向通信「clearly too high」）、AAC-LD 低至 20 ms、AAC-ELD 15 ms @64 kbps。交互式双向通信的系统时延建议 ≤50 ms。陷阱：AAC…</p></body></html></richcontent>
        </node>
        <node TEXT="尾长 ≠ 时延 · Tail length is not delay">
          <richcontent TYPE="NOTE"><html><head/><body><p>最常见的记账错误</p><p>常见记账错误。AEC 尾长（典型 128 ms）说的是滤波器有多长，不是信号要等多久——它不进时延预算表。AEC 实际引入的时延只有处理帧长（10 ms）。但两者有硬耦合：播放缓冲 + 空气路径 + 采集缓冲 &lt; 尾长，否则回声跑出滤波器覆盖范围，AEC 完全失效。改任何缓冲前先检查这条不等式。</p></body></html></richcontent>
          <node TEXT="⚡ 尾长是回声长度，不进时延账 ｜ 第 6 课"/>
        </node>
      </node>
      <node TEXT="算力 · BOM 账" COLOR="#059669" FOLDED="false">
        <node TEXT="MIPS · 百万指令每秒">
          <richcontent TYPE="NOTE"><html><head/><body><p>算法要吃掉多少算力</p><p>Million Instructions Per Second——算力的记账单位，衡量「这段代码每秒要芯片干多少活」。在每周期执行一条指令的 DSP 上（如 TMS320C5517，5 ns 指令周期），MHz 与 MIPS 可以当同一个数看，200 MHz ≈ 200 MIPS；在超标量或带向量扩展的核上则不成立，…</p></body></html></richcontent>
        </node>
        <node TEXT="峰值 MIPS · Peak MIPS">
          <richcontent TYPE="NOTE"><html><head/><body><p>配硬件只认峰值，平均只看趋势</p><p>最忙那一帧的算力占用，区别于平均值。TIDUE77 实测整套应用 平均 136.6 / 峰值 157.3，比值 1.15×——这是峰均比这个概念从声音搬到算力上的样子。 产品用法：实时系统按峰值配硬件，平均值只用来看趋势。音频按 10 ms 一帧交货，算不完就是一次丢帧（听感是「咔」的一声或吞字）。更要命的是峰值出现…</p></body></html></richcontent>
        </node>
        <node TEXT="实例数据 · Instance data">
          <richcontent TYPE="NOTE"><html><head/><body><p>模块之和 ≠ 系统总量，框架也吃内存</p><p>算法每跑一路就要独占一份的内存：滤波器系数、历史缓冲、状态量。代码段全世界共用一份，实例数据按路数乘出来。 产品用法：内存账上最容易漏的一项。HD AEC 的实例数据 67 120 B，比它的代码段还大，且随尾长成正比增长——所以尾长这个旋钮同时拧动算力和内存两本账。索要占用数据时要求拆成「程序 + 数据 + 实例 …</p></body></html></richcontent>
        </node>
        <node TEXT="电压频率档 · Voltage-frequency tier">
          <richcontent TYPE="NOTE"><html><head/><body><p>算力按档卖，跨档才有钱拿</p><p>芯片的算力按档卖，每一档绑定一个核心电压。C5517 datasheet：75 MHz 要 1.05 V，175 MHz 要 1.3 V，200 MHz 要 1.4 V；功耗大致随 V² × f 走，于是档与档之间是跳变的。TI SPRABN1 实测估算：26.90 / 65.08 / 166.38 / 248.39…</p></body></html></richcontent>
          <node TEXT="⚡ 151 → 149 MIPS 省 82 mW ｜ TIDUE77"/>
        </node>
        <node TEXT="算力余量 · Compute headroom">
          <richcontent TYPE="NOTE"><html><head/><body><p>留多少给未来和最坏情况</p><p>峰值占用之外留下的比例。常见惯例是留 20 %（即峰值 ≤ 可用算力的 80 %）——这是工程惯例，不是任何标准的规定，写进规格书时要注明是谁定的、留给什么用。 产品用法：它要覆盖三件事——你没测到的那些帧、未来要加的功能、以及跟你抢 CPU 的所有别人（视频编码、AI 检测）。验收要配一个可观测的硬判据：丢帧计数（…</p></body></html></richcontent>
        </node>
      </node>
    </node>
  </node>
</map>
