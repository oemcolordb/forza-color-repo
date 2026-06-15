import re

with open(r'c:\Users\xxx\Documents\GitHub\forza-color-repo\app\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the incorrect ones:
content = content.replace("from '@/lib/utils/indexedDB'", "from '@/lib/db/indexedDB'")
content = content.replace("from '@/components/system/OptimizedSearchControls'", "from '@/components/color/OptimizedSearchControls'")
content = content.replace("from '@/components/ui/TokyoBackground'", "from '@/components/backgrounds/TokyoBackground'")
content = content.replace("from '@/components/ui/CreditsBackground'", "from '@/components/backgrounds/CreditsBackground'")
content = content.replace("from '@/components/system/MobileGamingOptimizer'", "from '@/app/components/MobileGamingOptimizer'")

with open(r'c:\Users\xxx\Documents\GitHub\forza-color-repo\app\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
