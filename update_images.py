import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

# Replace the Top Trending INTERNATIONAL Destinations grid
intl_regex = re.compile(
    r'\{\/\* Top Trending INTERNATIONAL Destinations \*\/.*?<\/div>\s*<\/div>\s*<\/div>',
    re.MULTILINE | re.DOTALL
)

new_intl = """{/* Top Trending INTERNATIONAL Destinations */}
      <div className="py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#2c3e50] dark:text-gray-200 mb-2" style={{ fontFamily: 'var(--font-sans)' }}>Top Trending INTERNATIONAL Destinations</h2>
            <p className="text-gray-500 text-sm">Find the exclusive tour options for Top Trending International Destinations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Milan_Cathedral_from_Piazza_del_Duomo.jpg/3840px-Milan_Cathedral_from_Piazza_del_Duomo.jpg", name: "Milan" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Titlis_W.jpg/1280px-Titlis_W.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail", name: "Mount Titlis" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg", name: "Paris" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg", name: "Rome" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/1280px-Tower_Bridge_at_Dawn.jpg", name: "London" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/1280px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg", name: "Japan" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg/1280px-Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail", name: "Grand Canyon" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oia_sunset_-_panoramio_%282%29.jpg/1280px-Oia_sunset_-_panoramio_%282%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail", name: "Santorini" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg/1280px-%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail", name: "Thailand" }
            ].map((item, i) => (
              <div key={i} className="aspect-[16/9] overflow-hidden group cursor-pointer relative bg-gray-100 dark:bg-zinc-900">
                <img src={item.src} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold text-xl uppercase tracking-widest">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>"""
data = intl_regex.sub(new_intl, data)

# Also fix the agency slide show to use the new Santorini picture since the old one was the map
agency_img_regex = re.compile(
    r'\{\[\s*"https:\/\/upload\.wikimedia\.org.*?\]\.map'
)

new_agency_img = """{[
                 "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg",
                 "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg",
                 "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oia_sunset_-_panoramio_%282%29.jpg/1280px-Oia_sunset_-_panoramio_%282%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
                 "https://upload.wikimedia.org/wikipedia/commons/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg"
               ].map"""

data = agency_img_regex.sub(new_agency_img, data)

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(data)
print("Updated Images!")
