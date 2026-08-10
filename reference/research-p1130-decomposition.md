# ITU-T P.1130 整机→子系统分解：39 参数分了什么、推导顺序缺口长什么样

对应 GitHub issue [zhiwei1988/learning-audio#18](https://github.com/zhiwei1988/learning-audio/issues/18)（地图 [#16](https://github.com/zhiwei1988/learning-audio/issues/16) 的子工单）。承接 [#4 的既有 findings](https://github.com/zhiwei1988/learning-audio/blob/master/reference/research-handsfree-spec-standards.md)，不重复它已证的内容，只往"分解"这一层深挖。

**结论先说**：P.1130 把车载免提整机拆成 8.3（声学子系统：通用 5 条 + 麦克风采集链 8 条 + 喇叭放音链 9 条）、8.4（信号增强子系统，即 AEC+NS+AGC 算法层，**39 条**）、9（双向网络传输，19 条）、10（单向短距无线，9 条）四大块，全文档共 89 条子系统级参数——但**"39"这个数字标准原文从未自己说过**（全文搜索 "39" 零命中），是把 §8.4 的 42 个编号条目减去 1 条测试装置说明（8.4.1）、再减去 2 条连参数符号都没分配的 AGC 占位条款（8.4.6/8.4.8）反推出来的，本报告核实了这个反推站得住脚。更关键的发现：**"没回答推导顺序"这个缺口不是均匀的**——时延这一条，P.1130 用 Annex C 给了完整的子系统→整机加总方法外加两个数字化 worked example（还直接对着 P.1110 的整机时延上限验算）；除了时延，其余全部 88 条参数唯一的换算依据是 §6 一段定性宣言："Class 2 大概率满足 P.1100/P.1110""假设可加性"，然后自己在下一句承认"某子系统某参数弱不代表整机这个参数就弱"——**没有公式、没有百分比拆账、没有反向验证，"budget/allocate/apportion" 这几个词在 180 页全文里一次都没出现过**。检查的三份邻接标准里，P.1110 和 TS 103 740 都不提"subsystem"这个词（全文搜索零命中），没有补上这个缺口；P.1150（车内对讲放大，2020 年单一版本）付费且无免费旧版可查，本次未能核实全文，按仓库惯例标记为"查无"。

---

## 0. 核实范围说明

| 标准 | 核实方式 | 版本 |
|---|---|---|
| ITU-T P.1130 | **一手全文**，PDF 转纯文本逐条核对（180 页，7227 行文本） | (06/2015)，现行版本 |
| ITU-T P.1110 | **一手全文**，针对性检索"subsystem/P.1130/budget/allocation/apportion"关键词 | (01/2015，superseded，免费镜像) |
| ETSI TS 103 740 | **一手全文**，针对性检索"subsystem"关键词 | V1.4.1 (2021-10) |
| ITU-T Technical Report GSTR-Perf_Req | **一手全文**，核实后排除——与本题无关 | (09/2025)，主题是 IMS/VoLTE/VoNR 网络交换性能，不涉及车载/免提子系统分解 |
| ITU-T P.1150 | **仅摘要**，未获取全文 | (01/2020)，现行且唯一版本，无免费旧版，两次尝试均未找到免费副本 |

查证方法：P.1130 直接从 ITU 官网免费 PDF 入口获取（`T-REC-P.1130-201506-I!!PDF-E`），用 `pdftotext -layout` 转成纯文本后逐章节 grep 核对条款编号与标题，避免只信 AI 摘要漏看条款。P.1110 用 #4 记录过的"已被取代旧版免费"模式获取。TS 103 740 用标准浏览器 UA 直接下载（ETSI 免费策略，#4 已证）。P.1150 只有一个版本、现行即付费，无旧版可绕过付费墙——这点和 #4 里 P.1120 的处境相同。

---

## 1. P.1130 整机→子系统分解的完整地图

P.1130 §7 定义四种物理架构（distributed speakerphone / 集成麦克风 / 集成喇叭 / 集成麦克风+喇叭），但真正的分解粒度在 §8-10：

```
整机（P.1100/P.1110 定义的车载免提整机指标，本身不在 P.1130 范围内）
  │
  └─→ §8 Subsystems（子系统级，P.1130 主体）
        ├─ §8.3 Acoustic subsystem（声学子系统，硬件线）
        │    ├─ §8.3.1 General（通用，5 条）—— 处理增强之前的原始声学+电耦合
        │    ├─ §8.3.2 Microphone subsystem / send path（采集链，8 条）
        │    └─ §8.3.3 Audio subsystem / receive path（放音链，9 条）
        │    [Annex A Microphone in anechoic conditions（麦克风器件级/消声室条件，6 条，独立于车厢环境)]
        │
        └─ §8.4 Signal enhancement subsystem（信号增强子系统，算法线，AEC+NS+AGC，39 条）
  │
  ├─→ §9 Bidirectional signal transport including network transport（双向网络传输，19 条）
  └─→ §10 Unidirectional signal transport: wired and short range wireless（单向短距无线，即车规蓝牙链路，9 条）
```

全文档子系统级参数条目总计：5 + 8 + 9 + 39 + 19 + 9 = **89 条**（Annex A 的 6 条麦克风器件级测量是独立于车厢环境的备用条目，不计入主表）。

一手来源：ITU-T Rec. P.1130 (06/2015) 目录（Table of Contents，pp. i-v）与正文 §7-10、Annex A-C 逐条核对，<https://www.itu.int/rec/T-REC-P.1130-201506-I>。

### 1.1 §8.3 声学子系统（硬件线）—— 22 条

**§8.3.1 General（5 条，适用于处理增强之前的整条声学通路，不分送/受话）**：

| 条款 | 参数 |
|---|---|
| 8.3.1.1 | Clock synchronization accuracy（子系统时钟同步精度） |
| 8.3.1.2 | Acoustic subsystem delay（声学子系统时延） |
| 8.3.1.3 | Acoustic subsystem echo path overload point（回声路径过载点） |
| 8.3.1.4 | Acoustic subsystem weighted terminal coupling loss（TCLwAS / TCLAS，**信号增强处理前**的麦克风-喇叭耦合损耗） |
| 8.3.1.5 | Time invariance of processing（处理的时不变性） |

**§8.3.2 Microphone subsystem / send path（采集链，8 条，标题里明写"(in the car)"的 4 条 + 无此限定的 4 条）**：

| 条款 | 参数 |
|---|---|
| 8.3.2.1.1 | Microphone overload point (in the car)（麦克风过载点，车内） |
| 8.3.2.1.2 | Microphone frequency response (in the car)（麦克风频响，车内） |
| 8.3.2.1.3 | Microphone idle channel noise (in the car)（麦克风空闲信道噪声，车内） |
| 8.3.2.1.4 | Microphone SNR (in the car)（麦克风信噪比 SNRD，车内；**Table 8-11/8-12 四档 Performance Class 的数值全部标 "FFS"**，本次已用 `pdftotext` 逐字核对，见 §3 详述） |
| 8.3.2.1.5 | Microphone send reverberation (SRV)（送话混响度） |
| 8.3.2.1.6 | Microphone send input/output linearity（送话输入输出线性度） |
| 8.3.2.1.7 | Microphone send speech quality（送话语音质量） |
| 8.3.2.1.8 | Microphone send speech quality with background noise（带噪送话语音质量） |

**§8.3.3 Audio subsystem / receive path（放音链，9 条）**：

| 条款 | 参数 |
|---|---|
| 8.3.3.1 | Audio subsystem delay（受话子系统时延） |
| 8.3.3.2 | Audio subsystem sensitivity frequency response（受话灵敏度频响） |
| 8.3.3.3 | Audio subsystem speech quality（受话语音质量） |
| 8.3.3.4 | Audio subsystem idle channel noise（受话空闲信道噪声） |
| 8.3.3.5 | Audio subsystem output level at maximum level setting（最大音量档输出电平） |
| 8.3.3.6 | Audio subsystem overload point（受话过载点） |
| 8.3.3.7 | Audio subsystem delay between REF and LSP（参考点到扬声器的时延差） |
| 8.3.3.8 | Audio subsystem linearity between reference output and LSP（参考输出到扬声器的线性度） |
| 8.3.3.9 | Coherence between reference output and LSP（参考输出到扬声器的相干性） |

**Annex A（独立于车厢，麦克风器件级/消声室条件，6 条——与 §8.3.2.1 的"车内"版本逐条对应）**：

| 条款 | 参数 | 对应 §8.3.2.1 的"车内"版本 |
|---|---|---|
| A.1 | Microphone sensitivity（消声室灵敏度） | （§8.3.2.1 无对应，灵敏度只在消声室测） |
| A.2 | Microphone frequency response（消声室频响） | 8.3.2.1.2（车内频响） |
| A.3 | Microphone directional characteristics（消声室指向性） | （§8.3.2.1 无对应） |
| A.4 | Microphone distortion（消声室失真） | （§8.3.2.1 无对应） |
| A.5 | Microphone maximum SPL（消声室最大声压级） | 8.3.2.1.1（车内过载点，同一物理量的两种测量条件） |
| A.6 | Microphone dynamic range（消声室动态范围） | （§8.3.2.1 无对应） |

**这个 Annex A / §8.3.2.1 的双轨结构本身就是本次调研最有用的一个方法论发现**——P.1130 自己已经把麦克风指标拆成"器件级（消声室，与安装环境无关）"和"装机级（车内，与车厢声学环境强绑定）"两条独立测量轨道，这正是 issue 问题 2（哪些能直接借骨架）的现成答案，详见 §2。

一手来源：ITU-T Rec. P.1130 (06/2015) §8.3、Annex A，pp. 15-49、144-151。

### 1.2 §8.4 信号增强子系统（算法线）—— 39 条，全文档粒度最细的一块

§8.4 跨 49-106 页（57 页，占全文档三分之一篇幅），是唯一一个 ITU-T 免提标准家族里给到"AEC+NS+AGC 模块本身该测哪些指标"这个粒度的条款集合。完整条款编号是 8.4.1 到 8.4.42（42 个编号条目），但不是每个编号都是一个"参数"：

- **8.4.1 Test set-up**：测试装置说明，不是参数。
- **8.4.6 / 8.4.8**（送话/受话 AGC）：正文原话——"Other measurement procedures are needed to characterize the different type of AGC mechanisms... This is for further study."——**连参数符号都没分配**，纯粹是一段说明"这里应该有个指标但我们还没定义"，标题本身都不带缩写符号（对比其余条目标题都带 `(XXX)` 形式的符号）。

42 − 1（测试装置）− 2（无符号的 AGC 占位段）= **39**——这就是"39 个信号增强参数"的来源，本次核实确认这个反推逻辑成立（按"是否分配了参数符号"这个标准切分，干净地落在 39）。但**这 39 条内部完成度差异很大**，逐条核对后可以再分三档：

| 完成度 | 条目数 | 举例 |
|---|---|---|
| 完整（有测试方法 + 数值化 Performance Class 表） | 约 33 条 | 8.4.7 Receive signal level：Table 8-44 给出 Class 1-4 分别 `0±0.5dB / 0±3dB / 0±6dB / >±6dB`；8.4.29 Receive activation：Table 8-81 给出 RALSE-min 与建立时间的完整四档表 |
| 有方法、数值留白（FFS） | 若干（如 §8.3.2.1.4 麦克风 SNR，虽属 §8.3 不属 §8.4，但同一种"有方法无数值"的缺口模式在 §8.4 内也存在，例如 8.4.6/8.4.8 描述的 AGC 需求） | 见上 |
| **纯占位，除一句话定义外空白**（Test / Classification / Design guidance 三个子条款全部写 "For further study"） | **至少 4 条**：8.4.14 Receive intelligibility (RIE)、8.4.36 Speech-to-echo ratio (SpERE)、8.4.37 SNR improvement (SNRIE)、8.4.42 Speech recognition accuracy indicator (SRAIE) | 8.4.37 原文全部内容仅两句："This measurement parameter is for further study. It provides a measurement of the send speech level relative to the noise level at the output of the signal enhancement subsystem." |

39 条完整清单（按条款号）：

| # | 条款 | 参数（符号） |
|---|---|---|
| 1 | 8.4.2 | Round-trip delay of signal enhancement (TSERTD)——**是 8.4.3+8.4.4 的加总，不是独立测量的参数** |
| 2 | 8.4.3 | Signal enhancement delay in send direction (TSES) |
| 3 | 8.4.4 | Signal enhancement delay in receive direction (TSER) |
| 4 | 8.4.5 | Send signal level (LSES) |
| 5 | 8.4.7 | Receive signal level (LSER) |
| 6 | 8.4.9 | Send sensitivity frequency response (FRSES) |
| 7 | 8.4.10 | Receive sensitivity frequency response (FRSER) |
| 8 | 8.4.11 | Send speech quality (MOS-LQOSES) |
| 9 | 8.4.12 | Receive speech quality (MOS-LQOSER) |
| 10 | 8.4.13 | Send intelligibility (SIE) |
| 11 | 8.4.14 | Receive intelligibility (RIE) —— **纯占位** |
| 12 | 8.4.15 | Send speech-to-idle-channel-noise ratio (SINRSES) |
| 13 | 8.4.16 | Receive speech-to-idle-channel-noise ratio (SINRSER) |
| 14 | 8.4.17 | Discrimination against out-of-band signals, send (DOOBSES) |
| 15 | 8.4.18 | Spurious out-of-band signal, receive (SOOBSER) |
| 16 | 8.4.19 | Distortion in send (DSES) |
| 17 | 8.4.20 | Distortion in receive (DSER) |
| 18 | 8.4.21 | Weighted terminal coupling loss (TCLwSE / TCLSE) |
| 19 | 8.4.22 | Echo level versus time (ELVTSE) |
| 20 | 8.4.23 | Spectral echo attenuation (SEASE) |
| 21 | 8.4.24 | Initial convergence without background noise (ICSE) |
| 22 | 8.4.25 | Initial convergence with background noise (ICBNSE) |
| 23 | 8.4.26 | Echo performance with time variant echo path (TVEPSE) |
| 24 | 8.4.27 | Echo performance with time variant echo path and speech (TVEPSE-SP) |
| 25 | 8.4.28 | Send activation (SASE) |
| 26 | 8.4.29 | Receive activation (RASE) |
| 27 | 8.4.30 | Send attenuation range (AH,SSE) |
| 28 | 8.4.31 | Receive attenuation range (AH,RSE) |
| 29 | 8.4.32 | Send attenuation range during double-talk (AH,S,dtSE) |
| 30 | 8.4.33 | Receive attenuation range during double-talk (AH,RdtSE) |
| 31 | 8.4.34 | Detection of echo components during double-talk (DECDT-SE) |
| 32 | 8.4.35 | Sent speech attenuation during double-talk (SSADT-SE) |
| 33 | 8.4.36 | Speech-to-echo ratio (SpERE) —— **纯占位** |
| 34 | 8.4.37 | SNR improvement (SNRIE) —— **纯占位** |
| 35 | 8.4.38 | Background noise transmission after call set-up (BGNTACSE) |
| 36 | 8.4.39 | Enhanced speech quality in presence of background noise (SQPBGNE) |
| 37 | 8.4.40 | Enhanced quality of background noise transmission with far-end speech (QBGNTFSE) |
| 38 | 8.4.41 | Comfort noise injection after enhancement (CNIE) |
| 39 | 8.4.42 | Speech recognition accuracy indicator (SRAIE) —— **纯占位** |

一手来源：ITU-T Rec. P.1130 (06/2015) §8.4，pp. 49-106，全部 42 个编号条目逐条核对标题与子条款结构。

### 1.3 §9/§10 传输子系统（网络编解码线 + 短距无线线）

§9 Bidirectional transport（19 条：9.1-9.19，送/受话各一套时延、时钟漂移、结点响度评定、线性度、灵敏度频响、空闲信道噪声、语音质量、语音质量稳定性，外加禁用回声控制验证与加权耦合损耗）建模的是"车机头单元↔蜂窝网络"这条腿；§10 Unidirectional transport（10.1 测试装置 + 10.2-10.10 共 9 条，同构的时延/时钟漂移/响度评定/线性度/频响/空闲噪声/语音质量清单）建模的是"手机↔车机"这条车规短距无线（通常蓝牙）链路。两者都不是本次问题 1/2 的重点（IPC 没有"手机中转"这一跳），仅在问题 2 的骨架借用判断里简要提及。

一手来源：同上，§9-10，pp. 106-143。

---

## 2. 哪些条目能直接当 IPC 算法线/硬件线需求条目的骨架，哪些不迁移

### 2.1 能直接借的：方法论层面

1. **测量拓扑（test point 命名 S1-S5/R1-R5）**：P.1130 §7-8 把每个子系统的输入输出定义为独立可寻址的电气/声学接口，测试时可以只接入某个子系统而不依赖上下游实际存在。这套"分段可测"的架构思想直接可用——#4 已指出 P.1100 §12（SRW 验证）支持分段测，P.1130 把这个思想在子系统粒度上系统化了一整套接口命名，IPC 的"MCU 内录 vs 云端解码"分段验收可以直接借这套接口划分逻辑，而不是具体的 S1-S5 定义本身。
2. **Annex A / §8.3.2.1 的"器件级 vs 装机级"双轨结构**：P.1130 自己已经把麦克风指标拆成消声室器件级（Annex A：灵敏度/频响/指向性/失真/最大声压/动态范围）和车内装机级（§8.3.2.1：过载点/频响/空闲噪声/SNR/混响/线性度/语音质量，"(in the car)"），两轨对同一物理量给出不同的测量条件。**这个切分逻辑本身可以整体照搬**——IPC 硬件线需求文档应该同样区分"麦克风器件 datasheet 指标（与摄像机腔体无关）"和"装进摄像机腔体后的指标（与结构/密封/出音孔强相关）"，这正是 IPC 结构线与硬件线的天然分界，P.1130 提前把这条界线画好了。
3. **§8.3.1 通用声学子系统（处理前的原始耦合，5 条，尤其是 TCLwAS/TCLAS 回声路径耦合损耗）**：这是"信号增强算法介入之前，纯靠腔体/结构/器件布局能做到多少回声隔离"的正式定义条款，和 NOTES.md/RESOURCES.md 已经确立的"腔体决定 ERL 天花板"命题完全对应，但 P.1130 给了正式符号（TCLwAS/TCLAS）和独立测试方法（§8.3.1.4）。这条可以直接作为 IPC **结构线**需求条目的骨架（测量口径整体照搬，数值需按摄像机自己的麦克风-喇叭间距/腔体重新定）。
4. **§8.4 的 39 条参数名称/分类体系**：即便约 1/3 数值留白、4 条纯占位，这仍是全行业标准家族里最细粒度的"AEC+NS+AGC 该测什么"清单（时延、电平、AGC、频响、MOS、可懂度、SINR、带外抑制、失真、TCL、回声电平-时间曲线、频谱回声衰减、含/不含噪声收敛、动态回声路径、激活特性、单/双讲衰减范围、双讲回声检测、语音回声比、SNR 改善量、建立后背景噪声传输、带噪增强质量、舒适噪声、语音识别准确率指标）——这份条目名称清单可以整体作为 IPC **算法线**需求文档的骨架条目库，数值和测试网格（见下）需要重新定。
5. **Annex C 时延加总方法（C.3-C.6）**：唯一一处给出"子系统→整机"完整数字化换算关系的地方，方法本身（buffer delay / algorithmic delay / computational delay 三分类 + 共享缓冲导致非线性加总，见 §3）不含车载假设，是纯粹的 DSP 系统工程方法，可直接扩展进 NOTES.md 已有的"缓冲统治时延"账本。

### 2.2 不迁移的：车载假设锚定的部分

1. **Annex B 标准场景网格（Table B.1，7 档场景）**：由车速（0/60/120/≥160 km/h）、HVAC 风扇档位、路面（干燥粗糙路面）、风速、降水、温度共同定义，**§6 明文规定这套场景网格适用于所有子系统**（"the user scenarios as described in Annex B apply to all subsystems"），几乎每一张 §8.4 的 Performance Class 表都按这套车速/HVAC 分档（例如 §8.3.2.1.4 麦克风 SNR 表按"≤80km/h"和"≤120km/h"两档分别列限值）。这套网格 100% 车载专属，IPC 没有车速、没有 HVAC、没有路面——**需要摄像机自己建一版背景噪声场景网格**（PoE 供电噪声、风扇/云台电机、IR-cut 切换、室内/临街环境）来替换 Annex B，这点 #4 的空白清单第 4 条已经点出，本次从 P.1130 的条款结构上进一步坐实——它不是"某几条数值不能用"，而是**驱动全部 39 条参数分级表格的底层场景变量整体不适用**。
2. **§8.2.3.1 Lombard 效应公式与 HFRP 校准**：送话侧口输出电平按"驾驶员头部位置测得的长期 A 计权噪声"分段加成（N≤50dB(A) 不加、50-77dB(A) 每超 10dB 加 3dB、>77dB(A) 顶格 8dB），且 HATS-HFRP 校准基准是车载免提标准固定的 50cm 参考嘴距下的 −25.7dBPa。这条公式喂给几乎所有送话方向的 §8.3.2/§8.4 测试信号电平——IPC 是 1-5m 远场拾音，这套近场校准与噪声加成公式整体不适用（呼应 #4 已证的近场/远场结论，本次定位到具体喂给哪些下游条款）。
3. **§10 单向短距无线（车规短距无线，通常蓝牙）**：整个子系统建模"手机↔车机"这一跳，典型单体 IPC 没有对应架构，只有"分体对讲基站"产品线（麦克风/算法处理器/喇叭物理分离，对应 P.1130 §7.1 distributed speakerphone 架构）才可能用得上这条子系统的方法论。
4. **§9 双向传输的响度评定/时延假设**：建模的是电信电路域/分组域语音网络（ITU-T P.79 响度评定公式、telecom 抖动缓冲假设），IPC 走 RTSP/RTMP/私有信令+移动互联网，网络特性差异很大——#4 空白清单第 7 条已指出这点，本次确认 P.1130 §9 没有额外补充适配非电信网络的内容。

---

## 3. "没回答推导顺序"的缺口具体长什么样

这是本次调研最重要的定位工作。逐条核实后，答案不是"给了限值没给分账方法"这一种情况，也不是"整机↔子系统换算关系完全没有"这一种情况，而是**两者都对，但分属不同参数**：

### 3.1 时延：唯一给出完整加总方法+worked example 的参数

Annex C.5「Subsystem delay and relationship to overall delay」正文：

> "It is recognized that for frame-based implementations the sum of the input-to-output delays of the individual subsystems may be higher than the total delay of the implementation because frame buffers could be shared by different subsystems."

Annex C.6 给出两组具体数字化例子（宽带 SRW/免提系统）：

- **"好"实现**：送话方向各子系统时延 1.5+0.5+15+25+7.5+15 = 64.5ms，受话方向 15+15+15+7.5+0.5+2 = 55ms，往返 119.5ms，**"which meets [ITU-T P.1110]"**——直接对着 P.1110 的整机往返时延上限验算。
- **"坏"实现**（信号增强子系统独立芯片实现、帧间隔与 SRW 不对齐）：送话 90ms + 受话 80.5ms，往返 170.5ms，**"which cannot meet [ITU-T P.1110]"**。

且明确指出子系统时延加总不是简单求和——因共享缓冲，例中送话方向"the total system delay calculated above is much shorter than just the sum of these two subsystems"（信号增强子系统与 SRW 子系统共享了 7.5ms 缓冲 + 7.5ms 计算时延）。这是全文档唯一一处：①给出子系统→整机的量化换算方法（Annex C.3-C.4 的四种缓冲仲裁情形）；②直接对着上游整机标准（P.1110）的数值验算；③用真实数字走了一遍完整流程。

### 3.2 其余全部参数：只有一段定性宣言，没有公式

§6「How to use this Recommendation」是全文档唯一试图建立子系统↔整机关系的通用性文字，原文：

> "Performance Class 2 characterizes an implementation which most likely fulfils the requirements in [ITU-T P.1100] and [ITU-T P.1110]. Performance Class 2 can be expected to be representative for good implementations."
>
> "Performance Class 3 characterizes some weakness for the parameter under test. If a parameter is fulfilling just Performance Class 3 it may be acceptable only given that other parameters benefit from that or may compensate the weakness of this parameter, and the complete system still fulfils the requirements of [ITU-T P.1100] and [ITU-T P.1110]."
>
> "As a basic principle additivity of the parameters is assumed. This means that a parameter with a high performance for all subsystems will most likely lead to a good overall performance of the complete system. However, it is recognized that a weakness of one parameter in a subsystem does not necessarily lead to a weakness of this parameter for the overall system."

三处措辞（"most likely"、"may be acceptable only given that other parameters... may compensate"、"additivity... is assumed"）全部是不可验证的定性表述，且标准自己在同一段里承认这个"假设的可加性"不总是成立——但**没有给出任何机制**去判断"什么时候不成立""不成立时该怎么调整分账""子系统 Class 2 对应整机哪个具体余量"。全文 180 页对 "budget" "allocation" "apportion" 三个关键词做全文检索，**零命中**——即便是最基本的"这条子系统限值占整机预算的百分之多少"这类表述也不存在。

**结论**：缺口不是均匀的"整机↔子系统换算关系完全没有"，而是"**唯独时延这一条给了完整的量化加总方法（且是靠 case-by-case 手工核算，不是通用公式），其余 88 条参数系统性地只有一句不可操作的定性宣言**"。这个定位比 #4 原来"给了限值没给分账方法"的笼统表述更精确——时延甚至没有"限值"意义上的分账公式，而是靠具体实现走一遍缓冲仲裁规则（Annex C.4 的四种 case）算出来的；其余参数则是连这种手工核算的路径都没有，只能各子系统自己按 Performance Class 达标，指望"可加性大概率成立"。

一手来源：ITU-T Rec. P.1130 (06/2015) §6 (p. 9)、Annex C.3-C.6 (pp. 154-159)。

---

## 4. 邻接标准有没有补上这个缺口

### 4.1 ITU-T P.1110（宽带车载免提整机）—— 没有

对 P.1110 (01/2015) 全文做关键词检索："subsystem"、"P.1130"、"budget"、"allocation"、"apportion"——**全部零命中**。P.1110 是纯粹的整机级标准，完全没有涉及"如何把整机限值拆给子系统"的内容，也不反向引用 P.1130（时间线上 P.1110 发布于 2015 年 1 月，P.1130 发布于同年 6 月，且 P.1130 §2 References 列出 P.1100/P.1110 作为其规范性引用，方向是子系统标准引用整机标准，不是反过来）。

一手来源：ITU-T Rec. P.1110 (01/2015，superseded)，经 `T-REC-P.1110-201501-S!!PDF-E` 免费镜像获取，全文检索核实。

### 4.2 ETSI TS 103 740 —— 没有

对 TS 103 740 V1.4.1 全文做"subsystem"关键词检索——**零命中**。TS 103 740 是整机级无线终端标准（#4 已证：车载配置整条引用 P.1110，其余配置沿用 P.340 双讲分级表），全文没有子系统分解，自然也不存在子系统↔整机换算关系。

一手来源：ETSI TS 103 740 V1.4.1 (2021-10)，<https://www.etsi.org/deliver/etsi_ts/103700_103799/103740/01.04.01_60/ts_103740v010401p.pdf>，全文检索核实。

### 4.3 ITU-T P.1150（车内对讲，In-car communication）—— 查无

P.1150（01/2020，"In-car communication audio specification"）只有一个版本、现行即付费，两次尝试均未找到免费旧版副本，**本次未获取全文，不作为可引用结论使用**。仅能确认公开摘要信息：P.1150 针对的是车厢内乘员之间用麦克风+喇叭放大对话（in-car communication，ICC），**不是**免提通话（hands-free telephony）——应用场景与 P.340/P.1100/P.1110/P.1130 这条"打电话"主线不同，即便获取全文，是否会补上子系统换算关系也存疑，需要另立调研单独核实，不能假定它相关。

同时排查了一份可能相关的候选文档 ITU-T Technical Report GSTR-Perf_Req (09/2025)，全文核实后确认主题是 IMS/PES/VoLTE/VoNR 网络交换性能要求，与车载/免提子系统分解无关，排除。

---

## 5. 结论回应 issue 的四个问题

1. **39 个参数具体分解了哪些子系统，条目清单长什么样**——见 §1：声学子系统（硬件线）22 条（通用 5 + 采集链 8 + 放音链 9，另有 Annex A 器件级 6 条独立备用）；信号增强子系统（算法线）39 条，占全文档篇幅三分之一，是全行业粒度最细的一份；网络传输两条腿（§9 双向 19 条 + §10 短距无线 9 条）。"39"这个数字标准自己从未声明过，是 42 个编号条目减去 1 条测试装置说明、减去 2 条无符号占位条款反推出来的，其中至少 4 条连测试方法都是空白（纯 "for further study"）。
2. **哪些能直接借骨架，哪些因车载假设不迁移**——见 §2：能借的是方法论层——测量拓扑（分段可测的接口设计）、Annex A/§8.3.2.1 的器件级/装机级双轨结构（直接对应 IPC 结构线/硬件线的分界）、§8.3.1 的处理前耦合损耗定义（结构线锚点）、§8.4 的 39 条参数名称体系（算法线骨架）、Annex C 时延加总方法；不迁移的是 Annex B 车速/HVAC/路面场景网格（驱动几乎全部分级表格）、Lombard 效应公式与近场 HFRP 校准、§10 手机-车机短距无线架构、§9 电信网络响度评定假设。
3. **推导顺序缺口具体长什么样**——见 §3：不是均匀缺失。时延这一条有完整的加总方法+两个数字化 worked example，直接对着 P.1110 验算；其余 88 条参数唯一的依据是 §6 一段自我矛盾的定性宣言（"假设可加性""但不保证"），全文对"budget/allocation/apportion"零命中，没有公式、没有百分比拆账、没有反向验证机制。
4. **邻接标准有没有补上**——见 §4：P.1110、TS 103 740 全文检索"subsystem"关键词均为零命中，都没有补上这个缺口；P.1150 付费且无免费版本，本次未核实，标记查无，不排除但也不能假定它相关。

---

## 附：本次核实的一手来源清单

- ITU-T Rec. P.1130 (06/2015)：<https://www.itu.int/rec/T-REC-P.1130-201506-I>，直接 PDF 入口 `https://www.itu.int/rec/dologin_pub.asp?lang=e&id=T-REC-P.1130-201506-I!!PDF-E&type=items`，180 页全文已用 `pdftotext -layout` 转纯文本逐条核对。
- ITU-T Rec. P.1110 (01/2015，superseded)：经 `T-REC-P.1110-201501-S!!PDF-E` 免费镜像获取，全文检索核实。
- ETSI TS 103 740 V1.4.1 (2021-10)：<https://www.etsi.org/deliver/etsi_ts/103700_103799/103740/01.04.01_60/ts_103740v010401p.pdf>，全文检索核实。
- ITU-T Technical Report GSTR-Perf_Req (09/2025)：<https://www.itu.int/dms_pub/itu-t/opb/tut/T-TUT-TEST-2025-7-PDF-E.pdf>，全文核实后确认与本题无关，排除。
- ITU-T Rec. P.1150 (01/2020)：<https://www.itu.int/rec/T-REC-P.1150/en>，仅核实到摘要级信息，全文未获取（付费、无免费旧版），标记查无。
