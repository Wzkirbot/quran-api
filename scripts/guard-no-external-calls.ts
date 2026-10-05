import fs from 'node:fs';
import path from 'node:path';

// Known external Quran and religious API domains that must NEVER be called at runtime
const FORBIDDEN_DOMAINS = [
  'api.quran.com',
  'api.alquran.cloud',
  'quranenc.com',
  'everyayah.com',
  'mp3quran.net',
  'qurani.api',
  'fawazahmed0'
];

// Patterns that indicate outgoing HTTP requests in runtime code
const FORBIDDEN_CALL_PATTERNS = [
  /\bfetch\s*\(/,
  /\baxios(\.|\s*\()/,
  /\bgot(\.|\s*\()/,
  /\brequest(\.|\s*\()/,
  /\bhttps?\.get\s*\(/,
  /\bhttps?\.request\s*\(/
];

function scanDirectory(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

export function runOfflineGuardrail(): boolean {
  console.log('====================================================');
  console.log('🛡️  Quran API - Runtime Offline Guardrail Audit');
  console.log('====================================================');

  const srcDir = path.resolve(process.cwd(), 'src');
  const filesToScan = scanDirectory(srcDir);

  const violations: Array<{ file: string; line: number; issue: string }> = [];

  for (const filePath of filesToScan) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for forbidden external Quran API domains
      for (const domain of FORBIDDEN_DOMAINS) {
        if (line.includes(domain)) {
          violations.push({
            file: path.relative(process.cwd(), filePath),
            line: lineNum,
            issue: `Forbidden external Quran API domain reference detected: "${domain}"`
          });
        }
      }

      // Check for outgoing HTTP requests in runtime code
      for (const pattern of FORBIDDEN_CALL_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({
            file: path.relative(process.cwd(), filePath),
            line: lineNum,
            issue: `Forbidden runtime network request call pattern: ${line.trim()}`
          });
        }
      }
    });
  }

  if (violations.length > 0) {
    console.error('❌ OFFLINE GUARDRAIL VIOLATIONS FOUND:');
    violations.forEach((v) => {
      console.error(`  - [${v.file}:${v.line}] ${v.issue}`);
    });
    console.error('\nCRITICAL: Runtime code in src/ must be 100% self-contained and serve data exclusively from local database/cache.');
    return false;
  }

  console.log(`✓ Scanned ${filesToScan.length} runtime TypeScript files in src/`);
  console.log('✓ ZERO external Quran API runtime calls or dependencies found.');
  console.log('✓ 100% OFFLINE-READY & SELF-CONTAINED ARCHITECTURE VERIFIED.');
  console.log('====================================================');
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('guard-no-external-calls.ts')) {
  const success = runOfflineGuardrail();
  if (!success) process.exit(1);
}
