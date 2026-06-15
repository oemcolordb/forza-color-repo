import re

with open(r'c:\Users\xxx\Documents\GitHub\forza-color-repo\app\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace local imports with @ aliases based on the correct structure
content = content.replace("from './types'", "from '@/types'")
content = content.replace("from './lib/errorBoundary'", "from '@/lib/utils/errorBoundary'")
content = content.replace("from './lib/cache'", "from '@/lib/utils/cache'")
content = content.replace("from './lib/validation'", "from '@/lib/utils/validation'")
content = content.replace("from './lib/indexedDB'", "from '@/lib/utils/indexedDB'")
content = content.replace("from './lib/assetProtection'", "from '@/lib/utils/assetProtection'")

content = content.replace("from './components/Header'", "from '@/components/layout/Header'")
content = content.replace("from './components/Footer'", "from '@/components/layout/Footer'")

content = content.replace("from './components/SimpleColorGrid'", "from '@/components/color/SimpleColorGrid'")
content = content.replace("from './components/VirtualColorGrid'", "from '@/components/color/VirtualColorGrid'")

content = content.replace("from './components/OptimizedSearchControls'", "from '@/components/system/OptimizedSearchControls'")
content = content.replace("from './components/ResponsiveLayout'", "from '@/components/layout/ResponsiveLayout'")
content = content.replace("from './components/TokyoBackground'", "from '@/components/ui/TokyoBackground'")
content = content.replace("from './components/CreditsBackground'", "from '@/components/ui/CreditsBackground'")

content = content.replace("from './hooks/", "from '@/hooks/")

content = content.replace("from './components/ProgressiveLoader'", "from '@/components/system/ProgressiveLoader'")
content = content.replace("from './components/GamingErrorBoundary'", "from '@/components/error/GamingErrorBoundary'")
content = content.replace("from './components/GamingSEO'", "from '@/components/seo/GamingSEO'")
content = content.replace("from './components/MobileGamingOptimizer'", "from '@/components/system/MobileGamingOptimizer'")
content = content.replace("from './components/ForzaColorSheetSEO'", "from '@/components/seo/ForzaColorSheetSEO'")
content = content.replace("from './components/StatusAlert'", "from '@/components/system/StatusAlert'")
content = content.replace("from './components/KeyboardShortcuts'", "from '@/components/system/KeyboardShortcuts'")
content = content.replace("from './components/OfflineIndicator'", "from '@/components/system/OfflineIndicator'")

content = content.replace("import('./components/ImageColorExtractor')", "import('@/components/color/ImageColorExtractor')")
content = content.replace("import('./components/AdvancedTools')", "import('@/components/color/AdvancedTools')")
content = content.replace("import('./components/ColorComparison')", "import('@/components/color/ColorComparison')")
content = content.replace("import('./components/HSBPopup')", "import('@/components/color/HSBPopup')")
content = content.replace("import('./components/ColorRouletteHarmony')", "import('@/components/color/ColorRouletteHarmony')")
content = content.replace("import('./components/HarmonyVisualizer')", "import('@/components/color/HarmonyVisualizer')")
content = content.replace("import('./components/ColorGenerator')", "import('@/components/color/ColorGenerator')")
content = content.replace("import('./components/PerformanceMonitor')", "import('@/components/system/PerformanceMonitor')")
content = content.replace("import('./components/ColorAnalyticsDashboard')", "import('@/components/seo/ColorAnalyticsDashboard')")
content = content.replace("import('./components/CommunityTrends')", "import('@/components/seo/CommunityTrends')")


with open(r'c:\Users\xxx\Documents\GitHub\forza-color-repo\app\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
