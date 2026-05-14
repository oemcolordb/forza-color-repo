#!/usr/bin/env python3
"""
Deep dive analysis of colors missing HSB data in carColors.json
"""

import json
from collections import Counter
from pathlib import Path

def analyze_missing_hsb():
    json_path = Path('public/carColors.json')
    
    print(f'Loading {json_path}...')
    with open(json_path, 'r', encoding='utf-8') as f:
        colors = json.load(f)
    
    total = len(colors)
    missing_hsb = []
    valid_hsb = 0
    
    for i, c in enumerate(colors):
        c1 = c.get('color1')
        has_hsb = c1 and isinstance(c1, dict) and 'h' in c1 and 's' in c1 and 'b' in c1
        
        if not has_hsb:
            missing_hsb.append({
                'index': i,
                'make': c.get('make', 'Unknown'),
                'model': c.get('model', 'Unknown'),
                'year': c.get('year', 'Unknown'),
                'colorName': c.get('colorName', 'Unknown'),
                'colorType': c.get('colorType', 'Unknown'),
                'color1': c1,
                'color2': c.get('color2')
            })
        else:
            valid_hsb += 1
    
    print(f'\n{"="*60}')
    print(f'HSB DATA ANALYSIS')
    print(f'{"="*60}')
    print(f'Total colors:      {total:,}')
    print(f'Valid HSB:         {valid_hsb:,} ({100*valid_hsb/total:.1f}%)')
    print(f'Missing HSB:       {len(missing_hsb):,} ({100*len(missing_hsb)/total:.1f}%)')
    
    if missing_hsb:
        # Analyze by color type
        type_counts = Counter(c['colorType'] for c in missing_hsb)
        print(f'\n{"="*60}')
        print(f'MISSING HSB BY COLOR TYPE')
        print(f'{"="*60}')
        for ctype, count in type_counts.most_common():
            print(f'  {ctype:20s}: {count:5,}')
        
        # Analyze by make
        make_counts = Counter(c['make'] for c in missing_hsb)
        print(f'\n{"="*60}')
        print(f'TOP 20 MAKES WITH MISSING HSB')
        print(f'{"="*60}')
        for make, count in make_counts.most_common(20):
            print(f'  {make:25s}: {count:5,}')
        
        # Show sample entries
        print(f'\n{"="*60}')
        print(f'SAMPLE ENTRIES MISSING HSB (first 20)')
        print(f'{"="*60}')
        for c in missing_hsb[:20]:
            print(f"\n[{c['index']}] {c['make']} {c['model']} ({c['year']})")
            print(f"  Color: {c['colorName']} ({c['colorType']})")
            print(f"  color1: {c['color1']}")
            print(f"  color2: {c['color2']}")
        
        # Save missing entries to file for further analysis
        output_path = Path('missing_hsb_analysis.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                'summary': {
                    'total_colors': total,
                    'valid_hsb': valid_hsb,
                    'missing_hsb': len(missing_hsb)
                },
                'by_color_type': dict(type_counts),
                'by_make': dict(make_counts),
                'samples': missing_hsb[:100]
            }, f, indent=2)
        print(f'\n📄 Detailed analysis saved to: {output_path}')
    
    return missing_hsb

if __name__ == '__main__':
    analyze_missing_hsb()
