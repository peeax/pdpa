import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildAll } from '../lib/build-notes.mjs';
import { PRODUCTION_CSP } from '../lib/security-headers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const { notes } = buildAll();
assert(notes.size > 0, 'content build returned no notes');

const slugs = [...notes.keys()];
assert(slugs.includes('about'), 'root note `about` is missing');
assert(new Set(slugs).size === slugs.length, 'duplicate slugs detected');

for (const [slug, note] of notes) {
  assert(note.title, `${slug} is missing a title`);
  if (!note.isHighlight) {
    assert(typeof note.body === 'string', `${slug} is missing rendered markdown body`);
  }
}

const headersPath = path.join(rootDir, 'public', '_headers');
const headersText = fs.readFileSync(headersPath, 'utf8');
assert(headersText.includes(`Content-Security-Policy: ${PRODUCTION_CSP}`), 'public/_headers CSP is out of sync');
assert(!PRODUCTION_CSP.includes("'unsafe-eval'"), 'production CSP must not allow unsafe-eval');
assert(PRODUCTION_CSP.includes("object-src 'none'"), 'production CSP should block plugins/objects');
assert(PRODUCTION_CSP.includes("frame-ancestors 'none'"), 'production CSP should block framing');

const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
assert(packageJson.scripts?.start === 'node scripts/serve-static.mjs', '`npm run start` must serve ./out');
assert(packageJson.scripts?.audit, 'audit script is missing');
assert(packageJson.scripts?.lint, 'lint script is missing');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`[check-production] validated ${notes.size} notes and production headers`);
