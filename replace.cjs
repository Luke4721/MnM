const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const newNav = fs.readFileSync('nav.txt', 'utf8');
code = code.replace(/<nav[\s\S]*?<\/nav>/, newNav);
fs.writeFileSync('src/App.tsx', code);
