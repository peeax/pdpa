import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourceDirs = ['app', 'components', 'lib', 'scripts', 'theme'];
const failures = [];
const unsafeEvalAllowed = new Set([path.join(rootDir, 'lib', 'security-headers.mjs')]);
const lintRuleFiles = new Set([
  path.join(rootDir, 'scripts', 'check-production.mjs'),
  path.join(rootDir, 'scripts', 'lint-source.mjs'),
]);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.(jsx?|mjs|css)$/.test(entry.name)) {
      checkFile(fullPath);
    }
  }
}

function report(filePath, message) {
  failures.push(`${path.relative(rootDir, filePath)}: ${message}`);
}

function checkFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  if (/[ \t]$/m.test(text)) report(filePath, 'remove trailing whitespace');
  if (text.includes('window.open(to, \'_blank\');')) {
    report(filePath, 'window.open must use noopener,noreferrer');
  }
  if (text.includes('httpEquiv="Content-Security-Policy"') && !lintRuleFiles.has(filePath)) {
    report(filePath, 'set CSP as an HTTP header, not a meta tag');
  }
  if (text.includes("'unsafe-eval'") && !unsafeEvalAllowed.has(filePath) && !lintRuleFiles.has(filePath)) {
    report(filePath, 'unsafe-eval is only allowed in the documented development CSP');
  }
}

for (const dir of sourceDirs) {
  walk(path.join(rootDir, dir));
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`[lint-source] checked ${sourceDirs.join(', ')}`);
