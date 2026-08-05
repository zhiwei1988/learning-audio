# 网络摄像机音频 · 知识地图

共 76 条术语，六支职能分类。⚡ 行的数字在 ｜ 之后注明来源与测量条件。

## 声学基础（6 条）

- **拾音 / Capture · 放音 / Playback** — 上行采环境声，下行放远端声
- **SPL · Sound Pressure Level** — 声压级，整个音频世界的量尺
- **Inverse square law · 平方反比定律** — 离远一倍，直达声就小一截
  - ⚡ 距离 ×2 → −6 dB ｜ 定义
- **Reverberation · 混响 · Dereverberation · 去混响** — 墙面反射叠加，声音变糊的来源
- **Critical distance · 混响半径** — 直达声与混响声相等的那个距离
- **Far-field · 远场** — 远到直达声不再占优的区间

## 硬件（17 条）

### 拾音器件（9 条）

- **SNR · Signal-to-Noise Ratio · 信噪比** — 麦克风自己有多安静
  - ⚡ 在 94 dB SPL 下测的 ｜ 第 2 课锚点
- **AOP · Acoustic Overload Point** — 多大声开始削波
- **Sensitivity · 灵敏度** — 给定声压下输出多大电平
- **Dynamic Range · 动态范围** — 最轻到最响能覆盖多宽
  - ⚡ = AOP − EIN ｜ 定义
- **EIN · Equivalent Input Noise · 等效输入噪声（自噪声）** — 麦的自噪声折算回声压
  - ⚡ = 94 − SNR (dB) ｜ 定义
- **THD · Total Harmonic Distortion** — 器件把信号弄脏了多少
- **PDM / I²S** — 数字麦到主控的两种传输格式
- **麦克风一致性 · Sensitivity & phase matching** — 阵列里每颗麦必须长得一样
- **Isolation · 喇叭→麦隔离（dB）** — 结构上先把回声挡掉多少 dB

### 放音器件（8 条）

- **喇叭灵敏度 · Speaker sensitivity** — 1 W 输入能出多大声
  - ⚡ 常在 10 cm 测，换算 1 m 要 −20 dB ｜ 第 9 课陷阱
- **共振频率 · Fo · Resonant frequency** — 喇叭发不出声的下边界
  - ⚡ 频响下限写的是 Fo，不是可用下限 ｜ 第 9 课陷阱
- **峰均比 · Crest factor** — 峰值比平均高出多少
  - ⚡ 语音约 12 dB ｜ 第 9 课
- **BTL · Bridge-tied load · 桥接负载** — 两路反相驱动，功率翻四倍
- **Smart Amp · 智能功放** — 实时测振膜位移与音圈温度
  - ⚡ 峰值上限 +9.5 dB ｜ TI 实测
- **Excursion · 振膜位移** — 推太狠会撞到机械极限
- **SOA · Safe Operating Area · 安全工作区** — 不烧不撞的电流电压边界
  - ⚡ 额定功率是断续信号测的 ｜ 第 9 课陷阱
- **热时间常数 · Thermal time constant** — 音圈发热到触发限功率要多久

## 评测（12 条）

### 方法（6 条）

- **Repeatability · 可复现性** — 消声室买的是这个，不是「准」
- **场次偏置 · Session bias** — 换一次场，整体就偏一点
- **误差棒 · Error bar · 最小可分辨差异** — 小于它的差异不能当差异
  - ⚡ 分开测的地板 = 1.96·√2·场次偏置 ｜ 第 8 课
- **配对测试 · Paired comparison · 配对四规则** — 同场、同序、同源、同人
- **ACR · DCR · CCR · 三种听音测试范式** — 打绝对分、打损伤分、打对比分
- **ITU-T P.501 · 测试信号** — 别拿自己随手录的语音当激励

### 指标（6 条）

- **MOS · 平均意见分 · DMOS · 差值分** — 绝对分不可复现，差值分才可复现
- **SNRI / DSN · ITU-T G.160 降噪指标** — 降噪到底降了多少、伤了多少
- **S-MOS / N-MOS / G-MOS · 3QUEST（ETSI EG 202 396-3）** — 语音、背景、整体分开打分
- **DNSMOS · SIG / BAK / OVRL · ViSQOL** — 不用人耳的客观替代分
- **dBPa** — 以 1 Pa 为参考的电平口径
- **双讲衰减量 · Attenuation range in double talk** — P.340 把「全双工」变成可查表的等级

## 编码与网络（7 条）

