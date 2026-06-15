import os, glob

# Map of component to its new path
import_map = {
    'TokyoBackground': '@/components/backgrounds/TokyoBackground',
    'CreditsBackground': '@/components/backgrounds/CreditsBackground',
    'Header': '@/components/layout/Header',
    'Footer': '@/components/layout/Footer',
    'ResponsiveLayout': '@/components/layout/ResponsiveLayout',
    'Breadcrumbs': '@/components/layout/Breadcrumbs',
    'PostModal': '@/components/ui/PostModal',
    'AuthModal': '@/components/ui/AuthModal',
    'Button': '@/components/ui/Button',
    'DialogShell': '@/components/ui/DialogShell',
    'GlassCard': '@/components/ui/GlassCard',
    'LoadingOverlay': '@/components/ui/LoadingOverlay',
    'LoadingSpinner': '@/components/ui/LoadingSpinner',
    'MicroInteractions': '@/components/ui/MicroInteractions',
    'Neumorphic': '@/components/ui/Neumorphic',
    'SimpleColorGrid': '@/components/color/SimpleColorGrid',
    'VirtualColorGrid': '@/components/color/VirtualColorGrid',
    'OptimizedSearchControls': '@/components/color/OptimizedSearchControls',
    'OptimizedStatsBar': '@/components/system/OptimizedStatsBar',
    'SoundtrackPlayer': '@/components/system/SoundtrackPlayer',
    'TelemetryDashboard': '@/components/system/TelemetryDashboard',
    'TelemetryMap': '@/components/system/TelemetryMap',
    'TelemetryPanel': '@/components/system/TelemetryPanel',
    'GamingErrorBoundary': '@/components/system/GamingErrorBoundary',
    'GamingSEO': '@/components/seo/GamingSEO',
    'ForzaColorSheetSEO': '@/components/seo/ForzaColorSheetSEO',
    'StructuredData': '@/components/seo/StructuredData',
    'CommunityTrends': '@/components/seo/CommunityTrends',
    'ClientTransitionWrapper': '@/components/transitions/ClientTransitionWrapper',
    'PageTransitions': '@/components/transitions/PageTransitions',
    'TransitionGallery': '@/components/transitions/TransitionGallery',
    'TransitionWrapper': '@/components/transitions/TransitionWrapper',
    'ColorAnalyticsDashboard': '@/components/color/ColorAnalyticsDashboard',
    'ColorCard': '@/components/color/ColorCard',
    'ColorComparison': '@/components/color/ColorComparison',
    'ColorGenerator': '@/components/color/ColorGenerator',
    'ColorRouletteHarmony': '@/components/color/ColorRouletteHarmony',
    'HarmonyVisualizer': '@/components/color/HarmonyVisualizer',
    'ImageColorExtractor': '@/components/color/ImageColorExtractor',
    'LazyColorLoader': '@/components/color/LazyColorLoader',
    'RealTimeColorVisualizer': '@/components/color/RealTimeColorVisualizer'
}

lib_map = {
    'assetProtection': '@/lib/utils/assetProtection',
    'cache': '@/lib/utils/cache',
    'colorUtils': '@/lib/utils/colorUtils',
    'countryFlags': '@/lib/utils/countryFlags',
    'encryption': '@/lib/utils/encryption',
    'errorBoundary': '@/lib/utils/errorBoundary',
    'logger': '@/lib/utils/logger',
    'rateLimit': '@/lib/utils/rateLimit',
    'tuning-calculator': '@/lib/utils/tuning-calculator',
    'validation': '@/lib/utils/validation',
    'indexedDB': '@/lib/db/indexedDB',
    'db': '@/lib/db/db',
    'databank': '@/lib/db/databank',
    'carDatabase': '@/lib/services/carDatabase',
    'colorData': '@/lib/services/colorData',
    'colorDataLazy': '@/lib/services/colorDataLazy',
    'firecrawl': '@/lib/services/firecrawl',
    'pythonApi': '@/lib/services/pythonApi',
    'telemetryBridge': '@/lib/services/telemetryBridge',
    'tursoApi': '@/lib/services/tursoApi'
}

files = glob.glob('app/**/*.tsx', recursive=True) + glob.glob('app/**/*.ts', recursive=True)

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    new_content = content
    for comp, new_path in import_map.items():
        new_content = new_content.replace(f"@/components/{comp}", new_path)
        new_content = new_content.replace(f"../components/{comp}", new_path)
        new_content = new_content.replace(f"../../components/{comp}", new_path)
        
    for comp, new_path in lib_map.items():
        new_content = new_content.replace(f"@/lib/{comp}", new_path)
        new_content = new_content.replace(f"../lib/{comp}", new_path)
        new_content = new_content.replace(f"../../lib/{comp}", new_path)
        
    if content != new_content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Fixed {f}")
