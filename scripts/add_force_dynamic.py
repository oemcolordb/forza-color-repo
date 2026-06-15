import os
import glob

app_dir = r"C:\Users\xxx\Documents\GitHub\forza-color-repo\app"
files = glob.glob(os.path.join(app_dir, "**", "page.tsx"), recursive=True)

# Pages that need force-dynamic because they use auth or browser APIs
problematic = [
    "blog",
    "mobile-dash",
    "favorites",
    "profile",
    "garage",
    "image-match",
    "livery-hub",
    "community",
    "telemetry",
    "login",
    "signup",
    "forgot-password",
    "reset-password",
    "dev/analytics",
    "dev/sw-diagnostics",
    "tuneforge",
]

for file in files:
    # Normalize path separators
    norm = file.replace("\\", "/")
    
    # Check if this page is in the problematic list
    match = any(p in norm for p in problematic)
    if not match:
        continue

    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    if "export const dynamic" in content:
        print(f"Already has dynamic: {file}")
        continue

    # Add after 'use client' directive if present
    if content.startswith("'use client'"):
        content = content.replace(
            "'use client'",
            "'use client'\n\nexport const dynamic = 'force-dynamic'",
            1
        )
    else:
        # Prepend to file
        content = "export const dynamic = 'force-dynamic'\n\n" + content

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Added force-dynamic: {file}")
