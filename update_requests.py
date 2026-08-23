import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

# 1. Remove Prime destination grid
data = re.sub(r'\s*// Prime Destinations Logic \(8 items\)\n\s*const primeDestinations = db\.packages\.slice\(0, 8\);\s*// Pick 8', '', data)

prime_dest_ui_regex = re.compile(
    r'\{\/\* Phase 4: Prime Destinations Grid \*\/.*?(?:<div className="text-center mt-12">.*?<\/div>\s*<\/div>\s*<\/div>)',
    re.MULTILINE | re.DOTALL
)
data = prime_dest_ui_regex.sub('', data)

# 2. Change Airplane CTA image
old_cta_img = 'https://upload.wikimedia.org/wikipedia/commons/7/76/Wing.two.arp.600pix.jpg'
new_cta_img = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Clouds_disappearing_into_a_darkening_blue_sky_over_an_airplane_wing.jpg'
data = data.replace(old_cta_img, new_cta_img)

# 3. Change ALEXANDER text to MONKS & MONKEYS in smaller font, dark mode orange
old_alex = '<div className="absolute top-1/2 -translate-y-1/2 -left-12 -z-0 text-gray-100 dark:text-zinc-800 font-serif text-9xl tracking-tighter select-none rotate-90 opacity-50">\n                 ALEXANDER\n               </div>'
new_alex = '<div className="absolute top-1/2 -translate-y-1/2 -left-12 -z-0 text-gray-100 dark:text-[#D97736] font-serif text-7xl tracking-widest select-none rotate-90 opacity-50 dark:opacity-20 whitespace-nowrap">\n                 MONKS & MONKEYS\n               </div>'
data = data.replace(old_alex, new_alex)

# Ensure no syntax errors and save
with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(data)
print("Updated successfully!")
