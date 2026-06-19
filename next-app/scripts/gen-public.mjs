// Generates the static data the client fetches for stacked pages, and copies
// the original Gatsby static assets into Next's public/ folder.
//   public/notes/<slug>.json   one file per note (fetched lazily by the stack)
//   public/pdfs/*              from ../static/pdfs
//   public/favicon.png         from ../src/images/favicon.png
//   public/manifest.webmanifest
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildAll } from '../lib/build-notes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, '..');
const repoDir = path.resolve(appDir, '..');
const publicDir = path.join(appDir, 'public');
const notesDir = path.join(publicDir, 'notes');

// --- per-note JSON ---
fs.rmSync(notesDir, { recursive: true, force: true });
fs.mkdirSync(notesDir, { recursive: true });

const { notes } = buildAll();
let count = 0;
for (const [slug, note] of notes) {
  fs.writeFileSync(path.join(notesDir, `${slug}.json`), JSON.stringify(note));
  count++;
}
console.log(`[gen] wrote ${count} note JSON files`);

// --- copy static assets from the original Gatsby site ---
const staticDir = path.join(repoDir, 'static');
if (fs.existsSync(staticDir)) {
  for (const entry of fs.readdirSync(staticDir)) {
    fs.cpSync(path.join(staticDir, entry), path.join(publicDir, entry), { recursive: true });
  }
  console.log('[gen] copied static/ assets');
}

const favicon = path.join(repoDir, 'src', 'images', 'favicon.png');
if (fs.existsSync(favicon)) {
  fs.copyFileSync(favicon, path.join(publicDir, 'favicon.png'));
  console.log('[gen] copied favicon');
}

// --- PWA manifest (mirrors gatsby-plugin-manifest options) ---
const manifest = {
  name: 'พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒ Thailand PDPA - SiData+ คณะแพทยศาสตร์ศิริราชพยาบาล',
  short_name: 'PDPA',
  start_url: '/',
  background_color: '#006400',
  theme_color: '#006400',
  display: 'minimal-ui',
  icons: [{ src: '/favicon.png', sizes: '512x512', type: 'image/png' }],
};
fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
console.log('[gen] wrote manifest.webmanifest');
