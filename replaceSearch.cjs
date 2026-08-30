const fs = require('fs');
let code = fs.readFileSync('src/components/TravelSearchEngine.tsx', 'utf8');

// 1. Make the pill wrapper stacked on mobile
code = code.replace(
  /<div className="flex flex-col lg:flex-row items-center bg-\[#f3f4f6\] dark:bg-black\/10 rounded-full p-2 relative shadow-inner">/g,
  '<div className="flex flex-col lg:flex-row items-center bg-[#f3f4f6] dark:bg-black/10 rounded-[2rem] lg:rounded-full p-2 relative shadow-inner gap-2 lg:gap-0">'
);

// 2. Add horizontal dividers for mobile
code = code.replace(
  /<div className="hidden lg:block w-\[1px\] h-12 bg-gray-200 dark:bg-white\/20 mx-1"><\/div>/g,
  '<div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div><div className="block lg:hidden h-[1px] w-full bg-gray-200 dark:bg-white/20 my-1"></div>'
);

// 3. Make Search button full width on mobile
code = code.replace(
  /<div className="w-16 h-16 bg-\[#FF003C\] hover:bg-red-700/g,
  '<div className="w-full lg:w-16 h-16 lg:h-16 bg-[#FF003C] hover:bg-red-700'
);

fs.writeFileSync('src/components/TravelSearchEngine.tsx', code);
