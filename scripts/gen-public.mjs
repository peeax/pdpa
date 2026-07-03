// Generates the static data the client fetches for stacked pages.
//   public/notes/<slug>.json   one file per note (fetched lazily by the stack)
//   public/manifest.webmanifest
//
// Static assets (public/pdfs/*, public/favicon.png) are checked into the repo
// directly — no copying needed.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildAll } from '../lib/build-notes.mjs';
import { stripMarkdown } from '../lib/strip-markdown.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const notesDir = path.join(publicDir, 'notes');
const noteMetaPath = path.join(publicDir, 'note-meta.json');

function compactSearchEntry(slug, note, text) {
  let type = 'article';
  if (note.isHighlight) type = 'highlight';
  else if (slug === 'about' || slug === 'index') type = 'other';
  return [slug, note.title, type, text];
}

function compactNote(note) {
  if (note.isHighlight) {
    return {
      s: note.slug,
      t: note.title,
      h: 1,
      c: note.content ?? '',
      p: note.pdf ?? '',
      l: note.main_pdf_link ?? '',
    };
  }

  return {
    s: note.slug,
    t: note.title,
    b: note.body,
    o: (note.outboundReferenceNotes || []).map((ref) => ref.slug),
    i: (note.inboundReferenceNotes || []).map((ref) => ref.slug),
  };
}

// --- per-note JSON ---
fs.rmSync(notesDir, { recursive: true, force: true });
fs.mkdirSync(notesDir, { recursive: true });

const { notes } = buildAll();
let count = 0;
const searchIndex = [];
const noteMeta = {};

for (const [slug, note] of notes) {
  fs.writeFileSync(path.join(notesDir, `${slug}.json`), JSON.stringify(compactNote(note)));
  count++;

  noteMeta[slug] = [note.title, note.excerpt || ''];

  // Exclude empty stub nodes from search
  let text = note.body || note.content || '';

  // Strip markdown and HTML for clean search snippets (shared utility)
  text = stripMarkdown(text);

  if (text || note.title !== slug) {
    searchIndex.push(compactSearchEntry(slug, note, text));
  }
}
fs.writeFileSync(path.join(publicDir, 'search-index.json'), JSON.stringify(searchIndex));
fs.writeFileSync(noteMetaPath, JSON.stringify(noteMeta));
console.log(`[gen] wrote ${count} note JSON files, search-index.json, and note-meta.json`);

// --- PWA manifest ---
const manifest = {
  name: 'พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒ Thailand PDPA - SiData+ คณะแพทยศาสตร์ศิริราชพยาบาล',
  short_name: 'PDPA',
  start_url: '/',
  background_color: '#ffffff',
  theme_color: '#ffffff',
  display: 'minimal-ui',
  icons: [{ src: '/favicon.png', sizes: '512x512', type: 'image/png' }],
};
fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
console.log('[gen] wrote manifest.webmanifest');

