# 音质字典五处空白核查：外部可引刻度找到了多少

对应 GitHub issue [#27](https://github.com/zhiwei1988/learning-audio/issues/27)，核查对象是 `reference/quality-dictionary.md`（#15 落盘）标注的五处疑似空白。查证标准照 [#4 findings](./research-handsfree-spec-standards.md)：一手全文核实的才叫「找到」，只读到摘要/二手转述的单独标注，查无的写清查证路径。

**结论先说**：五问里，**两问基本找到**（③提示音可辨、⑤P.835 JND——但⑤的「找到」是找到「标准明确不给数」这件事本身）；**两问部分找到**（①检出级、④音色↔频响，各有一条腿有一手出处，另一条腿仍空）；**一问找到但门槛是软的**（②辨识级——ENFSI 给了可引的下限，但下限是「时长」和「数字化规格」，不是「SNR/带宽」）。没有一问是纯粹空手而归，但也没有一问能直接抄出一个"绝对目标值"——这与 #4 的经验一致：**结构和方法论能借，具体数字大多要么标准自己没写，要么写了但换了场景就不成立**。

意外发现：安防视频监控的 DORI 分级（IEC 62676-4）完全是像素密度驱动的光学概念，行业里**确实没有音频对应物**，连"audio DORI"这个词组都搜不到任何标准或厂商白皮书使用过；ITU-T P.800/P.800.1/P.800.2/P.835 四份文档逐一核实后，**没有一份给出 MOS 差值的 JND 数字**——P.800.2 §9 原文明写"统计分析不在本建议书范围内"，把算置信区间的责任直接推给测试执行者。这两条都是"查无"里含金量最高的——不是没找到，是**标准自己承认没有**。

---

## 0. 核实范围说明（先说清哪些是一手全文，哪些不是）

| 文献 | 核实方式 | 版本/获取方式 |
|---|---|---|
| ITU-T P.800 | **一手全文**（ITU 官网免费） | (08/1996)，已下载 PDF 并本地提取文本核实 |
| ITU-T P.800.1 | **一手全文**（ITU 官网免费） | (07/2016)，现行版本，已核实 |
| ITU-T P.800.2 | **一手全文**（superseded 版免费） | (05/2013)，经 `T-REC-P.800.2-201305-S` 免费镜像获取；现行版本可能已改版，未核实新版是否补了统计条款 |
| ITU-T P.835 | **一手全文**（ITU 官网免费） | (11/2003)，已核实 |
| ENFSI BPM FSA-BPM-003 | **一手全文**（ENFSI 官网免费） | 版本 001，2022-11-29 ENFSI Board 批准，已下载 PDF 并本地提取文本核实 |
| ISO 7731:2003(E) | **一手部分全文**（iTeh 免费预览样张） | 预览覆盖 Clause 1–6.2（约正文一半），6.3「频谱特征」/6.4「时间特征」两条设计细则未覆盖 |
| ISO 8201:2017(E) | **一手近乎全文**（iTeh 免费预览样张） | 预览覆盖 Clause 1–4.5，核心条款（时间模式、可识别性）齐全 |
| EN 50849:2017（=SIST EN 50849:2018） | **一手部分全文**（iTeh 免费预览样张） | 预览覆盖前言/引言/§5.1 引用段，Annex A/B 测法细节未覆盖 |
| Patterson (1990), *Auditory warning sounds in the work environment* | **一手全文**（剑桥大学官网免费 PDF） | Phil. Trans. R. Soc. Lond. B 327:485–492，已下载并本地提取文本核实 |
| HEAD Acoustics「Psychoacoustic Analyses I」应用笔记 | **一手全文**（HEAD Acoustics 官网免费 PDF） | 工程应用笔记非正式标准，但明确标注 DIN 45692 为算法出处 |
| IEC 60268-16:2020 | **仅前言与术语条款一手**（iTeh 免费预览 15 页） | 含判据表的 Annex E/F/G 在第 68–73 页，超出免费预览范围，**未获取一手** |
| IEC 62676-4 / IEC 62676 系列 | **仅摘要/标题级** | 未下载全文；范围与 DORI 定义通过标准目录页、CEN/CENELEC 标准店页面、厂商白皮书多方交叉确认一致 |
| Toole & Olive (1988), *The Modification of Timbre by Resonances*, JAES 36(3) | **拿到一手 PDF 但无法提取文本** | pearl-hifi.com 免费镜像，确认是真实扫描件，但字体编码非标准，`pdftotext` 输出乱码，环境内无 OCR 工具可用；结论只能引二手（摘要/引用文献特征） |
| Gabrielsson & Sjögren (1979), *Perceived sound quality of sound-reproducing systems*, JASA 65(4) | **仅摘要/引文级** | JASA 付费墙，ResearchGate 页面 403，未找到免费镜像 |
| arXiv:2602.17010（2026），*Is there a relationship between MOS and JND?* | **一手全文**（arXiv 开放获取） | 主题是**视频**质量（VMAF/BT.910），非语音 P.800 系列，仅作旁证 |

查证方法：ITU-T 的免费副本同 #4 发现的规律——通过 `T-REC-Pxxx-YYYYMM-S!!PDF-E`（superseded 后缀 `-S`）模式对已被取代的旧版逐一尝试，现行版本仍收费。ENFSI、iTeh 预览样张、剑桥大学官网、HEAD Acoustics、arXiv 均可用标准 User-Agent 直接 `curl` 下载，本地用 `pdftotext -layout` 提取文本后 `grep` 核对关键条款，避免二手转述失真。

---

## 1. 「检出级」——STI 低段有没有可引的行为学刻度

**结论：部分找到。** STI（Speech Transmission Index，语音传输指数：把语音包络调制被噪声/混响抹掉的程度打成 0–1 分）低段的**数字边界**在 IEC 60268-16 里确有出处，但那条边界量化的是"词/句识别率"，不是「听得出有人说话、判断情绪」这种行为学描述；安防行业的 DORI 分级、临床听力学的 SRT，逐一查过，都不能直接搬。

### 1.1 STI 低段：数字边界找到，行为学描述查无

IEC 60268-16:2020 的免费预览只到第 13 页（前言 + 术语条款 3.1–3.11），含判据表的 **Annex F「Nominal qualification bands for STI」**（第 70 页）和 **Annex G「Examples of STI qualification bands and typical applications」**（第 71 页）都在付费部分，**本次未获取一手**。

多个独立二手源（STI 测量仪器厂商说明页、声学工程博客）一致复述同一张表：

| STI 范围 | 等级标签 | 词识别率（二手转述，未核实原文百分比） |
|---|---|---|
| < 0.30 | Bad | 低于 ~60% |
| 0.30–0.45 | Poor | ~60–75% |
| 0.45–0.60 | Fair | ~75–90% |
| 0.60–0.75 | Good | ~90–96% |
| 0.75–1.00 | Excellent | ~96–100% |

读数标尺：`quality-dictionary.md` 已经在用 0.45/0.60 这两个切点定义「逐字级」（0.45 勉强能懂，0.60 以上良好），与上表一致，**不是新发现**。新查的是"Bad/Poor 这一段到底描述的是什么听感"——标准的 **Annex E「Relationship between the STI and word/sentence scores」** 和 **Figure E.2** 建立的是"同一 STI 下，句子识别率显著高于单词识别率"（语境冗余让人能猜出整句，即便单词漏听）——这个原理方向上支持「检出级」的直觉（听不全字但能懂大意），但**标准原文用的是词/句识别率百分比，不是"听得出有人说话、判断情绪"这类行为学措辞**——后者是这个项目自己的翻译语言，标准里没有对应条目。

**查证路径**：尝试 WebFetch 直接抓取 iTeh 预览页与 ANSI 预览页均因 JavaScript 墙失败；`curl` 下载后本地 `pdftotext` 提取到的 15 页只到 Clause 3；Annex E/F/G 页码已知（68–73 页）但需要付费购买全文（IEC 60268-16:2020 官方定价约 200+ 瑞士法郎）。**未付费获取**。

### 1.2 安防行业 DORI 分级——确认无音频对应物

DORI（Detection/Observation/Recognition/Identification，检测/观察/识别/辨认：视频监控评估摄像机"看清多远"的四级像素密度分级）定义在 IEC 62676-4（《安防应用视频监控系统》系列第 4 部分）里，四级门槛是像素密度（px/m，每米目标平面上的像素数）：Detection 25px/m、Observation 62.5px/m、Recognition 125px/m、Identification 250px/m——**纯光学量，与声学没有任何接口**。

查过 IEC 62676 全系列的公开目录（Part 1 系统要求、Part 2 视频传输协议、Part 3 模拟/数字视频接口、Part 4 应用指南、Part 5 相机数据规格与图像质量、Part 6 智能分析性能测试），**没有一个 Part 提到音频**；直接搜索"audio DORI"「acoustic DORI」，搜索引擎和厂商白皮书（Axis、Infiniti Electro-Optics 等）里**完全没有这个词组的用例**。

**结论：查无，且确认是行业空白，不是我没找到**——DORI 这套框架的设计前提（像素密度）在声学域没有对应的"单位面积可分辨信息量"概念，音质字典若要借用 DORI 的"分级隐喻"，只能借"四级递进"这个结构，数字必须自己定义。

### 1.3 SRT（语音接收阈）——查过，判据不匹配

SRT（Speech Reception Threshold，语音接收阈：让 50% 关键词被正确复述所需的信噪比）出自 Plomp & Mimpen (1979, *Audiology* 18:43–52) 的经典方法论，临床听力学至今仍用——正常听力者对短句材料的 SRT 约 **−5 dB SNR**（负号读法：信号比噪声低 5 dB 时，一半的词还能听对，说明这个判据本身就设在"勉强及格"附近）。

这个判据固定用"50% 正确率"做门槛，语义上更接近「逐字级」的及格线，而不是「检出级」要的"只辨认存在与情绪、不要求听清词"这种更宽松的门槛——**SRT 文献里没有一个变体是用"能否察觉有人在说话"当判据的**，这类判据在听力学里属于"纯音听阈/言语察觉阈（Speech Detection Threshold）"，与 SRT 是两个不同的测量，且 SDT 本身也只回答"有没有声音"，不回答"能不能读出情绪"。**查无可直接借用的判据。**

**迁移前提（若强行借 STI 低段数字）**：STI 的适用假设是"标准语音材料+自然听感"，且是在成年正常听力人群上标定的；借到摄像机场景，还要接受"判据主体是句子级冗余带来的语境猜测，不是逐字理解"这个前提——本身就与「检出级」定义部分重合但不完全等价，借用时必须显式声明"这是一个近似替代，不是原装刻度"。

---

## 2. 「辨识级」——法庭语音同一性鉴定有没有可引门槛

**结论：找到，但门槛是「时长+数字化规格」，不是「SNR/带宽」。**

ENFSI（European Network of Forensic Science Institutes，欧洲法庭科学研究所网络）《法庭语音人同一性比对方法论最佳实践手册》（Best Practice Manual for the Methodology of Forensic Speaker Comparison，编号 FSA-BPM-003，版本 001，2022-11-29 经 ENFSI 理事会批准）全文一手核实，关键条款：

- **§8.2.2（数字化规格）**：「A minimum sampling rate of 44.1 kHz, 16-bit quantisation and PCM (Pulse-Code-Modulation) Wave target format are appropriate for most digitisations.」——模拟录音数字化时的最低采样率 **44.1 kHz、16-bit**，这是可直接引用的硬数字。
- **§9.1（材料数量）**：「recordings of less than about 10 seconds are not expected to contain much speaker-specific information」——**约 10 秒**是软下限，标准原文用词是"not expected"（预期不够），不是硬性拒绝；紧接着补一句「But even longer samples can sometimes provide only little speaker-specific information」，即时长达标也不保证够用，判断权仍在专家。
- **§9.2（声学质量）**：列举劣化因素（滤波效应、信噪比降低、环境噪声、压缩与有损格式、延迟效应、其它失真/伪影），结论句是「Greatly reduced acoustic quality can make feature analyses difficult or even not applicable.」——**明确不给数字**，只给"质量严重下降会导致分析困难甚至不可行"这句定性判断。

**逐字核对结果**：全文搜索"signal-to-noise"「SNR」「bandwidth」，只在 §9.2 那句定性描述里出现，**没有任何数值化的 SNR 或带宽门槛**。搜索引擎搜到的">10dB"或">12dB"这类数字出现在其它法庭语音识别论文里（非 ENFSI 原文），本次未能追溯到可核实的一手出处，**只作未核实线索记录，不采信**。

**迁移前提**：ENFSI 这套方法论假设的是"专家人工做听觉+语言学+仪器多特征比对，用于司法举证"，不是自动化算法门槛；借到摄像机「回放可当纠纷证据」场景，能直接借的是"≥10 秒有效语音"和"若要数字化则 ≥44.1kHz/16-bit"这两条量化下限，"声学质量是否够用"仍需自行按 #9 规则走差值/参照判断，不能编一个 SNR 数字冒充 ENFSI 的结论。

**查证路径**（若想进一步补上 SNR/带宽门槛）：可查 ENFSI 2015 年《Recommendations for the Discipline of Forensic Voice Comparison》系列论文（非 ENFSI 官方文档，是学界联署的方法论建议），或直接联系 ENFSI FSA 工作组索要案例集数据——本次时间预算内未展开。

---

## 3. 提示音「立刻分得清是哪类」——找到，三条一手证据互相印证

**结论：找到。** 三份独立标准/论文，从"能不能听见"「设计上如何做出区分」「一次最多能分清几种」三个角度分别给出可引结论，拼起来是一套完整链条。

### 3.1 ISO 7731:2003(E)——可辨性的两个必要条件

《人类工效学——公共场所和工作场所危险信号——听觉危险信号》（Ergonomics — Danger signals for public and work areas — Auditory danger signals），Clause 1–6.2 一手核实：

- **§4.2.1**：「The reliable recognition of a danger signal requires that the signal be clearly audible, be sufficiently different from other sounds in the environment and have an unambiguous meaning.」——可靠识别需要三条：可闻、与环境声充分不同、含义无歧义。
- **§4.2.3「Distinctiveness」（可辨性）**：「Parameters of the danger signal (signal level, frequency spectrum, temporal pattern, etc.) shall be designed to stand out from all other sounds in the reception area and shall be distinctly different from any other signals.」——信号电平/频谱/时间模式都要设计成与其它信号明显不同。
- **§4.2.2/§6.2（可闻性门槛，可直接引用的数字）**：信号 A 计权声压级 **≥65 dB(A)**，且超过环境噪声 **≥15 dB**——两条同时满足"足够但非必要"（原文：sufficient but not always necessary），若频谱/时间特征与环境噪声本身差异明显，声压级门槛可以放宽。

Clause 6.3「频谱特征」/6.4「时间特征」的具体设计细则超出免费预览范围，**未获取一手**。

### 3.2 ISO 8201:2017(E)——用「时间模式」而非「频率」做区分的实例

《报警系统——听觉紧急疏散信号——要求》，Clause 1–4.5 一手核实（预览覆盖近乎全部正文）：

- **§4.2「时间模式」**：国际统一的「三脉冲」（T3）模式——「on」0.5s±10% → 「off」0.5s±10% → 「on」0.5s±10% → 「off」1.5s±10%，一个周期共 4s±10%。**这是唯一一处标准原文给出可直接照抄的时间参数**，而且刻意"不规定频谱"（§1 Scope 原文：「Recognition of the signal does not require the specification of its spectral content, which can be selected to satisfy specific site requirements.」）——即国际标准认为**用节奏编码比用音色/频率编码更可靠**，频谱留给具体场地自定。
- **§4.3「可识别性」**：「it shall be ensured that the character of the "three-pulse" audible emergency evacuation signal can clearly be distinguished from other signals (e.g. alarm signal) used in the signal reception area (see ISO 7731)」——直接引用 ISO 7731 的可辨性原则，形成一条闭环引用链。

### 3.3 Patterson (1990)——一次最多能可靠分清几种，有实测数字

R. D. Patterson, *Auditory warning sounds in the work environment*, Phil. Trans. R. Soc. Lond. B 327:485–492（剑桥大学官网免费全文，已核实）。这是英国医学研究理事会应用心理学部（MRC Applied Psychology Unit）针对民航驾驶舱警报音过多问题做的系列研究总结：

> 「the number of immediate-action warning sounds should not exceed about **six**, and that each sound should have a distinct melody and temporal pattern」

第 4 节给出这个数字背后的学习实验（Patterson 1982 的后续复述）：让未经训练的听者学习识别 10 种民航驾驶舱警报音，结果「前 4–6 种警报音习得很快，之后习得速率明显放慢……超过前 6 种之后需要显著更多的练习……**6 种一组应该完全可靠**」（原文：the ease with which naive listeners learn six arbitrary warnings suggests that a set of six should prove entirely reliable）。

更关键的一条设计原理：混淆分析显示，**共享脉冲重复率（节奏）的警报音即使频谱差异很大也容易混淆**——「A confusion analysis... showed that warnings with the same pulse-repetition-rate were likely to be confused even when there were gross spectral differences between the warning sounds.」而引入更丰富的节奏变化能大幅降低混淆率。这与 ISO 8201 "不规定频谱、只规定时间模式"的设计选择互相印证，不是巧合。

读数标尺：**6 种是"未经训练的听者也能可靠分清"的上限**，不是"理论上能分清的最大数量"——如果摄像机的提示音场景允许用户先学习/看说明书，可以突破这个数；如果要求"一听就懂、零学习成本"，6 种是一个有实证支撑的天花板参考。

### 3.4 邻近但不直接回答本问题的一条：EN 50849 的语音告警可懂度

EN 50849:2017（取代 IEC/EN 60849，语音疏散广播系统标准；欧洲对应 EN 54-24"语音告警扬声器"作为下游器件认证），预览核实到 §5.1 引用段：该标准把语音告警系统的可懂度要求统一改用 STI 刻度表达（原文：「it was decided to express the required intelligibility score by using the STI scale」，并明确参照 EN 60268-16 = IEC 60268-16）。二手源常引的数字是"STI 全程不低于 0.5，单区故障时不低于 0.45"，但**本次未在预览范围内看到这条具体数值的一手原文**（超出免费预览）。

这份标准管的是"广播的语音内容听不听得懂"，不是本问题问的"提示音（非语音短音）能不能分清类型"——二者是相邻但不同的问题，放在这里做交叉参照，不作为③的直接答案。

**迁移前提**：以上三份文献的听者都处在"固定安装场所、有明确危险等级预期"的语境（工厂/机舱/建筑），且部分假设听者可能接受过培训；摄像机的提示音场景是"家庭消费者、零培训、注意力分散"，比这些文献的假设更苛刻——借用时，"6 种上限"应该当作**乐观上界**，实际摄像机能安全使用的提示音种类数很可能要更保守；"用节奏而非纯音色区分"这条设计原则可以直接借，且成本几乎为零（改时间包络不需要换硬件）。

---

## 4. 「闷/尖」等音色措辞 ↔ 频响特征——找到一条腿（尖），另一条腿（闷）证据不完整

**结论：部分找到。** "尖"（sharp）有一个标准化、可计算的心理声学量可以对照；"闷"（muffled）没有同等地位的单一标准量，只能借"尖的反面"和工程惯用语间接推。经典的音色描述词研究（Gabrielsson、Toole/Olive）**存在且方向对**，但本次没能拿到可逐字引用的一手文本。

### 4.1 「尖」——Zwicker 心理声学「锐度」（sharpness），有标准出处

HEAD Acoustics 应用笔记《Psychoacoustic Analyses I》（免费 PDF，一手核实，工程厂商文档非正式标准，但明确标注算法出处为标准）：

> 「The sharpness is a sensation value which is caused by high frequency components in a given noise. The unit of sharpness is "acum"... The value of 1 acum is attributed to a narrow-band noise at 1 kHz with a bandwidth smaller than 150 Hz and a level of 60 dB. The calculation of sharpness has been specified in the **DIN 45692** standard.」

也就是说：**锐度是一个由高频能量占比驱动的量，单位 acum，1 acum 的锚点是"1kHz窄带噪声、带宽<150Hz、60dB"这个具体信号**，计算方法写在 DIN 45692（德国标准，建立在 Zwicker 响度模型 / ISO 532-1 之上）里。三种主流算法（von Bismarck、DIN 45692/Widmann、Aures）彼此结果会有明显差异，引用时必须注明用的是哪一种。

读数标尺：锐度越高，主观感受越"尖/亮"；这是一个连续量，没有"多少 acum 算尖"的固定阈值——工程上通常是"跟基准（比如未处理信号）比锐度涨了多少"这种差值用法，与 quality-dictionary.md 已经确立的"同场差值"原则天然吻合。

**迁移前提**：DIN 45692 锐度模型是在宽带噪声/机械噪声（汽车 NVH 领域）上标定验证的，直接套用到**回放语音**的音色评价是一次跨域外推——标准本身没有对着语音信号做过验证，用之前需要自己做一轮"锐度差值 vs 主观闷/尖评分"的相关性小实验，不能假设直接成立。

### 4.2 「闷」——没有对等的单一标准量，只能反向借或用工程惯用语

锐度低 ≈ 高频占比低，方向上和"闷"（muffled，高频/中高频衰减导致的沉闷感）是反相关的，但"闷"在工程语境里更常指"具体频段滚降"（比如"2kHz 以上跌了 6dB"这种直接的频响陈述），而不是一个独立命名的心理声学参数——**本次没有找到一个像 DIN 45692 之于"尖"那样、专门对应"闷"的标准化量**。查证路径：搜索"muffled psychoacoustic parameter standard"「粗糙度 roughness」「音调度 tonality」等 HEAD Acoustics 同系列文档提到的其它心理声学量（本次未展开逐一核实），**目前判定为查无独立标准量，只能用"频响滚降的自然语言描述+锐度值偏低"做间接对照**。

### 4.3 经典音色描述词文献——存在，但一手文本没拿到

- **Gabrielsson & Sjögren (1979)**，*Perceived sound quality of sound-reproducing systems*，J. Acoust. Soc. Am. 65(4):1019–1033（同年有精简版发表于 *Scandinavian Journal of Psychology* 20:159–169）——用语义差异量表（semantic differential）+多变量分析建立的音质感知维度体系，二手摘要反复确认的维度名称包括：清晰度/明晰度（clearness/distinctness）、锐利/软硬（sharpness/hardness-softness）、明亮/暗淡（brightness/darkness）、丰满/单薄（fullness/thinness）——**"明亮/暗淡"和"丰满/单薄"这两条维度基本就是"尖"和"闷"的学术对应词**，方向完全吻合，但论文原文被 JASA 付费墙挡住，ResearchGate 页面返回 403，未找到任何免费镜像，**本次只能引用维度名称，不能引用具体数据或量表条目**。
- **Toole & Olive (1988)**，*The Modification of Timbre by Resonances: Perception and Measurement*，JAES 36(3):122–142——共振峰（resonance）对音色的影响研究，是这个领域被引用最多的基础文献之一。拿到了 pearl-hifi.com 的免费镜像（确认是真实扫描 PDF，非死链），但该扫描件用了非标准字体编码，`pdftotext` 抽取结果是乱码，本环境没有 OCR 工具（`tesseract` 未安装），**无法验证原文逐字表述**。二手摘要确认的方向性结论：共振峰的可闻度取决于频率、Q 值（品质因数，越高表示共振越窄越尖锐）、相对电平、节目素材类型；这与"尖"（窄而高 Q 的中高频共振峰更容易被听出、更容易被描述为"尖/刺耳"）方向一致，但**不能引用为逐字核实的结论**。

**迁移前提（若后续要补全这两篇一手文本）**：Gabrielsson 需要通过机构订阅或图书馆馆际互借获取 JASA 原文；Toole & Olive 需要找到清晰版扫描件或用 OCR 工具重新提取——这两步都不在本次 wayfinder 工单范围内，留给 #28 定目标值时按需补做。

---

## 5. P.835/MOS 「可感知差距」JND——四份 ITU-T 文档逐一核实，结论是标准自己不给数

**结论：查无，且是"标准明确声明不给"的查无，不是我没找到。** 这条本身就是一个可以直接使用的结论。

### 5.1 逐份核实结果

| 文档 | 一手核实结果 |
|---|---|
| ITU-T P.800 (08/1996) | 只建议"用常规方差分析（ANOVA）技术评估置信限、做显著性检验"，Annex D.3 提到可用 Tukey HSD（Honestly Significant Difference，事后多重比较检验）做两两比较——**给的是统计方法，不是固定数字** |
| ITU-T P.800.1 (07/2016) | 纯粹是 MOS 记号/术语规范文档（MOS-LQSN、MOS-LQON 这类下标怎么写），全文没有出现 JND、置信区间的数值化指引 |
| ITU-T P.800.2 (05/2013) | §9「Statistical analysis of MOS」原文：「The statistical analysis of subjective MOS values is **outside the scope of this Recommendation**. However, MOS values should be accompanied by sufficient information to allow a basic statistical analysis to be performed, for example, the calculation of a confidence interval for each condition. For any given condition..., this information comprises the number of votes, the mean of the votes and the standard deviation of the votes.」——**明确把统计分析推出了自己的范围**，只要求报告"票数、均值、标准差"这三个原始量，让读者自己算，不给通用阈值 |
| ITU-T P.835 (11/2003) | §5.4.1「Summary results」：「Summary results should include, at a minimum mean ratings and standard deviations... Other summary statistics, e.g., confidence intervals, should be included **as appropriate for the experiment**.」——同样是"按实验自行判断"，没有全局数字 |

### 5.2 两个经常被混为一谈、但其实是两回事的数字

行业里常听到"MOS 差 0.1/0.2/0.5 就能感知到"这类说法，查证后发现这些数字实际上来自两类不同性质的计算，都不是 JND：

1. **均值的统计置信区间半宽**——这个数字**会随打分人数 N 增大而缩小**，是"实验设计"的属性，不是"人类感知"的属性。例如 Microsoft DNS Challenge 论文里报告约 2600 条评分时 P.835 的 95% 置信区间约 ±0.04；而 #4 findings 里记录的是 24 人评审团、95% 置信区间约 ±0.5–0.7——同一个"0.X MOS"的说法，背后可能是完全不同的 N，直接借用是错的。
2. **真正的心理物理 JND**——指单个听者（或听者总体）在直接对比两个刺激时能可靠察觉差异的最小阈值，标准做法是双听/成对比较（2AFC，Two-Alternative Forced Choice）范式，而不是"两组各自打绝对分再比较均值"。MOS 本身是跨试次、跨听者的**平均分**，不是单次可辨的连续量，这类范式天然不适合直接产出一个"JND"——这也是为什么 P.800 系列不给这个数字：**它问的问题和 MOS 的产生方式不匹配**。

一条侧面印证：arXiv:2602.17010（2026年2月，Zhu/Amirpour/Zhou/Le Callet，《Is there a relationship between Mean Opinion Score (MOS) and Just Noticeable Difference (JND)?》，一手全文核实，开放获取）专门在问"MOS 和 JND 到底有没有关系"这个问题——但研究对象是**视频质量**（引用 VMAF、ITU-R BT.910、VideoSet 数据集），不是语音/P.800 系列，只能当**旁证**：连更成熟的视频质量研究界，2026 年了还在把"MOS 和 JND 的关系"当一个开放研究问题来发论文，说明语音这边同样没有一个可以拿来就用的现成数字并不奇怪。

### 5.3 一条有用的间接支持：ITU-T 自己更倾向配对比较法

P.800 Annex E 定义的 **CCR（Comparison Category Rating，比较级评分法）**方法论存在的原因，本身就是 ITU-T 承认"直接成对 A/B 比较比各自打绝对分更容易看出小差异"——这与 `quality-dictionary.md` 已经确立的"同场、同素材、成对差值"原则（#8 规则）方向一致，等于是从另一个角度印证了这个项目现有的设计选择是站得住的，只是"差多少算显著"仍然要靠 #28 自己用配对盲听实验测，不能从标准里抄一个数。

**迁移前提**：如果 #28 要自己测这个"可感知差距"，需要设计一个真正的 2AFC/ABX 配对辨异实验（而不是继续用绝对 MOS 均值比较），并固定打分人数与显著性水平，因为如上所述，"MOS 差多少算显著"这件事的答案本身就随实验设计变化。

---

## 6. 五问一览表

| # | 问题 | 判定 | 关键出处 |
|---|---|---|---|
| ① | 检出级刻度 | 部分找到 | STI 边界数字见 IEC 60268-16（二手转述，一手 Annex 未获取）；DORI 音频对应物、SRT 判据均查无 |
| ② | 辨识级门槛 | 找到（软门槛） | ENFSI BPM FSA-BPM-003 §8.2.2/§9.1：44.1kHz/16-bit、≥10秒；SNR/带宽门槛查无 |
| ③ | 提示音可辨 | 找到 | ISO 7731 §4.2/§6.2（可闻性+可辨性原则）+ ISO 8201 §4.2/§4.3（T3时间模式实例）+ Patterson (1990)（≤6种上限） |
| ④ | 音色↔频响 | 部分找到 | 「尖」= DIN 45692 锐度（一手，HEAD Acoustics应用笔记）；「闷」查无独立标准量；Gabrielsson/Toole-Olive 方向对但一手文本未拿到 |
| ⑤ | P.835/MOS JND | 查无（标准明确不给） | P.800/P.800.1/P.800.2/P.835 四份一手核实，均无JND数字；P.800.2 §9 明写"不在范围内" |

---

## 附：本次核实的一手来源清单

- ITU-T Rec. P.800 (08/1996)：<https://www.itu.int/rec/T-REC-P.800-199608-I>
- ITU-T Rec. P.800.1 (07/2016)：<https://www.itu.int/rec/T-REC-P.800.1-201607-I>
- ITU-T Rec. P.800.2 (05/2013，superseded)：经 `T-REC-P.800.2-201305-S!!PDF-E` 免费获取；现行版本页 <https://www.itu.int/rec/T-REC-P.800.2/en>
- ITU-T Rec. P.835 (11/2003)：<https://www.itu.int/rec/T-REC-P.835-200311-I>
- ENFSI Best Practice Manual for the Methodology of Forensic Speaker Comparison (FSA-BPM-003, v001, 2022-11-29)：<https://enfsi.eu/wp-content/uploads/2022/12/5.-FSA-BPM-003_BPM-for-the-Methodology-1.pdf>
- ISO 7731:2003(E)（免费预览样张，Clause 1–6.2）：<https://cdn.standards.iteh.ai/samples/33590/23420e332c4c49c781f090ab4d915518/ISO-7731-2003.pdf>；标准正式页 <https://www.iso.org/standard/33590.html>
- ISO 8201:2017(E)（免费预览样张，Clause 1–4.5）：<https://cdn.standards.iteh.ai/samples/67046/89e90bbd3b3b49da95ec94a91279bbb2/ISO-8201-2017.pdf>；标准正式页 <https://www.iso.org/standard/68866.html>
- EN 50849:2017 / SIST EN 50849:2018（免费预览样张）：<https://cdn.standards.iteh.ai/samples/22098/27ad812fc616411eb0172ea50a52e6e7/SIST-EN-50849-2018.pdf>
- Patterson, R. D. (1990). Auditory warning sounds in the work environment. *Phil. Trans. R. Soc. Lond. B* 327:485–492：<https://www.pdn.cam.ac.uk/system/files/documents/AuditoryWarningsAtWork_RSoc1990.pdf>
- HEAD Acoustics Application Note, *Psychoacoustic Analyses I*（Loudness and Sharpness Calculation）：<https://cdn.head-acoustics.com/fileadmin/data/global/Application-Notes/SVP/Psychoacoustic-Analyses-I_e.pdf>
- IEC 60268-16:2020（免费预览样张，仅前言+术语条款）：<https://cdn.standards.iteh.ai/samples/21925/7a5eb0d5e54e49e685b89ede43782760/IEC-60268-16-2020.pdf>；Annex E/F/G 未获取，标准正式页 <https://webstore.iec.ch/en/publication/26771>
- arXiv:2602.17010（2026），Zhu, Amirpour, Zhou, Le Callet, *Is there a relationship between Mean Opinion Score (MOS) and Just Noticeable Difference (JND)?*：<https://arxiv.org/pdf/2602.17010>

### 仅摘要/引文级、未获取一手全文的文献（不作为可逐字引用的结论使用）

- Gabrielsson, A. & Sjögren, H. (1979). Perceived sound quality of sound-reproducing systems. *J. Acoust. Soc. Am.* 65(4):1019–1033. DOI: 10.1121/1.382579（JASA 付费墙，ResearchGate 403，未找到免费镜像）
- Toole, F. E. & Olive, S. E. (1988). The Modification of Timbre by Resonances: Perception and Measurement. *J. Audio Eng. Soc.* 36(3):122–142（找到免费扫描件 <https://pearl-hifi.com/06_Lit_Archive/15_Mfrs_Publications/Harman_Int'l/AES-Other_Publications/Modification%20of_Timbre_by_Resonances.pdf>，但字体编码损坏导致文本无法提取，本环境无 OCR 工具）
- IEC 62676-4:2025 及 IEC 62676 系列 Part 1/2/3/5/6（仅标题/摘要/标准目录页核实，未下载全文；范围与 DORI 定义通过多个独立厂商白皮书交叉确认）
