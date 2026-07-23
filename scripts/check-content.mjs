import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import generateSlug from '../lib/generate-slug.mjs';
import { validateActStructure } from '../lib/full-act.mjs';
import {
  extractConsultationMetadata,
  extractConsultationIdentity,
  formatConsultationContent,
  parseConsultationFilename,
} from '../lib/consultation-metadata.mjs';
import { formatDisclosureMarkup } from '../lib/disclosure-markup.mjs';

const rootDir = path.resolve(import.meta.dirname, '..');
const contentDir = path.join(rootDir, 'content');
const publicDir = path.join(rootDir, 'public');
const discussionDir = path.join(contentDir, 'discussion');
const discussionRedirectsPath = path.join(contentDir, 'discussion-redirects.json');
const discussionMigrationPath = path.join(contentDir, 'discussion-migration.json');
const failures = [];
const discussionRecords = [];

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(filePath);
    return /\.mdx?$/i.test(entry.name) ? [filePath] : [];
  });
}

function fail(filePath, message) {
  failures.push(`${path.relative(rootDir, filePath)}: ${message}`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(filePath, `invalid JSON (${error.message})`);
    return null;
  }
}

const discussionRedirects = readJson(discussionRedirectsPath) || {};
const discussionMigration = readJson(discussionMigrationPath);

const actStructurePath = path.join(contentDir, 'act-structure.json');
const actStructure = JSON.parse(fs.readFileSync(actStructurePath, 'utf8'));
const articleNumbers = new Set(validateActStructure(actStructure));
const files = markdownFiles(contentDir);
const noteSlugs = new Set(['/']);

for (const filePath of files) {
  const relative = path.relative(contentDir, filePath);
  const basename = path.parse(filePath).name;
  const slug = relative.startsWith(`discussion${path.sep}`)
    ? basename
    : generateSlug(basename);
  const lowerSlug = slug.toLowerCase();
  if ([...noteSlugs].some((existing) => existing.toLowerCase() === lowerSlug)) {
    fail(filePath, `duplicate case-insensitive slug ${slug}`);
  }
  noteSlugs.add(slug);
}

for (const filePath of files) {
  const source = fs.readFileSync(filePath, 'utf8');
  const relative = path.relative(contentDir, filePath);

  if (/\sstyle\s*=/i.test(source)) fail(filePath, 'inline styles are not allowed');
  if (/<\/?div\b/i.test(source)) fail(filePath, 'raw div elements are not allowed');
  if ((source.match(/<details\b/g) || []).length !== (source.match(/<\/details>/g) || []).length) {
    fail(filePath, 'details elements must be balanced');
  }
  if ((source.match(/<summary\b/g) || []).length !== (source.match(/<\/summary>/g) || []).length) {
    fail(filePath, 'summary elements must be balanced');
  }
  if (formatDisclosureMarkup(source) !== source) {
    fail(filePath, 'disclosure markup is not formatted; run npm run format:content');
  }
  if (relative.startsWith(`discussion${path.sep}`)) {
    const { content, data } = matter(source);
    const metadata = extractConsultationMetadata(content);
    const identity = extractConsultationIdentity(content);
    const filenameIdentity = parseConsultationFilename(path.basename(filePath));
    const contentLines = content.split(/\r?\n/);
    const headings = contentLines
      .map((line, index) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        return match ? { level: match[1].length, line: index + 1, text: match[2] } : null;
      })
      .filter(Boolean);
    if (!metadata.title) fail(filePath, 'consultation content must declare a title');
    if (!/^เรื่อง\s+\S/.test(metadata.summary)) {
      fail(filePath, 'consultation subject must be written on the same line as "## เรื่อง"');
    }
    if (headings.filter(({ level }) => level === 1).length !== 1) {
      fail(filePath, 'consultation must contain exactly one h1 title');
    }
    for (let index = 1; index < headings.length; index += 1) {
      if (headings[index].level > headings[index - 1].level + 1) {
        fail(
          filePath,
          `heading level jumps from h${headings[index - 1].level} to ` +
            `h${headings[index].level} at content line ${headings[index].line}`,
        );
      }
    }
    if (/^(?:\\(?:#{1,6}|-|---)|\d+\\\.)/m.test(content) || content.includes('&#x20;')) {
      fail(filePath, 'generated Markdown escapes must be normalized');
    }
    if (
      /[Œ‚Ž•‰ﬂ]|คุ0ม|ข0อมูล|ส8วน|เป\]น|เป\{ด|ขJอ|ข\)อ|เป\|น|แห6ง|ปo|และ้หรือ|ผู้ให้ผู้บริการ/.test(
        content,
      )
    ) {
      fail(filePath, 'content contains a known OCR or transcription artifact');
    }
    if (!filenameIdentity) {
      fail(filePath, 'filename must use consultation-YYYY-NNN.md');
    } else if (
      !identity ||
      identity.year !== filenameIdentity.year ||
      identity.number !== filenameIdentity.number
    ) {
      fail(filePath, 'filename must match the consultation number and year in the title');
    }
    if (formatConsultationContent(content) !== content) {
      fail(filePath, 'consultation headings or whitespace are not formatted; run npm run format:content');
    }
    if (data.title != null || data.summary != null) {
      fail(filePath, 'title and summary are derived from content and must not be duplicated in frontmatter');
    }
    if (
      !Array.isArray(data.articles) ||
      data.articles.some((article) => !Number.isInteger(article) || !articleNumbers.has(article))
    ) {
      fail(filePath, 'articles must contain valid article numbers');
    } else if (new Set(data.articles).size !== data.articles.length) {
      fail(filePath, 'articles must not contain duplicates');
    }
    discussionRecords.push({
      filePath,
      filename: path.basename(filePath),
      slug: path.parse(filePath).name,
      contentHash: crypto
        .createHash('sha256')
        .update(content.replace(/\r\n/g, '\n').trim())
        .digest('hex'),
      articles: data.articles,
    });
  }

  for (const match of source.matchAll(/\]\((\/[^)\s]+)\)/g)) {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(match[1], 'https://content.local').pathname);
    } catch {
      fail(filePath, `invalid internal link ${match[1]}`);
      continue;
    }
    const target = pathname.replace(/^\/+|\/+$/g, '');
    if (!target || noteSlugs.has(target) || Object.hasOwn(discussionRedirects, target)) continue;
    if (fs.existsSync(path.join(publicDir, target))) continue;
    fail(filePath, `missing internal link target /${target}`);
  }
}

