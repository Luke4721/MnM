import csv
import json
import uuid
import random

csv_text = """web_scraper_order,web_scraper_start_url,pagination,blog,modify,delete,category,status,display_home,faqs
"1788072917-1","https://mnmtravels.in/admin/blog/","","12 Jyotirlingas in India – Complete Guide to Lord Shiva’s Sacred Temples","Modify","Delete","India","Active","No","5"
"1788072917-2","https://mnmtravels.in/admin/blog/","","13 Must Visit Temples In Vrindavan | Temples in Vrindavan | Temples in Mathura","Modify","Delete","India","Active","No","5"
"1788072917-3","https://mnmtravels.in/admin/blog/","","5 Places to Visit in February with Better AQI within 200 Km from Delhi","Modify","Delete","India","Active","No","3"
"1788072917-4","https://mnmtravels.in/admin/blog/","","Adalaj Stepwell, Gandhinagar - The Timeless Beauty of Queen Rudabai’s Creation","Modify","Delete","India","Active","No","5"
"1788072917-5","https://mnmtravels.in/admin/blog/","","Adventure & Activity-Based Trips from Delhi","Modify","Delete","India","Active","No","5"
"1788072917-6","https://mnmtravels.in/admin/blog/","","Adventure Activities in Rishikesh - Rafting, Bungee, Trekking & More","Modify","Delete","India","Active","No","5"
"1788072917-7","https://mnmtravels.in/admin/blog/","","Adī-Kadi Vav & Navghan Kuvo - Ancient Stepwells of Junagadh","Modify","Delete","India","Active","No","5"
"1788072917-8","https://mnmtravels.in/admin/blog/","","Agam Kuan, Patna - The Mysterious Ancient Well of Emperor Ashoka","Modify","Delete","India","Active","No","5"
"1788072917-9","https://mnmtravels.in/admin/blog/","","Agra Fort - The Glorious Mughal Fortress of History & Power","Modify","Delete","India","Active","No","5"
"1788072917-10","https://mnmtravels.in/admin/blog/","","Agrasen ki Baoli Delhi – History, Timings & Mystery","Modify","Delete","India","Active","No","5"
"1788072917-11","https://mnmtravels.in/admin/blog/","","Ahmedabad: A journey through history, culture, and culinary delights","Modify","Delete","India","Active","No","6"
"1788072917-12","https://mnmtravels.in/admin/blog/","","Aina Mahal - The Palace of Mirrors in Bhuj","Modify","Delete","India","Active","No","5"
"1788072917-13","https://mnmtravels.in/admin/blog/","","Ajatshatru Fort, Rajgir - A Timeless Symbol of Magadha’s Power and Glory","Modify","Delete","India","Active","No","5"
"1788072917-14","https://mnmtravels.in/admin/blog/","","Ajmer: Where Spirituality Meets Heritage","Modify","Delete","India","Active","No","6"
"1788072917-15","https://mnmtravels.in/admin/blog/","","Ajwa Water Park & Gardens Vadodara - A Perfect Family Getaway for Fun and Relaxation","Modify","Delete","India","Active","No","5"
"1788072917-16","https://mnmtravels.in/admin/blog/","","Akshardham Temple Delhi - A Modern Wonder of Spirituality and Architecture,","Modify","Delete","India","Active","No","5"
"1788072917-17","https://mnmtravels.in/admin/blog/","","Akshardham Temple Gandhinagar - Swaminarayan Mandir & Spiritual Landmark of Gujarat","Modify","Delete","India","Active","No","5"
"1788072917-18","https://mnmtravels.in/admin/blog/","","All Saints’ Cathedral, Prayagraj - The “Patthar Girja” of Uttar Pradesh","Modify","Delete","India","Active","No","5"
"1788072917-19","https://mnmtravels.in/admin/blog/","","Allahabad Museum, Prayagraj - A Treasure House of Indian History & Art","Modify","Delete","India","Active","No","5"
"1788072917-20","https://mnmtravels.in/admin/blog/","","Alleppey Travel Guide  - Best Places to Visit in Kerala’s Venice of the East","Modify","Delete","India","Active","No","5"
"1788072917-21","https://mnmtravels.in/admin/blog/","","Almora – The Cultural Heart of Kumaon, Things to Do, Best Time to Visit & Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-22","https://mnmtravels.in/admin/blog/","","Alwar Travel Guide: History, Attractions & Things to Do","Modify","Delete","India","Active","No","5"
"1788072917-23","https://mnmtravels.in/admin/blog/","","Ambedkar Memorial Park, Lucknow - A Grand Symbol of Social Justice","Modify","Delete","India","Active","No","5"
"1788072917-24","https://mnmtravels.in/admin/blog/","","Amritsar: The Soul of Punjab Where Heritage Meets Heart","Modify","Delete","India","Active","No","5"
"1788072917-25","https://mnmtravels.in/admin/blog/","","Anamalai Tiger Reserve (Topslip) – Safari, Travel Guide & Best Time to Visit","Modify","Delete","India","Active","No","5"
"1788072917-26","https://mnmtravels.in/admin/blog/","","Anand Bhavan, Prayagraj - Home of India’s Freedom Struggle","Modify","Delete","India","Active","No","5"
"1788072917-27","https://mnmtravels.in/admin/blog/","","Anandpur Sahib: The Spiritual & Historical Heart of Sikhism","Modify","Delete","India","Active","No","5"
"1788072917-28","https://mnmtravels.in/admin/blog/","","Apharwat Peak in Gulmarg: Explore Kashmir’s Highest Snow Point & Gondola Experience","Modify","Delete","India","Active","No","6"
"1788072917-29","https://mnmtravels.in/admin/blog/","","Aravalli Biodiversity Park Delhi - Timings, Entry Fee, Attractions & Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-30","https://mnmtravels.in/admin/blog/","","Archaeological Museum, Bodh Gaya - A Treasure of Buddhist History and Art","Modify","Delete","India","Active","No","5"
"1788072917-31","https://mnmtravels.in/admin/blog/","","Ashoka Pillar, Sarnath - The Symbol of India’s Heritage and Buddhist Legacy","Modify","Delete","India","Active","No","4"
"1788072917-32","https://mnmtravels.in/admin/blog/","","Ashoka Rock Edicts, Junagadh - A Timeless Testament of India’s Glorious Past","Modify","Delete","India","Active","No","5"
"1788072917-33","https://mnmtravels.in/admin/blog/","","Assi Ghat Varanasi - Ganga Aarti, Activities, Timings & Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-34","https://mnmtravels.in/admin/blog/","","Athirapilly - The Niagara of India","Modify","Delete","India","Active","No","5"
"1788072917-35","https://mnmtravels.in/admin/blog/","","Attari-Wagah Border: Patriotic Experience You Must Witness","Modify","Delete","India","Active","No","5"
"1788072917-36","https://mnmtravels.in/admin/blog/","","Auli & Nearby Attractions in Uttarakhand","Modify","Delete","India","Active","No","5"
"1788072917-37","https://mnmtravels.in/admin/blog/","","Ayodhya: The Sacred City of Faith, Heritage & Devotion","Modify","Delete","India","Active","No","5"
"1788072917-38","https://mnmtravels.in/admin/blog/","","Bandhavgarh National Park - The Land of the Royal Bengal Tiger","Modify","Delete","India","Active","No","6"
"1788072917-39","https://mnmtravels.in/admin/blog/","","Banke Bihari Temple Vrindavan | History, Timings & Travel Tips","Modify","Delete","India","Active","No","5"
"1788072917-40","https://mnmtravels.in/admin/blog/","","Bapu Museum Delhi | History, Timings, Location & Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-41","https://mnmtravels.in/admin/blog/","","Bara Imambara, Lucknow - A Marvel of History and Architecture","Modify","Delete","India","Active","No","5"
"1788072917-42","https://mnmtravels.in/admin/blog/","","Barabar Caves, Gaya - India’s Oldest Rock-Cut Buddhist Caves","Modify","Delete","India","Active","No","5"
"1788072917-43","https://mnmtravels.in/admin/blog/","","Barda Hills Wildlife Sanctuary Porbandar - Explore Gujarat’s Hidden Nature Gem","Modify","Delete","India","Active","No","5"
"1788072917-44","https://mnmtravels.in/admin/blog/","","Barua Sagar Lake Jhansi, History, Viewpoints, Timings & Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-45","https://mnmtravels.in/admin/blog/","","Bathinda: A Historic City of Culture, Faith & Heritage","Modify","Delete","India","Active","No","5"
"1788072917-46","https://mnmtravels.in/admin/blog/","","Best Long Weekend Getaways from Delhi","Modify","Delete","India","Active","No","6"
"1788072917-47","https://mnmtravels.in/admin/blog/","","Best Nearby Excursions from Haridwar & Rishikesh - Neelkanth Mahadev, Kunjapuri Devi & Devprayag","Modify","Delete","India","Active","No","4"
"1788072917-48","https://mnmtravels.in/admin/blog/","","Best Places to Visit in Chail, Complete Travel Guide from Shimla & Beyond","Modify","Delete","India","Active","No","5"
"1788072917-49","https://mnmtravels.in/admin/blog/","","Best Places to Visit in Kasol & Tosh (Parvati Valley) Complete Travel Guide,","Modify","Delete","India","Active","No","5"
"1788072917-50","https://mnmtravels.in/admin/blog/","","Best Places to Visit in Kufri: Complete Travel Guide from Shimla & Beyond","Modify","Delete","India","Active","No","5"
"1788072917-51","https://mnmtravels.in/admin/blog/","","Best Places to Visit in Kullu, Complete Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-52","https://mnmtravels.in/admin/blog/","","Best Places to Visit in Manali, Complete Travel Guide 2025","Modify","Delete","India","Active","No","5"
"1788072917-53","https://mnmtravels.in/admin/blog/","","Best Places to Visit in Naggar, Complete Travel Guide for Naggar and Himachal Pradesh","Modify","Delete","India","Active","No","5"
"1788072917-54","https://mnmtravels.in/admin/blog/","","Best Places to Visit in Narkanda, Complete Travel Guide from Shimla & Beyond","Modify","Delete","India","Active","No","5"
"1788072917-55","https://mnmtravels.in/admin/blog/","","Best Places to Visit in Shimla, Complete Travel Guide from Delhi & Beyond","Modify","Delete","India","Active","No","5"
"1788072917-56","https://mnmtravels.in/admin/blog/","","Best Places to Visit Near Auli | Joshimath & Gorson Bugyal Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-57","https://mnmtravels.in/admin/blog/","","Bet Dwarka - The Sacred Island of Lord Krishna","Modify","Delete","India","Active","No","5"
"1788072917-58","https://mnmtravels.in/admin/blog/","","Betwa River & Kanchana Ghat, Orchha - A Peaceful Riverside Retreat","Modify","Delete","India","Active","No","5"
"1788072917-59","https://mnmtravels.in/admin/blog/","","Bhagsu & Dharamkot Travel Guide | Things to Do, Nearby Attractions & Best Time to Visit","Modify","Delete","India","Active","No","5"
"1788072917-60","https://mnmtravels.in/admin/blog/","","Bhalka Tirth, Somnath - The Sacred Site Where Lord Krishna Left His Mortal Body","Modify","Delete","India","Active","No","6"
"1788072917-61","https://mnmtravels.in/admin/blog/","","Bharat Darshan Park Delhi | Unique Theme Park with Iconic Monuments,","Modify","Delete","India","Active","No","5"
"1788072917-62","https://mnmtravels.in/admin/blog/","","Bharatpur Bird Sanctuary - A Paradise for Bird Lovers","Modify","Delete","India","Active","No","6"
"1788072917-63","https://mnmtravels.in/admin/blog/","","Bhartrihari Caves, Ujjain - A Mystical Retreat of Meditation and Legends","Modify","Delete","India","Active","No","5"
"1788072917-64","https://mnmtravels.in/admin/blog/","","Bhavnath Fair & Bhavnath Mahadev Temple, Junagadh - A Spiritual Celebration at the Foothills of Girnar","Modify","Delete","India","Active","No","5"
"1788072917-65","https://mnmtravels.in/admin/blog/","","Bhimashankar Jyotirlinga - The Sacred Temple of Lord Shiva in Maharashtra","Modify","Delete","India","Active","No","5"
"1788072917-66","https://mnmtravels.in/admin/blog/","","Bhimtal & Sattal near Nainital. Discover boating, birdwatching, history, best time to visit, things to do, nearby attractions, and travel tips.","Modify","Delete","India","Active","No","5"
"1788072917-67","https://mnmtravels.in/admin/blog/","","Bhopal: The City of Lakes - A Complete Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-68","https://mnmtravels.in/admin/blog/","","BHU Campus, Varanasi - A Green, Grand & Historic World Within a City","Modify","Delete","India","Active","No","5"
"1788072917-69","https://mnmtravels.in/admin/blog/","","Bhubaneswar - The Temple City of India | Complete Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-70","https://mnmtravels.in/admin/blog/","","Bhuj, Kutch - The Gateway to Gujarat’s White Desert","Modify","Delete","India","Active","No","5"
"1788072917-71","https://mnmtravels.in/admin/blog/","","Bhujodi Village - The Handicraft Hub of Kutch","Modify","Delete","India","Active","No","5"
"1788072917-72","https://mnmtravels.in/admin/blog/","","Bihar - The Land of Ancient Wisdom and Spiritual Heritage","Modify","Delete","India","Active","No","6"
"1788072917-73","https://mnmtravels.in/admin/blog/","","Bihar Museum, Patna - A Modern Gateway to the State’s Glorious Past","Modify","Delete","India","Active","No","5"
"1788072917-74","https://mnmtravels.in/admin/blog/","","Bikaner: The Hidden Gem of Rajasthan You Must Explore","Modify","Delete","India","Active","No","6"
"1788072917-75","https://mnmtravels.in/admin/blog/","","Bir Billing - The Paragliding Capital of India","Modify","Delete","India","Active","No","5"
"1788072917-76","https://mnmtravels.in/admin/blog/","","Birla Mandir Delhi - Timings, History & Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-77","https://mnmtravels.in/admin/blog/","","Birla Mandir Mathura - Complete Visiting & Travel Guide","Modify","Delete","India","Active","No","5"
"1788072917-78","https://mnmtravels.in/admin/blog/","","Bodh Gaya - The Land of Enlightenment","Modify","Delete","India","Active","No","5"
"1788072917-79","https://mnmtravels.in/admin/blog/","","Bodhi Tree - The Sacred Tree of Enlightenment","Modify","Delete","India","Active","No","5"
"1788072917-80","https://mnmtravels.in/admin/blog/","","British Residency, Lucknow - A Historic Landmark of the 1857 Revolt","Modify","Delete","India","Active","No","5"
"""

images = [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1514222134-b57c58ce2452?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920'
]

blogs = []
lines = csv_text.strip().split('\n')[1:]
for line in lines:
    parts = list(csv.reader([line]))[0]
    if len(parts) >= 4:
        title = parts[3]
        slug = title.lower().replace(' ', '-').replace(',', '').replace('|', '').replace('&', 'and')[:50]
        if slug.endswith('-'): slug = slug[:-1]
        
        blogs.append({
            'id': str(uuid.uuid4()),
            'slug': slug,
            'title': title,
            'excerpt': 'Discover the hidden secrets and essential travel tips for this incredible destination. Read our comprehensive guide to make the most of your journey and uncover unforgettable experiences.',
            'content': '',
            'author': 'MNM Team',
            'date': 'Aug 2026',
            'readTime': '5 min read',
            'image': random.choice(images),
            'category': parts[6] if len(parts) > 6 else 'Travel'
        })

with open('src/data/blogs_database.json', 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2, ensure_ascii=False)
