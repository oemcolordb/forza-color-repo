import os
import glob
import re

app_dir = r"C:\Users\xxx\Documents\GitHub\forza-color-repo\app"
files = glob.glob(os.path.join(app_dir, "**", "page.tsx"), recursive=True)

# We want to replace this structure:
# import dynamic from 'next/dynamic'
# const Dynamic... = dynamic(() => Promise.resolve({ default: ... }), { ssr: false })
# export default function ...Page() { return <Dynamic... /> }

# with:
# import ClientOnly from '@/components/system/ClientOnly'
# export default function ...Page() { return <ClientOnly><...Inner /></ClientOnly> }

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "Promise.resolve({ default:" in content and "next/dynamic" in content:
        # 1. Replace dynamic import with ClientOnly import
        content = re.sub(r"import\s+dynamic\s+from\s+['\"]next/dynamic['\"]", "import ClientOnly from '@/components/system/ClientOnly'", content)
        
        # 2. Extract Inner component name
        inner_match = re.search(r"Promise\.resolve\(\{\s*default:\s*([a-zA-Z0-9_]+)\s*\}\)", content)
        if inner_match:
            inner_name = inner_match.group(1)
            
            # 3. Remove the dynamic declaration
            content = re.sub(r"const\s+Dynamic[a-zA-Z0-9_]+\s*=\s*dynamic\([^)]+\)[^)]+\)", "", content, flags=re.DOTALL)
            
            # 4. Find the export default function and replace the <Dynamic... /> with <ClientOnly><InnerName /></ClientOnly>
            # The export default might be wrapping it in other elements
            # Just replace <Dynamic... /> with <ClientOnly><InnerName /></ClientOnly>
            dynamic_tag_match = re.search(r"<Dynamic([a-zA-Z0-9_]+)[^>]*/>", content)
            if dynamic_tag_match:
                dynamic_tag = dynamic_tag_match.group(0)
                content = content.replace(dynamic_tag, f"<ClientOnly>\n        <{inner_name} />\n      </ClientOnly>")
                
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Refactored {file}")
