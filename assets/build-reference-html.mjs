/**
 * Converts a fixed set of reference/*.md assets (method fixed assets +
 * research findings) into styled reference/*.html pages that open cleanly
 * via file:// — matching the lesson/cheatsheet convention (assets/styles.css,
 * <script defer> glossary linking, no runtime fetch).
 *
 * The .md files stay the source of truth (git-friendly diffs, grep-able);
 * the .html files are the generated reading view. Re-run after editing any
 * source .md:
 *   node assets/build-reference-html.mjs
 *
 * Markdown support is intentionally narrow — only what these 9 files
 * actually use: ATX headings (#### max), paragraphs, blockquotes, fenced
 * code blocks, hr (---), pipe tables, nested ordered/unordered lists, and
 * inline code/bold/italic/links/autolinks. Not a general-purpose parser.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REF = join(ROOT, "reference");

// basename (without .md) -> { lede }. lede is optional hand-written dek;
// falls back to the first paragraph under the H1 when omitted.
const SOURCES = [
  { name: "answer-shapes", eyebrow: "Reference · 方法固定资产" },
  { name: "coupling-inventory", eyebrow: "Reference · 方法固定资产" },
  { name: "duplex-dictionary", eyebrow: "Reference · 方法固定资产" },
  { name: "quality-dictionary", eyebrow: "Reference · 方法固定资产" },
  { name: "retreat-program", eyebrow: "Reference · 方法固定资产" },
  { name: "research-consumer-intercom-benchmarks", eyebrow: "Reference · Research findings" },
  { name: "research-handsfree-spec-standards", eyebrow: "Reference · Research findings" },
  { name: "research-quality-dictionary-gaps", eyebrow: "Reference · Research findings" },
  { name: "research-store-reverberation", eyebrow: "Reference · Research findings" },
];

// Cross-links between these files should point at the generated .html, not
// the raw .md, once both exist side by side.
const LINK_REWRITE = new Map(SOURCES.map((s) => [`${s.name}.md`, `${s.name}.html`]));

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function rewriteHref(href) {
  const bare = href.replace(/^\.\//, "");
  return LINK_REWRITE.has(bare) ? LINK_REWRITE.get(bare) : href;
}

// Inline markdown: code spans, autolinks, links, bold, italic. Single
// left-to-right pass; plain-text gaps get HTML-escaped as we go.
function parseInline(text) {
  const pattern = /`([^`]+)`|<(https?:\/\/[^\s>]+)>|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = pattern.exec(text))) {
    out += escapeHtml(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out += `<code>${escapeHtml(m[1])}</code>`;
    } else if (m[2] !== undefined) {
      out += `<a href="${escapeHtml(m[2])}" target="_blank" rel="noopener">${escapeHtml(m[2])}</a>`;
    } else if (m[3] !== undefined) {
      out += `<a href="${escapeHtml(rewriteHref(m[4]))}"${/^https?:\/\//.test(m[4]) ? ' target="_blank" rel="noopener"' : ""}>${escapeHtml(m[3])}</a>`;
    } else if (m[5] !== undefined) {
      out += `<strong>${escapeHtml(m[5])}</strong>`;
    } else if (m[6] !== undefined) {
      out += `<em>${escapeHtml(m[6])}</em>`;
    }
    last = pattern.lastIndex;
  }
  out += escapeHtml(text.slice(last));
  return out;
}

function indentOf(line) {
  return line.match(/^ */)[0].length;
}

const UL_RE = /^(\s*)-\s+(.*)$/;
const OL_RE = /^(\s*)\d+\.\s+(.*)$/;

