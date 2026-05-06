#!/usr/bin/env python3
"""
Enhanced fix script for name-HSB mismatches.
Fixes colors where the name doesn't match the HSB values.
"""

import json
import sys
import re
from typing import Dict, List, Tuple, Any

# Enhanced color name to HSB mapping with more precision
ENHANCED_COLOR_HSB_MAP = {
    # Blacks - various shades
    'black': {'h': 0, 's': 0, 'b': 0.05},
    'nero': {'h': 0, 's': 0, 'b': 0.08},
    'onyx': {'h': 0, 's': 0, 'b': 0.06},
    'carbon': {'h': 0, 's': 0, 'b': 0.07},
    'obsidian': {'h': 0, 's': 0, 'b': 0.04},
    'midnight': {'h': 0, 's': 0, 'b': 0.03},
    'jet': {'h': 0, 's': 0, 'b': 0.02},
    'charcoal': {'h': 0, 's': 0, 'b': 0.15},
    'graphite': {'h': 0, 's': 0, 'b': 0.25},
    'shadow': {'h': 0, 's': 0, 'b': 0.08},
    'ebony': {'h': 0, 's': 0, 'b': 0.04},
    'raven': {'h': 0, 's': 0, 'b': 0.06},
    'tuxedo': {'h': 0, 's': 0, 'b': 0.05},
    'phantom': {'h': 0, 's': 0, 'b': 0.07},
    
    # Whites - various shades
    'white': {'h': 0, 's': 0, 'b': 0.95},
    'pearl': {'h': 0, 's': 0.05, 'b': 0.92},
    'ivory': {'h': 0.1, 's': 0.1, 'b': 0.9},
    'cream': {'h': 0.15, 's': 0.2, 'b': 0.88},
    'alpine': {'h': 0, 's': 0, 'b': 0.93},
    'arctic': {'h': 0, 's': 0, 'b': 0.94},
    'snow': {'h': 0, 's': 0, 'b': 0.96},
    'frost': {'h': 0, 's': 0, 'b': 0.91},
    'polar': {'h': 0, 's': 0, 'b': 0.95},
    'diamond': {'h': 0, 's': 0.02, 'b': 0.93},
    
    # Grays/Silvers
    'gray': {'h': 0, 's': 0, 'b': 0.5},
    'grey': {'h': 0, 's': 0, 'b': 0.5},
    'silver': {'h': 0, 's': 0.1, 'b': 0.7},
    'steel': {'h': 0, 's': 0.05, 'b': 0.45},
    'titanium': {'h': 0, 's': 0.02, 'b': 0.6},
    'stone': {'h': 0, 's': 0.03, 'b': 0.55},
    'slate': {'h': 0, 's': 0.01, 'b': 0.4},
    'mineral': {'h': 0, 's': 0.05, 'b': 0.5},
    'gunmetal': {'h': 0, 's': 0.02, 'b': 0.35},
    'magnetic': {'h': 0, 's': 0.01, 'b': 0.4},
    
    # Reds - various shades
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
    'cherry': {'h': 0.01, 's': 0.85, 'b': 0.7},
    'garnet': {'h': 0.04, 's': 0.75, 'b': 0.5},
    'cabernet': {'h': 0.05, 's': 0.7, 'b': 0.45},
    'sunset': {'h': 0.06, 's': 0.85, 'b': 0.8},
    'grace': {'h': 0.02, 's': 0.8, 'b': 0.75},
    
    # Oranges - various shades
    'orange': {'h': 0.08, 's': 0.9, 'b': 0.85},
    'amber': {'h': 0.1, 's': 0.8, 'b': 0.8},
    'bronze': {'h': 0.09, 's': 0.6, 'b': 0.5},
    'copper': {'h': 0.07, 's': 0.7, 'b': 0.6},
    'gold': {'h': 0.12, 's': 0.8, 'b': 0.85},
    'apricot': {'h': 0.08, 's': 0.6, 'b': 0.85},
    'peach': {'h': 0.07, 's': 0.5, 'b': 0.9},
    'terracotta': {'h': 0.06, 's': 0.65, 'b': 0.6},
    'rust': {'h': 0.08, 's': 0.7, 'b': 0.5},
    'pumpkin': {'h': 0.09, 's': 0.85, 'b': 0.8},
    
    # Yellows - various shades
    'yellow': {'h': 0.15, 's': 0.9, 'b': 0.9},
    'canary': {'h': 0.16, 's': 0.8, 'b': 0.95},
    'lemon': {'h': 0.14, 's': 0.7, 'b': 0.9},
    'mustard': {'h': 0.12, 's': 0.6, 'b': 0.7},
    'dew': {'h': 0.15, 's': 0.3, 'b': 0.9},
    'sunshine': {'h': 0.14, 's': 0.7, 'b': 0.95},
    'dandelion': {'h': 0.13, 's': 0.8, 'b': 0.9},
    'buttercup': {'h': 0.15, 's': 0.75, 'b': 0.92},
    'modena': {'h': 0.13, 's': 0.85, 'b': 0.88},
    'phoenix': {'h': 0.14, 's': 0.9, 'b': 0.9},
    'rio': {'h': 0.13, 's': 0.8, 'b': 0.85},
    'indy': {'h': 0.13, 's': 0.85, 'b': 0.9},
    
    # Greens - various shades
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
    'brooklands': {'h': 0.33, 's': 0.7, 'b': 0.5},
    'canterbury': {'h': 0.32, 's': 0.75, 'b': 0.55},
    'cypress': {'h': 0.31, 's': 0.8, 'b': 0.6},
    'dark': {'h': 0.28, 's': 0.8, 'b': 0.4},
    'deep': {'h': 0.3, 's': 0.75, 'b': 0.45},
    'fir': {'h': 0.29, 's': 0.7, 'b': 0.5},
    'juniper': {'h': 0.32, 's': 0.6, 'b': 0.55},
    
    # Blues - various shades
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
    'surf': {'h': 0.52, 's': 0.5, 'b': 0.9},
    'mariner': {'h': 0.59, 's': 0.7, 'b': 0.65},
    'saxon': {'h': 0.56, 's': 0.6, 'b': 0.7},
    'bayside': {'h': 0.6, 's': 1, 'b': 0.5},
    'racing': {'h': 0.58, 's': 0.9, 'b': 0.7},
    'ultra': {'h': 0.55, 's': 0.8, 'b': 0.8},
    'galaxy': {'h': 0.65, 's': 0.8, 'b': 0.3},
    'midnight': {'h': 0.65, 's': 0.8, 'b': 0.25},
    'princess': {'h': 0.6, 's': 0.7, 'b': 0.75},
    
    # Purples - various shades
    'purple': {'h': 0.75, 's': 0.7, 'b': 0.6},
    'violet': {'h': 0.73, 's': 0.6, 'b': 0.7},
    'lavender': {'h': 0.72, 's': 0.4, 'b': 0.85},
    'magenta': {'h': 0.83, 's': 0.8, 'b': 0.7},
    'orchid': {'h': 0.78, 's': 0.6, 'b': 0.7},
    'plum': {'h': 0.76, 's': 0.5, 'b': 0.6},
    'amethyst': {'h': 0.74, 's': 0.6, 'b': 0.5},
    'spinnaker': {'h': 0.77, 's': 0.5, 'b': 0.7},
    'schafter': {'h': 0.8, 's': 0.6, 'b': 0.7},
    
    # Pinks - various shades
    'pink': {'h': 0.85, 's': 0.6, 'b': 0.85},
    'rose': {'h': 0.88, 's': 0.5, 'b': 0.8},
    'salmon': {'h': 0.05, 's': 0.6, 'b': 0.8},
    'coral': {'h': 0.08, 's': 0.7, 'b': 0.85},
    'fuchsia': {'h': 0.83, 's': 0.8, 'b': 0.8},
    'hot': {'h': 0.87, 's': 0.8, 'b': 0.85},
    'pfister': {'h': 0.82, 's': 0.5, 'b': 0.9},
    
    # Browns - various shades
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

def check_name_hsb_mismatch(color_name: str, hsb: Dict) -> List[str]:
    """Check if color name matches HSB values"""
    issues = []
    name_lower = color_name.lower()
    
    if not hsb:
        return ["Missing HSB data"]
    
    h = hsb.get('h', 0)
    s = hsb.get('s', 0)
    b = hsb.get('b', 0)
    
    # Enhanced color matching with better thresholds
    if 'black' in name_lower and b > 0.15:
        issues.append(f"Name says 'black' but brightness is {b:.2f}")
    
    if 'white' in name_lower and b < 0.8:
        issues.append(f"Name says 'white' but brightness is {b:.2f}")
    
    if ('gray' in name_lower or 'grey' in name_lower) and s > 0.2:
        issues.append(f"Name says 'gray' but saturation is {s:.2f}")
    
    if 'silver' in name_lower and (s < 0.05 or s > 0.3):
        issues.append(f"Name says 'silver' but saturation is {s:.2f}")
    
    if 'red' in name_lower and not (h < 0.08 or h >= 0.95):
        issues.append(f"Name says 'red' but hue is {h:.2f}")
    
    if 'blue' in name_lower and not (0.52 <= h < 0.68):
        issues.append(f"Name says 'blue' but hue is {h:.2f}")
    
    if 'green' in name_lower and not (0.25 <= h < 0.45):
        issues.append(f"Name says 'green' but hue is {h:.2f}")
    
    if 'yellow' in name_lower and not (0.12 <= h < 0.18):
        issues.append(f"Name says 'yellow' but hue is {h:.2f}")
    
    if 'orange' in name_lower and not (0.05 <= h < 0.12):
        issues.append(f"Name says 'orange' but hue is {h:.2f}")
    
    if 'purple' in name_lower and not (0.7 <= h < 0.85):
        issues.append(f"Name says 'purple' but hue is {h:.2f}")
    
    if 'pink' in name_lower and not (0.8 <= h < 0.9):
        issues.append(f"Name says 'pink' but hue is {h:.2f}")
    
    return issues

def extract_enhanced_hsb_from_name(color_name: str) -> Dict[str, float]:
    """Extract HSB values from color name using enhanced mappings"""
    name_lower = color_name.lower()
    
    # Check for multi-word color combinations (prioritize longer matches)
    color_matches = []
    
    # Find all color keywords in the name
    for color_key, hsb in ENHANCED_COLOR_HSB_MAP.items():
        if color_key in name_lower:
            # Calculate match score based on position and length
            position = name_lower.find(color_key)
            score = len(color_key) - (position / len(name_lower))
            color_matches.append((score, color_key, hsb))
    
    if color_matches:
        # Sort by score (higher score = better match)
        color_matches.sort(reverse=True)
        best_match = color_matches[0]
        return best_match[2].copy()
    
    # Default fallback - medium gray
    return {'h': 0, 's': 0, 'b': 0.5}

def fix_name_hsb_mismatches(colors: List[Dict]) -> Tuple[List[Dict], Dict]:
    """Fix colors with name-HSB mismatches"""
    fixed_colors = []
    fix_stats = {
        'total_colors': len(colors),
        'mismatches_found': 0,
        'mismatches_fixed': 0,
        'manual_review_needed': [],
        'fixes_applied': []
    }
    
    for i, color in enumerate(colors):
        color_name = color.get('colorName', 'Unknown')
        make = color.get('make', 'Unknown')
        hsb = color.get('color1', {})
        
        # Check for mismatches
        mismatches = check_name_hsb_mismatch(color_name, hsb)
        
        if mismatches:
            fix_stats['mismatches_found'] += 1
            
            # Try to fix based on enhanced color name analysis
            new_hsb = extract_enhanced_hsb_from_name(color_name)
            
            # Create fixed color
            fixed_color = color.copy()
            fixed_color['color1'] = new_hsb
            fixed_color['original_hsb'] = hsb  # Keep original for reference
            
            fixed_colors.append(fixed_color)
            fix_stats['mismatches_fixed'] += 1
            fix_stats['fixes_applied'].append({
                'index': i,
                'make': make,
                'name': color_name,
                'original': hsb,
                'fixed': new_hsb,
                'issues': mismatches
            })
            
            if len(fix_stats['fixes_applied']) <= 10:  # Show first 10 fixes
                print(f"Fixed: {make} - {color_name}")
                print(f"  Issues: {', '.join(mismatches)}")
                print(f"  Original: {hsb}")
                print(f"  Fixed:    {new_hsb}")
                print()
        else:
            fixed_colors.append(color)
    
    return fixed_colors, fix_stats

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
    print("🔧 Starting enhanced name-HSB mismatch fix process...")
    
    # Load colors
    colors = load_colors('public/carColors.json')
    if not colors:
        print("❌ No colors found to fix!")
        sys.exit(1)
    
    print(f"📊 Loaded {len(colors)} colors")
    
    # Fix name-HSB mismatches
    print("\n🔧 Fixing name-HSB mismatches...")
    fixed_colors, fix_stats = fix_name_hsb_mismatches(colors)
    
    print(f"✅ Found {fix_stats['mismatches_found']} mismatches")
    print(f"✅ Fixed {fix_stats['mismatches_fixed']} mismatches")
    
    # Save fixed colors
    print("\n💾 Saving fixed colors...")
    save_colors(fixed_colors, 'public/carColors_name_fixed.json')
    
    # Save detailed report
    report = {
        'original_count': fix_stats['total_colors'],
        'mismatches_found': fix_stats['mismatches_found'],
        'mismatches_fixed': fix_stats['mismatches_fixed'],
        'final_count': len(fixed_colors),
        'fixes_applied': fix_stats['fixes_applied'][:100],  # Limit for readability
    }
    
    with open('name_hsb_fix_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n📋 Fix report saved to: name_hsb_fix_report.json")
    print(f"\n📈 SUMMARY:")
    print(f"  Original colors: {report['original_count']:,}")
    print(f"  Mismatches found: {report['mismatches_found']:,}")
    print(f"  Mismatches fixed: {report['mismatches_fixed']:,}")
    print(f"  Final colors: {report['final_count']:,}")
    
    print(f"\n✅ Fixed colors saved to: public/carColors_name_fixed.json")
    print(f"🔄 To apply fixes: Replace public/carColors.json with carColors_name_fixed.json")

if __name__ == "__main__":
    main()
