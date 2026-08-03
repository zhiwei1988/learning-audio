# 网络摄像机音频 Resources

## Knowledge

### 系统与参考设计
- [TI Design: TIDA-01589 — High Fidelity Near-Field Two-Way Audio (AEC + NR)](https://www.ti.com/tool/TIDA-01589)
  双麦、AEC、谱域降噪、Smart Amp 的完整近场全双工参考设计；应用列表明确包含 **IP Network Camera / Wi-Fi Camera / Video Doorbell**。Use for: 信号链对照、算法模块清单、硬件分区。
- [TI User Guide PDF (tidue77)](https://www.ti.com/lit/ug/tidue77/tidue77.pdf)
  同上设计的详细说明。Use for: 回声尾长、ASNR、功放保护等实现细节。

### 麦克风硬件与指标
- [Analog Devices: Understanding Microphone Sensitivity — Jerad Lewis](https://www.analog.com/en/resources/analog-dialogue/articles/understanding-microphone-sensitivity.html)
  灵敏度（dBV / dBFS）、SNR、动态范围、远场/近场选型、数字增益陷阱。明确提到 security cameras 作为远场场景。Use for: 读 datasheet 的第一课。
- [Infineon: Factors to consider when choosing a MEMS microphone](https://community.infineon.com/t5/Knowledge-Base-Articles/Factors-to-consider-when-choosing-a-MEMS-microphone/ta-p/1210049)
  SNR、AOP、动态范围、频响/LFRO 的选型框架。Use for: MEMS 选型 checklist。
- [Infineon: MEMS microphone specifications](https://community.infineon.com/t5/Knowledge-Base-Articles/MEMS-microphone-specifications/ta-p/696839)
  灵敏度、SNR、AOP、动态范围定义与测试条件。Use for: 术语精确含义。

### 数字音频基础
- [EE Times: Fundamentals of embedded audio, part 2](https://www.eetimes.com/fundamentals-of-embedded-audio-part-2/)
  动态范围、SNR、headroom、6 dB/bit 规则、量化噪声。Use for: 位深与系统 SNR 木桶效应。
- [Analog Devices chapter PDF: Basics of Embedded Audio Processing](https://www.analog.com/media/en/dsp-documentation/embedded-media-processing/embedded-media-processing-chapter5.pdf)
  嵌入式音频处理基础（与上书同源体系）。Use for: 更系统的复习。

### 协议与编码（摄像机侧）
- [ONVIF Media Service Specification](https://www.onvif.org/specs/srv/media/ONVIF-Media-Service-Spec-v1606.pdf)
  音频编码配置：G.711 / G.726 / AAC、码率、采样率。Use for: 互操作与规格书用语。
- [ONVIF Profile T Specification](https://www.onvif.org/wp-content/uploads/2018/09/ONVIF_Profile_T_Specification_v1-0.pdf)
  设备至少支持 G.711 µ-law 或 AAC 之一的流媒体要求。Use for: 产品 Profile 合规。
- [VIVOTEK: G.711 / G.726 sample rate (8 kHz)](https://vivotek.zendesk.com/hc/en-001/articles/17432485748121--All-cameras-What-is-the-camera-audio-sample-rate-for-G-711-and-G-726-audio-format)
  行业实践：窄带语音编码采样率。Use for: 与「高清拾音」卖点对照。

### 语音质量评测（后续课）
- [ITU-T P.862 PESQ](https://www.itu.int/rec/t-rec-p.862)
  窄带语音客观质量评估标准。Use for: 了解行业如何「量化听感」（需授权）。
- [Wikipedia overview: PESQ / POLQA lineage](https://en.wikipedia.org/wiki/Perceptual_Evaluation_of_Speech_Quality)
  P.861 → P.862 → P.863 系谱。Use for: 评测路线图入门。

### 实时通信算法栈（对照）
- [ADI Wiki: Acoustic Echo Cancellation](https://wiki.analog.com/resources/tools-software/sigmastudio/toolbox/adialgorithms/aec)
  Far End In、声学路径、自适应 FIR、残差 RES、双讲时暂停适应；说明 AEC 何时必需。Use for: AEC 概念与全双工评审语言（第 3 课主文献）。
- [WebRTC Audio Processing Module (APM) headers / docs](https://webrtc.googlesource.com/src/+/main/modules/audio_processing/include/audio_processing.h)
  业界公开的 AEC / NS / AGC 实时语音处理组件集合。Use for: 算法模块命名与职责对照（摄像机厂商栈常类似）；后续课对照常见处理顺序 AEC → NS → AGC。

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
- 客观评测流程（消声室 / 半消声、回声路径测量、双讲用例）的可复现实验手册仍缺
