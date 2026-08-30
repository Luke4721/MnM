const fs = require('fs');

let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Remove the Red Price Badge from Hero
code = code.replace(/<div className="absolute -top-4 -right-8 md:-right-24 bg-red-600 rounded-full w-20 h-20 md:w-28 md:h-28 flex items-center justify-center text-white font-bold text-xl md:text-3xl shadow-lg border-4 border-white\/20 transform rotate-12">\s*₹{activePackage.id \* 1000}\s*<\/div>/, '');

// 2. Fix the Parallax CTA background image (was accidentally replaced by the SVG mask)
const brokenBgRegex = /backgroundImage: 'url\("data:image\/svg\+xml;utf8,<svg viewBox=\\'0 0 1200 120\\' preserveAspectRatio=\\'none\\' xmlns=\\'http:\/\/www\.w3\.org\/2000\/svg\\'>[\s\S]*?<\/svg>"\)',/;
code = code.replace(brokenBgRegex, "backgroundImage: 'url(\"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop\")',");

// 3. Remove the Play Button
const playButtonRegex = /<button className="w-20 h-20 bg-white\/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-white hover:text-black transition-colors group">[\s\S]*?<\/button>/;
code = code.replace(playButtonRegex, '');

// 4. Update the icons in the Booking Steps
code = code.replace(/<Compass className="text-gray-400/g, '<Map className="text-gray-400');
code = code.replace(/<Plane className="text-gray-400/g, '<Ticket className="text-gray-400');
code = code.replace(/<Shield className="text-gray-400 group-hover:text-\[#FF003C\] transition-colors" size={32} \/>[\s\S]*?<span className="font-bold text-sm tracking-widest uppercase text-gray-900 dark:text-white">Booking<\/span>/, '<CalendarCheck className="text-gray-400 group-hover:text-[#FF003C] transition-colors" size={32} />\n            </div>\n            <span className="font-bold text-sm tracking-widest uppercase text-gray-900 dark:text-white">Booking</span>');

code = code.replace(/<Heart className="text-gray-400 group-hover:text-\[#FF003C\] transition-colors" size={32} \/>[\s\S]*?<span className="font-bold text-sm tracking-widest uppercase text-gray-900 dark:text-white">Bedding<\/span>/, '<BedDouble className="text-gray-400 group-hover:text-[#FF003C] transition-colors" size={32} />\n            </div>\n            <span className="font-bold text-sm tracking-widest uppercase text-gray-900 dark:text-white">Bedding</span>');

// We must add imports for Map, Ticket, CalendarCheck, BedDouble if they aren't there
if (!code.includes('Map,')) code = code.replace('Compass', 'Compass, Map, Ticket, CalendarCheck, BedDouble');

fs.writeFileSync('src/pages/Home.tsx', code);