const contentHashOwners = new Map();
for (const record of discussionRecords) {
  const existing = contentHashOwners.get(record.contentHash);
  if (existing) {
    fail(record.filePath, `duplicates the consultation content in ${existing}`);
  } else {
    contentHashOwners.set(record.contentHash, record.filename);
  }
}

for (const [source, target] of Object.entries(discussionRedirects)) {
  if (!source || source.includes('/') || !target || target.includes('/')) {
    fail(discussionRedirectsPath, `redirect ${JSON.stringify(source)} -> ${JSON.stringify(target)} must use slugs`);
  }
  if (noteSlugs.has(source)) {
    fail(discussionRedirectsPath, `legacy slug ${source} conflicts with a canonical note`);
  }
  if (!noteSlugs.has(target)) {
    fail(discussionRedirectsPath, `legacy slug ${source} points to missing note ${target}`);
  }
  if (Object.hasOwn(discussionRedirects, target)) {
    fail(discussionRedirectsPath, `redirect chains are not allowed (${source} -> ${target})`);
  }
}

if (discussionMigration) {
  if (discussionMigration.canonicalFileCount !== discussionRecords.length) {
    fail(discussionMigrationPath, 'canonicalFileCount does not match the discussion directory');
  }
  if (discussionMigration.redirectCount !== Object.keys(discussionRedirects).length) {
    fail(discussionMigrationPath, 'redirectCount does not match discussion-redirects.json');
  }
  if (!Array.isArray(discussionMigration.entries)) {
    fail(discussionMigrationPath, 'entries must be an array');
  } else {
    const recordsByFilename = new Map(
      discussionRecords.map((record) => [record.filename, record]),
    );
    const coveredFiles = new Set();
    for (const entry of discussionMigration.entries) {
      const record = recordsByFilename.get(entry.canonical);
      if (!record) {
        fail(discussionMigrationPath, `missing canonical file ${entry.canonical}`);
        continue;
      }
      coveredFiles.add(entry.canonical);
      const target = path.parse(entry.canonical).name;
      for (const sourceFilename of entry.sources || []) {
        const source = path.parse(sourceFilename).name;
        if (source !== target && discussionRedirects[source] !== target) {
          fail(discussionMigrationPath, `${source} is missing redirect to ${target}`);
        }
      }
    }
    if (coveredFiles.size !== discussionRecords.length) {
      fail(discussionMigrationPath, 'entries do not cover every canonical discussion file');
    }
  }
}

if (failures.length > 0) {
  console.error(failures.map((message) => `[check-content] ${message}`).join('\n'));
  console.error(`[check-content] failed with ${failures.length} problem(s)`);
  process.exit(1);
}

console.log(
  `[check-content] verified ${files.length} Markdown files, ${noteSlugs.size - 1} note slugs, ` +
    `and articles ${actStructure.firstArticle}-${actStructure.lastArticle}`
);
