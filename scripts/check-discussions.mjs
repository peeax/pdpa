import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { buildAll } from '../lib/build-notes.mjs';
import { extractConsultationMetadata } from '../lib/consultation-metadata.mjs';

const rootDir = path.resolve(import.meta.dirname, '..');
const discussionDir = path.join(rootDir, 'content', 'discussion');
const files = fs
  .readdirSync(discussionDir)
  .filter((filename) => /\.mdx?$/i.test(filename))
  .sort();
const failures = [];
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize);
const notes = buildAll().notes;
let checkedLines = 0;
let checkedDisclosures = 0;
let checkedRelationships = 0;

function fail(filename, line, message) {
  failures.push(`${filename}${line ? `:${line}` : ''}: ${message}`);
}

function textContent(node) {
  if (node.type === 'text') return node.value;
  return (node.children || []).map(textContent).join('');
}

function collectHeadings(node, headings = []) {
  if (node.type === 'element' && /^h[1-6]$/.test(node.tagName)) {
    headings.push({ level: Number(node.tagName.slice(1)), text: textContent(node).trim() });
  }
  for (const child of node.children || []) collectHeadings(child, headings);
  return headings;
}

function inspectTree(node, filename, insideDetails = false) {
  if (node.type === 'element') {
    if (/^h[1-6]$/.test(node.tagName) && !textContent(node).trim()) {
      fail(filename, null, `rendered ${node.tagName} must not be empty`);
    }

    if (node.tagName === 'details') {
      checkedDisclosures += 1;
      if (insideDetails) fail(filename, null, 'details elements must not be nested');
      const elements = node.children.filter((child) => child.type === 'element');
      if (elements[0]?.tagName !== 'summary') {
        fail(filename, null, 'details must begin with a summary element');
      } else {
        if (!textContent(elements[0]).trim()) {
          fail(filename, null, 'summary text must not be empty');
        }
        if (elements[0].children.some((child) => child.type === 'element')) {
          fail(filename, null, 'summary must contain plain text only');
        }
      }
      if (elements.length < 2) fail(filename, null, 'details must contain rendered content');
      for (const child of node.children) inspectTree(child, filename, true);
      return;
    }
  }

  for (const child of node.children || []) inspectTree(child, filename, insideDetails);
}

for (const filename of files) {
  const filePath = path.join(discussionDir, filename);
  const source = fs.readFileSync(filePath, 'utf8');
  const lines = source.split(/\r?\n/);
  checkedLines += lines.length;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (/[ \t]+$/.test(line)) fail(filename, lineNumber, 'trailing whitespace');
    if (line.includes('\t')) fail(filename, lineNumber, 'tab characters are not allowed');
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(line)) {
      fail(filename, lineNumber, 'control character found');
    }
    if (line.includes('\ufffd')) fail(filename, lineNumber, 'Unicode replacement character found');
  });

  let parsed;
  try {
    parsed = matter(source);
  } catch (error) {
    fail(filename, null, `invalid frontmatter (${error.message})`);
    continue;
  }

  const nonEmptyLines = parsed.content.split(/\r?\n/).filter((line) => line.trim());
  if (!/^# เลขที่เรื่อง [๐-๙]+\/[๐-๙]+$/.test(nonEmptyLines[0] || '')) {
    fail(filename, null, 'first content line must be the complete consultation h1');
  }
  if (!/^## เรื่อง \S/.test(nonEmptyLines[1] || '')) {
    fail(filename, null, 'second content line must contain the complete subject h2');
  }
  if (!Array.isArray(parsed.data.articles)) {
    fail(filename, null, 'frontmatter must declare an articles array');
  }

  const rawTags = [...parsed.content.matchAll(/<\/?([a-z][\w-]*)\b[^>]*>/gi)];
  for (const match of rawTags) {
    if (!['details', 'summary'].includes(match[1].toLowerCase())) {
      fail(filename, null, `unsupported raw HTML tag <${match[1]}>`);
    }
  }

  let tree;
  try {
    tree = processor.runSync(processor.parse(parsed.content));
  } catch (error) {
    fail(filename, null, `Markdown render failed (${error.message})`);
    continue;
  }
  inspectTree(tree, filename);
  const renderedHeadings = collectHeadings(tree);

  const slug = path.parse(filename).name;
  const note = notes.get(slug);
  const metadata = extractConsultationMetadata(parsed.content);
  if (!note) {
    fail(filename, null, `build graph is missing slug ${slug}`);
    continue;
  }
  if (note.title !== metadata.title) fail(filename, null, 'rendered title does not match source title');
  if (note.excerpt !== metadata.summary) fail(filename, null, 'rendered summary does not match source subject');
  if (!note.body?.trim()) fail(filename, null, 'rendered Markdown body is empty');
  if (
    !renderedHeadings.some(
      ({ level, text }) => level === 2 && text === metadata.summary,
    )
  ) {
    fail(filename, null, 'rendered Markdown is missing the consultation subject heading');
  }

  for (const article of parsed.data.articles || []) {
    checkedRelationships += 1;
    const articleSlug = `article-${article}`;
    if (!note.inboundReferenceNotes.some((reference) => reference.slug === articleSlug)) {
      fail(filename, null, `missing backlink from ${articleSlug}`);
    }
    const articleNote = notes.get(articleSlug);
    if (!articleNote?.relatedConsultations?.some((reference) => reference.slug === slug)) {
      fail(filename, null, `${articleSlug} is missing related consultation ${slug}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.map((message) => `[check-discussions] ${message}`).join('\n'));
  console.error(`[check-discussions] failed with ${failures.length} problem(s)`);
  process.exit(1);
}

console.log(
  `[check-discussions] verified ${files.length} files, ${checkedLines} lines, ` +
    `${checkedDisclosures} disclosures, and ${checkedRelationships} article relationships`
);
