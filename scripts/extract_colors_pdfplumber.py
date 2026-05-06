#!/usr/bin/env python3
"""
Extract colors from Forza Horizon 5 PDF color sheets using pdfplumber.
Handles multiple color sheet formats:
- Body Color sheets
- Wheel Color sheets
- Brake Caliper sheets
- VIP Body Color sheets
- Aftermarket Color sheets
- One of a kind body color sheets

Usage:
    python scripts/extract_colors_pdfplumber.py
"""

import pdfplumber
import os
import json
import re


def normalize_paint_type(ptype):
    """Normalize paint type to standard categories."""
    ptype = str(ptype).strip() if ptype else "Normal"
    if not ptype:
        return "Normal"
    low = ptype.lower()
    if "metal flake" in low:
        return "Metal Flake"
    if "matte" in low:
        return "Matte"
    if "gloss" in low:
        return "Gloss"
    if "semigloss" in low or "semi-gloss" in low:
        return "Semigloss"
    if "carbon" in low:
        return "Carbon Fiber Polished"
    if "polished" in low:
        return "Polished"
    if "two-tone" in low or "two tone" in low:
        return "Two-Tone"
    if "normal" in low:
        return "Normal"
    if "satin" in low:
        return "Satin"
    if "pearl" in low:
        return "Pearl"
    if "chrome" in low:
        return "Chrome"
    return ptype


def parse_hsb_values(text):
    """Extract HSB (Hue, Saturation, Brightness) values from text."""
    if not text or "Not in source" in text:
        return None, None

    # Match patterns like "0.13 L    0.04 R    0.92 R" or "1.00    0.83    0.57"
    nums = re.findall(r'(\d+\.\d+)', text)
    if len(nums) >= 6:
        try:
            c1 = {'h': float(nums[0]), 's': float(nums[1]), 'b': float(nums[2])}
            c2 = {'h': float(nums[3]), 's': float(nums[4]), 'b': float(nums[5])}
            if all(0 <= v <= 1 for v in c1.values()) and all(0 <= v <= 1 for v in c2.values()):
                return c1, c2
        except ValueError:
            pass
    if len(nums) >= 3:
        try:
            h = float(nums[0])
            s = float(nums[1])
            b = float(nums[2])

            # Validate ranges (0-1)
            if 0 <= h <= 1 and 0 <= s <= 1 and 0 <= b <= 1:
                return {'h': h, 's': s, 'b': b}, {'h': h, 's': s, 'b': b}
        except ValueError:
            pass
    return None, None


def extract_color_name(line):
    """Extract color name from a line of text."""
    # Skip lines that look like headers or contain numbers only
    if re.match(r'^\s*\d', line):
        return None
    if len(line.strip()) < 3:
        return None

    # Remove common prefixes/suffixes
    line = re.sub(r'^(Color|Name|Paint)\s*[:\-]?\s*', '', line, flags=re.IGNORECASE)

    return line.strip()


def determine_paint_type_from_filename(filename):
    """Determine paint type category from filename."""
    f_lower = filename.lower()

    if 'wheel' in f_lower:
        return 'Wheel'
    if 'brake' in f_lower or 'caliper' in f_lower:
        return 'Brake Caliper'
    if 'vip' in f_lower:
        return 'VIP Body'
    if 'aftermarket' in f_lower:
        return 'Aftermarket'
    if 'one of a kind' in f_lower or 'special' in f_lower:
        return 'Special'
    if 'body' in f_lower:
        return 'Body'

    return 'Body'


def extract_colors_from_pdf(pdf_path):
    """Extract colors from a PDF color sheet."""
    filename = os.path.basename(pdf_path)
    print(f"Processing: {filename}")

    colors = []
    category = determine_paint_type_from_filename(filename)

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if not text:
                    continue

                lines = text.split('\n')

                for line in lines:
                    line = line.strip()
                    if not line:
                        continue

                    # Try to extract HSB values from the line
                    c1, c2 = parse_hsb_values(line)

                    if c1:
                        # Extract color name from the line (everything before the numbers)
                        name_part = re.split(r'\d+\.\d+', line)[0].strip()
                        color_name = extract_color_name(name_part)

                        if color_name and len(color_name) > 2:
                            color_entry = {
                                'make': 'Forza',
                                'model': category,
                                'year': None,
                                'colorName': color_name,
                                'colorType': normalize_paint_type(category),
                                'color1': c1,
                                'color2': c2,
                                'source': filename,
                                'page': page_num
                            }
                            colors.append(color_entry)
                            print(f"  Found: {color_name} - Base({c1['h']:.2f}, {c1['s']:.2f}, {c1['b']:.2f})")

    except Exception as e:
        print(f"Error processing {filename}: {e}")

    return colors


def main():
    # Find all color-related PDFs in the project root
    color_keywords = ['color', 'colour', 'paint', 'body', 'wheel', 'brake', 'vip', 'aftermarket']
    pdf_files = []

    for f in os.listdir('.'):
        if f.endswith('.pdf'):
            f_lower = f.lower()
            if any(keyword in f_lower for keyword in color_keywords):
                pdf_files.append(f)

    print(f"\nFound {len(pdf_files)} color PDFs")
    print("=" * 60)

    all_colors = []

    for pdf_file in pdf_files:
        colors = extract_colors_from_pdf(pdf_file)
        all_colors.extend(colors)

    print("\n" + "=" * 60)
    print(f"Total colors extracted: {len(all_colors)}")

    # Remove duplicates based on color name
    seen_names = set()
    unique_colors = []
    for color in all_colors:
        name_key = f"{color['colorName']}_{color['model']}"
        if name_key not in seen_names:
            seen_names.add(name_key)
            unique_colors.append(color)

    print(f"Unique colors: {len(unique_colors)}")

    # Save to JSON file
    output_file = 'extracted_colors.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_colors, f, indent=2, ensure_ascii=False)

    print(f"Saved to: {output_file}")
    print("\nNext steps:")
    print("1. Review extracted_colors.json")
    print("2. Validate HSV values (0-1 range)")
    print("3. Run: node scripts/merge_autocolor_strict.js")


if __name__ == '__main__':
    main()
