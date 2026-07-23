import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { formatDisclosureMarkup } from '../lib/disclosure-markup.mjs';
import { formatConsultationContent } from '../lib/consultation-metadata.mjs';

const contentDir = path.resolve(import.meta.dirname, '..', 'content');

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(filePath);
    return /\.mdx?$/i.test(entry.name) ? [filePath] : [];
  });
}

let updated = 0;
for (const filePath of markdownFiles(contentDir)) {
  const source = fs.readFileSync(filePath, 'utf8');
  let formatted = formatDisclosureMarkup(source);
  if (path.dirname(filePath) === path.join(contentDir, 'discussion')) {
    const parsed = matter(formatted);
    const formattedContent = formatConsultationContent(parsed.content);
    if (formattedContent !== parsed.content) {
      formatted = matter.stringify(formattedContent, parsed.data);
    }
  }
  if (formatted === source) continue;
  fs.writeFileSync(filePath, formatted, 'utf8');
  updated += 1;
}

console.log(`[format-content] formatted ${updated} Markdown files`);
