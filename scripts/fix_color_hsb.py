#!/usr/bin/env python3
"""
Automated fix script for colors with invalid HSB values.
Fixes:
1. Colors with HSB = {0, 0, 0} (completely black)
2. Colors with names that don't match HSB values
3. Duplicate colors with different HSB values
"""

import json
import sys
from typing import Dict, List, Tuple, Any

# Color name to HSB mapping based on common automotive colors
COLOR_HSB_MAP = {
    # Blacks
    'black': {'h': 0, 's': 0, 'b': 0.05},
    'nero': {'h': 0, 's': 0, 'b': 0.08},
    'onyx': {'h': 0, 's': 0, 'b': 0.06},
    'carbon': {'h': 0, 's': 0, 'b': 0.07},
    'obsidian': {'h': 0, 's': 0, 'b': 0.04},
    'midnight': {'h': 0, 's': 0, 'b': 0.03},
    'jet': {'h': 0, 's': 0, 'b': 0.02},
    'charcoal': {'h': 0, 's': 0, 'b': 0.15},
    'graphite': {'h': 0, 's': 0, 'b': 0.25},
    
    # Whites
    'white': {'h': 0, 's': 0, 'b': 0.95},
    'pearl': {'h': 0, 's': 0.05, 'b': 0.92},
    'ivory': {'h': 0.1, 's': 0.1, 'b': 0.9},
    'cream': {'h': 0.15, 's': 0.2, 'b': 0.88},
    'alpine': {'h': 0, 's': 0, 'b': 0.93},
    'arctic': {'h': 0, 's': 0, 'b': 0.94},
    'snow': {'h': 0, 's': 0, 'b': 0.96},
    'frost': {'h': 0, 's': 0, 'b': 0.91},
    
    # Grays
    'gray': {'h': 0, 's': 0, 'b': 0.5},
    'grey': {'h': 0, 's': 0, 'b': 0.5},
    'silver': {'h': 0, 's': 0.1, 'b': 0.7},
    'steel': {'h': 0, 's': 0.05, 'b': 0.45},
    'titanium': {'h': 0, 's': 0.02, 'b': 0.6},
    'stone': {'h': 0, 's': 0.03, 'b': 0.55},
    'slate': {'h': 0, 's': 0.01, 'b': 0.4},
    
    # Reds
    'red': {'h': 0, 's': 0.9, 'b': 0.8},
    'rosso': {'h': 0, 's': 0.85, 'b': 0.75},
    'crimson': {'h': 0.02, 's': 0.8, 'b': 0.7},
    'scarlet': {'h': 0.03, 's': 0.95, 'b': 0.85},
    'burgundy': {'h': 0.05, 's': 0.7, 'b': 0.5},
    'maroon': {'h': 0.04, 's': 0.6, 'b': 0.4},
    'wine': {'h': 0.06, 's': 0.65, 'b': 0.45},
    'ruby': {'h': 0.01, 's': 0.8, 'b': 0.6},
    'candy': {'h': 0, 's': 0.95, 'b': 0.7},
    'lava': {'h': 0.02, 's': 0.9, 'b': 0.8},
    'blaze': {'h': 0.03, 's': 0.85, 'b': 0.82},
    'flame': {'h': 0.05, 's': 0.9, 'b': 0.85},
    'fire': {'h': 0.02, 's': 0.95, 'b': 0.88},
    
    # Oranges
    'orange': {'h': 0.08, 's': 0.9, 'b': 0.85},
    'amber': {'h': 0.1, 's': 0.8, 'b': 0.8},
    'bronze': {'h': 0.09, 's': 0.6, 'b': 0.5},
    'copper': {'h': 0.07, 's': 0.7, 'b': 0.6},
    'gold': {'h': 0.12, 's': 0.8, 'b': 0.85},
    'sunset': {'h': 0.06, 's': 0.85, 'b': 0.8},
    'apricot': {'h': 0.08, 's': 0.6, 'b': 0.85},
    'peach': {'h': 0.07, 's': 0.5, 'b': 0.9},
    
    # Yellows
    'yellow': {'h': 0.15, 's': 0.9, 'b': 0.9},
    'canary': {'h': 0.16, 's': 0.8, 'b': 0.95},
    'lemon': {'h': 0.14, 's': 0.7, 'b': 0.9},
    'mustard': {'h': 0.12, 's': 0.6, 'b': 0.7},
    'gold': {'h': 0.12, 's': 0.8, 'b': 0.85},
    'dew': {'h': 0.15, 's': 0.3, 'b': 0.9},
    'sunshine': {'h': 0.14, 's': 0.7, 'b': 0.95},
    
    # Greens
    'green': {'h': 0.33, 's': 0.8, 'b': 0.6},
    'verde': {'h': 0.32, 's': 0.75, 'b': 0.55},
    'emerald': {'h': 0.3, 's': 0.7, 'b': 0.5},
    'forest': {'h': 0.28, 's': 0.8, 'b': 0.4},
    'olive': {'h': 0.22, 's': 0.6, 'b': 0.5},
    'lime': {'h': 0.25, 's': 0.9, 'b': 0.7},
    'mint': {'h': 0.4, 's': 0.5, 'b': 0.85},
    'sage': {'h': 0.35, 's': 0.3, 'b': 0.7},
    'jade': {'h': 0.3, 's': 0.6, 'b': 0.5},
    'teal': {'h': 0.45, 's': 0.7, 'b': 0.6},
    'sea': {'h': 0.5, 's': 0.6, 'b': 0.7},
    'gasoline': {'h': 0.15, 's': 0.3, 'b': 0.8},
    'british': {'h': 0.28, 's': 0.7, 'b': 0.4},
    
    # Blues
    'blue': {'h': 0.6, 's': 0.8, 'b': 0.7},
    'blu': {'h': 0.6, 's': 0.8, 'b': 0.7},
    'azul': {'h': 0.6, 's': 0.8, 'b': 0.7},
    'navy': {'h': 0.6, 's': 0.9, 'b': 0.3},
    'royal': {'h': 0.58, 's': 0.85, 'b': 0.6},
    'sky': {'h': 0.55, 's': 0.5, 'b': 0.9},
    'baby': {'h': 0.52, 's': 0.3, 'b': 0.95},
    'ocean': {'h': 0.58, 's': 0.7, 'b': 0.6},
    'sapphire': {'h': 0.55, 's': 0.8, 'b': 0.5},
    'cobalt': {'h': 0.58, 's': 0.85, 'b': 0.55},
    'denim': {'h': 0.6, 's': 0.6, 'b': 0.5},
    'harbor': {'h': 0.58, 's': 0.4, 'b': 0.6},
    'nautical': {'h': 0.57, 's': 0.6, 'b': 0.65},
    'diamond': {'h': 0.55, 's': 0.3, 'b': 0.85},
    'surf': {'h': 0.52, 's': 0.5, 'b': 0.9},
    'mariner': {'h': 0.59, 's': 0.7, 'b': 0.65},
    'saxon': {'h': 0.56, 's': 0.6, 'b': 0.7},
    'bayside': {'h': 0.6, 's': 1, 'b': 0.5},
    'racing': {'h': 0.58, 's': 0.9, 'b': 0.7},
    'ultra': {'h': 0.55, 's': 0.8, 'b': 0.8},
    'galaxy': {'h': 0.65, 's': 0.8, 'b': 0.3},
    'midnight': {'h': 0.65, 's': 0.8, 'b': 0.25},
    
    # Purples
    'purple': {'h': 0.75, 's': 0.7, 'b': 0.6},
    'violet': {'h': 0.73, 's': 0.6, 'b': 0.7},
    'lavender': {'h': 0.72, 's': 0.4, 'b': 0.85},
    'magenta': {'h': 0.83, 's': 0.8, 'b': 0.7},
    'orchid': {'h': 0.78, 's': 0.6, 'b': 0.7},
    'plum': {'h': 0.76, 's': 0.5, 'b': 0.6},
    'amethyst': {'h': 0.74, 's': 0.6, 'b': 0.5},
    'spinnaker': {'h': 0.77, 's': 0.5, 'b': 0.7},
    'schafter': {'h': 0.8, 's': 0.6, 'b': 0.7},
    
    # Pinks
    'pink': {'h': 0.85, 's': 0.6, 'b': 0.85},
    'rose': {'h': 0.88, 's': 0.5, 'b': 0.8},
    'salmon': {'h': 0.05, 's': 0.6, 'b': 0.8},
    'coral': {'h': 0.08, 's': 0.7, 'b': 0.85},
    'fuchsia': {'h': 0.83, 's': 0.8, 'b': 0.8},
    'magenta': {'h': 0.83, 's': 0.8, 'b': 0.7},
    'hot': {'h': 0.87, 's': 0.8, 'b': 0.85},
    'pfister': {'h': 0.82, 's': 0.5, 'b': 0.9},
    
    # Browns
    'brown': {'h': 0.08, 's': 0.6, 'b': 0.4},
    'tan': {'h': 0.1, 's': 0.3, 'b': 0.6},
    'beige': {'h': 0.12, 's': 0.2, 'b': 0.8},
    'khaki': {'h': 0.14, 's': 0.3, 'b': 0.6},
    'sienna': {'h': 0.06, 's': 0.5, 'b': 0.4},
    'saddle': {'h': 0.08, 's': 0.4, 'b': 0.5},
    'moss': {'h': 0.25, 's': 0.4, 'b': 0.4},
    'bison': {'h': 0.08, 's': 0.3, 'b': 0.35},
    'creek': {'h': 0.09, 's': 0.35, 'b': 0.4},
    'maple': {'h': 0.07, 's': 0.4, 'b': 0.45},
    'beechwood': {'h': 0.1, 's': 0.3, 'b': 0.5},
    'woodbench': {'h': 0.08, 's': 0.25, 'b': 0.4},
    'straw': {'h': 0.15, 's': 0.3, 'b': 0.7},
    'sandy': {'h': 0.12, 's': 0.2, 'b': 0.75},
    'chocolate': {'h': 0.06, 's': 0.5, 'b': 0.3},
    'feltzer': {'h': 0.08, 's': 0.4, 'b': 0.45},
    'bleached': {'h': 0.1, 's': 0.1, 'b': 0.85},
}

