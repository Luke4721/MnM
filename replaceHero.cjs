const fs = require('fs');

// 1. Update index.css
let cssCode = fs.readFileSync('src/index.css', 'utf8');
if (!cssCode.includes('Great+Vibes')) {
  cssCode = `@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');\n` + cssCode;
}
cssCode = cssCode.replace(/--font-cursive: "Oswald", sans-serif;/g, '--font-cursive: "Great Vibes", cursive;');
fs.writeFileSync('src/index.css', cssCode);

// 2. Update Home.tsx Hero Section
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace the Hero Slideshow content entirely with the new torn-paper layout
const oldHeroRegex = /<div className="relative w-full h-screen overflow-hidden bg-black">[\s\S]*?{heroPackages\.map\([\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

// I'll just use string replacement on specific chunks instead of regex to be safer.
const heroLayerStr = `
        {/* Hero Overlay Text */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center text-center px-4 relative mt-24"
            >
              <div className="relative">
                <h1 className="text-8xl md:text-[14rem] text-white drop-shadow-xl capitalize" style={{ fontFamily: 'var(--font-cursive)' }}>
                  {activePackage.category}
                </h1>
                <div className="absolute -top-4 -right-8 md:-right-24 bg-red-600 rounded-full w-20 h-20 md:w-28 md:h-28 flex items-center justify-center text-white font-bold text-xl md:text-3xl shadow-lg border-4 border-white/20 transform rotate-12">
                  ₹{activePackage.id * 1000}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Paint Brush / Torn Paper Bottom Border effect */}
        <div 
          className="absolute bottom-0 left-0 w-full h-16 md:h-32 z-20"
          style={{
            backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\"0 0 1440 320\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path fill=\\"%23f9f8f4\\" fill-opacity=\\"1\\" d=\\"M0,160L48,154.7C96,149,192,139,288,149.3C384,160,480,192,576,213.3C672,235,768,245,864,224C960,203,1056,149,1152,144C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\\"></path></svg>')",
            backgroundSize: 'cover',
            backgroundPosition: 'bottom',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
`;

homeCode = homeCode.replace(
  /{\/\* Hero Overlay Text \*\/}[\s\S]*?(?={\/\* Bottom Hero Overlay Bar \*\/})/,
  heroLayerStr
);

// We should hide the Bottom Hero Overlay Bar because the brush stroke goes there.
// Actually, I'll delete the Bottom Hero Overlay Bar, because in the reference there is no bottom bar!
homeCode = homeCode.replace(
  /{\/\* Bottom Hero Overlay Bar \*\/}[\s\S]*?(?=<\/div>\s*{\/\* Floating Search Engine Widget \*\/})/,
  ''
);

fs.writeFileSync('src/pages/Home.tsx', homeCode);
