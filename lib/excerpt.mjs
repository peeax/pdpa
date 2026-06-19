// Approximate Gatsby's MDX `excerpt(pruneLength: 280, truncate: true)`:
// strip markdown/HTML to plain text and hard-truncate at 280 chars.

const ENTITIES = {
  '&emsp;': ' ',
  '&ensp;': ' ',
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

export default function makeExcerpt(markdown, pruneLength = 280) {
  let text = markdown || '';

  // images first, then links -> keep the link text
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

  // headings, blockquotes, list markers at line starts
  text = text.replace(/^[ \t]*#{1,6}[ \t]+/gm, '');
  text = text.replace(/^[ \t]*>[ \t]?/gm, '');
  text = text.replace(/^[ \t]*([-*+]|\d+\.)[ \t]+/gm, '');

  // emphasis / inline code / leftover brackets
  text = text.replace(/[*_`~]/g, '');
  text = text.replace(/\[\[|\]\]/g, '');

  // html entities
  text = text.replace(/&[a-z]+;|&#\d+;/gi, (m) => ENTITIES[m] || ' ');

  // collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length > pruneLength) {
    text = text.substring(0, pruneLength);
  }
  return text;
}
