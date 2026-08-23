import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

# Define the new JSX to inject
new_sections = """
      {/* Top Trending INDIA Destinations */}
      <div className="py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-normal text-[#2c3e50] dark:text-gray-200 mb-2">Top Trending INDIA Destinations</h2>
            <p className="text-gray-500 text-sm">Find the exclusive tour options for India's Top Trending Destinations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "/images/0b9903d33f4b2867c46621f3eb86c7cd.jpg",
              "/images/2667045e2fd96444a1e5a7796a6ab43b.jpg",
              "/images/30ca80d455a76609dc911a25a68d87e2.jpg",
              "/images/3ac9bf62d5bb14289acd33e9f5a63ee3.jpg",
              "/images/6b2bb97f0c1b6d7f2e78e37589eae965.jpg",
              "/images/6f3ad43a139e289fdcc2ccc6d497923b.jpg",
              "/images/7c677b5e8b51587496b66ed9709845df.jpg",
              "/images/8b2e185fc79ab5f9983920bbc1f8f6b5.jpg",
              "/images/8c22906dc1ab06a9031e5f0fde298c5b.jpg"
            ].map((src, i) => (
              <div key={i} className="aspect-[16/9] overflow-hidden group cursor-pointer">
                <img src={src} alt={`India Destination ${i+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Trending INTERNATIONAL Destinations */}
      <div className="py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-normal text-[#2c3e50] dark:text-gray-200 mb-2">Top Trending INTERNATIONAL Destinations</h2>
            <p className="text-gray-500 text-sm">Find the exclusive tour options for Top Trending International Destinations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "/images/9c904a1b42b78bb14a34bb65cc768a40.jpg",
              "/images/9dd341eb42d8bf61fd830a7fb49fcea0.jpg",
              "/images/addd9c793a887b86533272b59634079b.jpg",
              "/images/bc26215b8a86f23ba325cec734f67987.jpg",
              "/images/d0d74fa518ccf2c3f270d33d480a52ec.jpg",
              "/images/e97b55b625311db0391ed5d31752fe46.jpg",
              "/images/f426fde8514dd68edc767474c1fa719a.jpg",
              "/images/sd1.jpg",
              "/images/sd2.jpg"
            ].map((src, i) => (
              <div key={i} className="aspect-[16/9] overflow-hidden group cursor-pointer relative">
                 <img src={src} alt={`International Destination ${i+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            ))}
          </div>
        </div>
      </div>
"""

# Insert right after Phase 4
target = r'(\{\/\* Phase 5: CTA, Blogs & Footer \*\/\})'
if re.search(target, data):
    new_data = re.sub(target, new_sections + r'\n      \1', data)
    with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
        f.write(new_data)
    print("Injected successfully!")
else:
    print("Could not find insertion point!")