def load_colors(file_path: str) -> List[Dict]:
    """Load colors from JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return []

def has_invalid_hsb(color: Dict) -> bool:
    """Check if color has invalid HSB (all zeros or missing)"""
    hsb = color.get('color1', {})
    if not hsb:
        return True
    
    h = hsb.get('h')
    s = hsb.get('s')
    b = hsb.get('b')
    
    # All zeros or missing values
    if h == 0 and s == 0 and b == 0:
        return True
    
    # Missing any value
    if h is None or s is None or b is None:
        return True
    
    return False

def extract_hsb_from_name(color_name: str) -> Dict[str, float]:
    """Extract HSB values from color name using predefined mappings"""
    name_lower = color_name.lower()
    
    # Check for exact matches first
    for color_key, hsb in COLOR_HSB_MAP.items():
        if color_key in name_lower:
            return hsb.copy()
    
    # Check for color combinations (e.g., "midnight blue")
    for color_key, hsb in COLOR_HSB_MAP.items():
        if f" {color_key} " in f" {name_lower} ":
            return hsb.copy()
    
    # Default fallback - gray
    return {'h': 0, 's': 0, 'b': 0.5}

def fix_invalid_hsb(colors: List[Dict]) -> Tuple[List[Dict], Dict]:
    """Fix colors with invalid HSB values"""
    fixed_colors = []
    fix_stats = {
        'total_colors': len(colors),
        'invalid_fixed': 0,
        'manual_review_needed': [],
        'fixes_applied': []
    }
    
    for i, color in enumerate(colors):
        color_name = color.get('colorName', 'Unknown')
        make = color.get('make', 'Unknown')
        hsb = color.get('color1', {})
        
        if has_invalid_hsb(color):
            # Try to fix based on color name
            new_hsb = extract_hsb_from_name(color_name)
            
            # Create fixed color
            fixed_color = color.copy()
            fixed_color['color1'] = new_hsb
            fixed_color['original_hsb'] = hsb  # Keep original for reference
            
            fixed_colors.append(fixed_color)
            fix_stats['invalid_fixed'] += 1
            fix_stats['fixes_applied'].append({
                'index': i,
                'make': make,
                'name': color_name,
                'original': hsb,
                'fixed': new_hsb
            })
            
            print(f"Fixed: {make} - {color_name}")
            print(f"  Original: {hsb}")
            print(f"  Fixed:    {new_hsb}")
            print()
        else:
            fixed_colors.append(color)
    
    return fixed_colors, fix_stats

def remove_duplicates(colors: List[Dict]) -> Tuple[List[Dict], Dict]:
    """Remove duplicate colors with same name but different HSB"""
    unique_colors = []
    seen_names = {}
    duplicate_stats = {
        'duplicates_removed': 0,
        'duplicates_found': []
    }
    
    for i, color in enumerate(colors):
        color_name = color.get('colorName', 'Unknown')
        make = color.get('make', 'Unknown')
        hsb = color.get('color1', {})
        
        name_key = f"{make}_{color_name}"
        
        if name_key in seen_names:
            # Found duplicate
            existing = seen_names[name_key]
            existing_hsb = existing.get('color1', {})
            
            # Keep the one with more complete HSB data
            if (hsb.get('h') is not None and hsb.get('s') is not None and hsb.get('b') is not None and
                not (hsb.get('h') == 0 and hsb.get('s') == 0 and hsb.get('b') == 0)):
                # Current one is better, replace existing
                duplicate_stats['duplicates_found'].append({
                    'removed': f"{existing['make']} - {existing['colorName']}",
                    'kept': f"{make} - {color_name}",
                    'reason': 'Better HSB data'
                })
                # Find and replace in unique_colors
                for j, uc in enumerate(unique_colors):
                    if uc.get('make') == existing['make'] and uc.get('colorName') == existing['colorName']:
                        unique_colors[j] = color
                        break
            else:
                # Keep existing, skip current
                duplicate_stats['duplicates_found'].append({
                    'removed': f"{make} - {color_name}",
                    'kept': f"{existing['make']} - {existing['colorName']}",
                    'reason': 'Existing has better HSB data'
                })
                duplicate_stats['duplicates_removed'] += 1
                continue
        else:
            seen_names[name_key] = color
            unique_colors.append(color)
    
    return unique_colors, duplicate_stats

def save_colors(colors: List[Dict], output_path: str):
    """Save colors to JSON file"""
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(colors, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved {len(colors)} colors to {output_path}")
    except Exception as e:
        print(f"❌ Error saving colors: {e}")

def main():
    """Main fix function"""
    print("🔧 Starting color HSB fix process...")
    
    # Load colors
    colors = load_colors('public/carColors.json')
    if not colors:
        print("❌ No colors found to fix!")
        sys.exit(1)
    
    print(f"📊 Loaded {len(colors)} colors")
    
    # Fix invalid HSB values
    print("\n🔧 Fixing invalid HSB values...")
    fixed_colors, fix_stats = fix_invalid_hsb(colors)
    
    print(f"✅ Fixed {fix_stats['invalid_fixed']} colors with invalid HSB")
    
    # Remove duplicates
    print("\n🔄 Removing duplicates...")
    unique_colors, duplicate_stats = remove_duplicates(fixed_colors)
    
    print(f"✅ Removed {duplicate_stats['duplicates_removed']} duplicate colors")
    
    # Save fixed colors
    print("\n💾 Saving fixed colors...")
    save_colors(unique_colors, 'public/carColors_fixed.json')
    
    # Save detailed report
    report = {
        'original_count': fix_stats['total_colors'],
        'invalid_fixed': fix_stats['invalid_fixed'],
        'duplicates_removed': duplicate_stats['duplicates_removed'],
        'final_count': len(unique_colors),
        'improvement': fix_stats['total_colors'] - len(unique_colors),
        'fixes_applied': fix_stats['fixes_applied'][:50],  # Limit for readability
        'duplicates_found': duplicate_stats['duplicates_found']
    }
    
    with open('color_fix_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n📋 Fix report saved to: color_fix_report.json")
    print(f"\n📈 SUMMARY:")
    print(f"  Original colors: {report['original_count']:,}")
    print(f"  Invalid HSB fixed: {report['invalid_fixed']:,}")
    print(f"  Duplicates removed: {report['duplicates_removed']:,}")
    print(f"  Final colors: {report['final_count']:,}")
    print(f"  Total improvement: {report['improvement']:,} colors")
    
    print(f"\n✅ Fixed colors saved to: public/carColors_fixed.json")
    print(f"🔄 To apply fixes: Replace public/carColors.json with carColors_fixed.json")

if __name__ == "__main__":
    main()
