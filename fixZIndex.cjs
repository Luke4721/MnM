const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  '<div className="relative z-30 -mt-10 max-w-6xl mx-auto px-4 sm:px-6">',
  '<div className="relative z-50 -mt-10 max-w-6xl mx-auto px-4 sm:px-6">'
);

fs.writeFileSync('src/pages/Home.tsx', code);
