import re

with open('src/components/TravelSearchEngine.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

target = """              <div className="flex flex-col w-full">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">Destinations</span>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Search destinations"
                  className="bg-transparent border-none p-0 text-sm font-medium text-gray-600 dark:text-white/90 dark:placeholder-white/60 placeholder-gray-400 focus:ring-0 outline-none w-full truncate"
                />
              </div>"""

dest_dropdown_code = """              <div className="relative flex flex-col w-full">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">Destinations</span>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setIsDestOpen(true);
                  }}
                  onFocus={() => setIsDestOpen(true)}
                  placeholder="Search destinations"
                  className="bg-transparent border-none p-0 text-sm font-medium text-gray-600 dark:text-white/90 dark:placeholder-white/60 placeholder-gray-400 focus:ring-0 outline-none w-full truncate"
                />
                <ul className={`absolute top-full mt-4 left-0 w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-[9999] overflow-hidden transition-all duration-300 ease-in-out origin-top ${
                   isDestOpen && matchedDestinations.length > 0 ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                   {matchedDestinations.slice(0, 8).map((option, idx) => (
                      <li 
                         key={idx}
                         onClick={() => {
                           setDestination(option);
                           setIsDestOpen(false);
                         }}
                         className="px-5 py-3 hover:bg-[#D97736]/10 hover:text-[#D97736] text-gray-700 dark:text-gray-300 transition-colors duration-200 cursor-pointer text-sm"
                      >
                         {option}
                      </li>
                   ))}
                </ul>
              </div>"""

if target in data:
    data = data.replace(target, dest_dropdown_code)
    with open('src/components/TravelSearchEngine.tsx', 'w', encoding='utf-8') as f:
        f.write(data)
    print("Injected UI dropdown!")
else:
    print("Could not find the target string block!")
