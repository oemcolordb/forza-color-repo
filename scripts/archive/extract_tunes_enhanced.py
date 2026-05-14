#!/usr/bin/env python3
"""
Enhanced PDF tune extractor with more lenient parsing
Usage: python scripts/extract_tunes_enhanced.py <research_folder_path>
"""

import sys
import os
import re
import json
from pathlib import Path

# Try to import pdfplumber, fall back to PyPDF2
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
    print("Using pdfplumber for text extraction")
except ImportError:
    HAS_PDFPLUMBER = False
    try:
        import PyPDF2
        HAS_PYPDF2 = True
        print("Using PyPDF2 for text extraction")
    except ImportError:
        HAS_PYPDF2 = False
        print("Error: Neither pdfplumber nor PyPDF2 installed. Run: pip install pdfplumber")


def parse_discipline(filename):
    """Extract discipline from filename."""
    f_lower = filename.lower()
    if 'road' in f_lower:
        return 'Road Racing'
    if 'dirt' in f_lower:
        return 'Dirt Racing'
    if 'offroad' in f_lower or 'off-road' in f_lower or 'cross' in f_lower:
        return 'Cross-Country'
    if 'drag' in f_lower:
        return 'Drag Racing'
    if 'drift' in f_lower:
        return 'Drift'
    if 'rally' in f_lower:
        return 'Rally'
    return 'Road Racing'


