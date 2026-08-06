# 消费级摄像机 / 可视门铃对讲基准数——调研笔记

对应 GitHub issue [zhiwei1988/learning-audio#5](https://github.com/zhiwei1988/learning-audio/issues/5)，补 `RESOURCES.md` Gaps 第一条：
「消费级门铃/家用摄像机对讲时延与全双工竞品拆解的一手 teardown 报告」。

**先说结论**：这四类数里，**拾音距离**是唯一有可信第三方实测的一项（Consumer Reports）；**全双工/半双工**厂商官方支持文档给得比想象中清楚（只是没人按 P.340 分级）；**端到端时延**和**放音响度（对讲喇叭而非警报器）**几乎全行业查无权威一手数据——能找到的都是过时案例、社区经验值或警报器 SPL（不是对讲喇叭 SPL，不能直接当同一个数用）。

## 证据分级说明

本文所有数字标注以下四级来源，按可信度从高到低：

| 标记 | 含义 | 本文中的例子 |
|---|---|---|
| **[厂商]** | 官方 datasheet / spec 页 / 官方支持文档 | Tapo 警报器 dB、Arlo/Wyze/Google 官方双工说明 |
| **[第三方评测]** | 有公开方法论的独立测评机构 | Consumer Reports 实地/实验室拾音测试 |
| **[社区]** | 论坛/社区经验值，无实验室条件，可能只是个别人的个别遭遇 | IPVM 讨论区、Reddit、Reolink 社区 |
| **[拆解]** | 拆机后看到的物理元件规格，非厂商公开 datasheet | iFixit 用户评论里的 Ring 喇叭尺寸 |

凡是表格里没有一手来源的格子，一律写「查无」，不用典型值或推测填充——这是 `NOTES.md` 的硬规则。

---

## 一、端到端对讲时延（口对耳 / 按下到出声）

### 1.1 能找到的数字

| 产品 | 时延 | 来源等级 | 测法 | 出处 |
|---|---|---|---|---|
| Ring Video Doorbell（**2015 年第一代**，弱 Wi-Fi） | 约 10 秒（按门铃→手机弹提示→点 Accept→开始对话，整段计时，非纯语音环回） | **[第三方评测]** | The Register 记者实测，描述式计时，非仪器级精度 | [The Register, 2015-05-09](https://www.theregister.com/2015/05/09/review_ring_video_doorbell/) |
| 同上，路由器/天线优化后 | 降到 1–2 秒 | **[第三方评测]** | 同上 | 同上 |
| 同上，Ring CEO Jamie Siminoff 自述 | 「average customer experience... one to two seconds delay」 | **[厂商]**（高管口头声明，非 datasheet） | 未披露测法 | 同上文引用 |

**这条数据的问题**：产品是 2015 年的第一代 Ring Doorbell，硬件、算法、云端架构与今天完全不是一回事；测法也只是「秒表式」估读，不是逐帧/逐样点的仪器测量。**它唯一的价值是证明「弱网时 10 秒、正常时 1–2 秒」这个量级十年前就是行业共识起点**，作为锚点的下限参考，不能当作当前产品的基准。

### 1.2 查无的部分（即 issue 真正要的东西）

- **没有任何专业评测机构（IPVM、Consumer Reports、RTINGS、TechGearLab、Wirecutter）公开过跨品牌的口对耳时延仪器测量数据。**
  - Consumer Reports 的门铃实验室测试项目里有「response time」评分（多快发送提醒、多快加载直播），但公开可见部分不含对讲时延的量化结果，付费墙后是否有未知。
  - RTINGS 不测视频门铃/安防摄像机这一类目——查过其官网结构，门铃类产品不在其评测范围内。
  - TechGearLab 对 Ring Battery Doorbell、Eufy E340 的评测里「Two Way Talk」只在参数表标注「Yes」，正文没有测量数据。
- **社区/自助排障类信息一致认为「1–2 秒是正常，3–5 秒到两位数秒是网络问题」**，但这些来自 SEO 内容站（如 whizz-experts.com、scos.co.uk）和零散论坛帖（Reolink 社区「大约 2 秒，取决于码率档位」），**没有一条披露测试环境、样本量或重复次数**，只能当「用户体感共识」而非「基准数」。
- **没有任何来源按 ITU-T P.340 或等价方法测过消费级摄像机/门铃的双讲时延（TELR_DT / 双讲衰减）。** 直接搜索「P.340 doorbell/camera duplex rating」查无一手来源，验证了 issue 描述与 `RESOURCES.md` Gaps 的判断：这条缺口至今没人填过。

**小结**：口对耳时延这个数，行业实际上是空白——连"典型值"级别的公开一手测量都没有，遑论跨品牌对比表。立项若要锚点，唯一现实路径是**自己测**（第 6 课已有时延预算方法论可用于设计测试）。

---

## 二、全双工能力（Full-duplex vs Half-duplex）

这是四类数据里**证据质量最好**的一项——不是因为有人做过 P.340 分级（没有），而是因为多家厂商在官方支持文档里**明确用「像打电话一样同时说」vs「像对讲机一样按住说」来分类自己的产品线**，这本身就是可引用的一手声明。

### 2.1 厂商官方分类（一手，来自 support/kb 页面）

| 品牌 | 全双工（Full-duplex，像电话） | 半双工（Push-to-talk，像对讲机） | 来源 |
|---|---|---|---|
| **Arlo** | Ultra、Ultra 2、Pro 3、Pro 3 Floodlight、Essential、Video Doorbell | Pro 2、Pro、Q Plus、Q、Baby、Go | **[厂商]** [Arlo 官方 FAQ](https://kb.arlo.com/000063035/How-do-I-use-2-way-audio-on-my-Arlo-camera) |
| **Google Nest** | Nest Hello、Nest IQ 系列（「works more like a phone」） | Nest Cam Indoor / Outdoor（旧款，需轮流说话） | **[厂商]** [Google Nest 官方支持](https://support.google.com/googlenest/answer/9219455) |
| **Wyze** | 查无（未见任何 Wyze 产品被官方标为全双工） | Wyze Cam v2（官方原文：「2-Way Audio is similar to walkie talkie where only one side can speak at a time」） | **[厂商]** [Wyze 官方支持](https://forums.wyze.com/t/two-way-audio/3426) |
| **TP-Link Tapo** | **TD25**（门铃，官方原文：「full-duplex technology ensures both sides can be heard simultaneously and in real time」） | TD21（仅标「two-way audio featuring noise cancellation」，未声明双工方式——按其表述更接近半双工，但厂商未明确定性，标「查无明确声明」） | **[厂商]** [Tapo TD25 官方页面](https://www.tp-link.com/us/smart-home/smart-doorbell/td25/) |
| **Ring** | 官方从未使用「full-duplex」这个词；「Audio+」（Battery Video Doorbell Pro 等新款）营销页只写「Two-Way Talk with Audio+」，不含双工技术说明 | 经典款操作方式明确是「press and hold 说话，松开听」——按压模式即半双工的行为特征，来自 Ring 自己的操作指引 | **[厂商]**（操作说明层面），双工技术分类本身**查无官方明确声明** |
| **Eufy** | Video Doorbell E340「full-duplex，像打电话」——**仅见于第三方数码媒体转述**（mightygadget.com、bikmantech.com），eufy.com 官方产品页只写「Two-Way Audio ✓」，**不含双工技术声明** | Pet Camera D605 系列：官方明确「supports half-duplex two-way audio... does not allow audio to be transmitted in both directions at the same time」（门铃产品线是否同架构未见官方说明） | 半双工 **[厂商]**；全双工声称降级为 **[第三方评测]**，未经厂商一手确认 |
| **EZVIZ / 萤石** | 查无 | 查无 | 搜索官方页面与 DB1 datasheet，均未提及双工方式 |
| **小米 / Xiaomi** | 查无 | 查无 | 未找到官方或第三方对小米可视门铃双工方式的明确说明 |

### 2.2 关键发现：厂商愿意公开分类，但没人用统一刻度

上表本身回答了 issue 的一半问题——**至少 4 家厂商（Arlo、Google、Wyze、TP-Link）在支持文档里明确承认自己有些型号是半双工**，这比预期更透明。但：

1. **P.340 Table 4 的双讲分级（Behaviour 1–3，按 dB 分 4 档）没有任何厂商或评测机构用过。** 「全双工/半双工」目前只是二元营销/支持用语，不是量化分级——一台被标「full-duplex」的门铃，双讲衰减可能是 P.340 Behaviour 1 也可能勉强够上 Behaviour 2c，无从判断。
2. **同品牌不同代际差异巨大**（Arlo Pro→Pro 3 从半双工变全双工；Nest Cam→Nest Hello 同理），说明「这个牌子是不是全双工」这个问题本身问法有误——**必须问到具体型号**。
3. **EZVIZ、小米两家完全没有可查一手来源**，无论厂商还是第三方，双工方式都是黑盒。

---

## 三、拾音距离（厂商标称 vs 实测）

### 3.1 唯一的高质量一手数据：Consumer Reports

**[第三方评测]** [Consumer Reports — Video Doorbell Cameras Record Audio, Too](https://www.consumerreports.org/home-garden/home-security-cameras/video-doorbell-cameras-record-audio-too-a4636115889/)

两组独立测试，方法论公开：

- **实验室测试**：Ring Video Doorbell 3 Plus，在对话音量下清晰可辨的最远距离 **18 英尺**（约 5.5 m）——这是实验室测试的最远设定距离，不代表真实上限（即"至少 18 尺可用"，没有测更远）。
- **实地测试**（记者 Daniel Wroclawski 在新泽西自宅，把 YouTube 测试语音以 5 英尺为间隔从人行道播放）：
  - **Arlo Ultra**：无风条件下清晰拾音至 **30 英尺**（约 9 m）
  - **Ring Video Doorbell 3 Plus**：无风条件下清晰拾音至 **20 英尺**（约 6 m）
  - 两者在**有风**条件下都退化到只剩 **10 英尺**（约 3 m）清晰

这组数据的价值在于：**给出了风噪这个环境变量对拾音距离的实测衰减比例**（约打对折），这是厂商 datasheet 从不会告诉你的。

### 3.2 社区经验值（专业社区，但非实验室条件）

**[社区]** [IPVM — What's The Typical Audio Range Of An IP Camera For A Busy Room?](https://ipvm.com/discussions/ip-camera-with-audio)

- Shannon Davis（IPVMU 认证会员）：「I have had cameras pick up as far as 30' but usually the audio is not that good.」（泛指内置麦 IP 摄像机，非门铃专指）
- Ethan Ace：外接优质麦克风「~15' 实用拾音上限」，**内置麦「最多打对折到 10'」**

这与 Consumer Reports 的实测量级（10–20 尺）基本吻合，可以互相印证——两个独立来源在「10 尺量级」上收敛，这本身提高了这个数的可信度。

### 3.3 厂商标称：几乎全数查无

系统性检查了 Ring、Nest、Arlo、Eufy、Wyze、Tapo、EZVIZ、小米的官方 spec 页/datasheet，**没有一家公开发布麦克风拾音距离规格**。厂商愿意标的是夜视距离（如 EZVIZ DB1「Night Vision Up to 5m/16ft」）和 PIR 检测范围（DB1 datasheet 图示 1.5/3/5 米），**唯独拾音距离系统性缺失**——这本身是一条值得记的模式：**麦克风拾音距离不是消费级门铃厂商愿意标称的指标**，立项定规格时不能指望竞品 datasheet 给锚点，只能自测或引第三方实测。

---

## 四、放音响度（标称 SPL 及测量距离）

### 4.1 重要警告：找到的几乎全是「警报器」SPL，不是「对讲喇叭」SPL

多数消费级摄像机/门铃的 datasheet 里唯一给 dB 数字的栏位是 **Siren（警报器）**，不是 Two-Way Talk 用的对讲喇叭。两者物理上可能共用同一颗喇叭单元，但警报音通常是持续单频/方波音调（声学效率远高于语音），**警报器 dB 不能直接当对讲响度用**——这正是 issue 要求的"归一化前先问清楚测的是什么"的又一层，比距离换算更基础：**先问测的是不是同一个信号**。

带着这个警告，以下是能找到的警报器 SPL 数据：

### 4.2 有测量距离披露的（可归一化）

换算公式沿用 Same Sky 官方公式（见 `RESOURCES.md`）：`Sadj = 20·log10(D/Dstd)`。

| 产品 | 标称 SPL | 测量距离 | 换算到 1 m | 来源等级 | 出处 |
|---|---|---|---|---|---|
| TP-Link Tapo C530WS（警报器） | 93 dB | 10 cm | 93 − 20·log10(10) = **73 dB @ 1 m** | **[厂商]** | [Tapo C530WS 官方](https://directpcsupplies.com/product/tp-link-tapo-c530ws-outdoor-pan-tilt-3k-5mp-security-wi-fi-camera-360-colour-night-vision-smart-ai-detection-sound-light-alarm-2-way-audio/) |
| TP-Link Tapo TD25（门铃，警报器） | 98 dB | 10 cm | 98 − 20 = **78 dB @ 1 m** | **[厂商]** | Tapo TD25 官网 |
| Wyze Bulb Cam（警报器） | 95 dB | 4 in（≈10 cm） | 95 − 20 = **75 dB @ 1 m** | **[厂商]** | [Wyze 官方 tech specs](https://support.wyze.com/) |
| Arlo Pro / Pro 4（内置智能警报器） | 80 dB | **30 m**（非近场，是远场声称） | 若强行按平方反比外推：80 + 20·log10(30) ≈ **110 dB @ 1 m** —— **这个外推极不可信，见下方说明** | **[厂商]** | [Arlo 官方文档](https://care.arlo.com/en-us/images/documents/arlopro4/) |

**Arlo 这行必须单独说明**：10 cm 与 30 m 相差 300 倍距离，跨了近场→远场的转换区间，平方反比定律在小型喇叭的近场并不成立（第 9 课已讲过 datasheet 陷阱），把 80 dB@30m 外推回 1 m 得到 110 dB 这种量级，大概率是**营销用的"能传多远"式模糊表述，而非严谨声学测量**，不能和 TP-Link/Wyze 那三行的 10 cm 近场读数放在同一列比较。**这行的正确处理方式是保留原始声称（80 dB@30m），不做归一化，标注"测量条件与其余厂商不可比"**。

### 4.3 有 dB 数字但测量距离披露不全的

| 产品 | 标称 SPL | 测量距离 | 备注 |
|---|---|---|---|
| Wyze Cam OG（警报器） | 100–106 dB | **查无**（官方 support 页面在多次抓取中未能确认具体测量距离，403 拒绝直接访问确认） | 需要人工登录 support.wyze.com 核实 |
| Wyze Cam v4（警报器） | 99 dB | 查无 | 同上 |
| Wyze Duo Cam Doorbell（警报器） | 90 dB | 查无 | 同上 |
| EZVIZ C3W（警报器） | 「up to 100 dB」 | 查无——官网原文只写「the siren can reach up to 100 dB」，未标测量距离 | 「up to」措辞本身已提示这是上限营销数字 |

### 4.4 对讲喇叭本身的响度：系统性查无

- 没有任何一家厂商（Ring / Nest / Arlo / Eufy / Wyze / EZVIZ / Tapo / 小米）在公开 datasheet 里为「Two-Way Talk 对讲喇叭」单独标注 SPL 数字——全部只写「built-in speaker」「HiFi quality speaker」一类定性描述（如 EZVIZ DB1 datasheet：「Audio Output: Built-in loud speaker」，无量化指标）。
- **没有第三方评测机构做过独立 SPL 实测**（用声级计在标准距离量对讲喇叭输出）——搜索「doorbell speaker dB SPL measured independent test」查无任何结果。
- **拆解层面**：iFixit「Ring Video Doorbell Pro Speaker Replacement」页面下，用户 cagedbat（2021-07-01 评论，**[拆解]**、非 iFixit 官方撰写、单人样本未经复核）拆机识别出喇叭物理规格：**1 W、8 Ω、15×11×3.5 mm 矩形喇叭**。这只给了功率/阻抗/尺寸，**没有 SPL 灵敏度数字**——拿到型号也无法反推响度，除非能查到这颗具体喇叭元件的厂商 datasheet（本次调研未能定位到该元件的原厂 datasheet）。

**小结**：对讲喇叭响度是四类数据里空白程度最高的一项——连"警报器 dB"这种间接锚点都要打上"很可能不代表对讲响度"的折扣。

---

## 五、给方法论的启示（回应 Gaps）

1. **`RESOURCES.md` Gaps 第一条不能靠调研关掉，只能靠自测关掉。** 时延和对讲喇叭响度两项，行业一手数据密度接近零；不是调研深度不够，是这个市场里确实没人发表过。
2. **拾音距离是四项里最容易借力的**——Consumer Reports 的方法（固定语音源 + 5 尺步进 + 记录风况）本身就是一份现成的低成本测试方案模板，且已经和 IPVM 的独立经验值互相印证到同一量级（10–20 尺）。
3. **双工分类可以直接抄厂商的操作说明书作为快速筛查**（"press and hold" = 半双工的强信号），不需要等厂商说出"full-duplex"这个词——但这只能做真/假二元判断，判断不出程度，做不到 P.340 那种分级。
4. **警报器 SPL 与对讲喇叭 SPL 混用是这个市场的通病**——写竞品对比表时，任何厂商给出的唯一 dB 数字，第一步先确认它测的是哪个信号源，这比"哪个距离测的"更容易被忽略。
5. 若要真正填上这条 Gap，现实路径只有：**买几台代表性竞品自己测**（口对耳时延用秒表/高帧率录像逐帧读、拾音距离照抄 Consumer Reports 的方法、对讲喇叭 SPL 自己上声级计），调研到此为止已经是公开资料的极限。
