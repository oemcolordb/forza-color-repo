import os
import glob
import re

app_dir = r"C:\Users\xxx\Documents\GitHub\forza-color-repo\app"
files = glob.glob(os.path.join(app_dir, "**", "page.tsx"), recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove the orphaned `, { ssr: false } )` pattern
    content = re.sub(r",\s*\{\s*ssr:\s*false\s*\}\s*\)", "", content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Cleaned {file}")
