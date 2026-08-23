import json
import re

# We use Wikipedia images we know exist and are beautiful
IMAGE_MAP = {
    "kashmir": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pangong_Lake_in_Ladakh.jpg/1280px-Pangong_Lake_in_Ladakh.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Dal_Lake_in_Srinagar_Kashmir.jpg/1280px-Dal_Lake_in_Srinagar_Kashmir.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Sunset_view_-manali_to_shimla.jpg/1280px-Sunset_view_-manali_to_shimla.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Gulmarg_in_winter.jpg/1280px-Gulmarg_in_winter.jpg"
    ],
    "ladakh": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pangong_Lake_in_Ladakh.jpg/1280px-Pangong_Lake_in_Ladakh.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Nubra_Valley.jpg/1280px-Nubra_Valley.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Thikse_Monastery_Ladakh.jpg/1280px-Thikse_Monastery_Ladakh.jpg"
    ],
    "leh": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pangong_Lake_in_Ladakh.jpg/1280px-Pangong_Lake_in_Ladakh.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Thikse_Monastery_Ladakh.jpg/1280px-Thikse_Monastery_Ladakh.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Nubra_Valley.jpg/1280px-Nubra_Valley.jpg"
    ],
    "srinagar": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Dal_Lake_in_Srinagar_Kashmir.jpg/1280px-Dal_Lake_in_Srinagar_Kashmir.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pangong_Lake_in_Ladakh.jpg/1280px-Pangong_Lake_in_Ladakh.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Sunset_view_-manali_to_shimla.jpg/1280px-Sunset_view_-manali_to_shimla.jpg"
    ],
    "kerala": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Kerala_Backwaters_-_Alappuzha.jpg/1280px-Kerala_Backwaters_-_Alappuzha.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Munnar_hillstation_kerala.jpg/1280px-Munnar_hillstation_kerala.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Houseboat_in_Kerala.jpg/1280px-Houseboat_in_Kerala.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Tea_plantation_in_Munnar.jpg/1280px-Tea_plantation_in_Munnar.jpg"
    ],
    "cochin": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Kerala_Backwaters_-_Alappuzha.jpg/1280px-Kerala_Backwaters_-_Alappuzha.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Munnar_hillstation_kerala.jpg/1280px-Munnar_hillstation_kerala.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Tea_plantation_in_Munnar.jpg/1280px-Tea_plantation_in_Munnar.jpg"
    ],
    "trivandrum": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Munnar_hillstation_kerala.jpg/1280px-Munnar_hillstation_kerala.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Kerala_Backwaters_-_Alappuzha.jpg/1280px-Kerala_Backwaters_-_Alappuzha.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Tea_plantation_in_Munnar.jpg/1280px-Tea_plantation_in_Munnar.jpg"
    ],
    "delhi": [
        "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/India_Gate_in_New_Delhi_03-2016.jpg/1280px-India_Gate_in_New_Delhi_03-2016.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Qutb_Minar_and_its_Monuments%2C_Delhi-311234.jpg/1280px-Qutb_Minar_and_its_Monuments%2C_Delhi-311234.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Red_Fort_in_Delhi.jpg/1280px-Red_Fort_in_Delhi.jpg"
    ],
    "agra": [
        "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/India_Gate_in_New_Delhi_03-2016.jpg/1280px-India_Gate_in_New_Delhi_03-2016.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Qutb_Minar_and_its_Monuments%2C_Delhi-311234.jpg/1280px-Qutb_Minar_and_its_Monuments%2C_Delhi-311234.jpg"
    ],
    "ayodhya": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Ram_Janmbhoomi_Mandir%2C_Ayodhya_Dham.jpg/1280px-Ram_Janmbhoomi_Mandir%2C_Ayodhya_Dham.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Varanasi_Ghats_at_Night.jpg/1280px-Varanasi_Ghats_at_Night.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg"
    ],
    "andaman": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Radhanagar_Beach_Havelock_Island.jpg/1280px-Radhanagar_Beach_Havelock_Island.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Ross_Island%2C_Andaman.jpg/1280px-Ross_Island%2C_Andaman.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Andaman_Islands_Beach.jpg/1280px-Andaman_Islands_Beach.jpg"
    ],
    "port blair": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Radhanagar_Beach_Havelock_Island.jpg/1280px-Radhanagar_Beach_Havelock_Island.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Ross_Island%2C_Andaman.jpg/1280px-Ross_Island%2C_Andaman.jpg"
    ],
    "sikkim": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Kangchenjunga_from_Tiger_Hill.jpg/1280px-Kangchenjunga_from_Tiger_Hill.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Tsomgo_Lake_in_Sikkim.jpg/1280px-Tsomgo_Lake_in_Sikkim.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Rumtek_Monastery.jpg/1280px-Rumtek_Monastery.jpg"
    ],
    "bagdogra": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Kangchenjunga_from_Tiger_Hill.jpg/1280px-Kangchenjunga_from_Tiger_Hill.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Tsomgo_Lake_in_Sikkim.jpg/1280px-Tsomgo_Lake_in_Sikkim.jpg"
    ],
    "nepal": [
        "https://upload.wikimedia.org/wikipedia/commons/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Boudhanath_Stupa_in_Kathmandu.jpg/1280px-Boudhanath_Stupa_in_Kathmandu.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Patan_Durbar_Square.jpg/1280px-Patan_Durbar_Square.jpg"
    ],
    "kathmandu": [
        "https://upload.wikimedia.org/wikipedia/commons/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Boudhanath_Stupa_in_Kathmandu.jpg/1280px-Boudhanath_Stupa_in_Kathmandu.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Patan_Durbar_Square.jpg/1280px-Patan_Durbar_Square.jpg"
    ],
    "bhutan": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Tiger%27s_Nest_Bhutan.jpg/1280px-Tiger%27s_Nest_Bhutan.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Punakha_Dzong_-_Bhutan.jpg/1280px-Punakha_Dzong_-_Bhutan.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Thimphu_Valley.jpg/1280px-Thimphu_Valley.jpg"
    ],
    "thimphu": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Tiger%27s_Nest_Bhutan.jpg/1280px-Tiger%27s_Nest_Bhutan.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Punakha_Dzong_-_Bhutan.jpg/1280px-Punakha_Dzong_-_Bhutan.jpg"
    ],
    "shimla": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Sunset_view_-manali_to_shimla.jpg/1280px-Sunset_view_-manali_to_shimla.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pangong_Lake_in_Ladakh.jpg/1280px-Pangong_Lake_in_Ladakh.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Gulmarg_in_winter.jpg/1280px-Gulmarg_in_winter.jpg"
    ],
    "manali": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Sunset_view_-manali_to_shimla.jpg/1280px-Sunset_view_-manali_to_shimla.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pangong_Lake_in_Ladakh.jpg/1280px-Pangong_Lake_in_Ladakh.jpg"
    ],
    "dubai": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Dubai_Skylines_at_night_%28Pexels_3787839%29.jpg/1280px-Dubai_Skylines_at_night_%28Pexels_3787839%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Burj_Khalifa_night_2.jpg/1280px-Burj_Khalifa_night_2.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg/1280px-Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg"
    ],
    "maldives": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Radhanagar_Beach_Havelock_Island.jpg/1280px-Radhanagar_Beach_Havelock_Island.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Andaman_Islands_Beach.jpg/1280px-Andaman_Islands_Beach.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oia_sunset_-_panoramio_%282%29.jpg/1280px-Oia_sunset_-_panoramio_%282%29.jpg"
    ],
    "bali": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Radhanagar_Beach_Havelock_Island.jpg/1280px-Radhanagar_Beach_Havelock_Island.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg/1280px-%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oia_sunset_-_panoramio_%282%29.jpg/1280px-Oia_sunset_-_panoramio_%282%29.jpg"
    ],
    "singapore": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/1280px-Tower_Bridge_at_Dawn.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Dubai_Skylines_at_night_%28Pexels_3787839%29.jpg/1280px-Dubai_Skylines_at_night_%28Pexels_3787839%29.jpg"
    ],
    "mauritius": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Radhanagar_Beach_Havelock_Island.jpg/1280px-Radhanagar_Beach_Havelock_Island.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Andaman_Islands_Beach.jpg/1280px-Andaman_Islands_Beach.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oia_sunset_-_panoramio_%282%29.jpg/1280px-Oia_sunset_-_panoramio_%282%29.jpg"
    ],
    "europe": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Milan_Cathedral_from_Piazza_del_Duomo.jpg/3840px-Milan_Cathedral_from_Piazza_del_Duomo.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/1280px-Tower_Bridge_at_Dawn.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Titlis_W.jpg/1280px-Titlis_W.jpg"
    ],
    "russia": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/1280px-Tower_Bridge_at_Dawn.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Milan_Cathedral_from_Piazza_del_Duomo.jpg/3840px-Milan_Cathedral_from_Piazza_del_Duomo.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg"
    ],
    "bhubaneshwar": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Ram_Janmbhoomi_Mandir%2C_Ayodhya_Dham.jpg/1280px-Ram_Janmbhoomi_Mandir%2C_Ayodhya_Dham.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Varanasi_Ghats_at_Night.jpg/1280px-Varanasi_Ghats_at_Night.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg"
    ],
    "mumbai": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/India_Gate_in_New_Delhi_03-2016.jpg/1280px-India_Gate_in_New_Delhi_03-2016.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Qutb_Minar_and_its_Monuments%2C_Delhi-311234.jpg/1280px-Qutb_Minar_and_its_Monuments%2C_Delhi-311234.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Red_Fort_in_Delhi.jpg/1280px-Red_Fort_in_Delhi.jpg"
    ],
    "chennai": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Kerala_Backwaters_-_Alappuzha.jpg/1280px-Kerala_Backwaters_-_Alappuzha.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Munnar_hillstation_kerala.jpg/1280px-Munnar_hillstation_kerala.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Ram_Janmbhoomi_Mandir%2C_Ayodhya_Dham.jpg/1280px-Ram_Janmbhoomi_Mandir%2C_Ayodhya_Dham.jpg"
    ],
    "kolkata": [
        "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/India_Gate_in_New_Delhi_03-2016.jpg/1280px-India_Gate_in_New_Delhi_03-2016.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Ram_Janmbhoomi_Mandir%2C_Ayodhya_Dham.jpg/1280px-Ram_Janmbhoomi_Mandir%2C_Ayodhya_Dham.jpg"
    ]
}

FALLBACK_IMAGES = [
    "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oia_sunset_-_panoramio_%282%29.jpg/1280px-Oia_sunset_-_panoramio_%282%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg/1280px-Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg"
]

with open('src/data/mnm_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

for pkg in db['packages']:
    term = (pkg.get('destination') or pkg.get('location', '')).lower()
    if not term or "itineraries" in term:
        term = pkg.get('name', '').lower()
        
    imgs = []
    # Find matching keyword
    for key, urls in IMAGE_MAP.items():
        if key in term:
            imgs = urls
            break
            
    if not imgs:
        imgs = FALLBACK_IMAGES
        
    def get_img(index):
        return imgs[index % len(imgs)]
        
    pkg['image_url'] = get_img(0)
    pkg['img'] = get_img(0)
    pkg['image'] = get_img(0)
    pkg['heroImage'] = get_img(1)
    
    if 'gallery' in pkg:
        pkg['gallery'] = [get_img(2), get_img(3)]
        
    if 'images' in pkg:
        pkg['images'] = [get_img(i) for i in range(len(pkg['images']))]

with open('src/data/mnm_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2)

print("Successfully replaced all images locally!")
