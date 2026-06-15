#!/usr/bin/env python3
"""
Comprehensive audit script to check all colors for:
1. Missing HSB values
2. Invalid HSB (all zeros)
3. Color names that don't match HSB data
4. Duplicate colors with different HSB values
"""

import json
import sys
from collections import defaultdict
from typing import Dict, List, Tuple, Any

def load_colors(file_path: str) -> List[Dict]:
    """Load colors from JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return []

def has_valid_hsb(color: Dict) -> bool:
    """Check if color has valid HSB values"""
    hsb = color.get('color1', {})
    if not hsb:
        return False
    
    h = hsb.get('h')
    s = hsb.get('s') 
    b = hsb.get('b')
    
    # Check if all values are present and not all zero
    if h is None or s is None or b is None:
        return False
    
    # All zeros means invalid/missing data
    if h == 0 and s == 0 and b == 0:
        return False
    
    # Check valid ranges
    if not (0 <= h <= 1 and 0 <= s <= 1 and 0 <= b <= 1):
        return False
    
    return True

def get_hsb_color_category(hsb: Dict) -> str:
    """Categorize color based on HSB values"""
    if not hsb:
        return "Unknown"
    
    h = hsb.get('h', 0)
    s = hsb.get('s', 0)
    b = hsb.get('b', 0)
    
    # Grayscale (no saturation)
    if s < 0.1:
        if b < 0.2:
            return "Black"
        elif b > 0.9:
            return "White"
        else:
            return "Gray"
    
    # Very dark colors
    if b < 0.2:
        return "Dark"
    
    # Very light colors
    if b > 0.9:
        return "Light"
    
    # Hue-based categories
    if h < 0.05 or h >= 0.95:
        return "Red"
    elif h < 0.15:
        return "Orange"
    elif h < 0.25:
        return "Yellow"
    elif h < 0.4:
        return "Green"
    elif h < 0.55:
        return "Cyan"
    elif h < 0.7:
        return "Blue"
    elif h < 0.85:
        return "Purple"
    else:
        return "Pink/Magenta"

def check_name_hsb_consistency(color_name: str, hsb: Dict) -> List[str]:
    """Check if color name matches HSB values"""
    issues = []
    name_lower = color_name.lower()
    
    if not hsb:
        return ["Missing HSB data"]
    
    h = hsb.get('h', 0)
    s = hsb.get('s', 0)
    b = hsb.get('b', 0)
    
    # Check for obvious mismatches
    if 'black' in name_lower and b > 0.3:
        issues.append(f"Name says 'black' but brightness is {b:.2f}")
    
    if 'white' in name_lower and b < 0.7:
        issues.append(f"Name says 'white' but brightness is {b:.2f}")
    
    if 'gray' in name_lower or 'grey' in name_lower:
        if s > 0.3:
            issues.append(f"Name says 'gray' but saturation is {s:.2f}")
    
    if 'red' in name_lower and not (h < 0.05 or h >= 0.95):
        issues.append(f"Name says 'red' but hue is {h:.2f}")
    
    if 'blue' in name_lower and not (0.55 <= h < 0.7):
        issues.append(f"Name says 'blue' but hue is {h:.2f}")
    
    if 'green' in name_lower and not (0.25 <= h < 0.4):
        issues.append(f"Name says 'green' but hue is {h:.2f}")
    
    if 'yellow' in name_lower and not (0.15 <= h < 0.25):
        issues.append(f"Name says 'yellow' but hue is {h:.2f}")
    
    if 'orange' in name_lower and not (0.05 <= h < 0.15):
        issues.append(f"Name says 'orange' but hue is {h:.2f}")
    
    if 'purple' in name_lower and not (0.7 <= h < 0.85):
        issues.append(f"Name says 'purple' but hue is {h:.2f}")
    
    return issues

def audit_colors(colors: List[Dict]) -> Dict[str, Any]:
    """Perform comprehensive audit of colors"""
    results = {
        'total_colors': len(colors),
        'valid_hsb': 0,
        'invalid_hsb': 0,
        'missing_hsb': 0,
        'name_hsb_mismatches': [],
        'duplicate_names': defaultdict(list),
        'problematic_colors': [],
        'summary': {}
    }
    
    # Check each color
    for i, color in enumerate(colors):
        color_name = color.get('colorName', 'Unknown')
        make = color.get('make', 'Unknown')
        hsb = color.get('color1', {})
        
        # Check HSB validity
        if not hsb:
            results['missing_hsb'] += 1
            results['problematic_colors'].append({
                'index': i,
                'make': make,
                'name': color_name,
                'issue': 'Missing HSB data',
                'hsb': hsb
            })
        elif not has_valid_hsb(color):
            results['invalid_hsb'] += 1
            results['problematic_colors'].append({
                'index': i,
                'make': make,
                'name': color_name,
                'issue': 'Invalid HSB (all zeros or out of range)',
                'hsb': hsb
            })
        else:
            results['valid_hsb'] += 1
            
            # Check name-HSB consistency
            mismatches = check_name_hsb_consistency(color_name, hsb)
            if mismatches:
                results['name_hsb_mismatches'].append({
                    'index': i,
                    'make': make,
                    'name': color_name,
                    'hsb': hsb,
                    'issues': mismatches
                })
        
        # Track duplicate names
        name_key = f"{make}_{color_name}"
        results['duplicate_names'][name_key].append({
            'index': i,
            'hsb': hsb,
            'make': make
        })
    
    # Find actual duplicates (same name, different HSB)
    actual_duplicates = {}
    for name_key, entries in results['duplicate_names'].items():
        if len(entries) > 1:
            # Check if HSB values differ significantly
            hsbs = [e['hsb'] for e in entries if e['hsb']]
            if len(set(str(h) for h in hsbs)) > 1:
                actual_duplicates[name_key] = entries
    
    results['duplicate_names'] = actual_duplicates
    
    # Generate summary
    results['summary'] = {
        'total_colors': results['total_colors'],
        'valid_percentage': (results['valid_hsb'] / results['total_colors'] * 100) if results['total_colors'] > 0 else 0,
        'problematic_count': results['missing_hsb'] + results['invalid_hsb'] + len(results['name_hsb_mismatches']),
        'duplicate_groups': len(actual_duplicates)
    }
    
    return results

def print_report(results: Dict[str, Any]):
    """Print detailed audit report"""
    print("=" * 80)
    print("COLOR HSB AUDIT REPORT")
    print("=" * 80)
    
    summary = results['summary']
    print(f"\n[SUMMARY]:")
    print(f"  Total colors: {summary['total_colors']:,}")
    print(f"  Valid HSB: {results['valid_hsb']:,} ({summary['valid_percentage']:.1f}%)")
    print(f"  Missing HSB: {results['missing_hsb']:,}")
    print(f"  Invalid HSB: {results['invalid_hsb']:,}")
    print(f"  Name-HSB mismatches: {len(results['name_hsb_mismatches']):,}")
    print(f"  Duplicate name groups: {summary['duplicate_groups']:,}")
    print(f"  Total problematic: {summary['problematic_count']:,}")
    
    # Show problematic colors
    if results['problematic_colors']:
        print(f"\n[PROBLEMATIC COLORS] (Top 20):")
        for color in results['problematic_colors'][:20]:
            print(f"  [{color['index']:5d}] {color['make']} - {color['name']}")
            print(f"         Issue: {color['issue']}")
            print(f"         HSB: {color['hsb']}")
            print()
        
        if len(results['problematic_colors']) > 20:
            print(f"  ... and {len(results['problematic_colors']) - 20} more")
    
    # Show name-HSB mismatches
    if results['name_hsb_mismatches']:
        print(f"\n[NAME-HSB MISMATCHES] (Top 15):")
        for color in results['name_hsb_mismatches'][:15]:
            print(f"  [{color['index']:5d}] {color['make']} - {color['name']}")
            for issue in color['issues']:
                print(f"         {issue}")
            print()
        
        if len(results['name_hsb_mismatches']) > 15:
            print(f"  ... and {len(results['name_hsb_mismatches']) - 15} more")
    
    # Show duplicates
    if results['duplicate_names']:
        print(f"\n[DUPLICATE NAMES WITH DIFFERENT HSB]:")
        for name_key, entries in list(results['duplicate_names'].items())[:10]:
            print(f"  {name_key}:")
            for entry in entries:
                print(f"    HSB: {entry['hsb']}")
            print()
        
        if len(results['duplicate_names']) > 10:
            print(f"  ... and {len(results['duplicate_names']) - 10} more groups")

def main():
    """Main audit function"""
    print("Starting comprehensive color HSB audit...")
    
    # Load colors from public file
    colors = load_colors('public/carColors.json')
    if not colors:
        print("No colors found to audit!")
        sys.exit(1)
    
    # Perform audit
    results = audit_colors(colors)
    
    # Print report
    print_report(results)
    
    # Save detailed results
    with open('color_hsb_audit_results.json', 'w', encoding='utf-8') as f:
        # Convert defaultdict to regular dict for JSON serialization
        results_copy = results.copy()
        results_copy['duplicate_names'] = dict(results['duplicate_names'])
        json.dump(results_copy, f, indent=2, ensure_ascii=False)
    
    print(f"\n[INFO] Detailed results saved to: color_hsb_audit_results.json")
    
    # Exit with error code if many problems found
    if results['summary']['problematic_count'] > results['summary']['total_colors'] * 0.1:
        print(f"\n[WARNING] More than 10% of colors have issues!")
        sys.exit(1)

if __name__ == "__main__":
    main()
