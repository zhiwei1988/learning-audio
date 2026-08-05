/**
 * Regenerates the knowledge mind map in three interchange formats:
 *
 *   reference/audio-mindmap.mm     FreeMind / Freeplane — imports into XMind,
 *                                  MindManager, MindNode, iThoughts
 *   reference/audio-mindmap.opml   OPML 2.0 — outliners and most mind map apps
 *   reference/audio-mindmap.md     nested list — markmap, Obsidian, plain reading
 *
 * Terms come from assets/glossary-terms.js, so the map cannot silently drift
 * from the glossary. TAXONOMY below carries the two things the glossary does
 * not know: which branch a term belongs to, and its one-line essence.
 *
 * Run after editing the glossary or adding a lesson:
 *   node assets/build-glossary.mjs && node assets/build-mindmap.mjs
 *
 * The test asserts the taxonomy and the glossary stay in bijection, so a new
 * term fails the build until it is placed:
 *   node --test assets/build-mindmap.test.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT_TEXT = "网络摄像机音频";

/**
 * A strict tree: every term appears exactly once. Cross-branch couplings that
 * NOTES.md calls out (tail length sitting on three ledgers at once) are
 * deliberately not drawn — they belong to the notes, not to this index.
 *
 * `badge` is the extra line for terms carrying a number. Every badge names its
 * provenance after ｜ so an example value is never read as a universal constant.
 */