// Parses a nested list starting at `lines[i]`, whose marker sits at exactly
// `indent` columns. Returns { html, next }.
function parseList(lines, i, indent) {
  const isOrdered = OL_RE.test(lines[i]);
  const re = isOrdered ? OL_RE : UL_RE;
  const tag = isOrdered ? "ol" : "ul";
  let html = `<${tag}>`;
  while (i < lines.length) {
    const m = lines[i].match(re);
    if (!m || m[1].length !== indent) break;
    let itemHtml = parseInline(m[2]);
    i++;
    // Nested list: next non-blank line is more indented and is itself a list item.
    if (i < lines.length && (lines[i].trim() === "")) {
      // allow a single blank line inside a loose list without ending it
      const j = i + 1;
      if (j < lines.length && (UL_RE.test(lines[j]) || OL_RE.test(lines[j])) && indentOf(lines[j]) > indent) {
        i = j;
      }
    }
    if (i < lines.length && (UL_RE.test(lines[i]) || OL_RE.test(lines[i])) && indentOf(lines[i]) > indent) {
      const nested = parseList(lines, i, indentOf(lines[i]));
      itemHtml += nested.html;
      i = nested.next;
    }
    html += `<li>${itemHtml}</li>`;
  }
  html += `</${tag}>`;
  return { html, next: i };
}

// Splits a pipe-delimited row on unescaped `|`, honouring `\|` as a literal
// pipe inside a cell (e.g. "Server\|Client\|Auto").
function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, "|"));
}

function parseTable(lines, i) {
  const headerCells = splitTableRow(lines[i]);
  i += 2; // skip header + separator row
  let body = "";
  while (i < lines.length && /^\s*\|/.test(lines[i])) {
    const cells = splitTableRow(lines[i]);
    body += `<tr>${cells.map((c) => `<td>${parseInline(c)}</td>`).join("")}</tr>`;
    i++;
  }
  const head = `<tr>${headerCells.map((c) => `<th>${parseInline(c)}</th>`).join("")}</tr>`;
  return { html: `<table class="ref"><thead>${head}</thead><tbody>${body}</tbody></table>`, next: i };
}

function convert(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  let title = "";
  let firstParagraph = "";
  let body = "";

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code block.
    if (/^```/.test(line)) {
      i++;
      const codeLines = [];
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // closing fence
      body += `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`;
      continue;
    }

    // Heading.
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      if (level === 1 && !title) {
        title = text;
      } else {
        body += `<h${level}>${parseInline(text)}</h${level}>`;
      }
      i++;
      continue;
    }

    // Horizontal rule (pure dashes, not a table separator row).
    if (/^-{3,}$/.test(line.trim())) {
      body += "<hr />";
      i++;
      continue;
    }

    // Blockquote.
    if (/^>\s?/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      const paras = quoteLines
        .join("\n")
        .split(/\n\s*\n/)
        .map((p) => `<p>${parseInline(p.trim())}</p>`)
        .join("");
      body += `<blockquote>${paras}</blockquote>`;
      continue;
    }

    // Table.
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
      const table = parseTable(lines, i);
      body += table.html;
      i = table.next;
      continue;
    }

    // List (top level, indent 0).
    if (UL_RE.test(line) || OL_RE.test(line)) {
      const list = parseList(lines, i, indentOf(line));
      body += list.html;
      i = list.next;
      continue;
    }

    // Paragraph: consume consecutive plain lines.
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^-{3,}$/.test(lines[i].trim()) &&
      !/^>\s?/.test(lines[i]) &&
      !UL_RE.test(lines[i]) &&
      !OL_RE.test(lines[i]) &&
      !/^\s*\|/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    const paraText = paraLines.join(" ");
    if (!firstParagraph) {
      // Used as the header lede — don't also emit it as the first body paragraph.
      firstParagraph = paraText;
    } else {
      body += `<p>${parseInline(paraText)}</p>`;
    }
  }

  return { title, lede: firstParagraph, body };
}

function page({ title, eyebrow, lede, body }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="../assets/styles.css" />
</head>
<body>
  <div class="page">
    <header class="lesson-head">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="lede">${lede}</p>
    </header>

    ${body}

    <p class="meta">
      <a href="../index.html">全库入口</a>
      · <a href="glossary.html">术语表</a>
    </p>
  </div>
  <script defer src="../assets/glossary-terms.js"></script>
  <script defer src="../assets/glossary-link.js"></script>
</body>
</html>
`;
}

for (const src of SOURCES) {
  const mdPath = join(REF, `${src.name}.md`);
  const md = readFileSync(mdPath, "utf8");
  const { title, lede, body } = convert(md);
  const html = page({ title, eyebrow: src.eyebrow, lede: parseInline(lede), body });
  writeFileSync(join(REF, `${src.name}.html`), html);
  console.log(`built reference/${src.name}.html`);
}
