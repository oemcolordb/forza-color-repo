import os
import glob
import re

app_dir = r"C:\Users\xxx\Documents\GitHub\forza-color-repo\app"
files = glob.glob(os.path.join(app_dir, "**", "*.ts"), recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "@/lib/db/db/db" in content:
        content = content.replace("@/lib/db/db/db", "@/lib/db/db")
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file}")