def extract_share_code(text):
    """Extract share code from text - handles various formats."""
    # Match 9 digits with or without spaces/dashes
    patterns = [
        r'\b(\d{3})\s*(\d{3})\s*(\d{3})\b',  # 123 456 789 or 123456789
        r'\b(\d{3})-(\d{3})-(\d{3})\b',       # 123-456-789
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return f"{match.group(1)} {match.group(2)} {match.group(3)}"
    return None


def extract_pi_value(text):
    """Extract PI value from text."""
    # Look for PI: XXX or PI XXX patterns
    match = re.search(r'PI[:\s]*(\d{3})', text, re.IGNORECASE)
    if match:
        return int(match.group(1))
    # Also look for standalone 3-digit numbers between 600-999
    matches = re.findall(r'\b([6-9]\d{2})\b', text)
    if matches:
        return int(matches[0])
    return None


def extract_car_from_line(line):
    """Try to extract car info from a line - more lenient."""
    # Skip common non-car lines
    skip_words = ['tune', 'share', 'code', 'hp', 'torque', 'weight', '0-60', 'speed',
                  'ignition', 'intake', 'exhaust', 'brakes', 'tires', 'wheels',
                  'upgrade', 'stock', 'sport', 'race', 'class', 'url', 'source',
                  'approach', 'disable', 'video', 'guide', 'help', 'trial',
                  'recommended', 'open', 'north', 'south', 'east', 'west']

    line_lower = line.lower()
    for word in skip_words:
        if word in line_lower and len(line) < 60:
            return None

    # Match car patterns - Year Make Model
    # Match: "2018 Porsche 911 GT3" or "Porsche 911 GT3" or "Nissan Skyline GT-R"
    car_pattern = r'(\d{4})?\s*([A-Za-z][A-Za-z\-]+(?:\s+[A-Za-z][A-Za-z\-]+){0,2})\s+([A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-]+)*).*'
    match = re.match(car_pattern, line.strip())

    if match:
        year = match.group(1) or ''
        make = match.group(2).strip()
        model = match.group(3).strip()

        # Filter out bad matches
        if len(make) < 2 or len(model) < 2:
            return None
        if make.lower() in ['the', 'and', 'for', 'with', 'from', 'this', 'that']:
            return None

        return {
            'year': year,
            'make': make,
            'model': model,
            'full_name': f"{year} {make} {model}".strip()
        }

    return None


def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using available methods."""
    text = ""

    if HAS_PDFPLUMBER:
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"  Error reading PDF with pdfplumber: {e}")
    elif HAS_PYPDF2:
        try:
            with open(pdf_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"  Error reading PDF with PyPDF2: {e}")

    return text


def parse_tune_sheet(pdf_path):
    """Parse a tune sheet PDF and extract entries."""
    filename = os.path.basename(pdf_path)
    print(f"Processing: {filename}")

    discipline = parse_discipline(filename)
    text = extract_text_from_pdf(pdf_path)

    if not text:
        print("  No text extracted")
        return []

    tunes = []
    lines = text.split('\n')

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Look for share code first
        share_code = extract_share_code(line)
        if not share_code:
            continue

        # Try to find car name in this line or previous lines
        car_info = None

        # Try current line
        car_info = extract_car_from_line(line.replace(share_code, '').strip())

        # Try previous 3 lines if no car found
        if not car_info:
            for j in range(1, 4):
                if i - j >= 0:
                    prev_line = lines[i - j].strip()
                    car_info = extract_car_from_line(prev_line)
                    if car_info:
                        break

        # Try next 2 lines if still no car
        if not car_info:
            for j in range(1, 3):
                if i + j < len(lines):
                    next_line = lines[i + j].strip()
                    car_info = extract_car_from_line(next_line)
                    if car_info:
                        break

        if car_info:
            pi_value = extract_pi_value(line)
            pi_class = None
            if pi_value:
                if pi_value >= 900:
                    pi_class = 'S2' if pi_value >= 901 else 'S1'
                elif pi_value >= 800:
                    pi_class = 'A'
                elif pi_value >= 700:
                    pi_class = 'B'
                elif pi_value >= 600:
                    pi_class = 'C'
                elif pi_value >= 500:
                    pi_class = 'D'

            tune_name = f"{discipline} Tune"
            if pi_class:
                tune_name = f"{pi_class} {tune_name}"

            tunes.append({
                'id': f"pdf-{len(tunes)}",
                'car_make': car_info['make'],
                'car_model': car_info['model'],
                'tune_name': tune_name,
                'tuner_name': 'Community',
                'share_code': share_code,
                'discipline': discipline,
                'pi_class': pi_class,
                'pi_value': pi_value,
                'tune_data': json.dumps({
                    'source': filename,
                    'extracted_car': car_info['full_name']
                }),
                'votes': 0
            })
            print(f"  Found: {car_info['full_name']} - {share_code}")

    return tunes


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/extract_tunes_enhanced.py <research_folder_path>")
        print("Example: python scripts/extract_tunes_enhanced.py \"F:/Forza-color-repo Research\"")
        sys.exit(1)

    research_folder = sys.argv[1]

    if not os.path.exists(research_folder):
        print(f"Error: Folder not found: {research_folder}")
        sys.exit(1)

    # Find all tune-related PDFs
    tune_keywords = [
        'tune', 'sheet', 'k1z', 'purist', 'ramen', 'bala', 'snosaes', 'howzer',
        'mapping', 'setup', 'design', 'template', 'vehicle', 'seasonal', 'event',
        'online', 'spreadsheet', 'estadio', 'lap', 'time'
    ]

    pdf_files = []
    for f in os.listdir(research_folder):
        if f.endswith('.pdf'):
            f_lower = f.lower()
            if any(keyword in f_lower for keyword in tune_keywords):
                pdf_files.append(os.path.join(research_folder, f))
            elif 'forza' in f_lower and ('tune' in f_lower or 'car' in f_lower or 'fh5' in f_lower):
                pdf_files.append(os.path.join(research_folder, f))

    print(f"\nFound {len(pdf_files)} tune sheet PDFs")
    print("=" * 60)

    all_tunes = []
    for pdf_path in pdf_files:
        try:
            tunes = parse_tune_sheet(pdf_path)
            all_tunes.extend(tunes)
        except Exception as e:
            print(f"  Error processing {pdf_path}: {e}")

    print(f"\n{'=' * 60}")
    print(f"Total tunes extracted: {len(all_tunes)}")

    # Save to JSON
    output_file = os.path.join(os.path.dirname(__file__), 'extracted_tunes.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_tunes, f, indent=2, ensure_ascii=False)

    print(f"Saved to: {output_file}")
    print("\nNext steps:")
    print("1. Review extracted_tunes.json")
    print("2. Run: node scripts/seed-community-tunes.js")


if __name__ == '__main__':
    main()
