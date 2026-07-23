import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import { buildAll, ROOT_NOTE } from '../lib/build-notes.mjs';
import { buildFullActContent, validateActStructure } from '../lib/full-act.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'content');
const structure = JSON.parse(fs.readFileSync(path.join(contentDir, 'act-structure.json'), 'utf8'));
const articleNumbers = validateActStructure(structure);
const introduction = matter(fs.readFileSync(path.join(contentDir, 'about.md'), 'utf8')).content;
const articles = new Map();

for (const number of articleNumbers) {
  const articlePath = path.join(contentDir, `article-${number}.md`);
  assert.ok(fs.existsSync(articlePath), `Missing content/article-${number}.md`);
  const parsed = matter(fs.readFileSync(articlePath, 'utf8'));
  articles.set(number, { title: parsed.data.title, content: parsed.content });
}

const fullActContent = buildFullActContent({
  introduction,
  structure,
  getArticle: (number) => articles.get(number),
});

for (const [number, article] of articles) {
  const marker = `&emsp; [[${article.title}]] `;
  assert.equal(
    fullActContent.split(marker).length - 1,
    1,
    `Full act must contain one generated marker for article ${number}`,
  );
}

const rootNote = buildAll().notes.get(ROOT_NOTE);
assert.ok(rootNote, `Missing generated ${ROOT_NOTE} note`);
for (const number of articleNumbers) {
  assert.match(rootNote.body, new RegExp(`\\]\\(/article-${number}\\)`));
}

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw);
const tree = processor.runSync(processor.parse(rootNote.body));
let consultationMarkers = 0;

function inspectMarkers(node, parent = null) {
  if (node.type === 'element' && node.tagName === 'section' && node.properties?.dataArticle) {
    consultationMarkers += 1;
    assert.notEqual(
      parent?.tagName,
      'p',
      `Related consultations marker for article ${node.properties.dataArticle} must be block-level`
    );
  }
  for (const child of node.children || []) inspectMarkers(child, node);
}

inspectMarkers(tree);
assert.equal(
  consultationMarkers,
  articleNumbers.length,
  'Full act must contain one block-level consultation marker per article'
);

console.log(
  `[check-full-act] verified articles ${structure.firstArticle}-${structure.lastArticle}, section structure, and generated links`,
);
