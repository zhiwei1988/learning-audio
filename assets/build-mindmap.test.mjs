/**
 * node --test assets/build-mindmap.test.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TAXONOMY,
  BRANCH_SIZES,
  loadTerms,
  buildTree,
  countLeaves,
  toFreeMind,
  toOPML,
  toMarkdown,
} from "./build-mindmap.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const terms = loadTerms(join(ROOT, "assets", "glossary-terms.js"));
const tree = buildTree(terms);

const assignedIds = TAXONOMY.flatMap((b) => b.groups.flatMap((g) => g.items.map((i) => i.id)));

test("每条术语被分配到且只被分配到一个位置", () => {
  const dupes = assignedIds.filter((id, i) => assignedIds.indexOf(id) !== i);
  assert.deepEqual(dupes, [], `重复分配: ${dupes.join(", ")}`);
});

test("分类表与术语表双向闭合，没有孤儿也没有幽灵", () => {
  const known = new Set(terms.map((t) => t.id));
  const ghosts = assignedIds.filter((id) => !known.has(id));
  const orphans = [...known].filter((id) => !assignedIds.includes(id));
  assert.deepEqual(ghosts, [], `分类表引用了不存在的术语: ${ghosts.join(", ")}`);
  assert.deepEqual(orphans, [], `术语未被分类: ${orphans.join(", ")}`);
});

test("六支的条数符合约定", () => {
  const actual = Object.fromEntries(
    tree.children.map((b) => [b.text, countLeaves(b)])
  );
  assert.deepEqual(actual, BRANCH_SIZES);
  assert.equal(countLeaves(tree), 76);
});

test("恰好 15 条术语带 ⚡ 数字行，且每条都注明来源", () => {
  const badged = TAXONOMY.flatMap((b) =>
    b.groups.flatMap((g) => g.items.filter((i) => i.badge))
  );
  assert.equal(badged.length, 15);
  for (const item of badged) {
    assert.match(item.badge, /｜/, `${item.id} 的数字行缺少来源括注`);
  }
});

test("左右两侧都被使用，侧向标注只有 left / right", () => {
  const sides = new Set(tree.children.map((b) => b.side));
  assert.deepEqual([...sides].sort(), ["left", "right"]);
});

test("FreeMind 输出转义了 XML 元字符", () => {
  const xml = toFreeMind(tree);
  const bare = xml.match(/&(?!(amp|lt|gt|quot|apos);)/g);
  assert.equal(bare, null, "存在未转义的 &");
  assert.ok(xml.includes("&amp;"), "含 & 的术语应被转义（如 Sensitivity & phase matching）");
  assert.match(xml, /^<map version="1\.0\.1">/m);
  assert.ok(xml.trimEnd().endsWith("</map>"));
});

test("FreeMind 节点总数 = 根 + 支 + 组 + 叶 + 数字行", () => {
  const xml = toFreeMind(tree);
  const opens = (xml.match(/<node\b/g) || []).length;
  const groups = TAXONOMY.reduce((s, b) => s + b.groups.filter((g) => g.name).length, 0);
  assert.equal(opens, 1 + TAXONOMY.length + groups + 76 + 15);
});

test("OPML 是合法外框且叶子数守恒", () => {
  const opml = toOPML(tree);
  assert.match(opml, /<opml version="2\.0">/);
  assert.ok(opml.includes("</opml>"));
  const bare = opml.match(/&(?!(amp|lt|gt|quot|apos);)/g);
  assert.equal(bare, null, "存在未转义的 &");
  const selfClosing = (opml.match(/<outline\b/g) || []).length;
  const groups = TAXONOMY.reduce((s, b) => s + b.groups.filter((g) => g.name).length, 0);
  assert.equal(selfClosing, TAXONOMY.length + groups + 76 + 15);
});

test("Markdown 缩进层级与树深度一致", () => {
  const md = toMarkdown(tree);
  assert.match(md, /^# 网络摄像机音频/m);
  assert.match(md, /^## 声学基础/m);
  assert.match(md, /^### 拾音器件/m);
  // 无子组的分支，叶子直接挂在支下，不应出现 h3
  const codecSection = md.split(/^## /m).find((s) => s.startsWith("编码与网络"));
  assert.ok(!/^### /m.test(codecSection), "编码与网络没有子组，不应生成 h3");
});

test("每个叶子都带定义备注，供导入后展开阅读", () => {
  const leaves = [];
  (function walk(n) {
    if (!n.children.length) leaves.push(n);
    else n.children.forEach(walk);
  })(tree);
  const withoutNote = leaves.filter((l) => !l.note && !l.badgeLine);
  assert.deepEqual(withoutNote.map((l) => l.text), []);
});