- **奈奎斯特频率 · Nyquist frequency** — 采样率决定能留住多高的音
  - ⚡ 可用带宽 = fs / 2 ｜ 定义
- **窄带 / 宽带 · Narrowband / Wideband** — 8 kHz 够听懂，16 kHz 才自然
- **齿擦音 · Sibilants /s/ /f/ /sh/** — 最先被带宽切掉的那批高频辅音
- **G.711 · G.726 · AAC** — 从窄带低延到宽带高质的三档
- **ONVIF 音频 · Profile T audio** — 行业到底承诺了哪几种编码
- **ptime · 打包时长** — 一个网络包里装多少毫秒的声音
- **Jitter buffer · 抖动缓冲** — 拿时延换不卡顿

## 算法（23 条）

### AEC · 全双工（10 条）

- **AEC · Acoustic Echo Cancellation** — 把喇叭放出去、又被麦收回的声音减掉
- **Reference · Far-end reference** — 送去做减法的那一路远端信号
- **Double-talk · 双讲** — 两边同时说话，最难的那一刻
- **Echo tail · 回声尾长** — 回声要拖多久才衰干净
- **Tap · 抽头** — 自适应滤波器的长度单位
- **FIR · Finite Impulse Response（有限冲激响应）** — AEC 用来建模回声路径的滤波器
- **ERL · Echo Return Loss（回声回损）** — 结构与距离先帮你压掉多少
- **ERLE · Echo Return Loss Enhancement（回声回损改善）** — 算法又额外压掉多少
  - ⚡ ≤ −20·log₁₀(THD) ｜ 第 9 课推导
- **RES / NLP · Residual / Non-linear processing（残差 / 非线性处理）** — 线性滤波器减不掉的那部分
- **Full-duplex / Half-duplex** — 能不能同时说，产品级的分水岭

### NS · AGC · 链序（7 条）

- **HPF · High-pass Filter（高通滤波）** — 切掉直流与低频隆隆声
- **NS / ANR · Noise Suppression（噪声抑制）** — 压稳态噪声，代价是语音也被削
- **AGC · Automatic Gain Control（自动增益控制）** — 把忽大忽小的音量拉平
- **处理链顺序 · Chain order** — HPF → AEC → NS → AGC，顺序错了全错
- **Musical noise · 音乐噪声** — 降噪过头后的「水下叮当」声
- **Aggressiveness · 降噪激进度** — 它是一根滑杆，不是一个开关
- **Pumping / Breathing · 呼吸感** — AGC 时间常数没配好的听感

### 波束成形（6 条）

- **Beamforming · 波束成形** — 用多麦换方向性，换不到距离
- **相加式 Delay-and-sum · 差分式 Differential** — 大孔径换增益 vs 小孔径换指向
- **Aperture · 孔径** — 阵列尺寸相对波长有多大
- **Spatial aliasing · 空间混叠 / Grating lobe · 栅瓣** — 间距太大，高频长出栅瓣
- **DI · Directivity Index · 指向性指数** — 指向性换来多少等效信噪比
- **WNG · White Noise Gain · 白噪声增益** — 差分阵列为指向性付出的自噪声代价

## 预算（11 条）

### 时延账（6 条）

- **Mouth-to-ear · 嘴到耳时延** — 唯一对用户成立的那个时延
- **G.114 标尺 · One-way transmission time** — 判断时延好坏的行业刻度
  - ⚡ < 150 ms 好 / > 400 ms 不可接受 ｜ ITU-T G.114
- **Group delay · 群延迟** — 不同频率被拖慢的程度不一样
- **块长 / 帧长 · Block size / Frame size** — 每次处理多少毫秒，直接进账
- **算法时延 · Algorithmic delay** — 编解码器为压缩预先要囤的那点声音
- **尾长 ≠ 时延 · Tail length is not delay** — 最常见的记账错误
  - ⚡ 尾长是回声长度，不进时延账 ｜ 第 6 课

### 算力 · BOM 账（5 条）

- **MIPS · 百万指令每秒** — 算法要吃掉多少算力
- **峰值 MIPS · Peak MIPS** — 配硬件只认峰值，平均只看趋势
- **实例数据 · Instance data** — 模块之和 ≠ 系统总量，框架也吃内存
- **电压频率档 · Voltage-frequency tier** — 算力按档卖，跨档才有钱拿
  - ⚡ 151 → 149 MIPS 省 82 mW ｜ TIDUE77
- **算力余量 · Compute headroom** — 留多少给未来和最坏情况
