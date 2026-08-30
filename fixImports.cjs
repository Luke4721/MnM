const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/<Shield className="text-gray-400 group-hover:text-\[#FF9933\] transition-colors" size={32} \/>/, '<CalendarCheck className="text-gray-400 group-hover:text-[#FF9933] transition-colors" size={32} />');
code = code.replace(/import \{ Compass, Map, Ticket, CalendarCheck, BedDouble, Star, Shield, Plane, ArrowRight, Camera \} from 'lucide-react';/, "import { Compass, Map, Ticket, CalendarCheck, BedDouble, Star, Shield, ArrowRight, Camera } from 'lucide-react';");

fs.writeFileSync('src/pages/Home.tsx', code);
