import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

old_logic = "const popularPackages = db.packages.slice(7, 10); // Pick 3"
new_logic = "const popularPackageIds = ['7', 'dubai-package', 'singapore-malayasia'];\n  const popularPackages = popularPackageIds.map(id => db.packages.find(p => p.id === id)).filter(Boolean) as typeof db.packages;"

data = data.replace(old_logic, new_logic)

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(data)
print("Updated popular packages logic!")
