/**
 * Regenerates the two halves of the glossary's bidirectional links:
 *
 *   assets/glossary-terms.js   term data consumed by glossary-link.js, which
 *                              turns mentions in a lesson into links back to
 *                              the definition                    (forward)
 *   reference/glossary.html    a "出现在：第 N 课 …" line appended to each
 *                              definition, injected in place    (backward)
 *
 * Also assigns a stable id to any entry still missing one, so every term is
 * addressable. Idempotent — safe to re-run.
 *
 * Run after editing the glossary or adding a lesson:
 *   node assets/build-glossary.mjs
 *
 * A generated data file rather than a runtime fetch of glossary.html, because
 * lessons get opened by double-clicking (file://), where fetch is CORS-blocked.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GLOSSARY = join(ROOT, "reference", "glossary.html");

const stripTags = (s) => s.replace(/<[^>]*>/g, "");
const decode = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const text = (s) => decode(stripTags(s)).replace(/\s+/g, " ").trim();

/**
 * Aliases are what we hunt for in lesson prose. A <dt> like
 * "NS / ANR · Noise Suppression（噪声抑制）" yields NS, ANR, Noise Suppression,
 * 噪声抑制 — each a thing a lesson might plausibly write.
 */
function aliasesFromLabel(label) {
  const out = new Set();
  const add = (s) => {
    const v = s.trim().replace(/^[（(]|[）)]$/g, "").trim();
    if (v.length >= 2) out.add(v);
  };
  for (const chunk of text(label).split("·")) {
    for (const part of chunk.split("/")) {
      const bare = part.trim();
      if (!bare) continue;
      const head = bare.replace(/[（(].*$/, "").trim();
      add(head);
      // "相加式 Delay-and-sum" is two names for one thing, not one name.
      // Split only where Chinese meets Latin; leave "Sound Pressure Level" whole.
      if (/[一-鿿]/.test(head) && /[a-zA-Z]/.test(head)) {
        (head.match(/[一-鿿]+|[a-zA-Z][a-zA-Z0-9-]*(?: [a-z][a-zA-Z0-9-]*)*/g) || []).forEach(add);
      }
      const paren = bare.match(/[（(]([^）)]+)[）)]/);
      if (paren) paren[1].split(/[\/、,，]/).forEach(add);
    }
  }
  return [...out];
}

/**
 * Terms whose label yields an alias that reads as an ordinary word — matching
 * those would carpet the prose. Listed id → the aliases to use instead.
 */
const ALIAS_OVERRIDE = {
  capture: ["拾音", "放音"],
  sensitivity: ["灵敏度", "Sensitivity"],
  reference: ["参考信号", "Far-end reference", "远端参考"],
  tap: ["抽头"],
  isolation: ["喇叭→麦隔离", "声学隔离"],
  "full-duplex": ["全双工", "半双工", "Full-duplex", "Half-duplex"],
  "onvif-audio": ["ONVIF"],
  di: ["DI", "指向性指数", "directivity index"],
  // Bare 峰值 belongs to peak power (lesson 9); only the compound is this term.
  "peak-mips": ["峰值 MIPS", "Peak MIPS"],
};

/** Units and bare words that must never become links. */
const ALIAS_DENY = new Set(["dB", "Hz", "ms", "SPL 参考"]);

/**
 * Short Latin aliases only earn a link when they read as an acronym. Keeps
 * DI and NS, drops the "sh" that "Sibilance（s/sh 等高频辅音）" would donate.
 */
const aliasIsSafe = (a) =>
  !ALIAS_DENY.has(a) && (!/^[a-zA-Z-]{2,3}$/.test(a) || a === a.toUpperCase());

const slugFor = (label, aliases) => {
  const latin = aliases.find((a) => /^[a-zA-Z][a-zA-Z0-9 .·²-]*$/.test(a));
  return (latin || text(label).split("·")[0])
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-|-$/g, "") || "term";
};

// ---------------------------------------------------------------- parse
const source = readFileSync(GLOSSARY, "utf8");
const itemRe =
  /<div class="glossary-item"([^>]*)>\s*<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>\s*<\/div>/g;