export const TAXONOMY = [
  {
    name: "声学基础",
    side: "left",
    color: "#6B7280",
    groups: [
      {
        name: null,
        items: [
          { id: "capture", essence: "上行采环境声，下行放远端声" },
          { id: "spl", essence: "声压级，整个音频世界的量尺" },
          { id: "inverse-square", essence: "离远一倍，直达声就小一截", badge: "距离 ×2 → −6 dB ｜ 定义" },
          { id: "reverberation", essence: "墙面反射叠加，声音变糊的来源" },
          { id: "critical-distance", essence: "直达声与混响声相等的那个距离" },
          { id: "far-field", essence: "远到直达声不再占优的区间" },
        ],
      },
    ],
  },
  {
    name: "硬件",
    side: "left",
    color: "#2563EB",
    groups: [
      {
        name: "拾音器件",
        items: [
          { id: "snr", essence: "麦克风自己有多安静", badge: "在 94 dB SPL 下测的 ｜ 第 2 课锚点" },
          { id: "aop", essence: "多大声开始削波" },
          { id: "sensitivity", essence: "给定声压下输出多大电平" },
          { id: "dynamic-range", essence: "最轻到最响能覆盖多宽", badge: "= AOP − EIN ｜ 定义" },
          { id: "self-noise", essence: "麦的自噪声折算回声压", badge: "= 94 − SNR (dB) ｜ 定义" },
          { id: "thd", essence: "器件把信号弄脏了多少" },
          { id: "pdm", essence: "数字麦到主控的两种传输格式" },
          { id: "mic-matching", essence: "阵列里每颗麦必须长得一样" },
          { id: "isolation", essence: "结构上先把回声挡掉多少 dB" },
        ],
      },
      {
        name: "放音器件",
        items: [
          { id: "speaker-sensitivity", essence: "1 W 输入能出多大声", badge: "常在 10 cm 测，换算 1 m 要 −20 dB ｜ 第 9 课陷阱" },
          { id: "fo", essence: "喇叭发不出声的下边界", badge: "频响下限写的是 Fo，不是可用下限 ｜ 第 9 课陷阱" },
          { id: "crest-factor", essence: "峰值比平均高出多少", badge: "语音约 12 dB ｜ 第 9 课" },
          { id: "btl", essence: "两路反相驱动，功率翻四倍" },
          { id: "smart-amp", essence: "实时测振膜位移与音圈温度", badge: "峰值上限 +9.5 dB ｜ TI 实测" },
          { id: "excursion", essence: "推太狠会撞到机械极限" },
          { id: "soa", essence: "不烧不撞的电流电压边界", badge: "额定功率是断续信号测的 ｜ 第 9 课陷阱" },
          { id: "thermal-time-constant", essence: "音圈发热到触发限功率要多久" },
        ],
      },
    ],
  },
  {
    name: "评测",
    side: "left",
    color: "#EA580C",
    groups: [
      {
        name: "方法",
        items: [
          { id: "repeatability", essence: "消声室买的是这个，不是「准」" },
          { id: "session-bias", essence: "换一次场，整体就偏一点" },
          { id: "error-bar", essence: "小于它的差异不能当差异", badge: "分开测的地板 = 1.96·√2·场次偏置 ｜ 第 8 课" },
          { id: "paired-test", essence: "同场、同序、同源、同人" },
          { id: "ccr", essence: "打绝对分、打损伤分、打对比分" },
          { id: "p501", essence: "别拿自己随手录的语音当激励" },
        ],
      },
      {
        name: "指标",
        items: [
          { id: "dmos", essence: "绝对分不可复现，差值分才可复现" },
          { id: "snri", essence: "降噪到底降了多少、伤了多少" },
          { id: "smos", essence: "语音、背景、整体分开打分" },
          { id: "dnsmos", essence: "不用人耳的客观替代分" },
          { id: "dbpa", essence: "以 1 Pa 为参考的电平口径" },
          { id: "dt-attenuation", essence: "P.340 把「全双工」变成可查表的等级" },
        ],
      },
    ],
  },
  {
    name: "编码与网络",
    side: "right",
    color: "#0891B2",
    groups: [
      {
        name: null,
        items: [
          { id: "nyquist", essence: "采样率决定能留住多高的音", badge: "可用带宽 = fs / 2 ｜ 定义" },
          { id: "narrowband", essence: "8 kHz 够听懂，16 kHz 才自然" },
          { id: "sibilance", essence: "最先被带宽切掉的那批高频辅音" },
          { id: "codec", essence: "从窄带低延到宽带高质的三档" },
          { id: "onvif-audio", essence: "行业到底承诺了哪几种编码" },
          { id: "ptime", essence: "一个网络包里装多少毫秒的声音" },
          { id: "jitter-buffer", essence: "拿时延换不卡顿" },
        ],
      },
    ],
  },
  {
    name: "算法",
    side: "right",
    color: "#7C3AED",
    groups: [
      {
        name: "AEC · 全双工",
        items: [
          { id: "aec", essence: "把喇叭放出去、又被麦收回的声音减掉" },
          { id: "reference", essence: "送去做减法的那一路远端信号" },
          { id: "double-talk", essence: "两边同时说话，最难的那一刻" },
          { id: "echo-tail", essence: "回声要拖多久才衰干净" },
          { id: "tap", essence: "自适应滤波器的长度单位" },
          { id: "fir", essence: "AEC 用来建模回声路径的滤波器" },
          { id: "erl", essence: "结构与距离先帮你压掉多少" },
          { id: "erle", essence: "算法又额外压掉多少", badge: "≤ −20·log₁₀(THD) ｜ 第 9 课推导" },
          { id: "nlp", essence: "线性滤波器减不掉的那部分" },
          { id: "full-duplex", essence: "能不能同时说，产品级的分水岭" },
        ],
      },
      {
        name: "NS · AGC · 链序",
        items: [
          { id: "hpf", essence: "切掉直流与低频隆隆声" },
          { id: "ns", essence: "压稳态噪声，代价是语音也被削" },
          { id: "agc", essence: "把忽大忽小的音量拉平" },
          { id: "chain-order", essence: "HPF → AEC → NS → AGC，顺序错了全错" },
          { id: "musical-noise", essence: "降噪过头后的「水下叮当」声" },
          { id: "aggressiveness", essence: "它是一根滑杆，不是一个开关" },
          { id: "pumping", essence: "AGC 时间常数没配好的听感" },
        ],
      },
      {
        name: "波束成形",
        items: [
          { id: "beamforming", essence: "用多麦换方向性，换不到距离" },
          { id: "delay-and-sum", essence: "大孔径换增益 vs 小孔径换指向" },
          { id: "aperture", essence: "阵列尺寸相对波长有多大" },
          { id: "spatial-aliasing", essence: "间距太大，高频长出栅瓣" },
          { id: "di", essence: "指向性换来多少等效信噪比" },
          { id: "wng", essence: "差分阵列为指向性付出的自噪声代价" },
        ],
      },
    ],
  },
  {
    name: "预算",
    side: "right",
    color: "#059669",
    groups: [
      {
        name: "时延账",
        items: [
          { id: "mouth-to-ear", essence: "唯一对用户成立的那个时延" },
          { id: "g114", essence: "判断时延好坏的行业刻度", badge: "< 150 ms 好 / > 400 ms 不可接受 ｜ ITU-T G.114" },
          { id: "group-delay", essence: "不同频率被拖慢的程度不一样" },
          { id: "block-size", essence: "每次处理多少毫秒，直接进账" },
          { id: "algo-delay", essence: "编解码器为压缩预先要囤的那点声音" },
          { id: "tail-vs-delay", essence: "最常见的记账错误", badge: "尾长是回声长度，不进时延账 ｜ 第 6 课" },
        ],
      },
      {
        name: "算力 · BOM 账",
        items: [
          { id: "mips", essence: "算法要吃掉多少算力" },
          { id: "peak-mips", essence: "配硬件只认峰值，平均只看趋势" },
          { id: "instance-data", essence: "模块之和 ≠ 系统总量，框架也吃内存" },
          { id: "voltage-frequency-tier", essence: "算力按档卖，跨档才有钱拿", badge: "151 → 149 MIPS 省 82 mW ｜ TIDUE77" },
          { id: "compute-headroom", essence: "留多少给未来和最坏情况" },
        ],
      },
    ],
  },
];

export const BRANCH_SIZES = Object.fromEntries(
  TAXONOMY.map((b) => [b.name, b.groups.reduce((s, g) => s + g.items.length, 0)])
);

export function loadTerms(path) {
  const scope = {};
  new Function("window", readFileSync(path, "utf8"))(scope);
  return scope.GLOSSARY_TERMS;
}

