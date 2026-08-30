const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Use string replacement instead of regex to avoid escaping issues
code = code.replace('<Shield className="text-gray-400 group-hover:text-[#FF9933] transition-colors" size={32} />', '<CalendarCheck className="text-gray-400 group-hover:text-[#FF9933] transition-colors" size={32} />');

// Remove Plane from imports
code = code.replace(/Plane,\s*/, '');

fs.writeFileSync('src/pages/Home.tsx', code);
