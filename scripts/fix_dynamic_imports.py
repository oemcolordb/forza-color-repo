import os
import glob
import re

app_dir = r"C:\Users\xxx\Documents\GitHub\forza-color-repo\app"
files = glob.glob(os.path.join(app_dir, "**", "page.tsx"), recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace () => Promise.resolve(Component) with () => Promise.resolve({ default: Component })
    new_content = re.sub(
        r'\(\)\s*=>\s*Promise\.resolve\(([^)]+)\)',
        r'() => Promise.resolve({ default: \1 })',
        content
    )
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {file}")
