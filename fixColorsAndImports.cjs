const fs = require('fs');
const glob = require('glob');

// 1. Fix Home.tsx imports
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeCode = homeCode.replace(/import \{ Compass.*?\} from 'lucide-react';/, "import { Compass, Map, Ticket, CalendarCheck, BedDouble, Star, Shield, Plane, ArrowRight, Camera } from 'lucide-react';");

// 2. We need to check if ArrowRight and Camera are now correctly imported.
fs.writeFileSync('src/pages/Home.tsx', homeCode);

// 3. Find and replace all #FF003C to #FF9933 in src
const files = glob.sync('src/**/*.{tsx,ts,css}');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('#FF003C') || content.includes('#ff003c')) {
    content = content.replace(/#FF003C/gi, '#FF9933');
    fs.writeFileSync(file, content);
  }
}

// 4. Also replace red-600 / red-700 with orange-500 / orange-600 in src
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('red-600')) {
    content = content.replace(/red-600/g, 'orange-500');
    changed = true;
  }
  if (content.includes('red-700')) {
    content = content.replace(/red-700/g, 'orange-600');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content);
  }
}

// 5. Add a cookie clearing logic to main.tsx for testing LanguagePrompt
let mainCode = fs.readFileSync('src/main.tsx', 'utf8');
const clearCookiesStr = `
// TEMPORARY: Clear cookies and language preference on load for testing
localStorage.removeItem('languagePreference');
document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
`;

if (!mainCode.includes('localStorage.removeItem(\'languagePreference\')')) {
  mainCode = mainCode.replace(/createRoot\(document.getElementById\('root'\)!\)\.render\(/, clearCookiesStr + '\ncreateRoot(document.getElementById(\'root\')!).render(');
  fs.writeFileSync('src/main.tsx', mainCode);
}
