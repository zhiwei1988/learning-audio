/**
 * Links term mentions back to the glossary — the forward half of the
 * bidirectional pair built by assets/build-glossary.mjs (the backward half,
 * "出现在：第 N 课 …", is baked into glossary.html).
 *
 * Usage — after the generated data file, on every lesson and cheat sheet:
 *   <script defer src="../assets/glossary-terms.js"></script>
 *   <script defer src="../assets/glossary-link.js"></script>
 *
 * Two rules keep the prose readable instead of turning it solid blue:
 *   1. every <span class="term">, which the author already marked as a term
 *   2. the first bare mention per <h2> section, and no more
 * Hovering shows the definition, so a link is usually enough on its own.
 */
const GL_SKIP = new Set(["A", "CODE", "SCRIPT", "STYLE", "H1", "DT", "BUTTON", "OPTION", "SELECT"]);

/** Widgets that rebuild their own DOM — links injected there get wiped on the next render. */
const GL_SKIP_IN =
  ".quiz, .order-drill, .budget, .beam, .band-limit, .calc-wrap, .crossover, .abrep, .pbspl, .mledger, .no-gloss";

function glGlossaryHref() {
  return /\/lessons\//.test(location.pathname) ? "../reference/glossary.html" : "glossary.html";
}

function glTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      for (let el = node.parentElement; el; el = el.parentElement) {
        if (GL_SKIP.has(el.tagName)) return NodeFilter.FILTER_REJECT;
      }
      return node.parentElement?.closest(GL_SKIP_IN)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });
  const out = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) out.push(n);
  return out;
}

function glMatch(value, alias) {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = /^[\x00-\x7F]+$/.test(alias)
    ? new RegExp(`(^|[^a-zA-Z0-9-])(${escaped})([^a-zA-Z0-9-]|$)`, "i")
    : new RegExp(`(${escaped})`);
  const m = value.match(re);
  if (!m) return null;
  const group = /^[\x00-\x7F]+$/.test(alias) ? 2 : 1;
  return { start: m.index + (group === 2 ? m[1].length : 0), text: m[group] };
}

function glLink(term, label) {
  const a = document.createElement("a");
  a.className = "term-link";
  a.href = `${glGlossaryHref()}#${term.id}`;
  a.title = `${term.label}\n\n${term.gloss}`;
  a.textContent = label;
  return a;
}

function glMountGlossaryLinks() {
  const terms = window.GLOSSARY_TERMS;
  const page = document.querySelector(".page");
  if (!terms || !page) return;
  // The glossary defines the terms; it does not need to link to itself.
  if (document.querySelector(".glossary-item")) return;

  const byAlias = [];
  terms.forEach((t) => t.aliases.forEach((a) => byAlias.push({ alias: a, term: t })));
  byAlias.sort((a, b) => b.alias.length - a.alias.length);

  // Rule 1 — anything the author already marked up as a term.
  document.querySelectorAll("span.term").forEach((span) => {
    if (span.closest("a") || span.querySelector("a") || span.closest(GL_SKIP_IN)) return;
    const label = span.textContent.trim();
    const hit = byAlias.find(({ alias }) => alias.toLowerCase() === label.toLowerCase());
    if (!hit) return;
    const a = glLink(hit.term, span.textContent);
    a.classList.add("term-link-marked");
    span.textContent = "";
    span.appendChild(a);
  });

  // Rule 2 — first bare mention per section.
  const sections = [];
  let current = [];
  [...page.children].forEach((el) => {
    if (el.tagName === "H2" && current.length) {
      sections.push(current);
      current = [];
    }
    current.push(el);
  });
  if (current.length) sections.push(current);

  sections.forEach((els) => {
    const linked = new Set();
    els.forEach((el) => {
      el.querySelectorAll?.(".term-link").forEach((a) => {
        const id = a.getAttribute("href").split("#")[1];
        if (id) linked.add(id);
      });
    });

    els.forEach((el) => {
      glTextNodes(el).forEach((node) => {
        for (const { alias, term } of byAlias) {
          if (linked.has(term.id)) continue;
          const hit = glMatch(node.nodeValue, alias);
          if (!hit) continue;
          const tail = node.splitText(hit.start);
          tail.splitText(hit.text.length);
          tail.parentNode.replaceChild(glLink(term, hit.text), tail);
          linked.add(term.id);
          return;
        }
      });
    });
  });
}

glMountGlossaryLinks();