export function buildTree(terms) {
  const byId = new Map(terms.map((t) => [t.id, t]));
  const node = (kind, text, extra = {}) => ({ kind, text, children: [], ...extra });

  const termNode = (item) => {
    const term = byId.get(item.id);
    if (!term) throw new Error(`分类表引用了不存在的术语: ${item.id}`);
    const n = node("term", term.label, { note: `${item.essence}\n\n${term.gloss}` });
    if (item.badge) n.children.push(node("badge", `⚡ ${item.badge}`, { badgeLine: true }));
    return n;
  };

  const root = node("root", ROOT_TEXT, { note: "拾音 · 放音 · 全双工" });
  for (const branch of TAXONOMY) {
    const b = node("branch", branch.name, { side: branch.side, color: branch.color });
    for (const group of branch.groups) {
      const parent = group.name
        ? b.children[b.children.push(node("group", group.name, { color: branch.color })) - 1]
        : b;
      for (const item of group.items) parent.children.push(termNode(item));
    }
    root.children.push(b);
  }
  return root;
}

export function countLeaves(node) {
  if (node.kind === "term") return 1;
  return node.children.reduce((s, c) => s + countLeaves(c), 0);
}

const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function toFreeMind(root) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<map version="1.0.1">'];
  const walk = (n, depth) => {
    const pad = "  ".repeat(depth);
    const attrs = [`TEXT="${xmlEscape(n.text)}"`];
    if (n.side) attrs.push(`POSITION="${n.side}"`);
    if (n.color) attrs.push(`COLOR="${n.color}"`);
    if (n.kind === "branch" || n.kind === "group") attrs.push('FOLDED="false"');
    const hasBody = n.note || n.children.length;
    lines.push(`${pad}<node ${attrs.join(" ")}${hasBody ? ">" : "/>"}`);
    if (!hasBody) return;
    if (n.color && n.kind === "branch") lines.push(`${pad}  <edge COLOR="${n.color}" WIDTH="2"/>`);
    if (n.note) {
      const paras = n.note.split("\n\n").map((p) => `<p>${xmlEscape(p)}</p>`).join("");
      lines.push(`${pad}  <richcontent TYPE="NOTE"><html><head/><body>${paras}</body></html></richcontent>`);
    }
    for (const c of n.children) walk(c, depth + 1);
    lines.push(`${pad}</node>`);
  };
  walk(root, 1);
  lines.push("</map>", "");
  return lines.join("\n");
}

export function toOPML(root) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<opml version="2.0">',
    "  <head>",
    `    <title>${xmlEscape(root.text)} · 知识地图</title>`,
    "  </head>",
    "  <body>",
  ];
  const walk = (n, depth) => {
    const pad = "  ".repeat(depth);
    const attrs = [`text="${xmlEscape(n.text)}"`];
    if (n.note) attrs.push(`_note="${xmlEscape(n.note.replace(/\n\n/g, " — "))}"`);
    if (n.children.length) {
      lines.push(`${pad}<outline ${attrs.join(" ")}>`);
      for (const c of n.children) walk(c, depth + 1);
      lines.push(`${pad}</outline>`);
    } else {
      lines.push(`${pad}<outline ${attrs.join(" ")}/>`);
    }
  };
  for (const b of root.children) walk(b, 2);
  lines.push("  </body>", "</opml>", "");
  return lines.join("\n");
}

export function toMarkdown(root) {
  const out = [`# ${root.text} · 知识地图`, ""];
  out.push(`共 ${countLeaves(root)} 条术语，六支职能分类。⚡ 行的数字在 ｜ 之后注明来源与测量条件。`, "");
  const bullet = (term, indent) => {
    const essence = term.note.split("\n\n")[0];
    out.push(`${"  ".repeat(indent)}- **${term.text}** — ${essence}`);
    for (const b of term.children) out.push(`${"  ".repeat(indent + 1)}- ${b.text}`);
  };
  for (const branch of root.children) {
    out.push(`## ${branch.text}（${countLeaves(branch)} 条）`, "");
    for (const child of branch.children) {
      if (child.kind === "group") {
        out.push(`### ${child.text}（${countLeaves(child)} 条）`, "");
        for (const t of child.children) bullet(t, 0);
        out.push("");
      } else {
        bullet(child, 0);
      }
    }
    if (branch.children.every((c) => c.kind !== "group")) out.push("");
  }
  return out.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const terms = loadTerms(join(ROOT, "assets", "glossary-terms.js"));
  const tree = buildTree(terms);
  const targets = [
    ["audio-mindmap.mm", toFreeMind(tree)],
    ["audio-mindmap.opml", toOPML(tree)],
    ["audio-mindmap.md", toMarkdown(tree)],
  ];
  for (const [name, body] of targets) writeFileSync(join(ROOT, "reference", name), body);
  console.log(
    `${countLeaves(tree)} 条术语 → ${targets.map(([n]) => n).join(" / ")}\n` +
      TAXONOMY.map((b) => `  ${b.name} ${BRANCH_SIZES[b.name]} 条`).join("\n")
  );
}
