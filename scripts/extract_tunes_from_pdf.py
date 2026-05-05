#!/usr/bin/env python3
"""
Extract tune data from Forza Horizon 5 PDF tune sheets.
Supports tune sheets from various tuners: K1Z Howzer, Purist, TopTierRamen, bala, snosaes, etc.

Usage:
    python scripts/extract_tunes_from_pdf.py "F:/Forza-color-repo Research"
"""

import fitz  # PyMuPDF
import os
import json
import re
import sys
from pathlib import Path


def extract_text_from_pdf(pdf_path):
    """Extract all text from a PDF file."""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def parse_tuner_name(filename):
    """Extract tuner name from filename."""
    # Remove .pdf extension
    name = filename.replace('.pdf', '')
    
    # Common tuner patterns
    tuners = {
        'K1Z Howzer': 'K1Z Howzer',
        'Purist': 'Purist',
        'TopTierRamen': 'TopTierRamen',
        'bala': 'bala',
        'snosaes': 'snosaes',
        'ManteoMax': 'ManteoMax',
    }
    
    for tuner in tuners:
        if tuner.lower() in name.lower():
            return tuners[tuner]
    
    return 'Community'


def parse_class_info(filename):
    """Extract PI class from filename."""
    classes = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X']
    for cls in classes:
        if f'{cls}-' in filename or f'{cls} ' in filename or f'{cls} Class' in filename:
            return cls
        if f'{cls}800' in filename or f'{cls}700' in filename or f'{cls}900' in filename:
            return cls
    
    # Try to extract class from patterns like "A Estadio" or "B HMC"
    match = re.search(r'\b([DCSX][12]?)[\s\-]', filename)
    if match:
        return match.group(1)
    
    return 'A'  # Default


def parse_discipline(filename):
    """Extract discipline from filename."""
    if 'Road' in filename:
        return 'Road Racing'
    if 'Dirt' in filename:
        return 'Dirt Racing'
    if 'Offroad' in filename or 'Off-road' in filename:
        return 'Cross-Country'
    if 'Drag' in filename:
        return 'Drag Racing'
    if 'Drift' in filename:
        return 'Drift'
    if 'Rally' in filename:
        return 'Rally'
    return 'Road Racing'


def extract_car_name(line):
    """Extract car make and model from a line of text."""
    # Skip headers and common non-car lines
    skip_patterns = [
        'tune', 'share code', 'pi class', 'hp', 'torque', 'weight',
        '0-60', '0-100', 'top speed', 'gearbox', 'ignition',
        'intake', 'exhaust', 'cams', 'valves', 'displacement',
        'flywheel', 'oil', 'cooling', 'intercooler',
        'brakes', 'springs', 'dampers', 'arb', 'weight reduction',
        'clutch', 'transmission', 'diff', 'tire compound',
        'front tire', 'rear tire', 'front rim', 'rear rim',
        'aero', 'hood', 'side skirts', 'rear wing', 'front bumper',
        'rear bumper', 'paint', 'upgrade', 'stock', 'sport',
        'race', 'drift', 'rally', 'offroad', 'track',
        'suspension', 'tires', 'wheels', 'drivetrain',
        'hp/lb', 'lb/hp', 'grip', 'handling', 'speed',
        'class', 'division', 'year', 'source', 'url'
    ]
    
    line_lower = line.lower().strip()
    for pattern in skip_patterns:
        if pattern in line_lower and len(line) < 50:
            return None
    
    # Look for car patterns (Year Make Model)
    # Match patterns like "2018 Porsche 911 GT3" or "Porsche 911 GT3"
    car_pattern = r'(\d{4}\s+)?([A-Za-z\-]+(?:\s+[A-Za-z\-]+){0,2})\s+([A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-]+)*)'
    match = re.search(car_pattern, line)
    
    if match:
        year = match.group(1) or ''
        make = match.group(2).strip()
        model = match.group(3).strip()
        
        # Filter out common false positives
        if make.lower() in ['the', 'and', 'for', 'with', 'from', 'tune', 'share', 'code']:
            return None
        if len(make) < 2 or len(model) < 2:
            return None
            
        return {
            'year': year.strip(),
            'make': make,
            'model': model,
            'full_name': f"{year}{make} {model}".strip()
        }
    
    return None


