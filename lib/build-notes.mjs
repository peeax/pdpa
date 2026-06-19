// Replicates the data layer of @aengusm/gatsby-theme-brain (via gatsby-theme-andy)
// plus this project's custom HighlightNote nodes (content/highlights-data.json).
//
// Output: a Map of slug -> note, where a note is the shape consumed by <BrainNote>.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import generateSlug from './generate-slug.mjs';
import insertLinks from './insert-links.mjs';
import makeExcerpt from './excerpt.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// lib/ -> content/
const CONTENT_DIR = path.resolve(__dirname, '..', 'content');
const NOTE_EXTENSIONS = ['.md', '.mdx'];
const ROOT_PATH = '/'; // matches gatsby-theme-andy rootPath

let cache = null;

export function buildAll() {
  if (cache) return cache;

  const filenames = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => NOTE_EXTENSIONS.includes(path.extname(f).toLowerCase()));

  // --- Pass 1: parse every markdown note, build the name -> slug map ---
  const slugToNote = {}; // slug -> { title, content, aliases, outboundTexts }
  const nameToSlugMap = {}; // lowercased name/title/alias -> slug

  for (const filename of filenames) {
    const slug = generateSlug(path.parse(filename).name);
    const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8');
    const { content, data: frontmatter } = matter(raw);

    let title = slug;
    nameToSlugMap[slug] = slug;
    if (frontmatter.title != null) {
      title = frontmatter.title;
      nameToSlugMap[String(frontmatter.title).toLowerCase()] = slug;
    }

    let aliases = [];
    if (Array.isArray(frontmatter.aliases)) {
      aliases = frontmatter.aliases;
      aliases.forEach((alias) => {
        nameToSlugMap[String(alias).toLowerCase()] = slug;
      });
    }

    // Outbound wiki-link targets, e.g. [[ม1]] -> "ม1"
    const matches = [...content.matchAll(/(?<=\[\[).*?(?=\]\])/g)];
    const outboundTexts = matches.map((m) => m[0]);

    slugToNote[slug] = { slug, title, content, aliases, outboundTexts };
  }

  // --- Pass 2: create stub notes for unresolved references (mirrors source-nodes.js) ---
  for (const slug in slugToNote) {
    for (const text of slugToNote[slug].outboundTexts) {
      const lower = text.toLowerCase();
      if (nameToSlugMap[lower] == null) {
        const stubSlug = generateSlug(lower);
        if (slugToNote[stubSlug] == null) {
          slugToNote[stubSlug] = {
            slug: stubSlug,
            title: stubSlug,
            content: '',
            aliases: [],
            outboundTexts: [],
          };
          nameToSlugMap[stubSlug] = stubSlug;
        }
        nameToSlugMap[lower] = stubSlug;
      }
    }
  }

  // --- Pass 3: linkify content, resolve references, build backlinks + excerpts ---
  const notes = new Map();
  const backlinkMap = {}; // targetSlug -> [sourceSlug]

  for (const slug in slugToNote) {
    const note = slugToNote[slug];
    const body = insertLinks(note.content, nameToSlugMap, ROOT_PATH, true);

    const outboundSlugs = [
      ...new Set(note.outboundTexts.map((t) => nameToSlugMap[t.toLowerCase()]).filter(Boolean)),
    ];

    outboundSlugs.forEach((target) => {
      if (target === slug) return; // ignore self-references
      (backlinkMap[target] = backlinkMap[target] || []).push(slug);
    });

    notes.set(slug, {
      slug,
      title: note.title,
      isHighlight: false,
      body,
      excerpt: makeExcerpt(body),
      _outboundSlugs: outboundSlugs,
    });
  }

  // --- Highlight notes (content/highlights-data.json) ---
  const highlightsPath = path.join(CONTENT_DIR, 'highlights-data.json');
  if (fs.existsSync(highlightsPath)) {
    const highlights = JSON.parse(fs.readFileSync(highlightsPath, 'utf-8'));
    for (const item of highlights) {
      if (!item.slug || !item.title) continue;
      notes.set(item.slug, {
        slug: item.slug,
        title: item.title,
        isHighlight: true,
        pdf: item.pdf ?? null,
        content: item.content ?? null,
      });
    }
  }

  // --- Resolve reference note objects (title + excerpt) for the UI ---
  const refShape = (s) => {
    const n = notes.get(s);
    if (!n) return null;
    return { slug: n.slug, title: n.title, excerpt: n.excerpt || '' };
  };

  for (const note of notes.values()) {
    if (note.isHighlight) continue;
    note.outboundReferenceNotes = (note._outboundSlugs || [])
      .map(refShape)
      .filter(Boolean);
    const inbound = [...new Set(backlinkMap[note.slug] || [])];
    note.inboundReferenceNotes = inbound.map(refShape).filter(Boolean);
    delete note._outboundSlugs;
  }

  cache = { notes };
  return cache;
}

export function getNote(slug) {
  return buildAll().notes.get(slug) || null;
}

export function getAllSlugs() {
  return [...buildAll().notes.keys()];
}

export const ROOT_NOTE = 'about';
