import os

files = [
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\components\color\ColorCard.tsx",
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\components\error\GamingErrorBoundary.tsx",
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\components\layout\Header.tsx",
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\components\seo\GamingSEO.tsx",
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\components\color\MobileColorStats.js",
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\components\system\ExportButton.js",
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\components\system\ModelBrowser.js",
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\app\components\MobileGamingOptimizer.tsx",
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\app\location-finder\LocationCard.tsx",
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\app\location-finder\MapDisplay.tsx",
]

for file in files:
    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    content = "'use client'\n\n" + content
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Added 'use client' to: {file}")
