import re

with open('src/components/TravelSearchEngine.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

# Add db import
if 'import db from' not in data:
    data = re.sub(
        r"(import React.*?;)", 
        r"\1\nimport db from '../data/mnm_database.json';", 
        data
    )

# Add isDestOpen state
if 'const [isDestOpen, setIsDestOpen] = useState(false);' not in data:
    data = re.sub(
        r"const \[isBudgetOpen, setIsBudgetOpen\] = useState\(false\);",
        r"const [isBudgetOpen, setIsBudgetOpen] = useState(false);\n  const [isDestOpen, setIsDestOpen] = useState(false);",
        data
    )

# Add the derived locations logic
if 'const allDestinations =' not in data:
    locations_logic = """
  const allDestinations = Array.from(new Set(db.packages.flatMap(p => p.location.split(', ')))).filter(Boolean).sort();
  const matchedDestinations = destination ? allDestinations.filter(d => d.toLowerCase().includes(destination.toLowerCase())) : allDestinations.slice(0, 10);
"""
    data = re.sub(
        r"const today = new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];",
        r"const today = new Date().toISOString().split('T')[0];\n" + locations_logic,
        data
    )

# Update the backdrop click handler
data = re.sub(
    r"\{\(isGuestsOpen \|\| isBudgetOpen\) && \(",
    r"{(isGuestsOpen || isBudgetOpen || isDestOpen) && (",
    data
)
data = re.sub(
    r"setIsGuestsOpen\(false\); setIsBudgetOpen\(false\); \}\}",
    r"setIsGuestsOpen(false); setIsBudgetOpen(false); setIsDestOpen(false); }}",
    data
)

# Modify the Destinations input row
dest_input_regex = re.compile(
    r"(<div className=\"flex flex-col w-full\">\s*<span className=\"text-sm font-extrabold text-gray-900 dark:text-white\">Destinations</span>\s*<input[^>]+>)\s*(</div>)",
    re.MULTILINE | re.DOTALL
)

dest_dropdown_code = """
              <div className="relative flex flex-col w-full">
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
              </div>
"""

data = dest_input_regex.sub(dest_dropdown_code, data)

with open('src/components/TravelSearchEngine.tsx', 'w', encoding='utf-8') as f:
    f.write(data)
print("Updated Search Engine!")
