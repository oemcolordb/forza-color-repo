#!/usr/bin/env python3
"""
AGGRESSIVE tune extractor - extracts maximum tunes from PDFs
Uses raw table cells and share code proximity matching
"""

import sys
import os
import re
import json
from pathlib import Path
from collections import defaultdict

try:
    import pdfplumber
except ImportError:
    print("Error: pip install pdfplumber")
    sys.exit(1)

KNOWN_MAKES = [
    'Acura', 'Alfa Romeo', 'Ariel', 'Aston Martin', 'Audi', 'BAC', 'BMW', 'Bentley',
    'Bugatti', 'Buick', 'Cadillac', 'Caterham', 'Chevrolet', 'Chrysler', 'Citroen',
    'Datsun', 'DeLorean', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'GMC', 'Hennessey',
    'Honda', 'Hoonigan', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Koenigsegg',
    'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati',
    'Mazda', 'McLaren', 'Mercedes', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan',
    'Noble', 'Opel', 'Pagani', 'Peugeot', 'Plymouth', 'Polaris', 'Pontiac', 'Porsche',
    'Radical', 'Ram', 'Renault', 'Rimac', 'Rolls-Royce', 'Saleen', 'Scion', 'Shelby',
    'Subaru', 'TVR', 'Tesla', 'Toyota', 'Vauxhall', 'Volkswagen', 'Volvo', 'Wiesmann',
    'AMC', 'Ascari', 'Donkervoort', 'Ginetta', 'Holden', 'HSV', 'KTM', 'Lola',
    'Morgan', 'Noble', 'Ruf', 'Spyker', 'Ultima', 'Zenvo'
]

def parse_discipline(filename):
    f_lower = filename.lower()
    if 'road' in f_lower:
        return 'Road Racing'
    if 'dirt' in f_lower:
        return 'Dirt Racing'
    if 'offroad' in f_lower or 'cross' in f_lower:
        return 'Cross-Country'
    if 'drag' in f_lower:
        return 'Drag Racing'
    if 'drift' in f_lower:
        return 'Drift'
    if 'rally' in f_lower:
        return 'Rally'
    return 'Road Racing'

def extract_share_codes(text):
    """Extract all 9-digit sequences from text."""
    if not text:
        return []
    # Find 9 consecutive digits with optional separators
    pattern = r'(\d{3})[\s\-._]?(\d{3})[\s\-._]?(\d{3})'
    matches = re.finditer(pattern, text)
    codes = []
    for m in matches:
        code = f"{m.group(1)} {m.group(2)} {m.group(3)}"
        codes.append({
            'code': code,
            'raw': m.group(0),
            'start': m.start()
        })
    return codes

def find_car_in_text(text):
    """Try to find a car name in text - very lenient."""
    if not text:
        return None
    
    text = str(text).strip()
    if not text or len(text) < 2:
        return None
    
    # Check for known makes
    text_lower = text.lower()
    for make in KNOWN_MAKES:
        if make.lower() in text_lower:
            # Extract model as everything after the make
            idx = text_lower.find(make.lower())
            after_make = text[idx + len(make):].strip()
            # Clean up - remove common junk
            after_make = re.sub(r'\(\s*\d{4}\s*\)', '', after_make)  # Remove years in parens
            after_make = re.sub(r'\d{4}\s*$', '', after_make).strip()  # Remove trailing year
            return {
                'year': '',
                'make': make,
                'model': after_make[:50] if after_make else 'Unknown',
                'full_name': text[:80]
            }
    
    # Fallback: first word is make, rest is model
    parts = text.split(None, 1)
    if parts:
        return {
            'year': '',
            'make': parts[0][:30],
            'model': parts[1][:50] if len(parts) > 1 else 'Unknown',
            'full_name': text[:80]
        }
    return None

def parse_pi(text):
    """Extract PI class and value from text."""
    if not text:
        return None, None
    text = str(text).upper()
    # Match PI class (D, C, B, A, S1, S2, X) followed by number
    match = re.search(r'([DCBAS][12]?)[\s\-]*(\d{3})', text)
    if match:
        return match.group(1), int(match.group(2))
    # Just class letter
    match = re.search(r'\b([DCBAS][12]?)\b', text)
    if match:
        return match.group(1), None
    return None, None

