# 店铺混响这本账：RT60 量级、直达/混响比的可懂度刻度、去混响能买回多少

对应 GitHub issue [zhiwei1988/learning-audio#11](https://github.com/zhiwei1988/learning-audio/issues/11)。

**结论先说**：现有工单「240 m³ / RT60 0.8 s / 混响半径 1.0 m / D/R ≈ −18 dB」这组数，三件事被本次调研部分或完全推翻/坐实：(1) 0.8 s **不是一个保守估计，反而偏乐观**——本次找到的唯一一个体量与 240 m³ 接近的真实小店实测（203 m³ 服装店，未处理）RT 达 **2.11 s**，是拍脑袋数的 2.6 倍；(2) D/R −18 dB 已经远远超出「距离还能救」的物理边界（Peutz 公式的有效边界在 D/R = −11 dB，对应 3.5 倍混响半径，8 m 相当于 8 倍），意味着**再退后或再喊大声都不会让可懂度更差——它已经封顶在只由 RT60 决定的下限上**，用 RT60 = 0.8 s 代入换算，落在 STI ≈ 0.45–0.6（IEC 60268-16 的 "fair" 档），是「费劲但基本能听懂」而非「听不懂」；(3) 去混响这件事，**主流开源电话音频栈里根本没有能用的模块**——WebRTC APM 的 Config 里连 "reverb" 这个词都不出现，SpeexDSP 倒是留了 `SPEEX_PREPROCESS_SET_DEREVERB` 系列宏，但读源码会看到关键的 LEVEL/DECAY 设置代码被整段注释掉、标着「FIXME: 等去混响真正启用后再打开」——**这是一个挂了名字但没有实现的死接口**；TI TIDA-01589 文档里出现的「De-reverberation」也是一个易读错的词——它指的是 AEC 对回声路径变化的鲁棒性，不是本 issue 说的去混响，Table 5 的 MIPS 表里也确实没有去混响这一行；学术界的 U-net 去混响论文（León & Tobar）给了 SRMR/PESQ 提升数但**只字未提算力代价**，是这篇一手论文自己的空白；唯一给出可对比算力锚点的是经典 WPE 算法的开源实现 NARA-WPE，在树莓派 3B+ 上跑到 4 麦克风勉强实时；(4) P.340 和 ETSI TS 103 740 对混响的处理方式不是「有规定」或「回避」的二选一，而是**按测试目的分裂成两半**：大多数测量要求消声室（把 RT 当干扰变量清除），但专门测 AEC/双讲时反过来**必须**用有真实混响的房间——P.340 给了具体数字（免提终端/可视电话 500 ms、90 m³ 会议室 400 ms），ETSI TS 103 740 保留了这个「要用真实房间」的结构性要求，却把具体 RT 数字这一格**留白了**，没有继承下来。

---

## 0. 核实范围说明

| 来源 | 核实方式 | 版本/出处 |
|---|---|---|
| ITU-T P.340 | **一手全文**（免费 PDF，ITU 官网，本次独立下载核实） | (05/2000)，31 页 |
| ETSI TS 103 740 | **一手全文**（ETSI 官网免费，本次独立下载核实） | V1.4.1 (2021-10)，45 页 |
| León & Tobar, arXiv 2110.02144 | **一手全文**（arXiv 免费 PDF，本次独立下载核实） | 2021-10-05，5 页 |
| Alnuman & Altaweel 2020, *Applied Sciences* 10(3):1170 | **一手全文**（MDPI CC-BY 开放获取，MDPI 官网被 Cloudflare 拦截，经 Wayback Machine 快照读到完整正文含 Table 3） | DOI: 10.3390/app10031170 |
| Kanev 2021, *Acoustics* 3(1):137–155 | **一手全文**（同上，经 Wayback Machine 快照） | DOI: 10.3390/acoustics3010011 |
| Caruso Acoustic 服装店案例 | **一手厂商案例**（官网直接抓取成功） | carusoacoustic.com，未标注具体年份 |
| IEC 60268-16 | **仅目录/前页核实**（webstore/iteh 预览 PDF 只放开 Scope 与目录，STI 分级表所在的 Annex F/G 正文本身是付费内容，未获取） | Ed.5 (2020) 与 Ed.3 (2003) 两版目录均已核实 |
| Peutz/Becker ALcons↔STI↔D/R 换算 | **二手工程站点转述**（sengpielaudio.com，未找到 Peutz 1971 JAES 原文免费版） | 原始出处：V.M.A. Peutz, *JAES* 19(11), 1971（未获取全文） |
| NARA-WPE (Drude et al. 2018) | **一手全文**（作者机构 Paderborn 大学官网免费 PDF，本次独立下载核实） | ITG 2018 会议论文 |
| TI TIDUE77 (TIDA-01589 用户指南) | **一手全文**（TI 官网免费 PDF，本次独立下载核实，含全文 grep） | 2018-10 |
| WebRTC `api/audio/audio_processing.h` | **一手源码**（Google 官方仓库，直接读取） | main 分支现状 |
| SpeexDSP `speex_preprocess.h` / `preprocess.c` | **一手源码**（xiph/speexdsp 官方仓库，直接读取） | master 分支现状 |
| AS/NZS 2107（零售分类 RT 推荐值） | **未获取一手全文**（付费标准，只查到二手转述且怀疑有单位识别错误） | 明确标注为空白，见第 5 节 |

---

## 1. 零售/店铺空间 RT60 的典型范围

### 1.1 与 240 m³ 最接近的一个真实数：未处理的小店 RT 是 0.8 s 的 2.6 倍

**[厂商案例]** Caruso Acoustic 声学处理案例（意大利声学处理板材商）——一家 **203 m³** 服装店，声学处理前**平均混响时间（250–2000 Hz 均值）2.11 s**；加装 18 块 120×120×5 cm 吸声板（天花板+墙面）后降到 **0.72 s**，改善 4.69 dB。

口径：203 m³ 与工单的 240 m³ 体量级几乎一致；测量方式文中只写「设计阶段的声学分析」，未注明是否按 ISO 3382 测、用什么信号源、测几次——这是本条数据唯一的短板，但**体量匹配度是本次调研找到的所有数据点里最高的**。

读数标尺：2.11 s 这个「处理前」的数直接说明——**0.8 s 不是一个未处理小店的典型值，更像是处理过之后才能拿到的数**（处理后 0.72 s，与工单假设的 0.8 s 同一量级）。换句话说，工单如果想用 0.8 s，前提应该明确写成「假设已做声学处理」，而不是默认值。

出处：<https://carusoacoustic.com/en/magazine/improving-acoustics-in-commercial-spaces-a-case-study/>

### 1.2 大体量商场公共空间：0.9–1.4 s 是「还过得去」的档，3–5 s 是「没人管过」的档

**[一手论文]** Alnuman & Altaweel, "Investigation of the Acoustical Environment in A Shopping Mall and Its Correlation to the Acoustic Comfort of the Workers," *Applied Sciences* 10(3):1170 (2020)。

在约旦一家商场实测（空场、开门前，按 **ISO 3382-1** 测，500/1000/2000 Hz 三频段取算术平均，每处测三次取均值）：

| 位置 | 500 Hz | 1000 Hz | 2000 Hz | 均值 (s) |
|---|---|---|---|---|
| 游乐区 1 | 1.20 | 1.22 | 1.18 | 1.20 |
| 游乐区 3 | 1.01 | 1.04 | 1.00 | 1.02 |
| 美食广场 1 | 1.00 | 0.95 | 0.98 | 0.98 |
| 美食广场 2（两测点） | 1.02/1.08 | 0.96/1.06 | 0.75/0.83 | 0.91 / 0.99 |
| 入口 1 | 1.16 | 1.10 | 1.02 | 1.09 |
| 入口 2（挑高中庭） | 2.00 | 1.30 | 0.90 | **1.41**（全场最高） |
| 入口 3 | 1.12 | 1.44 | 1.12 | 1.23 |
| 购物区 1–3 | — | — | — | 1.19–1.27 |

原文明确把这组数字和一条法规挂钩：*"The NFPA 72 requires the Public Address and Voice Alarm (PA/VA) system to be intelligible and requests a speech intelligibility index (STI) of 0.5 or better for 90% of the space... For very large spaces, such as shopping centers and malls, as well as airports, the aim is to achieve an RT of 1.1–1.32 s (averaged at frequencies of 500, 1000, and 2000 Hz)."*——即这篇论文给出的「商场类大空间目标 RT」不是拍的，是从 NFPA 72（美国消防紧急广播系统规范）反推出来的，本质是 STI≥0.5 这条底线换算出的 RT 上限。

读数标尺：全场实测 0.91–1.41 s，全部落在或接近这条 1.1–1.32 s 的目标带；唯一超标的是「入口 2」（挑高中庭，1.41 s），论文原文解释为「高玻璃穹顶、大开敞体量、多反射面」。

出处：<https://www.mdpi.com/2076-3417/10/3/1170>（CC-BY，Wayback Machine 快照核实全文）

**[一手论文]** Kanev, "Study and Improvement of Acoustic Conditions in Public Spaces of Shopping Malls," *Acoustics* 3(1):137–155 (2021)。

这篇测的是量级远超小店的商场中庭/美食广场（体量 14 500–106 000 m³，比 240 m³ 大 60–440 倍），处理前 RT 在**中频段达到 4–5 s**，其中最大的美食广场 FC1 在 1 kHz 处理前 5.18 s，最小的 FC5 也有约 3.5 s；处理后普遍降到 1.5–2.8 s。原文引用另一份文献 [16] 给出的判据：**RT > 2.5 s 且体量 > 4000 m³ 属于"bad"到"satisfactory"的分界线**——原文：*"The spaces with a large volume (>4000 m³) and long reverberation time (>2.5 s) have satisfactory or poor acoustic quality."*

口径警告：这篇论文的对象是巨型商场中庭，体量比工单的 240 m³ 大两到三个数量级，**不能直接套用到小店**，只能作为「同一栋楼里，越空旷、越没做处理的区域，RT 能差到什么量级」的参照——它证明了行业里存在两极：小心处理过的零售终端可以压到 1 s 以内，完全没人管的公共大空间能到 4–5 s。

出处：<https://www.mdpi.com/2624-599X/3/1/11>（CC-BY，Wayback Machine 快照核实全文）

### 1.3 ITU-T P.340 给出的一个旁证锚点（非零售场景，但同量级空间）

P.340 §10.3.1（本次独立下载核实，见第 4 节详述）给出免提终端/可视电话测试室的**设计推荐值**：RT60 平均 500 ms、房间体积约 50 m³。这不是零售场景，但给出了「小到中型室内空间、以语音可懂度为目标」时行业认可的 RT-体积配比——50 m³ 房间配 0.5 s，按平方根经验关系（Sabine 类公式里 RT 与 V 大致成正比、与吸声量成反比）外推到 240 m³，如果吸声条件不变，RT 会明显高于 0.5 s，方向上与 1.1 节「203 m³ 未处理店铺 2.11 s」互相印证：**体量越大、如果不主动加吸声，RT 不会自动变小**。

### 1.4 未能核实的一条线索：AS/NZS 2107 的零售分类推荐值表

搜索结果显示 AS/NZS 2107（澳新建筑声学设计标准）在 Appendix A 里按建筑类型分类给出推荐 RT，且明确包含 "department stores"「小型零售商店」「专卖店」「超市」「购物中心」等零售细分类目——这正是工单想要的「零售空间设计标准」。但：

- 标准原文付费，本次未能获取全文；
- 搜索引擎摘要给出的数字（如「50–55 秒」）**明显是单位识别错误**（把 "0.50–0.55 s" 读成了 "50-55 seconds"），不可信，本次未采用任何具体数字；
- 几个转述来源（pdfcoffee、academia.edu 的标准解读文章）均被反爬虫拦截，无法核实原文。

**这条明确标记为空白**：AS/NZS 2107 存在零售 RT 推荐表这件事本身可信（多个独立来源都提到这张表的存在和分类结构），但具体数值本次调研拿不到一手核实，不能引用。

---

## 2. 直达/混响比（D/R）对可懂度的刻度

### 2.1 现成刻度：IEC 60268-16 的 STI 五档，但要认清它是「参考性」不是「强制性」

**[标准目录核实，正文未获取]** IEC 60268-16（*Sound system equipment — Part 16: Objective rating of speech intelligibility by speech transmission index*）两版目录本次均独立核实：

- Ed.5 (2020) 目录：*"Annex F (informative) Nominal qualification bands for STI"* + *"Annex G (informative) Examples of STI qualification bands and typical applications"*
- Ed.3 (2003) 目录：*"Annex E (informative) Qualification of the STI and relation with some subjective intelligibility..."*

两个关键事实：(1) 这张分级表**从 2003 版到 2020 版一直存在**，行业确实拿它当通用刻度用；(2) 它在标准里的地位是 **informative（资料性附录）**，不是 normative（规范性正文）——即 IEC 60268-16 本身并不强制要求任何系统必须落在哪一档，分级只是「帮助读数」的参考工具。

具体分界数值本次通过三个独立二手源交叉核实一致（但标准 Annex 正文本身未获取，故仍标注为二手转述）：

| STI 范围 | 等级 | 大致含义 |
|---|---|---|
| < 0.30 | Bad | 一半以上语音听不懂 |
| 0.30–0.45 | Poor | 明显费劲 |
| 0.45–0.60 | Fair | 费劲但基本能懂 |
| 0.60–0.75 | Good | 大部分教室/公共广播的目标档 |
| 0.75–1.00 | Excellent | 几乎每个词都听得懂 |

### 2.2 把 D/R（dB）换算到这张表：Peutz/Becker 的 ALcons↔STI↔D/R 关系链

工单要的是「D/R −18 dB 意味着什么」，IEC 60268-16 本身不直接接受 D/R 作为输入（它的输入是调制传递函数 MTF/STI 本身），需要一条中间换算链。本次找到的是**声学工程界公认但非国际标准正文的** Peutz (1971) / Becker 换算关系（经 sengpielaudio.com 工程参考站转述，原始出处 V.M.A. Peutz, *"Articulation Loss of Consonants as a Criterion for Speech Transmission in a Room,"* JAES 19(11), 1971——本次未获取该论文一手全文，Peutz 1971 是行业公认的 %ALcons 指标发明人，多个独立学术引用可交叉确认这一出处的真实性，但具体公式系数本次是通过转述站点拿到的）：

**公式的有效边界**：*"For r < 3.5 × Dc at which direct/reverberation ratio D/R = −11 dB"*——即这条「距离越远、越听不懂」的公式，只在**距离小于 3.5 倍混响半径**（对应 D/R 大于 −11 dB）时成立。

**超出边界之后**（*"For r > 3.5 × Dc (Reverberant field, always worse than above)"*）：

```
%ALcons = 9 × T60 + K
```

其中 T60 取 1 kHz 与 2 kHz 平均，K 是「听者因子」，好听者约 2%。**这个公式不再含距离项**——因为一旦深入混响场，直达声能量早已被混响能量淹没，继续拉远距离已经不再显著恶化可懂度，可懂度的下限完全由房间的 RT60 决定。

**代入工单的数字**：8 m 拾音距离相对 1.0 m 混响半径是 **8 倍**，早已越过 3.5 倍（D/R = −11 dB）这条边界（8 倍对应的 D/R 才是 −18 dB，符合工单给的数）。也就是说：

> **D/R −18 dB 这件事本身在告诉我们，此刻可懂度已经不再是"距离"问题，而是纯粹的"房间"问题**——继续退后不会更差，说话人喊得更大声也不会更好（信号和混响同涨，比值不变，这正是 issue 原文说的"混响账一分不赚"）。

用 RT60 = 0.8 s（工单假设值）代入 Peutz 公式：

```
%ALcons ≈ 9 × 0.8 + 2 = 9.2%
```

对照 IEC 60268-16 表（本次同样经 sengpielaudio.com 转述，与 ALcons 数值做了交叉映射）：

| STI | 等级 | ALcons |
|---|---|---|
| 0–0.3 | unacceptable | 100–33% |
| 0.3–0.45 | poor | 33–15% |
| **0.45–0.6** | **fair** | **15–7%** |
| 0.6–0.75 | good | 7–3% |
| 0.75–1.0 | excellent | 3–0% |

9.2% 落在 7–15% 区间，对应 **STI ≈ 0.45–0.6，"fair"档**——按该来源给出的口语化描述：ALcons < 10% 是「很好」，< 15% 是「可接受」，> 15% 才「会成为问题」。9.2% 低于 15% 的问题线，但没到 10% 的"很好"线。

**读数标尺（回答 issue 的原始问题）**：D/R −18 dB 配 RT60 = 0.8 s，对应的是**「费劲但基本听得懂」，不是「听不懂」**——前提是这条 Peutz 公式本身的可信度（源头站点原话：*"This conversion is to be regarded with some doubts, because there are different evaluations of measurements"*，即使发明人一方也承认这条换算有争议）。**如果按第 1 节找到的更现实的 RT60（未处理小店 2.11 s）重新代入**：%ALcons ≈ 9×2.11+2 = 21%，直接超过 15% 的问题线，落进 STI < 0.45 的 "poor" 档——这才是「听不懂」量级的开始。**RT60 从 0.8 s 变成 2.11 s，可懂度判断从"fair"直接掉到"poor"，这条账比底噪账敏感得多。**

出处：<https://sengpielaudio.com/calculator-ALcons-STI.htm>（二手工程转述站，非标准原文）

### 2.3 一个额外佐证：NFPA 72 的 STI ≥ 0.5 门槛

第 1.2 节引用的 Alnuman & Altaweel (2020) 论文提到，美国消防规范 NFPA 72 对公共空间紧急广播系统要求 **STI ≥ 0.5（90% 的空间达标）**——这是一个独立于 IEC 60268-16、来自安全法规的门槛，恰好落在 "fair" 档的中段（0.45–0.6），说明行业在生命安全场景下也只敢把及格线定在"费劲但能懂"，而不是"good"或"excellent"，这条门槛可以作为拾音规格「至少不能比这个差」的参照。

---

## 3. 去混响模块能买回多少：dB/STI 改善量与算力代价

### 3.1 León & Tobar (arXiv 2110.02144)：给了质量/可懂度**相关**指标，唯独没给 STI，也没给算力

**[一手论文全文核实]** 论文标题 *"Late Reverberation Suppression using U-nets"*，方法是把房间冲激响应拆成 early/late 两部分（`y = y_early + y_late`），网络专门学习并减掉 `y_late`（Late reverberation Suppression, LS）。

**用的客观指标是 PESQ、CD、LLR、fwSNRseg、SRMR——没有 STI**，这是本次调研第一个要明说的缺口：issue 想要的"STI 改善量"，这篇被 RESOURCES.md 标为起点的论文根本不报。SRMR（Speech-to-Reverberation Modulation Energy Ratio）是可懂度的**代理指标**而非 STI 本身。

三组实测结果（LS U-net 是论文提出的方法）：

| 数据集/口径 | 指标 | 未处理 | LS U-net 处理后 | 改善 |
|---|---|---|---|---|
| Omni 合成，SNR 15 dB | SRMR | 3.08 | 6.30 | +3.22（约 2 倍） |
| Omni 合成，SNR 35 dB | SRMR | 3.17 | 5.98 | +2.81 |
| MARDY 合成，近麦（RT60=291 ms） | SRMR | 5.21 | 5.73 | +0.52（约 10%） |
| MARDY 合成，远麦（RT60=447 ms） | SRMR | 4.49 | 5.36 | +0.87（约 19%） |
| BUT 真实录音，近麦 | SRMR | 3.99 | 5.34 | +1.35（约 34%） |
| BUT 真实录音，远麦 | SRMR | 4.36 | 6.56 | +2.20（约 50%） |
| Omni 合成，SNR 15 dB | PESQ | 1.98 | 2.65 | +0.67 |
| MARDY 合成，近麦 | PESQ | 2.57 | 2.74 | +0.17（改善很小） |

口径警告：SRMR 的数量级（干净语音基准 8.45，见论文 Fig.3 clean spectrogram 标注）说明它是一个无量纲比值分数，论文未注明是取对数（近似 dB）还是线性值——**不能直接当 dB 数字使用**。另外表格清楚显示：**RT60 越接近现实值（MARDY 的 291/447 ms，比 Omni 合成扫的 0.2–1.0 s 范围更贴近工单的 0.8 s），改善幅度越小**（近麦只有约 10%），论文自己的图 2（SRMR vs T60 曲线）也写明 *"None of the model considered improved over the mean score of the reverberant utterances at T60 = 0.2s; this was expected since a reverberation time of 0.2s represents a very subtle reverberation level."*——即混响本身很轻时，去混响网络反而没有明显收益，模块的价值是在**中高混响**区间才体现出来。

**算力代价：全文检索无任何参数量、FLOPs、推理时延或硬件平台描述**——这不是本次调研没找到，是这篇论文本身就没写。issue 挂靠的"第 10 课算力账"传统（MIPS/内存/功耗都要拆开报），在这篇被寄予厚望的起点论文里完全找不到对应数据，这是一个要明说的一手空白。

出处：<https://arxiv.org/pdf/2110.02144>

### 3.2 开源电话音频栈里的去混响：一个没有，一个是挂了名字但没实现的死接口

**[一手源码核实]** WebRTC `api/audio/audio_processing.h`（Config 结构体所在文件）：全文搜索 "reverb"/"dereverb" **零命中**。该文件暴露的模块清单是 Pipeline / PreAmplifier / CaptureLevelAdjustment / HighPassFilter / EchoCanceller / NoiseSuppression / TransientSuppression（已弃用）/ GainController1 / GainController2——**没有去混响**。这与 RESOURCES.md 已有的 APM 认知一致，本次是新增了"专门确认去混响不在其中"这一条。

**[一手源码核实]** SpeexDSP `include/speex/speex_preprocess.h` 和 `libspeexdsp/preprocess.c`：表面上看，头文件里确实有 `SPEEX_PREPROCESS_SET_DEREVERB` / `GET_DEREVERB` / `SET_DEREVERB_LEVEL` / `GET_DEREVERB_LEVEL` / `SET_DEREVERB_DECAY` / `GET_DEREVERB_DECAY` 六个宏，容易让人以为 Speex 是有去混响能力的开源栈。但读 `preprocess.c` 的实现：

```c
case SPEEX_PREPROCESS_SET_DEREVERB_LEVEL:
   /* FIXME: Re-enable when de-reverberation is actually enabled again */
   /*st->reverb_level = (*(float*)ptr);*/
   break;
```

`SET_DEREVERB`/`GET_DEREVERB` 这个开关本身是接的（切换 `dereverb_enabled` 标志位，并清零内部 `reverb_estimate` 数组），但真正决定去混响力度和衰减特性的 LEVEL 与 DECAY 两组 setter/getter **全部被注释掉**，代码里留着 `FIXME: Re-enable when de-reverberation is actually enabled again` 的字样——说明这是一个开发到一半被搁置的功能，接口留在头文件里没删，但打开开关也不会有任何可调的去混响效果。**这是一个值得记进"datasheet 陷阱"清单的新样本：API 存在 ≠ 功能存在，尤其是开源项目里，读头文件不够，必须读实现。**

出处：<https://github.com/xiph/speexdsp/blob/master/include/speex/speex_preprocess.h>、<https://github.com/xiph/speexdsp/blob/master/libspeexdsp/preprocess.c>

### 3.3 TI TIDA-01589：文档里出现的"De-reverberation"是一个易读错的词，不是本 issue 说的去混响

**[一手文档全文 grep 核实]** TIDUE77（TIDA-01589 用户指南）全文只有 3 处出现 "reverb"：

> *"De-reverberation: Ensuring consistent performance even during changes to echo path"*（§1，列在系统要解决的几大挑战之一）

字面看像是在说去混响，但**紧跟着的定语是"确保回声路径变化时性能依然稳定"**——这描述的是 AEC 对回声路径突变（如说话人走动、门开关）的重新收敛能力，是 AEC 自身的鲁棒性指标，**不是**从近端语音里去掉房间早期/晚期反射（即 issue 和 León&Tobar 论文说的那种去混响）。另外两处 "reverberation" 出现在插图说明文字里，描述"回声和混响共同污染麦克风信号"这个现象本身，同样不是在介绍一个去混响算法模块。

决定性证据：RESOURCES.md 已收录的 **Table 5（§3.2.7，MIPS 与内存实测表）本次重新核实，逐行确认只有 Fixed Beamforming / Noise Suppression / HD AEC 三个模块**，没有任何一行标注"Dereverberation"或类似字样——如果 TIDA-01589 真的内置了一个独立计费的去混响模块，它应该像 AEC 一样出现在这张表里。**结论：TIDA-01589 不含 issue 意义上的去混响模块**，这是对 RESOURCES.md 现有认知的一次更正（此前只知道它有 BF/AEC/NS，本次额外确认了"De-reverberation"这个措辞是术语陷阱）。

出处：<https://www.ti.com/lit/ug/tidue77/tidue77.pdf>

### 3.4 唯一给出可比算力锚点的：经典 WPE 算法在树莓派上的实测

**[一手论文全文核实]** León&Tobar 论文里提到的无监督基线 FD-NDLP 属于 WPE（Weighted Prediction Error）算法家族。WPE 本身有一个活跃维护的开源实现 NARA-WPE，其 ITG 2018 会议论文（Drude et al.）给出了本次调研唯一一份**可与嵌入式硬件算力预算直接对比**的去混响实测数据：

> *"Fig. 3 shows the real time factor of the frame-online WPE implementation in TensorFlow on a Raspberry Pi Model 3b+ device... equipped with 1 GB LPDDR2 RAM memory and an ARM A53 quad-core processor running at 1.4 GHz... up to K = 10 filter taps online processing is possible on this particular hardware for D ≤ 4 channels."*

即帧级在线多通道 WPE 去混响，在树莓派 3B+（ARM Cortex-A53 四核 1.4 GHz，1 GB RAM）上，**4 麦克风、滤波器阶数 K≤10 时能维持实时（RTF<1）**，8 麦克风则做不到实时。数量级上，树莓派 3B+ 的算力与 IP 摄像机常见的中高端 SoC 同一数量级或更强，说明**经典去混响算法不是免费的午餐，是一个和 AEC 同量级、需要专门算力预算的模块**，不能假设"顺手就能加上"。

同一篇论文给出的可懂度相关的下游收益（不是 STI，是 ASR 词错误率 WER，REVERB Challenge 真实录音测试集）：未处理 17.6% → 离线迭代 WPE 处理后 10.9%（2 通道）/ 10.9–14.4%（2–8 通道范围）——即便不是 STI，也是"去混响确实能显著改善下游任务表现"的独立佐证，且给出的算力口径（RTF、具体硬件型号）比 León&Tobar 论文完整得多。

出处：<https://groups.uni-paderborn.de/nt/pubs/2018/ITG_2018_Drude_Paper.pdf>

---

## 4. P.340 / ETSI TS 103 740 怎么处理混响：不是"有规定"或"回避"的二选一，是按测试目的分裂成两半

### 4.1 P.340：大多数测量要求消声室，但 AEC 测试专门反过来要求可控混响

§5.4（本次独立核实，与 RESOURCES.md 已有认知一致）：

> *"For the repeatability of the tests, the environment for most of the measurements shall be free field (anechoic) down to the lowest frequency of the 1/3 octave band centred on 200 Hz."*

——这是"大多数测量"的默认要求：**把 RT 当干扰变量清除掉**，为了可复现性，不是为了真实性。

但 §10.3.1（本次新查证，RESOURCES.md 此前未收录这条）专门给 AEC（回声消除）测试反过来规定了必须使用**有真实混响特性的房间或等效电子混响器**，并按终端类别给出具体数字：

| 场景 | 平均混响时间 RT60 | 房间体积 |
|---|---|---|
| 会议系统（teleconference） | 400 ms（最低倍频程不超过均值 2 倍，最高倍频程不低于均值一半） | 约 90 m³ |
| **免提终端与可视电话** | **500 ms**（同上容差规则） | **约 50 m³** |
| 车载（模拟车厢） | 60 ms | 约 2.5 m³ |

原文还给了具体的房间形状建议（避免过长/过矮、避免大面积平行硬墙反射面导致颤动回声、测试设备与墙面最小距离 1 m）——这是**为了让 AEC 测试结果贴近真实场景专门设计的可控混响**，与 §5.4 的"清除混响"正好相反。

**结论**：P.340 不是「回避了混响这个变量」，而是**清楚知道混响在什么场景下是噪声、在什么场景下是被测对象本身**，分别给了两套相反的处理方式。这条比 issue 原本猜测的"有规定 vs 回避"更精确。

### 4.2 ETSI TS 103 740：结构继承了 P.340 的两分法，但把具体 RT 数字这一格留白了

§5.3「Acoustical environment」（本次新查证核实全文，RESOURCES.md 此前只记录了 §5.2.4 的测试几何，未覆盖 §5.3）：

> *"Unless stated otherwise measurements shall be conducted under quiet and 'anechoic' conditions... In case where an anechoic room is not available the test room has to be an acoustically treated room with few reflections and a low noise level."*
>
> *"In all cases where the performance of acoustic echo cancellers shall be tested, a realistic room, which represents the typical user environment for the terminal shall be used."*

结构上和 P.340 一模一样：默认消声（或退而求其次"少反射低噪声"的处理过房间），AEC 测试专门要求"真实房间"。**但和 P.340 不同的是，这句话到此为止，没有像 P.340 §10.3.1 那样给出具体 RT60 数字或房间体积**——"typical user environment"是什么混响量级，标准原文没说，等于把这个数字继承的机会放弃了。

第二处间接证据（本次新查证，空闲信道噪声测量条款，§6.x）：

> *"NOTE 3: Care should be taken that only the noise is windowed out by the analysis and the analysis window is not impaired by any remaining reverberance or room noise."*

这条脚注承认"房间的残余混响会影响噪声测量窗口"，但同样只是提醒测试人员小心处理，没有给出量化的 RT 上限或容差——**标准知道混响是个变量，但选择用操作提示而不是数字来处理它**。

**结论（直接回答 issue）**：ETSI TS 103 740 既没有完全"回避"混响（它明确区分了"默认消声"和"AEC 测试要用真实房间"两种场景，并两次在正文里点名"reverberation/reverberance"会影响测量结果），也没有给出可以直接借用的 RT60 数字——**它把 P.340 的结构继承下来了，把 P.340 的数字丢掉了**。如果摄像机行业要照抄 ETSI TS 103 740 的 AEC 测试环境要求，唯一能抄的是"必须用真实、有代表性的房间"这句话本身，具体 RT60 要多少，标准没给，需要摄像机厂商自己按目标场景（这里是"店铺"）定。

---

## 5. 空白清单

逐条给出「查无」依据：

1. **零售店铺（非商场公共空间）RT60 的行业实测统计**几乎是空白。本次找到的唯一体量匹配数据点（203 m³ 服装店 2.11 s）来自一家声学处理板材商的营销案例研究，不是学术或标准机构的系统性调查；能找到的两篇同行评议论文都是研究几万到十万 m³ 的巨型商场中庭/美食广场，体量比工单的 240 m³ 大出 60–440 倍，不能直接套用。**零售行业目前没有一份公开的、体量分层的 RT60 实测统计报告。**
2. **AS/NZS 2107 的零售分类 RT 推荐值表**——已知这张表存在（多个独立来源确认其分类结构），但原文付费，本次未能核实具体数值，任何搜索引擎摘要给出的数字都疑似有单位识别错误，**明确不采用，留空**。
3. **Peutz 1971 原始论文**——ALcons↔STI↔D/R 这条关键换算链的源头论文本次未获取一手全文（JAES 付费），只能通过二手工程站点转述，且转述来源自己也承认"这个换算存在争议"。如果要在正式规格文件里使用这条公式，应先找到 Peutz 原文或后续被广泛引用的同行评议复核文献。
4. **IEC 60268-16 Annex F/G 正文**——标准存在、目录确认了分级表位置和 informative 属性，但具体数值边界（0.30/0.45/0.60/0.75）本次是靠三个独立二手源交叉核实，不是标准正文本身。
5. **去混响 DNN 方法的算力代价**——不只是 León&Tobar 这一篇论文没写，本次调研没有找到任何一篇同类去混响论文（U-net、GAN、LSTM 系列）公开报告参数量/FLOPs/推理时延。这似乎是这个子领域的普遍空白，不是调研深度不够。
6. **8 麦克风以上、或非 WPE 类算法的嵌入式去混响算力实测**——NARA-WPE 只测到 8 通道且不实时，且是经典统计方法（非深度学习），DNN 去混响在嵌入式设备（非 GPU）上的实测数据本次完全没有找到。
7. **STI 与本文推导的 ALcons 之间在"店铺+远场麦克风"这个具体场景下的实测交叉验证**——第 2 节的推导链条（IEC 分级表 + Peutz 公式）是两条独立文献拼接的产物，本次没有找到任何论文或标准直接测过"8 米外、RT60 0.8~2 秒的店铺场景，麦克风实测 STI 是多少"，推导结果需要未来用真实场景实测校准。

---

## 6. 结论回应 issue 的四个问题

1. **零售/店铺 RT60 典型范围**：没有系统性行业统计，但拿到一个体量匹配的真实数据点——203 m³ 未处理服装店 **2.11 s**（Caruso Acoustic 案例），处理后可压到 0.72 s；大体量商场公共区域（几万至十万 m³）实测跨度极大，从精心设计维持在 0.9–1.4 s 到完全没处理的 3–5 s 都有。**工单假设的 0.8 s 更接近"处理过的小店"下限，不是未处理小店的典型值**——如果规格要按未处理场景兜底，应该考虑向 1.5–2.1 s 靠拢。
2. **D/R/STI 可懂度刻度**：IEC 60268-16 有现成五档刻度（Bad<0.30 / Poor 0.30–0.45 / Fair 0.45–0.60 / Good 0.60–0.75 / Excellent>0.75，informative 附录，非强制条款）。用 Peutz/Becker 的 ALcons↔D/R 关系换算，8 m/1 m 混响半径（D/R −18 dB）已经越过"距离还能救"的 −11 dB 边界，可懂度封顶由 RT60 单独决定：RT60=0.8 s 对应 STI≈0.45–0.6（"fair"，费劲但基本能懂）；若 RT60 是更现实的 2.11 s，对应 STI 掉到 <0.45（"poor"，开始接近听不懂）。这条公式本身有工程界公认的不确定性，未找到国际标准对 D/R→STI 的直接规范性换算表。
3. **去混响能买回多少**：León & Tobar（RESOURCES 现有起点）给了 SRMR/PESQ 提升数据但不含 STI、也完全不含算力代价——这是该论文自身的一手空白。开源电话音频栈里，WebRTC APM 没有去混响模块，SpeexDSP 有去混响接口但核心参数控制代码被注释掉、功能未实现。TI TIDA-01589 文档提到的"De-reverberation"实际指 AEC 抗路径变化能力，不是去混响，其 MIPS 实测表里没有去混响这一项。唯一可用的算力锚点来自经典 WPE 算法的开源实现（树莓派 3B+ 上 4 麦可实时）。
4. **P.340/ETSI TS 103 740 怎么处理混响**：不是二选一——两份标准都对"大多数测量"要求消声（清除 RT 这个变量），但都对"AEC/双讲测试"反过来要求使用有真实混响特性的房间。区别在于 P.340 给出了具体 RT60-体积数字（免提终端/可视电话 500 ms / 50 m³），ETSI TS 103 740 继承了"要用真实房间"的结构性要求，却没有继承具体数字，把这一格留给了标准使用者自己填。

---

## 附：本次下载/核实的一手来源清单

- ITU-T Rec. P.340 (05/2000)：<https://www.itu.int/rec/T-REC-P.340-200005-I>
- ETSI TS 103 740 V1.4.1 (2021-10)：<https://www.etsi.org/deliver/etsi_ts/103700_103799/103740/01.04.01_60/ts_103740v010401p.pdf>
- León & Tobar, "Late Reverberation Suppression using U-nets," arXiv:2110.02144：<https://arxiv.org/pdf/2110.02144>
- Alnuman & Altaweel, "Investigation of the Acoustical Environment in A Shopping Mall...," *Appl. Sci.* 10(3):1170 (2020)：<https://www.mdpi.com/2076-3417/10/3/1170>（DOI: 10.3390/app10031170）
- Kanev, "Study and Improvement of Acoustic Conditions in Public Spaces of Shopping Malls," *Acoustics* 3(1):137–155 (2021)：<https://www.mdpi.com/2624-599X/3/1/11>（DOI: 10.3390/acoustics3010011）
- Caruso Acoustic 服装店声学处理案例：<https://carusoacoustic.com/en/magazine/improving-acoustics-in-commercial-spaces-a-case-study/>
- Drude et al., "NARA-WPE: A Python package for weighted prediction error dereverberation...," ITG 2018：<https://groups.uni-paderborn.de/nt/pubs/2018/ITG_2018_Drude_Paper.pdf>
- TI TIDUE77（TIDA-01589 用户指南）：<https://www.ti.com/lit/ug/tidue77/tidue77.pdf>
- WebRTC `api/audio/audio_processing.h`：<https://webrtc.googlesource.com/src/+/main/api/audio/audio_processing.h>
- SpeexDSP `speex_preprocess.h`：<https://github.com/xiph/speexdsp/blob/master/include/speex/speex_preprocess.h>
- SpeexDSP `preprocess.c`：<https://github.com/xiph/speexdsp/blob/master/libspeexdsp/preprocess.c>
- IEC 60268-16 Ed.5 (2020) 预览（仅目录）：<https://cdn.standards.iteh.ai/samples/21925/7a5eb0d5e54e49e685b89ede43782760/IEC-60268-16-2020.pdf>
- IEC 60268-16 Ed.3 (2003) 预览（仅目录）：<https://cdn.standards.iteh.ai/samples/11874/db3d5625a6ff4d0a842d1fe61174e0f3/IEC-60268-16-2003.pdf>
- ALcons↔STI↔D/R 换算（二手工程转述）：<https://sengpielaudio.com/calculator-ALcons-STI.htm>
