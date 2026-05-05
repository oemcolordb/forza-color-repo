#!/usr/bin/env python3
"""
Generate HSB colors for entries in carColors.json that are missing them.
Maps color name keywords to HSB values.
"""

import json
import re
from pathlib import Path

# Color keyword to HSB mapping
COLOR_MAP = {
    # Reds
    'red': (0.0, 0.85, 0.6),
    'rosso': (0.0, 0.9, 0.55),
    'rouge': (0.0, 0.8, 0.6),
    'rot': (0.0, 0.85, 0.6),
    'maroon': (0.0, 0.7, 0.4),
    'crimson': (0.97, 0.9, 0.8),
    'burgundy': (0.95, 0.6, 0.4),
    'cherry': (0.95, 0.85, 0.5),
    
    # Blues
    'blue': (0.6, 0.7, 0.6),
    'bleu': (0.6, 0.7, 0.6),
    'azul': (0.6, 0.7, 0.6),
    'navy': (0.62, 0.8, 0.3),
    'cyan': (0.5, 0.9, 0.9),
    'teal': (0.48, 0.7, 0.5),
    'turquoise': (0.48, 0.8, 0.8),
    'midnight': (0.62, 0.5, 0.2),
    
    # Greens
    'green': (0.33, 0.7, 0.5),
    'verde': (0.33, 0.75, 0.5),
    'vert': (0.33, 0.7, 0.5),
    'lime': (0.25, 0.9, 0.8),
    'olive': (0.15, 0.6, 0.4),
    'emerald': (0.42, 0.8, 0.6),
    'forest': (0.35, 0.7, 0.3),
    
    # Yellows/Oranges
    'yellow': (0.15, 0.9, 0.9),
    'jaune': (0.15, 0.9, 0.9),
    'amarillo': (0.15, 0.9, 0.9),
    'gold': (0.13, 0.8, 0.9),
    'orange': (0.08, 0.85, 0.8),
    'arancio': (0.08, 0.9, 0.8),
    'amber': (0.1, 0.9, 0.9),
    'bronze': (0.08, 0.6, 0.5),
    'copper': (0.06, 0.7, 0.6),
    
    # Purples/Pinks
    'purple': (0.75, 0.7, 0.5),
    'violet': (0.75, 0.8, 0.6),
    'pink': (0.92, 0.6, 0.9),
    'rosa': (0.95, 0.5, 0.85),
    'magenta': (0.83, 0.9, 0.7),
    'lavender': (0.75, 0.4, 0.8),
    
    # Browns
    'brown': (0.08, 0.6, 0.4),
    'marron': (0.08, 0.6, 0.4),
    'tan': (0.08, 0.4, 0.7),
    'beige': (0.1, 0.3, 0.8),
    'cream': (0.12, 0.2, 0.95),
    'ivory': (0.12, 0.1, 0.98),
    
    # Grays/Blacks/Whites
    'black': (0.0, 0.0, 0.1),
    'nero': (0.0, 0.0, 0.1),
    'noir': (0.0, 0.0, 0.1),
    'schwarz': (0.0, 0.0, 0.1),
    'white': (0.0, 0.0, 0.98),
    'bianco': (0.0, 0.0, 0.98),
    'blanc': (0.0, 0.0, 0.98),
    'weiss': (0.0, 0.0, 0.98),
    'gray': (0.0, 0.0, 0.5),
    'grey': (0.0, 0.0, 0.5),
    'grigio': (0.0, 0.0, 0.5),
    'gris': (0.0, 0.0, 0.5),
    'silver': (0.0, 0.0, 0.75),
    'silber': (0.0, 0.0, 0.75),
    'chrome': (0.0, 0.0, 0.85),
    'platinum': (0.0, 0.0, 0.9),
    
    # Metallics/Special
    'metallic': None,  # Will be handled specially
    'pearl': (0.0, 0.2, 0.9),
    'matte': (0.0, 0.0, 0.4),
    'gloss': (0.0, 0.1, 0.7),
    'carbon': (0.0, 0.0, 0.15),
}


def color_name_to_hsb(color_name):
    """Convert a color name to HSB values."""
    if not color_name:
        return None
    
    name_lower = color_name.lower()
    
    # Check for keywords in the color name
    for keyword, hsb in COLOR_MAP.items():
        if keyword in name_lower:
            if hsb is None:
                continue
            # Add slight random variation for uniqueness
            h, s, b = hsb
            return {'h': h, 's': s, 'b': b}
    
    # Default to gray if no match
    return {'h': 0.0, 's': 0.0, 'b': 0.5}


def has_valid_hsb(color):
    """Check if a color has valid HSB data."""
    c1 = color.get('color1')
    if not c1 or not isinstance(c1, dict):
        return False
    return 'h' in c1 and 's' in c1 and 'b' in c1


def main():
    json_path = Path('public/carColors.json')
    
    print(f'Loading {json_path}...')
    with open(json_path, 'r', encoding='utf-8') as f:
        colors = json.load(f)
    
    total = len(colors)
    valid = sum(1 for c in colors if has_valid_hsb(c))
    missing = total - valid
    
    print(f'\nTotal colors: {total}')
    print(f'With valid HSB: {valid}')
    print(f'Missing HSB: {missing}')
    
    if missing == 0:
        print('\nAll colors already have HSB values!')
        return
    
    # Generate HSB for missing colors
    generated = 0
    for color in colors:
        if not has_valid_hsb(color):
            color_name = color.get('colorName', '')
            hsb = color_name_to_hsb(color_name)
            if hsb:
                color['color1'] = hsb
                color['color2'] = hsb  # Set both colors the same
                generated += 1
    
    print(f'\nGenerated HSB for {generated} colors')
    
    # Save updated file
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(colors, f, indent=2, ensure_ascii=False)
    
    print(f'✅ Saved to {json_path}')
    
    # Verify
    with open(json_path, 'r', encoding='utf-8') as f:
        colors = json.load(f)
    valid_after = sum(1 for c in colors if has_valid_hsb(c))
    print(f'\nVerification: {valid_after}/{total} colors now have valid HSB')


if __name__ == '__main__':
    main()
