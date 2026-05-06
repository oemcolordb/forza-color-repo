#!/usr/bin/env python3
"""
AGGRESSIVE Color Extractor
Extracts maximum colors from PDFs using aggressive HSB pattern matching and Tesseract OCR
"""

import sys
import os
import re
import json
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("Error: pip install pdfplumber")
    sys.exit(1)

try:
    from PIL import Image
    import pytesseract
    if os.name == 'nt':
        # Utilizing your specific path from previous tune extractions
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

def normalize_paint_type(filename):
    f_lower = filename.lower()
    if 'wheel' in f_lower: return 'Wheel'
    if 'brake' in f_lower or 'caliper' in f_lower: return 'Brake Caliper'
    if 'vip' in f_lower: return 'VIP Body'
    if 'aftermarket' in f_lower: return 'Aftermarket'
    if 'special' in f_lower: return 'Special'
    return 'Body'

def parse_hsb_values(text):
    """Aggressively hunt for sequences of 3 floats between 0.00 and 1.00"""
    nums = re.findall(r'(0\.\d+|1\.00)', text)
    if len(nums) >= 6:
        try:
            c1 = {'h': float(nums[0]), 's': float(nums[1]), 'b': float(nums[2])}
            c2 = {'h': float(nums[3]), 's': float(nums[4]), 'b': float(nums[5])}
            return c1, c2
        except ValueError:
            pass
    elif len(nums) >= 3:
        try:
            c1 = {'h': float(nums[0]), 's': float(nums[1]), 'b': float(nums[2])}
            return c1, c1
        except ValueError:
            pass
    return None, None

def extract_colors_from_page(text, filename):
    colors = []
    if not text:
        return colors

    lines = text.split('\n')
    category = normalize_paint_type(filename)

    for line in lines:
        line = line.strip()
        if len(line) < 5: continue

        c1, c2 = parse_hsb_values(line)
        if c1:
            # Try to extract the color name (everything before the first number)
            parts = re.split(r'0\.\d+|1\.00', line)
            name_part = parts[0].strip()
            name_part = re.sub(r'^(Color|Name|Paint)\s*[:\-]?\s*', '', name_part, flags=re.IGNORECASE)
            # Strip trailing characters like 'L', 'R', '-', or extra spaces often found before values
            name_part = re.sub(r'[\d\.\,\-LMR\s]+$', '', name_part).strip()

            if len(name_part) > 2:
                colors.append({
                    'make': 'Forza',
                    'model': category,
                    'year': None,
                    'colorName': name_part,
                    'colorType': 'Normal',
                    'color1': c1,
                    'color2': c2,
                    'source': filename
                })
    return colors

def process_pdf(pdf_path):
    filename = os.path.basename(pdf_path)
    print(f"Processing: {filename}")

    all_colors = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                # Text extraction
                text = page.extract_text()
                page_colors = extract_colors_from_page(text, filename)
                all_colors.extend(page_colors)

                # OCR fallback
                if HAS_OCR and not page_colors:
                    print(f"    Page {page_num}: Using OCR...")
                    try:
                        im = page.to_image(resolution=150)
                        ocr_text = pytesseract.image_to_string(im.original)
                        ocr_colors = extract_colors_from_page(ocr_text, filename)
                        all_colors.extend(ocr_colors)
                    except Exception as e:
                        print(f"    OCR Error: {e}")
    except Exception as e:
        print(f"  Error processing PDF: {e}")

    return all_colors

def main():
    search_dirs = ['.', 'Forza-color-repo Research']
    pdf_files = []
    color_keywords = ['color', 'colour', 'paint', 'body', 'wheel', 'brake', 'vip', 'aftermarket']

    for search_dir in search_dirs:
        if os.path.exists(search_dir):
            for f in os.listdir(search_dir):
                if f.endswith('.pdf') and any(k in f.lower() for k in color_keywords):
                    pdf_files.append(os.path.join(search_dir, f))

    print(f"\nFound {len(pdf_files)} color PDFs")
    print("=" * 60)

    all_colors = []
    for pdf_file in pdf_files:
        all_colors.extend(process_pdf(pdf_file))

    print("\n" + "=" * 60)
    print(f"Total colors extracted: {len(all_colors)}")

    # Deduplicate based on exact name match
    seen_names = set()
    unique_colors = []
    for color in all_colors:
        key = f"{color['colorName']}_{color['model']}"
        if key not in seen_names:
            seen_names.add(key)
            unique_colors.append(color)

    print(f"Unique colors: {len(unique_colors)}")

    output_file = 'extracted_colors.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_colors, f, indent=2, ensure_ascii=False)

    print(f"Saved to: {output_file}")
    print("\nNext step: Run 'node scripts/merge_autocolor_strict.js' to add them to your DB!")

if __name__ == '__main__':
    main()