const terms = [];
const usedIds = new Set();
let patched = source;

for (const [block, attrs, dt, dd] of source.matchAll(itemRe)) {
  const declared = attrs.match(/id="([^"]+)"/);
  const labelAliases = aliasesFromLabel(dt);
  let id = declared ? declared[1] : slugFor(dt, labelAliases);
  while (usedIds.has(id)) id += "-2";
  usedIds.add(id);

  if (!declared) {
    patched = patched.replace(
      block,
      block.replace('class="glossary-item"', `class="glossary-item" id="${id}"`)
    );
  }

  const gloss = text(dd).replace(/\s*出现在：.*$/, "");
  terms.push({
    id,
    label: text(dt),
    // Longest first, so ERLE wins over ERL and S-MOS over MOS.
    aliases: (ALIAS_OVERRIDE[id] || labelAliases)
      .filter(aliasIsSafe)
      .sort((a, b) => b.length - a.length),
    gloss: gloss.length > 160 ? gloss.slice(0, 159) + "…" : gloss,
  });
}

// ------------------------------------------------- backward: who mentions it
const pageLabel = (title, file) => {
  const lesson = title.match(/第\s*(\d+)\s*课/);
  if (lesson) return `第 ${Number(lesson[1])} 课`;
  const after = title.split("·").slice(1).join("·").trim();
  return after || title || file;
};

const pages = [];
for (const dir of ["lessons", "reference"]) {
  for (const file of readdirSync(join(ROOT, dir)).filter((f) => f.endsWith(".html"))) {
    if (dir === "reference" && file === "glossary.html") continue;
    const raw = readFileSync(join(ROOT, dir, file), "utf8");
    const title = (raw.match(/<title>([^<]*)<\/title>/) || [, file])[1];
    pages.push({
      href: dir === "lessons" ? `../lessons/${file}` : file,
      label: pageLabel(title, file),
      sort: dir === "lessons" ? `0${file}` : `1${file}`,
      body: text(raw.replace(/<script[\s\S]*?<\/script>/g, "")),
    });
  }
}
pages.sort((a, b) => a.sort.localeCompare(b.sort));

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mentions = (body, alias) =>
  /^[\x00-\x7F]+$/.test(alias)
    ? new RegExp(`(^|[^a-zA-Z0-9-])${escapeRe(alias)}([^a-zA-Z0-9-]|$)`, "i").test(body)
    : body.includes(alias);

for (const term of terms) {
  term.seen = pages
    .filter((p) => term.aliases.some((a) => mentions(p.body, a)))
    .map((p) => ({ href: p.href, label: p.label }));
}

// ------------------------------------------------------ inject the backlinks
// Appended inside <dd> — a <div> inside <dl> may only hold <dt>/<dd>.
patched = patched.replace(/<span class="seen-in">[\s\S]*?<\/span>\s*(?=<\/dd>)/g, "");
for (const term of terms) {
  if (!term.seen.length) continue;
  const links = term.seen.map((s) => `<a href="${s.href}">${s.label}</a>`).join(" · ");
  const re = new RegExp(`(<div class="glossary-item" id="${escapeRe(term.id)}">[\\s\\S]*?)</dd>`);
  patched = patched.replace(re, `$1<span class="seen-in">出现在：${links}</span></dd>`);
}

writeFileSync(GLOSSARY, patched);
writeFileSync(
  join(ROOT, "assets", "glossary-terms.js"),
  "/* Generated by assets/build-glossary.mjs — do not edit by hand. */\n" +
    `window.GLOSSARY_TERMS = ${JSON.stringify(
      terms.map(({ id, label, aliases, gloss }) => ({ id, label, aliases, gloss }))
    )};\n`
);

const orphans = terms.filter((t) => !t.seen.length);
console.log(`${terms.length} 条术语，${terms.length - orphans.length} 条有反向链接`);
if (orphans.length) console.log(orphans.map((t) => `  未被任何课引用: ${t.label}`).join("\n"));
