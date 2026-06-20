const fs = require('fs');
const path = require('path');

const highlightsPath = 'content/highlights-data.json';
const linksPath = 'public/pdfs/pdpa_links.json';

const highlights = JSON.parse(fs.readFileSync(highlightsPath, 'utf8'));
const links = JSON.parse(fs.readFileSync(linksPath, 'utf8'));

let updated = 0;

highlights.forEach(h => {
  if (!h.title) return;
  // find in links
  const matched = links.find(l => {
    if (!l['เอกสารเชื่อมโยง']) return false;
    // try exact match or substring match
    const title = h.title.trim().replace(/\s+/g, ' ');
    const linkTitle = l['เอกสารเชื่อมโยง'].trim().replace(/\s+/g, ' ');
    return title === linkTitle || title.includes(linkTitle) || linkTitle.includes(title);
  });
  
  if (matched && matched.link && matched.link !== 'ยังไม่มีประกาศ') {
    h.main_pdf_link = matched.link;
    updated++;
  }
});

fs.writeFileSync(highlightsPath, JSON.stringify(highlights, null, 2), 'utf8');
console.log(`Updated ${updated} highlights with main_pdf_link.`);
