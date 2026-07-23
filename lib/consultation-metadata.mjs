const TITLE_PREFIX = 'เลขที่เรื่อง';
const SUMMARY_PREFIX = 'เรื่อง';
const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';
const CONSULTATION_FILENAME_PATTERN = /^consultation-(\d{4})-(\d{3})\.md$/;

export function thaiNumeralsToArabic(value) {
  return String(value).replace(/[๐-๙]/g, (digit) => THAI_DIGITS.indexOf(digit));
}

export function extractConsultationIdentity(content) {
  const title = extractConsultationMetadata(content).title;
  const match = title.match(/^เลขที่เรื่อง\s+([๐-๙\d]+)\s*\/\s*([๐-๙\d]+)$/);
  if (!match) return null;

  const number = Number.parseInt(thaiNumeralsToArabic(match[1]), 10);
  const year = Number.parseInt(thaiNumeralsToArabic(match[2]), 10);
  if (!Number.isInteger(number) || !Number.isInteger(year)) return null;

  return { number, year };
}

export function consultationFilename({ number, year }) {
  return `consultation-${year}-${String(number).padStart(3, '0')}.md`;
}

export function parseConsultationFilename(filename) {
  const match = String(filename).match(CONSULTATION_FILENAME_PATTERN);
  if (!match) return null;
  return {
    year: Number.parseInt(match[1], 10),
    number: Number.parseInt(match[2], 10),
  };
}

export function normalizeMarkdownLine(line) {
  return String(line)
    .replace(/^[\\\s]+/, '')
    .replace(/^#{1,6}\s+/, '')
    .replace(/^(?:\*\*|__)(.*?)(?:\*\*|__)$/, '$1')
    .trim();
}

export function extractConsultationMetadata(content) {
  const lines = [...String(content).matchAll(/^.+$/gm)].map((match) => ({
    index: match.index,
    source: match[0],
    text: normalizeMarkdownLine(match[0]),
  }));
  const titleLine =
    lines.find(({ text }) => text.startsWith(TITLE_PREFIX)) ||
    lines.find(({ source }) => /^(?:#{1,6}\s+|\*\*|__)/.test(source));
  const summaryLine = lines.find(
    ({ text }) => text.startsWith(SUMMARY_PREFIX) && !text.startsWith(TITLE_PREFIX)
  );

  return {
    title: titleLine?.text || '',
    summary: summaryLine?.text || '',
    titleSource: titleLine || null,
  };
}

export function removeConsultationTitle(content, titleSource) {
  if (!titleSource) return String(content).trim();
  return `${content.slice(0, titleSource.index)}${content.slice(
    titleSource.index + titleSource.source.length
  )}`.trim();
}

export function formatConsultationContent(content) {
  const unescaped = String(content)
    .replace(/&#x20;/g, '')
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\\(#{1,6}\s+)/, '$1')
        .replace(/^\\(---)\s*$/, '$1')
        .replace(/^\\(-\s+)/, '$1')
        .replace(/^(\d+)\\\.(\s+)/, '$1.$2')
        .replace(/\\([*_])/g, '$1')
        .replace(/[ \t]+$/, ''),
    )
    .join('\n');
  const lines = unescaped.split('\n');
  const subjectIndex = lines.findIndex((line) => /^##\s+เรื่อง/.test(line));

  if (subjectIndex >= 0) {
    const subjectParts = [lines[subjectIndex].replace(/^##\s+เรื่อง\s*/, '').trim()].filter(
      Boolean,
    );
    let endIndex = subjectIndex + 1;

    while (endIndex < lines.length) {
      const trimmed = lines[endIndex].trim();
      if (!trimmed) {
        endIndex += 1;
        continue;
      }
      const normalizedBoundary = normalizeMarkdownLine(trimmed);
      if (
        /^(?:#{1,6}\s|---$|<)/.test(trimmed) ||
        /^(?:ข้อกฎหมาย(?:ที่เกี่ยวข้อง)?|ข้อหารือ)$/.test(normalizedBoundary)
      ) {
        break;
      }
      subjectParts.push(trimmed);
      endIndex += 1;
    }

    if (subjectParts.length > 0) {
      lines.splice(subjectIndex, endIndex - subjectIndex, `## เรื่อง ${subjectParts.join(' ')}`, '');
    }
  }

  let titleSeen = false;
  let shiftNestedHeadings = false;
  let previousHeadingLevel = 0;
  const normalized = lines
    .map((line) => {
      if (!titleSeen && /^#\s+/.test(line)) {
        titleSeen = true;
        previousHeadingLevel = 1;
        return line;
      }
      if (titleSeen && /^#\s+/.test(line)) shiftNestedHeadings = true;
      let formattedLine =
        shiftNestedHeadings && /^#{1,5}\s+/.test(line) ? `#${line}` : line;
      const heading = formattedLine.match(/^(#{1,6})\s+/);
      if (heading) {
        const level = Math.min(heading[1].length, previousHeadingLevel + 1);
        if (level !== heading[1].length) {
          formattedLine = `${'#'.repeat(level)}${formattedLine.slice(heading[1].length)}`;
        }
        previousHeadingLevel = level;
      }
      return formattedLine;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  const metadata = extractConsultationMetadata(normalized);
  let titleFormatted = false;
  let summaryFormatted = false;

  return normalized
    .split('\n')
    .map((line) => {
      const trimmedLine = line.replace(/[ \t]+$/, '');
      const normalized = normalizeMarkdownLine(trimmedLine);

      if (!titleFormatted && metadata.title && normalized === metadata.title) {
        titleFormatted = true;
        return `# ${metadata.title}`;
      }
      if (!summaryFormatted && metadata.summary && normalized === metadata.summary) {
        summaryFormatted = true;
        return `## ${metadata.summary}`;
      }
      return trimmedLine;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}