def extract_share_code(text):
    """Extract share code from text (9 digits, space-separated or not)."""
    # Match 9 consecutive digits
    match = re.search(r'\b(\d{3})\s?(\d{3})\s?(\d{3})\b', text)
    if match:
        return f"{match.group(1)} {match.group(2)} {match.group(3)}"
    return None


def extract_pi_value(text):
    """Extract PI value from text."""
    match = re.search(r'PI[:\s]*(\d{3})', text, re.IGNORECASE)
    if match:
        return int(match.group(1))
    
    # Try to find 3-digit numbers that could be PI
    matches = re.findall(r'\b([7-9]\d{2})\b', text)
    if matches:
        return int(matches[0])
    
    return None


def parse_tune_sheet(pdf_path):
    """Parse a tune sheet PDF and extract tune entries."""
    filename = os.path.basename(pdf_path)
    print(f"Processing: {filename}")
    
    text = extract_text_from_pdf(pdf_path)
    lines = text.split('\n')
    
    tuner_name = parse_tuner_name(filename)
    discipline = parse_discipline(filename)
    pi_class = parse_class_info(filename)
    
    tunes = []
    current_car = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Try to extract car name
        car_info = extract_car_name(line)
        if car_info:
            current_car = car_info
            continue
        
        # If we have a car, look for share code
        if current_car:
            share_code = extract_share_code(line)
            if share_code:
                pi_value = extract_pi_value(text[line.find(share_code):line.find(share_code)+50])
                
                tune = {
                    'id': f"{tuner_name.lower().replace(' ', '-')}-{slugify(current_car['full_name'])}-{len(tunes)}",
                    'car_make': current_car['make'],
                    'car_model': current_car['model'],
                    'tune_name': f"{pi_class} {discipline} Tune",
                    'tuner_name': tuner_name,
                    'share_code': share_code,
                    'discipline': discipline,
                    'pi_class': pi_class,
                    'pi_value': pi_value or 800,
                    'tune_data': json.dumps({
                        'source': filename,
                        'tuner': tuner_name,
                        'extracted_car': current_car['full_name']
                    }),
                    'votes': 0
                }
                tunes.append(tune)
                print(f"  Found: {current_car['full_name']} - {share_code}")
                current_car = None  # Reset for next car
    
    return tunes


def slugify(text):
    """Create a URL-friendly slug from text."""
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/extract_tunes_from_pdf.py <research_folder_path>")
        print("Example: python scripts/extract_tunes_from_pdf.py \"F:/Forza-color-repo Research\"")
        sys.exit(1)
    
    research_folder = sys.argv[1]
    
    if not os.path.exists(research_folder):
        print(f"Error: Folder not found: {research_folder}")
        sys.exit(1)
    
    # Find all tune-related PDFs
    tune_keywords = ['tune', 'sheet', 'k1z', 'purist', 'ramen', 'bala', 'snosaes', 'howzer']
    pdf_files = []
    
    for f in os.listdir(research_folder):
        if f.endswith('.pdf'):
            # Check if it's a tune sheet
            f_lower = f.lower()
            if any(keyword in f_lower for keyword in tune_keywords):
                pdf_files.append(os.path.join(research_folder, f))
    
    print(f"\nFound {len(pdf_files)} tune sheet PDFs")
    print("=" * 60)
    
    all_tunes = []
    
    for pdf_path in pdf_files:
        try:
            tunes = parse_tune_sheet(pdf_path)
            all_tunes.extend(tunes)
        except Exception as e:
            print(f"Error processing {pdf_path}: {e}")
    
    print("\n" + "=" * 60)
    print(f"Total tunes extracted: {len(all_tunes)}")
    
    # Save to JSON file
    output_file = 'scripts/extracted_tunes.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_tunes, f, indent=2, ensure_ascii=False)
    
    print(f"Saved to: {output_file}")
    print("\nNext steps:")
    print("1. Review extracted_tunes.json")
    print("2. Run: node scripts/seed-community-tunes.js")


if __name__ == '__main__':
    main()
