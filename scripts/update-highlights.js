const fs = require('fs');
const path = require('path');

const ocrDir = path.join('C:', 'Users', 'P', 'Downloads', 'ocrเเก้เเล้ว (1)', 'ocrเเก้เเล้ว');
const highlightsPath = path.join(__dirname, '..', 'content', 'highlights-data.json');

// Read current highlights data
const highlights = JSON.parse(fs.readFileSync(highlightsPath, 'utf8'));

// Map PDF filenames to OCR filenames
// PDF: /pdfs/article-4.pdf -> OCR: article-4_ocr.txt
const ocrFiles = fs.readdirSync(ocrDir).filter(f => f.endsWith('.txt'));
console.log(`Found ${ocrFiles.length} OCR files:`);
ocrFiles.forEach(f => console.log(`  - ${f}`));

let updatedCount = 0;

highlights.forEach((item) => {
  if (item.pdf && item.pdf !== '') {
    // Extract the article name from PDF path: /pdfs/article-4.pdf -> article-4
    const pdfBasename = path.basename(item.pdf, '.pdf');
    const ocrFilename = `${pdfBasename}_ocr.txt`;
    const ocrFilePath = path.join(ocrDir, ocrFilename);

    if (fs.existsSync(ocrFilePath)) {
      const ocrContent = fs.readFileSync(ocrFilePath, 'utf8')
        .replace(/\f/g, '')   // Remove form feed characters
        .replace(/\r\n/g, '\n') // Normalize line endings
        .trim();
      
      console.log(`\nUpdating "${item.slug}":`);
      console.log(`  PDF: ${item.pdf} -> removed`);
      console.log(`  OCR file: ${ocrFilename} (${ocrContent.length} chars)`);
      
      item.pdf = '';
      item.content = ocrContent;
      updatedCount++;
    } else {
      console.log(`\nWARNING: No OCR file found for "${item.slug}" (expected: ${ocrFilename})`);
    }
  }
});

// Write updated highlights data
fs.writeFileSync(highlightsPath, JSON.stringify(highlights, null, 2) + '\n', 'utf8');
console.log(`\n✅ Done! Updated ${updatedCount} entries in highlights-data.json`);
