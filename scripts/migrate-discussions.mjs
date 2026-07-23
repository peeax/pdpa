import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
  consultationFilename,
  extractConsultationIdentity,
  parseConsultationFilename,
} from '../lib/consultation-metadata.mjs';

const rootDir = path.resolve(import.meta.dirname, '..');
const contentDir = path.join(rootDir, 'content');
const discussionDir = path.join(contentDir, 'discussion');
const redirectsPath = path.join(contentDir, 'discussion-redirects.json');
const manifestPath = path.join(contentDir, 'discussion-migration.json');
const write = process.argv.includes('--write');

function stableHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeBody(content) {
  return content.replace(/\r\n/g, '\n').trim();
}

function substantiveBody(content) {
  const withoutTitle = normalizeBody(content).replace(/^#\s+[^\n]+\n+/, '');
  const firstSection = withoutTitle.search(/\n#\s+/);
  return firstSection >= 0 ? withoutTitle.slice(firstSection + 1) : withoutTitle;
}

function chooseCanonicalBody(group, filename) {
  const byBody = Map.groupBy(group, (item) => item.body);
  if (byBody.size === 1) return group[0].body;

  const candidates = [...byBody.keys()].sort((a, b) => a.length - b.length);
  const shortest = candidates[0];
  const shortestRemainder = substantiveBody(shortest);
  const allContainShortest = candidates.every(
    (candidate) =>
      candidate === shortest ||
      substantiveBody(candidate).endsWith(shortestRemainder),
  );

  if (!allContainShortest) {
    const sources = group.map((item) => item.filename).join(', ');
    throw new Error(
      `${filename} has conflicting source content that cannot be merged safely: ${sources}`,
    );
  }

  return shortest;
}

const sourceFiles = fs
  .readdirSync(discussionDir)
  .filter((filename) => /\.md$/i.test(filename))
  .sort();

if (sourceFiles.every((filename) => parseConsultationFilename(filename))) {
  console.log(`[migrate-discussions] already migrated (${sourceFiles.length} canonical files)`);
  process.exit(0);
}

const parsedFiles = sourceFiles.map((filename) => {
  const source = fs.readFileSync(path.join(discussionDir, filename), 'utf8');
  const parsed = matter(source);
  const identity = extractConsultationIdentity(parsed.content);
  if (!identity) throw new Error(`${filename} does not have a valid consultation number and year`);
  if (!Array.isArray(parsed.data.articles)) {
    throw new Error(`${filename} does not declare an articles array`);
  }

  return {
    filename,
    source,
    body: normalizeBody(parsed.content),
    identity,
    articles: parsed.data.articles,
  };
});

const groups = Map.groupBy(parsedFiles, (item) => consultationFilename(item.identity));
const canonicalFiles = [];
const redirects = {};
const manifestEntries = [];

for (const [filename, group] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
  const body = chooseCanonicalBody(group, filename);
  const articles = [...new Set(group.flatMap((item) => item.articles))].sort((a, b) => a - b);
  const source = matter.stringify(`${body}\n`, { articles });
  canonicalFiles.push({ filename, source });

  const canonicalSlug = path.parse(filename).name;
  const sources = group.map((item) => item.filename).sort();
  for (const sourceFilename of sources) {
    const sourceSlug = path.parse(sourceFilename).name;
    if (sourceSlug !== canonicalSlug) redirects[sourceSlug] = canonicalSlug;
  }

  manifestEntries.push({
    canonical: filename,
    sources,
    articles,
    contentSha256: stableHash(body),
  });
}

const sortedRedirects = Object.fromEntries(
  Object.entries(redirects).sort(([a], [b]) => a.localeCompare(b)),
);
const manifest = {
  version: 1,
  sourceFileCount: sourceFiles.length,
  canonicalFileCount: canonicalFiles.length,
  redirectCount: Object.keys(sortedRedirects).length,
  entries: manifestEntries,
};

console.log(
  `[migrate-discussions] ${sourceFiles.length} source files -> ` +
    `${canonicalFiles.length} canonical files; ${manifest.redirectCount} redirects`,
);

if (!write) {
  console.log('[migrate-discussions] dry run only; use --write to apply');
  process.exit(0);
}

for (const filename of sourceFiles) {
  fs.rmSync(path.join(discussionDir, filename));
}
for (const { filename, source } of canonicalFiles) {
  fs.writeFileSync(path.join(discussionDir, filename), source, 'utf8');
}
fs.writeFileSync(redirectsPath, `${JSON.stringify(sortedRedirects, null, 2)}\n`, 'utf8');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log('[migrate-discussions] migration written successfully');