def process_table_aggressive(table, discipline):
    """Extract all possible tunes from a table aggressively."""
    tunes = []
    if not table or len(table) < 2:
        return tunes
    
    headers = [str(h).lower() if h else '' for h in table[0]]
    
    # Try to identify columns - look for keywords anywhere
    car_col = None
    code_col = None
    pi_col = None
    
    for i, h in enumerate(headers):
        if any(k in h for k in ['car', 'vehicle', 'model', 'auto']):
            car_col = i
        if any(k in h for k in ['share', 'code', 'tune', 'sc']):
            code_col = i
        if any(k in h for k in ['pi', 'class', 'rating', 'perf']):
            pi_col = i
    
    # Process each row
    for row in table[1:]:
        if not row:
            continue
        
        # Get share code from any column if not identified
        share_code = None
        if code_col is not None and len(row) > code_col:
            codes = extract_share_codes(str(row[code_col]))
            if codes:
                share_code = codes[0]['code']
        
        # If no code column found, scan all columns
        if not share_code:
            for cell in row:
                codes = extract_share_codes(str(cell))
                if codes:
                    share_code = codes[0]['code']
                    break
        
        if not share_code:
            continue
        
        # Get car info - try car column first, then any column with text
        car_info = None
        if car_col is not None and len(row) > car_col:
            car_info = find_car_in_text(row[car_col])
        
        if not car_info:
            # Try all columns for car info
            for i, cell in enumerate(row):
                if i == code_col:
                    continue
                car_info = find_car_in_text(cell)
                if car_info:
                    break
        
        # Get PI
        pi_class, pi_value = None, None
        if pi_col is not None and len(row) > pi_col:
            pi_class, pi_value = parse_pi(row[pi_col])
        
        # Create tune entry - accept even with unknown car
        if car_info is None:
            car_info = {'year': '', 'make': 'Unknown', 'model': 'Vehicle', 'full_name': 'Unknown Vehicle'}
        
        tunes.append({
            'car_year': car_info.get('year', ''),
            'car_make': car_info.get('make', 'Unknown'),
            'car_model': car_info.get('model', 'Unknown'),
            'car_name': car_info.get('full_name', 'Unknown'),
            'share_code': share_code,
            'pi_class': pi_class or 'B',
            'pi_value': pi_value,
            'discipline': discipline,
            'tuner_name': 'Community',
            'tune_name': f"{discipline.split()[0]} Tune",
            'votes': 0
        })
    
    return tunes

def extract_from_page_aggressive(page, discipline):
    """Aggressive extraction from a single page."""
    all_tunes = []
    
    # Extract tables
    tables = page.extract_tables()
    for table in tables:
        tunes = process_table_aggressive(table, discipline)
        all_tunes.extend(tunes)
    
    # Also extract from raw text for any missed codes
    text = page.extract_text()
    if text:
        codes = extract_share_codes(text)
        # Get context around each code (previous/following lines)
        lines = text.split('\n')
        for code_info in codes:
            code = code_info['code']
            # Check if we already have this code
            if any(t['share_code'] == code for t in all_tunes):
                continue
            
            # Find line with this code
            code_line = ''
            for line in lines:
                if code_info['raw'] in line or code.replace(' ', '') in line.replace(' ', ''):
                    code_line = line
                    break
            
            # Try to find car name in this line or nearby
            car_info = find_car_in_text(code_line)
            if not car_info and code_line:
                # Fallback: use any text before the code as car name
                parts = code_line.split(code_info['raw'])
                if parts:
                    car_info = find_car_in_text(parts[0])
            
            if not car_info:
                car_info = {'year': '', 'make': 'Unknown', 'model': 'Vehicle', 'full_name': 'Unknown'}
            
            pi_class, pi_value = parse_pi(code_line)
            
            all_tunes.append({
                'car_year': car_info.get('year', ''),
                'car_make': car_info.get('make', 'Unknown'),
                'car_model': car_info.get('model', 'Unknown'),
                'car_name': car_info.get('full_name', 'Unknown'),
                'share_code': code,
                'pi_class': pi_class or 'B',
                'pi_value': pi_value,
                'discipline': discipline,
                'tuner_name': 'Community',
                'tune_name': f"{discipline.split()[0]} Tune",
                'votes': 0
            })
    
    return all_tunes

def process_pdf(pdf_path):
    """Process a single PDF aggressively."""
    tunes = []
    discipline = parse_discipline(os.path.basename(pdf_path))
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"Processing: {os.path.basename(pdf_path)}")
            for page_num, page in enumerate(pdf.pages, 1):
                page_tunes = extract_from_page_aggressive(page, discipline)
                tunes.extend(page_tunes)
    except Exception as e:
        print(f"  Error: {e}")
    
    return tunes

def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_tunes_aggressive.py <pdf_folder>")
        sys.exit(1)
    
    pdf_folder = Path(sys.argv[1])
    if not pdf_folder.exists():
        print(f"Folder not found: {pdf_folder}")
        sys.exit(1)
    
    pdf_files = list(pdf_folder.glob('*.pdf'))
    print(f"Found {len(pdf_files)} PDF files")
    print("=" * 60)
    
    all_tunes = []
    seen_codes = set()
    
    for pdf_path in pdf_files:
        tunes = process_pdf(pdf_path)
        for tune in tunes:
            code = tune['share_code']
            if code not in seen_codes:
                seen_codes.add(code)
                all_tunes.append(tune)
        print(f"  Extracted: {len([t for t in tunes if t['share_code'] not in [tt['share_code'] for tt in all_tunes[:-len(tunes)]]])} unique tunes")
    
    print("\n" + "=" * 60)
    print(f"TOTAL UNIQUE TUNES: {len(all_tunes)}")
    
    # Save results
    script_dir = Path(__file__).parent
    output_path = script_dir / 'extracted_tunes_aggressive.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_tunes, f, indent=2)
    
    print(f"Saved to: {output_path}")
    
    # Also save as standard format for seeding
    standard_path = script_dir / 'extracted_tunes.json'
    with open(standard_path, 'w', encoding='utf-8') as f:
        json.dump(all_tunes, f, indent=2)
    
    print(f"Also saved as: {standard_path} (for seeding)")
    print("\nRun: node scripts/seed-community-tunes.js")

if __name__ == '__main__':
    main()
