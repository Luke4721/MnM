import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('[check-secrets] Scanning repository files for potential secret leaks...');

// Generic industry-standard regex patterns to detect potential secrets.
// NEVER include specific credentials or leaked fragments in this list.
const GENERIC_SECRET_PATTERNS = [
  {
    name: 'AWS Access Key ID',
    regex: /\bAKIA[0-9A-Z]{16}\b/,
  },
  {
    name: 'AWS Secret Access Key Assignment',
    regex: /(?:aws_secret_access_key|aws_secret|secret_access_key|secretAccessKey)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/i,
  },
  {
    name: 'Razorpay Secret Key Assignment',
    regex: /(?:razorpay_key_secret|razorpay_secret|key_secret)\s*[:=]\s*["']?([A-Za-z0-9]{16,})["']?/i,
  },
  {
    name: 'Private Key Header',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
];

// Files and paths excluded from scanning.
// Note: scripts/check-secrets.mjs is explicitly excluded to avoid self-flagging on its own detection regex text.
const IGNORED_PATHS = [
  'scripts/check-secrets.mjs',
  '.env.example',
  'node_modules',
  '.git',
  '.env.local',
  '.env',
];

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function getFilesToScan() {
  // If staged files exist, scan staged files. Otherwise, scan all git-tracked files.
  try {
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n')
      .map((f) => normalizePath(f.trim()))
      .filter(Boolean);
    if (staged.length > 0) {
      console.log(`[check-secrets] Scanning ${staged.length} staged file(s)...`);
      return staged;
    }
  } catch {
    // fallback
  }

  try {
    const tracked = execSync('git ls-files', { encoding: 'utf8' })
      .split('\n')
      .map((f) => normalizePath(f.trim()))
      .filter(Boolean);
    console.log(`[check-secrets] No staged files found. Scanning ${tracked.length} tracked file(s)...`);
    return tracked;
  } catch {
    return [];
  }
}

const files = getFilesToScan();
let violations = 0;

for (const file of files) {
  const normalized = normalizePath(file);
  // Self-skip: exclude scanner itself and ignored paths
  if (IGNORED_PATHS.some((p) => normalized === p || normalized.startsWith(p + '/'))) {
    continue;
  }

  const fullPath = path.resolve(process.cwd(), normalized);
  if (!fs.existsSync(fullPath)) continue;

  try {
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() || stat.size > 2 * 1024 * 1024) continue; // Skip large files / binaries

    const content = fs.readFileSync(fullPath, 'utf8');
    for (const pattern of GENERIC_SECRET_PATTERNS) {
      if (pattern.regex.test(content)) {
        console.error(`[check-secrets] VIOLATION: Found potential ${pattern.name} in file: ${normalized}`);
        violations++;
      }
    }
  } catch {
    // Ignore binary or unreadable files
  }
}

if (violations > 0) {
  console.error(`\n[check-secrets] FAILED: ${violations} potential secret(s) detected. Strip them before committing!`);
  process.exit(1);
}

console.log('[check-secrets] PASSED: No secrets found in scanned files.');
