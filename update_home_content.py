import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

# Replace the "Discover the world's leading travel agency" text and image
agency_regex = re.compile(
    r'<h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-8" style={{ fontFamily: \'var\(--font-sans\)\' }}>\s*Discover the <br\/>world\'s leading <br\/>travel agency.\s*<\/h2>\s*<p className="text-gray-500 dark:text-gray-400 text-lg mb-12">\s*Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since.\s*<\/p>',
    re.MULTILINE
)

new_agency_text = """<h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-8">
              Discover the <br/>world's leading <br/>travel agency.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-12 leading-relaxed">
              For over 15 years, Monks & Monkeys Travels has curated extraordinary journeys across the globe. Our seasoned team of experts crafts meticulously tailored experiences—from the tranquil backwaters of Kerala to the majestic peaks of the Swiss Alps. Join thousands of happy travelers and discover your next great adventure.
            </p>"""

data = agency_regex.sub(new_agency_text, data)

agency_img_regex = re.compile(
    r'<div className="rounded-t-full rounded-b-lg overflow-hidden shadow-2xl relative z-10 aspect-\[3/4\]">\s*<img src="[^"]+" className="w-full h-full object-cover" \/>\s*<\/div>'
)

new_agency_img = """<div className="rounded-t-full rounded-b-lg overflow-hidden shadow-2xl relative z-10 aspect-[3/4]">
               {[
                 "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg",
                 "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg",
                 "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/2011_Dimos_Thiras.png/1280px-2011_Dimos_Thiras.png",
                 "https://upload.wikimedia.org/wikipedia/commons/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg"
               ].map((imgUrl, i) => (
                 <img 
                   key={i} 
                   src={imgUrl} 
                   className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentSlide % 4 === i ? 'opacity-100' : 'opacity-0'}`} 
                   alt="Travel Destination" 
                 />
               ))}
            </div>"""

data = agency_img_regex.sub(new_agency_img, data)

# Replace the Top Trending INDIA Destinations grid
india_regex = re.compile(
    r'\{\/\* Top Trending INDIA Destinations \*\/.*?<\/div>\s*<\/div>\s*<\/div>',
    re.MULTILINE | re.DOTALL
)

new_india = """{/* Top Trending INDIA Destinations */}
      <div className="py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#2c3e50] dark:text-gray-200 mb-2" style={{ fontFamily: 'var(--font-sans)' }}>Top Trending INDIA Destinations</h2>
            <p className="text-gray-500 text-sm">Find the exclusive tour options for India's Top Trending Destinations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { src: "https://upload.wikimedia.org/wikipedia/commons/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg", name: "Himalayas" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg", name: "Agra" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/9/99/Mehrangarh_Fort_sanhita.jpg", name: "Jodhpur" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Lingaraj_Temple_%2C_Bhubaneswar.jpg", name: "Bhubaneswar" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/3/32/Udaipur_Lake_Palace.jpg", name: "Udaipur" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Boating_in_Kodaikanal_Lake_with_Mist.jpg/3840px-Boating_in_Kodaikanal_Lake_with_Mist.jpg", name: "Kodaikanal" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/House_Boat_DSW.jpg/1280px-House_Boat_DSW.jpg", name: "Kerala" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/1280px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg", name: "Jaipur" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/1280px-The_Golden_Temple_of_Amrithsar_7.jpg", name: "Amritsar" }
            ].map((item, i) => (
              <div key={i} className="aspect-[16/9] overflow-hidden group cursor-pointer relative">
                <img src={item.src} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold text-xl uppercase tracking-widest">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>"""
data = india_regex.sub(new_india, data)

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
              { src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Titlis_W.jpg", name: "Mount Titlis" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg", name: "Paris" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg", name: "Rome" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/1280px-Tower_Bridge_at_Dawn.jpg", name: "London" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/1280px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg", name: "Japan" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Canyon_River_Tree_%28165872763%29.jpeg/1280px-Canyon_River_Tree_%28165872763%29.jpeg", name: "Grand Canyon" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/2011_Dimos_Thiras.png/1280px-2011_Dimos_Thiras.png", name: "Santorini" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Khao_Phing_Kan_after_rain.jpg/1280px-Khao_Phing_Kan_after_rain.jpg", name: "Thailand" }
            ].map((item, i) => (
              <div key={i} className="aspect-[16/9] overflow-hidden group cursor-pointer relative">
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


# One last fix in About.tsx to prevent 1990 from rendering with cursive if it is not desired? No, 1990 is fine.
# We also want to remove 'since' class if it was 'since 2008' maybe... 

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(data)
print("Updated Home content!")
