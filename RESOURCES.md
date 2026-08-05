# 网络摄像机音频 Resources

## Knowledge

### 系统与参考设计
- [TI Design: TIDA-01589 — High Fidelity Near-Field Two-Way Audio (AEC + NR)](https://www.ti.com/tool/TIDA-01589)
  双麦、AEC、谱域降噪、Smart Amp 的完整近场全双工参考设计；应用列表明确包含 **IP Network Camera / Wi-Fi Camera / Video Doorbell**。Use for: 信号链对照、算法模块清单、硬件分区。
- [TI User Guide PDF (tidue77)](https://www.ti.com/lit/ug/tidue77/tidue77.pdf)
  同上设计的详细说明。Use for: 回声尾长、ASNR、功放保护等实现细节。
  **§3.2.7 Table 5（MIPS 与内存实测）是第 10 课的主数据**，业界罕见的公开占用表。条件：16 kHz 宽带、双麦、尾长 128 ms。
  平均/峰值 MIPS——固定波束成形 9.2/9.3、噪声抑制 13.2/13.5、**HD AEC 113.1/131.1**、整套应用 **136.6/157.3**（峰均比 1.15×）。
  内存（程序+数据｜实例×路数｜合计）——BF 7 188｜1 360×2｜9 908 B；NS 9 355｜4 886×2｜19 127 B；**AEC 66 225｜67 120×1｜133 345 B**；整套 **308 142 B**。
  两个减法：AEC 占算力 **83 %**；三模块之和 162 380 B 只占整套内存的 53 %，**其余 145 762 B（47 %）是框架/驱动/缓冲**，不在任何模块账单上。
  另一句关键原文：*「the HD AEC is customizable for shorter or longer tail lengths (based on available processing resources)」*——厂商自认**尾长是被算力买断的**。

### 远场、多麦与波束成形
- [Knowles Application Note AN-26 — Phase Sequenced MEMS Microphones for Beam-Forming Applications (PDF)](https://www.knowles.com/docs/default-source/default-document-library/an-26-phase-sequenced-mems-microphones.pdf?sfvrsn=cce94cb1_6)
  4 页，写给选料与量产的人。关键句：**「When physical space constraints limit array size, phase-matching sets the low frequency limit for directional performance.」** 硬数字：15 mm 间距 → 44 µs 到达差 → 400 Hz 上只有 **6.3°** 相位差，匹配误差必须远小于它；分档卷带 MM20-33639-B116 保证 100 支窗口内相位差 ≤1.5°@200 Hz。还给了心形/亚心形的 limaçon 族与延迟比 k。Use for: 第 7 课主文献、麦克风一致性条款、BOM 约束。
- [Buck — First Order Differential Microphone Arrays for Automotive Applications (IWAENC 2001, PDF)](https://www.iwaenc.org/proceedings/2001/main/data/buck.pdf)
  一阶差分阵列的频率相关 DI 表达式 + 失配模型。关键句：**「For low frequencies ω → 0 the equalization filter Weq assumes very high values. That means that any disturbance of the signals is strongly amplified.」** 一阶 DI 落在 **4.5–6 dB**（心形 4.8 / 超心形 6.0 / 偶极 4.8）；截止频率 ωc = π/(τA+τ)。实测：未校准麦对（σ²_M = 0.038）做 5 cm 心形，理想 6 dB 的 DI 在 1 kHz 以下掉到接近 0。Use for: WNG 代价的一手依据、「小阵列为什么对器件苛刻」。
- [audioXpress — Microphone Array Beamforming with Optical MEMS Microphones](https://audioxpress.com/article/microphone-array-beamforming-with-optical-mems-microphones)
  可读性最好的入门。关键句：**「a two-microphone Delay-and-Sum beamformer results in a 3dB increase of the system SNR… This +3dB improvement continues for every doubling in number of microphones used.」** 以及边射/端射对比、间距=半波长处出现零点（21 mm → ≈8 kHz）。二手源，数值已与 Buck、TI 交叉验证。Use for: 10·log₁₀(N) 的口径、边射/端射术语。
- TI TIDUE77 §2.3.2（见上）：**「Two analog microphones are mounted at a distance of 21.25 mm in a linear geometry on the MIC board」**——IP 摄像机参考设计的真实间距，c/2d 正好 8 kHz。§2.2 的信号流写明 **BF 先、HD AEC 后**。Use for: 摄像机侧几何锚点、链上位置的一手佐证。

### 麦克风硬件与指标
- [Analog Devices: Understanding Microphone Sensitivity — Jerad Lewis](https://www.analog.com/en/resources/analog-dialogue/articles/understanding-microphone-sensitivity.html)
  灵敏度（dBV / dBFS）、SNR、动态范围、远场/近场选型、数字增益陷阱。明确提到 security cameras 作为远场场景。Use for: 读 datasheet 的第一课。
- [Analog Devices MS-2348: Low Self Noise — The First Step to High Performance MEMS Microphone Applications (PDF)](https://www.analog.com/media/en/technical-documentation/technical-articles/Low-Self-Noise-The%20First-Step-to-High-Performance-MEMS-Microphone-Applications-MS-2348.pdf)
  **SNR / EIN 定义的一手出处。**关键句：SNR 是 **「the difference between its inherent self noise level and a standard reference pressure, specifically 94 dB SPL (1 Pa) at 1 kHz」**；通常 **A 计权、20 kHz 带宽**，且 **「A comparison will not be accurate if the measurements don't use the same weighting and bandwidth」**；`EIN = 94 dB − SNR`。量级：早期 MEMS 58–60 dB，65 dB(A)（EIN 29）在 2012 年是标杆。
  还有一段直接印证第 7 课的 WNG 论证：**「Beamforming algorithms often result in a higher system noise level, as compared with a single microphone in the array. Therefore, it becomes critical for each mic in the array to have a high SNR.」** Use for: SNR/EIN 精确定义、「阵列对麦的 SNR 要求更高」的厂商背书。
- [Infineon: Factors to consider when choosing a MEMS microphone](https://community.infineon.com/t5/Knowledge-Base-Articles/Factors-to-consider-when-choosing-a-MEMS-microphone/ta-p/1210049)
  SNR、AOP、动态范围、频响/LFRO 的选型框架。Use for: MEMS 选型 checklist。
- [Infineon: MEMS microphone specifications](https://community.infineon.com/t5/Knowledge-Base-Articles/MEMS-microphone-specifications/ta-p/696839)
  灵敏度、SNR、AOP、动态范围定义与测试条件。Use for: 术语精确含义。

### 数字音频基础
- [EE Times: Fundamentals of embedded audio, part 2](https://www.eetimes.com/fundamentals-of-embedded-audio-part-2/)
  动态范围、SNR、headroom、6 dB/bit 规则、量化噪声。Use for: 位深与系统 SNR 木桶效应。
- [Analog Devices chapter PDF: Basics of Embedded Audio Processing](https://www.analog.com/media/en/dsp-documentation/embedded-media-processing/embedded-media-processing-chapter5.pdf)
  嵌入式音频处理基础（与上书同源体系）。Use for: 更系统的复习。

### 编码时延与带宽
- [Fraunhofer: Enhanced MPEG-4 Low Delay AAC (AES 122nd Convention, PDF)](https://www.iis.fraunhofer.de/content/dam/iis/de/doc/ame/conference/AES-122-Convention_AAC-ELD_LowBitrateHighQualityCommunication_AES6998.pdf)
  编码方自己写的时延账。关键句：AAC-LC 算法时延 ≥55 ms @48 kHz（1024 samples/frame）「clearly too high for bi-directional communication」；「the system delay for interactive two way communication should not exceed 50 ms」；AAC-LD 低至 20 ms，优质起点 48 kbps/声道；AAC-LC 32 kbps 起可用、≈64 kbps 近透明。Use for: 第 5 课主文献、对讲编码选型、时延预算。
- [ITU-R Report BS.2161: Low delay audio coding for broadcasting (PDF)](https://www.itu.int/dms_pub/itu-r/opb/rep/R-REP-BS.2161-2009-PDF-E.pdf)
  Table 2 给 AAC-ELD vs AAC-LD 按码率的时延（64 kbit/s：15 ms vs 20 ms；48：23/16 vs 30；32：32/16 vs 40）。AAC-LD 整体算法时延 1 490 samples ≈ 31 ms @48 kHz。Use for: 低时延编码档位的权威数字。
- [ONVIF Profile Feature Overview (PDF)](https://www.onvif.org/wp-content/uploads/2022/04/onvif-profile-feature-overview.pdf)
  功能矩阵：Audio Streaming / Audio Output Streaming 全部标记 **C = Conditional**，不是 M——ONVIF 不要求摄像机有音频。脚注 6：「If supported, Device/client must support at least one of G.711 and AAC」。Use for: 拆「符合 ONVIF」这句话对音频的实际承诺。

### 时延预算与端到端时延
- [ITU-T Rec. G.114: One-way transmission time](https://www.itu.int/rec/T-REC-G.114/en) · [公开 PDF 镜像（Columbia）](http://www.cs.columbia.edu/~andreaf/new/documents/other/T-REC-G.114-200305.pdf)
  全行业时延讨论的共同标尺。**≤150 ms 基本透明；150–400 ms「可接受但需使用方知情」；>400 ms 网络规划上不应超过。**另有常被忽略的一句：**高交互性任务在约 100 ms 就已明显变难**。还给出延迟与回声的相互作用（延迟越长，同样残余回声越难忍受）。Use for: 第 6 课主文献、时延验收线、规格书措辞。
- [Infineon IM69D130 datasheet (PDF)](https://www.infineon.com/assets/row/public/documents/24/49/infineon-im69d130-datasheet-en.pdf)
  数字 MEMS 麦 **group delay 6 µs @1 kHz**；另有阵列级匹配指标 **灵敏度 ±1 dB、相位 ±2°**，28 Hz LFRO。Use for: 证明「换更好的麦降时延」无意义（器件延迟比 1 米空气传播还小五百倍）；同一份 datasheet 又是第 7 课「一致性决定阵列低频下限」的量级来源——同一个动作在两本账上价值相反。
- [WebRTC `audio_processing.h`](https://webrtc.googlesource.com/src/+/main/modules/audio_processing/include/audio_processing.h)
  一手：*「APM accepts only 16-bit linear PCM audio data in frames of 10 ms」*。Use for: 算法块 = 10 ms，而非 AEC 尾长 128 ms（预算表最常见的记账错误）。
- [WebRTC NetEQ 设计文档](https://webrtc.googlesource.com/src/+/main/modules/audio_coding/neteq/g3doc/index.md)
  自适应抖动缓冲：按网络状况持续优化缓冲延迟；`jitterBufferDelay / jitterBufferEmittedCount` 是可读出的实测时延。Use for: 抖动缓冲策略与「自适应上限」条款。
- [ECG: VoIP RTP Packetization Interval — maybe it's time for a smaller ptime](https://www.ecg.co/blog/40-voip-rtp-packetization-interval-maybe-it-s-time-for-a-smaller-ptime)
  ptime 与回声延迟的账：**典型抖动缓冲 = 3×ptime**；回声延迟最好情况 `2*ptime+rtt`，含两侧抖动缓冲后可达 `8*ptime+rtt`（20 ms ptime + 30 ms RTT → 190 ms 回声尾）。二手但工程性强，与 G.114、NetEQ 交叉验证后使用。Use for: ptime 的连带效应、缓冲与 AEC 的耦合。

### 协议与编码（摄像机侧）
- [ONVIF Media Service Specification](https://www.onvif.org/specs/srv/media/ONVIF-Media-Service-Spec-v1606.pdf)
  §5.23.27 `AudioEncoderConfiguration` 只有四个字段：Encoding（G.711 / G.726 / AAC）、Bitrate [kbps]、SampleRate [kHz]、SessionTimeout。**枚举不区分 AAC-LC 与 AAC-LD/ELD**。Use for: 互操作与规格书用语、判断 ONVIF 能约束到什么粒度。
- [ONVIF Profile T Specification](https://www.onvif.org/wp-content/uploads/2018/09/ONVIF_Profile_T_Specification_v1-0.pdf)
  设备至少支持 G.711 µ-law 或 AAC 之一的流媒体要求。Use for: 产品 Profile 合规。
- [VIVOTEK: G.711 / G.726 sample rate (8 kHz)](https://vivotek.zendesk.com/hc/en-001/articles/17432485748121--All-cameras-What-is-the-camera-audio-sample-rate-for-G-711-and-G-726-audio-format)
  行业实践：窄带语音编码采样率。Use for: 与「高清拾音」卖点对照。

### 混响与去混响
- [León &amp; Tobar — Late Reverberation Suppression using U-nets (arXiv 2110.02144, PDF)](https://arxiv.org/pdf/2110.02144)
  收到的信号 = 语音 ⊛ 房间冲激响应；冲激响应拆成 **early reflections + late reflections**，去混响的做法是**估计并减掉晚期那部分**（<em>「dereverberation is performed by subtracting the late reverberation estimation to the observed reverberated signal」</em>）。混响程度取决于房间几何、材料与**说话人到麦的距离**。Use for: 第 7 课「拉不回来到底指什么」、去混响属于独立模块而非降噪的一档。
- [The Modulation Transfer Function for Speech Intelligibility (PLOS Comput Biol / PMC2639724)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2639724/)
  STI 的理论基础：混响通过**平滑时间包络**降低调制深度（0.5–16 Hz 调制频段），可懂度随之下降。Use for: 解释混响毁掉的是「音节之间的空隙」，即信息被**填掉**而非被盖住。

### 语音质量评测
- [HEAD acoustics: 3QUEST — Applications & Use in Practice (PDF)](https://cdn.head-acoustics.com/fileadmin/data/global/Application-Notes/Telecom/3QUEST-Applications-and-Use-In-Practice-Application-Note.pdf)
  基于 ETSI EG 202 396-3 的 S-MOS / N-MOS / G-MOS 实测对比。含关键实证：两台机 G-MOS 相同（2.2 / 2.3）而 S-MOS（1.3 / 2.4）、N-MOS（4.7 / 3.2）天差地别，归因于降噪 aggressiveness 实现不同；非稳态噪声最难；静室成绩不预测带噪成绩。Use for: 第 4 课主文献、降噪验收条目、拆「AI 降噪」卖点。
- [ITU-T G.160: Voice enhancement devices](https://www.itu.int/rec/T-REC-G.160/en)
  降噪客观指标 SNRI / NPLR / DSN / TNLR 的定义（Appendix II）。注意：只量噪声，不量语音质量与失真。Use for: 规格书用语、要求供应商成对报数。
- [ITU-T P.862 PESQ](https://www.itu.int/rec/t-rec-p.862)
  窄带语音客观质量评估标准。注意 P.862 本身未针对终端声学、回声消除与降噪算法做验证。Use for: 了解行业如何「量化听感」（需授权）。
- [Wikipedia overview: PESQ / POLQA lineage](https://en.wikipedia.org/wiki/Perceptual_Evaluation_of_Speech_Quality)
  P.861 → P.862 → P.863 系谱。Use for: 评测路线图入门。

### 评测方法论与可复现性（第 8 课）

- [ITU-T Rec. P.340: Transmission characteristics and speech quality parameters of hands-free terminals](https://www.itu.int/rec/T-REC-P.340-200005-I) — **ITU 官网免费下载**
  第 8 课主文献，也是第 3 课「全双工」的量化补全。关键句（§5.4）：**「_For the repeatability of the tests_, the environment for most of the measurements shall be free field (anechoic) down to the lowest frequency of the 1/3 octave band centred on 200 Hz.」**——标准自己承认消声室买的是**可复现性**，不是「真实」。
  硬数字：房间本底 ≤**−70 dBPa(A)** = 24 dB(A)；人工嘴 **−4.7 dBPa @ MRP**（唇前 25 mm）= 89.3 dB SPL；被测机处 **−28.7 dBPa @ HFRP**（50 cm）= **65.3 dB SPL**（与第 7 课「60 dB @1 m」经平方反比换算一致）；测试信号须符合 P.501。
  **Table 4（双讲分级）**：送话方向 a_H,S,DT ≤3 dB = Behaviour 1（全双工），3–6 = 2a，6–9 = 2b，9–12 = 2c，>12 = Behaviour 3（实为半双工）；受话方向门槛 3/5/8/10。§8.2 的 TELR_DT：≥37 / 33 / 27 / 21 / <21 dB。§6 给 full / partial / no duplex 的官方定义。
  Use for: 把「支持全双工」逼成一个 dB 数与等级；实验室条件的成本锚点；规格书措辞。
- [Naderi & Cutler — An Open source Implementation of ITU-T Recommendation P.808 with Validation (INTERSPEECH 2020, arXiv PDF)](https://arxiv.org/pdf/2005.08138)
  **「绝对分不可复现、差值可复现」的一手实证。**§4.2 复现性实验：700 条同样素材、五个不同的日子、每天换一批人（平均 89 位唯一评分者）——绝对 MOS 的五次一致性 **ICC = 0.719**，DMOS **ICC = 0.907**。原文：**「bias observed between MOS values in different runs is a well-known and common behavior in the subjective tests. Using the DMOS successfully removed that offset.」**
  §4.1 与实验室 P.800 的相关性 PCC = 0.962、RMSE 0.223。§1 另有一句拆客观分的：**「Objective measures of speech quality such as PESQ, SRMR, and P.563 have been shown to have a low correlation to listening opinion, and are not reliable replacements for listening opinion tests even though they are widely used by researchers due to their convenience.」**
  Use for: 第 8 课配对法则的证据、客观分的边界、说服团队做同场对比。
- [microsoft/P.808 (GitHub)](https://github.com/microsoft/P.808)
  ITU-T P.808 的开源实现：ACR / DCR / **CCR** / P.835 众包听音全流程，含听力筛查、环境适宜性测试、陷阱题（trapping questions）、金标准题与数据清洗。跑在 Amazon MTurk 或 Prolific 上。Use for: 需要真人耳朵时的唯一低成本路径；CCR 成对比较范式。
- [DNSMOS P.835 (arXiv 2110.01763)](https://arxiv.org/abs/2110.01763)
  Microsoft 的**免参考**神经网络打分，一次给三个数：**SIG**（语音质量）/ **BAK**（背景噪声）/ **OVRL**（综合），与人耳相关性 PCC 0.94（SIG）、0.98（BAK、OVRL）。Use for: 回归防守的自动哨兵；与 3QUEST 的 S-MOS/N-MOS「成对报数」思路互为印证。**注意射程**：训练数据是降噪场景，不适用于回声与时延。
- [google/visqol (GitHub)](https://github.com/google/visqol) · [ViSQOL v3 论文](https://arxiv.org/pdf/2004.09584)
  开源全参考客观指标，输出 MOS-LQO（1–5）。需时间对齐的干净参考信号。Use for: 编码与丢包的自动化评估；不适合带房间声学的录音。
- [ITU-T Rec. P.501: Test signals for use in telephony and other speech-based applications](https://www.itu.int/rec/T-REC-P.501)
  标准测试信号（语音素材、噪声序列、CSS 复合信号、扫频），**电子附件免费下载**。P.340 §5.5 规定免提测试必须用它。Use for: 统一全项目测试素材——实验室那几条昂贵要求里唯一零成本就能满足的一条。
- [REW — Room EQ Wizard](https://www.roomeqwizard.com/) · [miniDSP UMIK-1 + REW 声学测量指南](https://www.minidsp.com/applications/acoustic-measurements/acoustic-measurements)
  免费声学测量软件 + 逐支校准的 USB 测量麦（约 ¥600）。测房间本底噪声、频响、冲激响应与 **RT60 混响时间**。Use for: 把「环境噪声 45 dB(A)」这句话变成可写进报告的实测值；第 7 课混响半径的实测入口。二手源，但工具本身是行业通用。

### 实时通信算法栈（对照）
- [ADI Wiki: Acoustic Echo Cancellation](https://wiki.analog.com/resources/tools-software/sigmastudio/toolbox/adialgorithms/aec)
  Far End In、声学路径、自适应 FIR、残差 RES、双讲时暂停适应；说明 AEC 何时必需。Use for: AEC 概念与全双工评审语言（第 3 课主文献）。
- [WebRTC Audio Processing Module (APM) headers / docs](https://webrtc.googlesource.com/src/+/main/modules/audio_processing/include/audio_processing.h)
  业界公开的 AEC / NS / AGC 实时语音处理组件集合。Use for: 算法模块命名与职责对照（摄像机厂商栈常类似）。
- [Fora Soft: The WebRTC audio pipeline end-to-end](https://www.forasoft.com/learn/audio-for-video/articles-audio/webrtc-audio-pipeline-end-to-end)
  APM 采集侧固定顺序 HPF → AEC3 → NS → AGC2，及「每级都假设上一级已完成」的说明。Use for: 处理链顺序的业界实现佐证（二手源，与下面两条一手工程文档交叉验证）。
- [Q-SYS: Acoustic Echo Cancellation White Paper](https://help.qsys.com/q-sys_8.3/Content/AEC/Q-SYS_Acoustic_Echo_Cancellation_White_Paper.htm)
  为什么压限/AGC/automixer 必须放 AEC 输出侧（「AEC will readapt… chase the compressor, limiter or AGC」）；参考必须在分叉前完成压限，与送喇叭信号一致；收敛量级 1–2 s 初始、约 10 s 完全。Use for: 第 4 课理由 2、评审「参考取点」问法。
- [VOCAL: Beamforming combined with AEC and Noise Suppression](https://vocal.com/beamforming-2/aec-noise-suppression/)
  「不宜在自适应线性滤波前做降噪，谱减会引入非线性」；降噪应作为 AEC/波束成形之后的后处理。另有 AEC 与波束成形谁在前的取舍：**「the primary debate is whether the acoustic echo cancellation (AEC) or the beamforming should come first」**；波束成形在前则 **「not only does the AEC have to model echo path but the beamforming vector as well… slows the convergence of AEC」**。Use for: 第 4 课理由 1；第 7 课链上位置与「波束转向 → AEC 重收敛」。
- [VOCAL: Automatic Gain and Saturation Control for an AEC](https://vocal.com/echo-cancellation/automatic-gain-and-saturation-control-for-an-acoustic-echo-canceller/)
  AGC 在 receive 路径放 AEC 之前、send 路径放 AEC 之后；检测到饱和/削波时应停止系数更新并加强残差抑制。Use for: 上行/下行顺序的例外、削波保护策略。

### 放音侧：喇叭、功放与 Smart Amp（第 9 课）
- [TI SLAA857 — SmartPA Speaker Protection Algorithm (PDF)](https://www.ti.com/lit/an/slaa857/slaa857.pdf)
  **第 9 课主文献。** 喇叭的电—机—声模型、阻抗与位移模型，以及 SmartPA 的温度/位移保护算法。关键实测数据（§4.2 Table 4，一颗 iPhone 7 微型喇叭）：热阻/热容推出**音圈热时间常数 4.22 s、磁体 411.8 s**；温度靠 **60 Hz 导频音**估直流电阻 R_E 反推，位移靠反电动势 + 自适应滤波器在线估计。原文：*「temperature of voice coil can rise much faster than the magnet as the power increases」*。Use for: 解释 Smart Amp 凭什么敢放开峰值；评审时向方案商索要表征结果的依据。
- [TI SLAA625D — Getting Started with Smart Amp Development (PDF)](https://www.ti.com/lit/an/slaa625d/slaa625d.pdf)
  Smart Amp 的定位与开发流程。原文：*「replaces traditional continuous power design principles and hardware based speaker protection methods with algorithms that allow significant increases in peak power output, loudness and sound quality」*；SOA（安全工作区）由**表征**产出，且「characterization often leads to changes to the speaker or enclosure」。Use for: 「支持 Smart Amp」这句话该验收什么。
- [Microchip — Speaker Design Considerations for Acoustic Echo Cancellation](https://support.microchip.com/s/article/Speaker-Design-Considerations-for-Acoustic-Echo-Cancellation)
  **第 9 课最关键的一条引用。** 明确 THD 与 ERLE 的定量对照：*「An ERLE of 25 dB to 30 dB is considered to be industry standard for good far-field user-experience. This translates to having Total Distortion + Noise of 3.1 % to 5.6 % respectively in the 20 Hz–8 kHz range」*——正好等于 `ERLE ≤ −20·log₁₀(THD)`。以及非线性回声无法被 AEC 消除的原因：*「Since there is no reference signal for the non-linear echo…」*；ERLE 上不去时的退路是**改腔体提高 ERL**。注：页面为 JS 渲染，直接抓取会拿到空壳，用搜索引擎缓存或搜原句。
- [Microchip IS2083/BM83 Echo Tuning — 6.2.1 Speaker Mechanical Design](https://onlinedocs.microchip.com/oxy/GUID-8A8101C4-6FEF-463A-8D5E-D83C5A884302-en-US-1/GUID-D1A0A43D-CE59-42A7-A5D9-2016A3C17829.html)
  可直接抄进结构评审的三条：喇叭**软安装**（背面只压泡棉/橡胶，不得硬压）、**出音孔要够**（孔不足→感知音量下降 + 声耦合上升）、**塑料件要拧够螺丝**（缺螺丝→特定频率共振→*「high non-linear echo returning to the echo canceller」*）。Use for: 第 9 课回声账的结构条款。
- [Lowell Mfg — Determining Speaker Power Requirements for the Integrator (PDF)](https://www.lowellmfg.com/wp-content/uploads/LowellDSPR.pdf)
  9 页，扩声工程的三条基本式与判据：`SPL = S + 10·log₁₀(P) − 20·log₁₀(D)`；平方反比每翻倍 −6.02 dB；**「minimum of 10 dB SPL over the average ambient noise level」**（保守用 +15）。还提醒**永远用 average sensitivity，别用 peak sensitivity**。Use for: 把「喇叭要几瓦」翻译成「在 D 米、环境 X dB(A) 下 SPL ≥ X+10」的可验收写法。
- [Same Sky（原 CUI Devices）CES-361811-18PM-67 datasheet (PDF)](https://www.sameskydevices.com/product/resource/ces-361811-18pm-67.pdf)
  第 9 课拆解的那颗真实喇叭：IP67、8 Ω、额定 1 W（IEC-60268-5，**60 s 开 / 120 s 关 × 10**）、**SPL 89 dB @ 1 W / 10 cm**、**Fo 900 Hz**、频响 Fo~20 kHz、**额定功率下 THD max 10 %**。Use for: 三个 datasheet 陷阱的实物样本。
- [Same Sky — Understanding and Measuring Sensitivity in Audio Components](https://www.sameskydevices.com/blog/understanding-and-measuring-sensitivity-in-audio-components)
  厂商自述的测法与换算：标准是 1 m / 2.83 V（8 Ω 上即 1 W），非标距离用 `Sadj = 20·log₁₀(D/Dstd)`。官方示例：*「65 dB at 0.1 meter … will be 45 dB at 1 meter」*。Use for: SPL 归一化，比较竞品前的第一步。
- [EDN — Understanding Class-D amplifier power supply requirements](https://www.edn.com/understanding-class-d-amplifier-power-supply-requirements/)
  BTL 输出功率的完整式子 `P_BTL(RMS) = [(Vcc·Mmax)² / (2·R_T²)]·R_LOAD`，其中 R_T 含 MOS 导通电阻、电感直流电阻、PCB 走线与电源内阻。理想简化式 `Vcc²/(2R)`：12 V/4 Ω → 18 W。Use for: 功放天花板估算与「实际打八折」的依据。
- [Merlijn van Veen — Crest Factor Part 1: Peak-to-Average Ratio](https://www.merlijnvanveen.nl/en/study-hall/191-crest-factor-part-1)
  峰均比的定义与各类节目素材的典型值：**语音约 12 dB**（10–12），压死的流行乐约 6 dB，鼓组 15–20 dB。Use for: 峰值账与平均账的换算系数（12 dB → 15.8 倍功率），第 9 课两个天花板分别看不同量的依据。

### 算力、内存与功耗预算（第 10 课）
- [TI TMS320C5517 datasheet (PDF)](https://www.ti.com/lit/ds/symlink/tms320c5517.pdf)
  第 10 课那颗芯片的资源上限与档位表。**320 KB 片上 RAM（64 KB DARAM + 256 KB SARAM）+ 128 KB ROM**；**75–200 MHz，13.33–5 ns 指令周期**（所以这颗 DSP 上 MHz ≈ MIPS）。关键的一页是频率与核心电压绑定：**1.05 V→75 MHz、1.3 V→175 MHz、1.4 V→200 MHz**。Use for: 用满度计算（157.3/200 = 79 %，308 142/327 680 = 94 %）、「算力按档卖」的一手依据。
- [TI SPRABN1 — Power Estimation and Power Consumption Summary for TMS320C5517 (PDF)](https://www.ti.com/lit/an/sprabn1/sprabn1.pdf)
  Table 1 的四个档位（估算值，25 °C 典型场景、75 % DMAC + 25 % ADD）：**1.05 V/75 MHz = 26.90 mW；1.3 V/100 MHz = 65.08 mW；1.3 V/150 MHz = 166.38 mW；1.4 V/200 MHz = 248.39 mW**。算力涨 2.67 倍，功耗涨 9.2 倍。Use for: 把「省下 N MIPS」翻译成毫瓦；证明**跨过一档才有钱可拿**。
- [Chinaboina et al. — Adaptive Algorithms for Acoustic Echo Cancellation in Speech Processing, IJRRAS 7(1), 2011 (PDF)](https://www.arpapress.com/files/volumes/vol7issue1/ijrras_7_1_05.pdf)
  自适应滤波器复杂度的可引用出处：LMS 每次迭代 **2N 加法 + 2N+1 乘法**，*「Each iteration of the NLMS algorithm requires 3N+1 multiplications」*。代进 128 ms @16 kHz（N = 2 048）得 98.3 M 次乘法/秒 ≈ 98 MIPS，与 TI 实测 113.1 只差 15 %。Use for: 自己估 AEC 算力、论证「MIPS ≈ 常数 × 尾长」。二手学术源，用途仅为量级校验。
- [Digi-Key — Infineon IM69D130 产品页](https://www.digikey.com/en/products/detail/infineon-technologies/IM69D130V01XTSA1/8030732)
  BOM 账上唯一一个可引用的锚点：**单片零售价约 2.02 美元**（非量产价，随时变动）。Use for: 「多一颗麦值多少钱」的量级；正式测算必须换成自己的报价。

### 增益与器件行为
- [Analog Devices MAX9814 datasheet (PDF)](https://www.analog.com/media/en/technical-documentation/data-sheets/max9814.pdf)
  AGC 的 attack / hold / release 与 pumping / breathing 的一手描述；具体量级：attack ≈1.1 ms、hold 固定 30 ms、A∶R = 1∶500 / 1∶2000 / 1∶4000、最大衰减 20 dB。Use for: AGC 参数锚点与失败听感。

## Wisdom (Communities)

- [IPVM discussions (e.g. camera audio range)](https://ipvm.com/discussions/ip-camera-with-audio)
  安防专业社区；内置麦有效距离、外置麦、房间声学等现场经验。Use for: 产品场景现实检验。
- [r/videosurveillance](https://www.reddit.com/r/videosurveillance/)
  安装与实战向讨论；信号噪声较大，交叉验证后使用。
- [TI E2E 支持论坛](https://e2e.ti.com/)
  硬件/参考设计实现问题。Use for: 器件与算法联调疑难。

## Gaps

- 消费级门铃/家用摄像机对讲时延与全双工竞品拆解的一手 teardown 报告（后续可补）
- 国内主流方案商（海思/安凯/君正等）音频算法 SDK 公开文档深度不一，需结合具体 SoC 再补
- ~~客观评测流程的可复现实验手册~~ — **第 8 课已补**：P.340 给了实验室条件与双讲分级刻度，Naderi & Cutler 给了「绝对分 vs 差值」的复现性实证，P.501 / REW / DNSMOS / P.808 工具包构成低成本替代路径。**仍缺**：回声路径（ERL / ERLE）的低成本测量手册——第 3 课给了 dBFS 相减的思路但没给完整流程；以及双讲用例中「同一句话对齐截取」的具体工程做法（目前只能手工对齐，缺自动化脚本）
- 时延侧「声学环回法 + 第三方录音设备」的 ±5 ms 近似做法（第 6 课）仍缺一手出处，目前是工程惯例而非标准
- 上面那套低成本双讲测法是**依据 P.340 定义自行推导的近似**，未见有人公开发表过等价流程。可用于排序与回归，但若要写进对外文件需先找到同行印证或送一次第三方实验室做交叉标定
- ETSI EG 202 396-3 / TS 103 106 原文需付费；目前只能通过 HEAD acoustics 应用笔记间接引用
- ~~放音链（喇叭/功放）整段缺一手资料~~ — **第 9 课已补**（TI SLAA857/SLAA625D、Microchip、Lowell、Same Sky、EDN）。**仍缺**：微型喇叭在**小腔体内**的 Fo 抬升与低频损失的定量关系（目前只能定性说「密闭盒抬高 Fo」）；以及 THD **随驱动电平变化**的实测曲线样本——datasheet 普遍只给额定功率下的一个 max 值，第 9 课表里 1/10 额定 ≈2 %、1/2 额定 ≈5 % 是**按经验填的占位值，必须实测替换**
- 算力账只有 TI 一家肯公开数字。**国内主流摄像机 SoC（海思 / 安凯 / 君正 / 星宸等）与 Ambarella 的音频算法占用数据全部不公开**，只能靠 NDA 后的方案商报表或自己实测——所以第 10 课的方法（要峰值、要拆项、自测最坏用例）比它引用的那几个数字更重要。
- TIDUE77 Table 5 **只有 128 ms 一个尾长点**。第 10 课里 32/64/96/160/192 ms 各档全是按正比外推的保守上界，未见任何厂商公开「尾长 vs MIPS/内存」的曲线。拿到真实项目时应优先向方案商索要三个点以上。
- Smart Amp 到底能放开多少 dB，公开资料一律只说「significant increases」，没有任何厂商给数字——因为它必然是表征结果。第 9 课用「峰均比 12 dB ⇒ 上界 9.5 dB」作为理论上界，**未见有人公开发表过等价推导**，写进对外文件前需实测印证
