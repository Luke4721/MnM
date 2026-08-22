import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

custom_hero_packages = """
  // Phase 2: Hero Slideshow Logic
  const heroPackages = [
    {
      id: 1,
      category: "Temple of India",
      name: "Bhubaneswar Pilgrimage",
      location: "Bhubaneswar, Odisha",
      duration: "04 Nights / 05 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Lingaraj_Temple_%2C_Bhubaneswar.jpg"
    },
    {
      id: 2,
      category: "Forts & Palaces",
      name: "Rajasthan Heritage Tour",
      location: "Jodhpur, Rajasthan",
      duration: "06 Nights / 07 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/9/99/Mehrangarh_Fort_sanhita.jpg"
    },
    {
      id: 5,
      category: "The Himalayas",
      name: "Everest Base Camp",
      location: "Himalayas, Nepal",
      duration: "10 Nights / 11 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg"
    },
    {
      id: 10,
      category: "Udaipur",
      name: "City of Lakes Tour",
      location: "Udaipur, Rajasthan",
      duration: "03 Nights / 04 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/3/32/Udaipur_Lake_Palace.jpg"
    },
    {
      id: 11,
      category: "Agra",
      name: "Taj Mahal Experience",
      location: "Agra, Uttar Pradesh",
      duration: "02 Nights / 03 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg"
    },
    {
      id: 12,
      category: "Milan",
      name: "Milan City Break",
      location: "Milan, Italy",
      duration: "04 Nights / 05 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Milan_Cathedral_from_Piazza_del_Duomo.jpg/3840px-Milan_Cathedral_from_Piazza_del_Duomo.jpg"
    },
    {
      id: 13,
      category: "Mount Titlis",
      name: "Swiss Alps Adventure",
      location: "Mount Titlis, Switzerland",
      duration: "05 Nights / 06 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Titlis_W.jpg"
    },
    {
      id: 14,
      category: "Kodaikanal",
      name: "Princess of Hill Stations",
      location: "Kodaikanal, Tamil Nadu",
      duration: "04 Nights / 05 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Boating_in_Kodaikanal_Lake_with_Mist.jpg/3840px-Boating_in_Kodaikanal_Lake_with_Mist.jpg"
    }
  ];
"""

# Replace the heroPackages definition
data = re.sub(r'// Phase 2: Hero Slideshow Logic\s*const heroPackages = db\.packages\.slice\([^\)]+\);', custom_hero_packages.strip(), data)

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(data)
