#!/usr/bin/env python3
"""
Aggressive PDF tune extractor - finds ALL tunes from PDFs
Uses pdfplumber for table extraction and text parsing
"""

import sys
import os
import re
import json
from pathlib import Path

# Use pdfplumber for better extraction
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    print("Error: pdfplumber not installed. Run: pip install pdfplumber")
    sys.exit(1)


def parse_discipline(filename):
    """Extract discipline from filename."""
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


def extract_share_code(text):
    """Extract share code from text - handles all formats."""
    if not text:
        return None
    # Match 9 digits in various formats
    patterns = [
        r'\b(\d{3})[\s\-]?(\d{3})[\s\-]?(\d{3})\b',
        r'(\d{9})\b',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            if len(match.groups()) == 3:
                return f"{match.group(1)} {match.group(2)} {match.group(3)}"
            else:
                code = match.group(1)
                return f"{code[:3]} {code[3:6]} {code[6:]}"
    return None


def extract_pi_info(text):
    """Extract PI class and value."""
    if not text:
        return None, None
    
    # Look for PI value
    pi_match = re.search(r'PI[:\s]*(\d{3})', text, re.IGNORECASE)
    if not pi_match:
        # Try to find 3-digit number that could be PI
        numbers = re.findall(r'\b([6-9]\d{2})\b', text)
        if numbers:
            pi_value = int(numbers[0])
        else:
            return None, None
    else:
        pi_value = int(pi_match.group(1))
    
    # Determine PI class
    if pi_value >= 901:
        pi_class = 'S2'
    elif pi_value >= 800:
        pi_class = 'S1'
    elif pi_value >= 700:
        pi_class = 'A'
    elif pi_value >= 600:
        pi_class = 'B'
    elif pi_value >= 500:
        pi_class = 'C'
    else:
        pi_class = 'D'
    
    return pi_class, pi_value


def extract_car_name(text, nearby_lines=None):
    """Extract car name from text using multiple strategies."""
    if not text:
        return None
    
    # Strategy 1: Look for Year Make Model pattern
    # Match: "2018 Porsche 911 GT3" or "Porsche 911 GT3"
    car_pattern = r'(?:(\d{4})\s+)?([A-Za-z][A-Za-z\s\-]+?)\s+([A-Za-z0-9][A-Za-z0-9\s\-]*)'
    match = re.match(car_pattern, text.strip())
    
    if match:
        year = match.group(1) or ''
        make = match.group(2).strip()
        model = match.group(3).strip()
        
        # Validate
        skip_words = ['the', 'and', 'for', 'with', 'from', 'tune', 'share', 
                      'code', 'hp', 'class', 'url', 'source', 'recommended',
                      'disable', 'video', 'guide', 'help', 'approach', 'north']
        
        if make.lower() in skip_words or len(make) < 2:
            return None
        if len(model) < 2:
            return None
            
        return {
            'year': year,
            'make': make,
            'model': model,
            'full_name': f"{year} {make} {model}".strip()
        }
    
    return None


def parse_pdf_tables(pdf_path):
    """Extract tunes from PDF tables."""
    tunes = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                # Try to extract tables
                tables = page.extract_tables()
                
                for table in tables:
                    if not table or len(table) < 2:
                        continue
                    
                    # Look for headers to identify columns
                    headers = table[0] if table else []
                    
                    # Find column indices
                    car_col = None
                    share_col = None
                    tune_col = None
                    pi_col = None
                    
                    for i, header in enumerate(headers):
                        if header:
                            h_lower = header.lower()
                            if any(x in h_lower for x in ['car', 'vehicle', 'name', 'model']):
                                car_col = i
                            elif any(x in h_lower for x in ['share', 'code']):
                                share_col = i
                            elif any(x in h_lower for x in ['tune', 'setup']):
                                tune_col = i
                            elif any(x in h_lower for x in ['pi', 'class']):
                                pi_col = i
                    
                    # Process rows
                    for row in table[1:]:
                        if not row:
                            continue
                        
                        # Get car info
                        car_text = row[car_col] if car_col is not None and len(row) > car_col else None
                        share_text = row[share_col] if share_col is not None and len(row) > share_col else None
                        tune_text = row[tune_col] if tune_col is not None and len(row) > tune_col else None
                        pi_text = row[pi_col] if pi_col is not None and len(row) > pi_col else None
                        
                        # Extract share code
                        share_code = None
                        if share_text:
                            share_code = extract_share_code(str(share_text))
                        if not share_code and car_text:
                            share_code = extract_share_code(str(car_text))
                        
                        if not share_code:
                            continue
                        
                        # Extract car info
                        car_info = None
                        if car_text:
                            car_info = extract_car_name(str(car_text))
                        
                        if not car_info:
                            continue
                        
                        # Extract PI info
                        pi_class, pi_value = extract_pi_info(str(pi_text) if pi_text else "")
                        
                        # Create tune entry
                        filename = os.path.basename(pdf_path)
                        discipline = parse_discipline(filename)
                        
                        tunes.append({
                            'id': f"pdf-{len(tunes)}",
                            'car_make': car_info['make'],
                            'car_model': car_info['model'],
                            'tune_name': str(tune_text) if tune_text else f"{discipline} Tune",
                            'tuner_name': 'Community',
                            'share_code': share_code,
                            'discipline': discipline,
                            'pi_class': pi_class,
                            'pi_value': pi_value,
                            'tune_data': json.dumps({
                                'source': filename,
                                'page': page_num,
                                'extracted_car': car_info['full_name']
                            }),
                            'votes': 0
                        })
                        
    except Exception as e:
        print(f"  Error parsing tables: {e}")
    
    return tunes


def parse_pdf_text(pdf_path):
    """Extract tunes from PDF text."""
    tunes = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text_lines = []
            
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_lines.extend(text.split('\n'))
            
            # Process lines looking for share codes
            for i, line in enumerate(text_lines):
                line = line.strip()
                if not line:
                    continue
                
                share_code = extract_share_code(line)
                if not share_code:
                    continue
                
                # Look for car name in nearby lines
                car_info = None
                
                # Try current line (without share code)
                clean_line = line.replace(share_code, '').replace(share_code.replace(' ', ''), '')
                car_info = extract_car_name(clean_line)
                
                # Try previous lines
                if not car_info:
                    for j in range(1, 5):
                        if i - j >= 0:
                            car_info = extract_car_name(text_lines[i - j])
                            if car_info:
                                break
                
                # Try next lines
                if not car_info:
                    for j in range(1, 3):
                        if i + j < len(text_lines):
                            car_info = extract_car_name(text_lines[i + j])
                            if car_info:
                                break
                
                if not car_info:
                    continue
                
                # Extract PI info from nearby lines
                pi_context = ' '.join(text_lines[max(0, i-2):min(len(text_lines), i+3)])
                pi_class, pi_value = extract_pi_info(pi_context)
                
                filename = os.path.basename(pdf_path)
                discipline = parse_discipline(filename)
                
                tunes.append({
                    'id': f"pdf-{len(tunes)}",
                    'car_make': car_info['make'],
                    'car_model': car_info['model'],
                    'tune_name': f"{pi_class or 'A'} {discipline} Tune" if pi_class else f"{discipline} Tune",
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
                
    except Exception as e:
        print(f"  Error parsing text: {e}")
    
    return tunes


def process_pdf(pdf_path):
    """Process a PDF file and extract tunes."""
    filename = os.path.basename(pdf_path)
    print(f"Processing: {filename}")
    
    all_tunes = []
    
    # Try table extraction first
    table_tunes = parse_pdf_tables(pdf_path)
    if table_tunes:
        all_tunes.extend(table_tunes)
        print(f"  Found {len(table_tunes)} tunes from tables")
    
    # Try text extraction
    text_tunes = parse_pdf_text(pdf_path)
    if text_tunes:
        all_tunes.extend(text_tunes)
        print(f"  Found {len(text_tunes)} tunes from text")
    
    if not all_tunes:
        print("  No tunes found")
    
    return all_tunes


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/extract_all_tunes.py <research_folder_path>")
        sys.exit(1)
    
    research_folder = sys.argv[1]
    
    if not os.path.exists(research_folder):
        print(f"Error: Folder not found: {research_folder}")
        sys.exit(1)
    
    # Find ALL PDFs
    pdf_files = []
    for f in os.listdir(research_folder):
        if f.endswith('.pdf'):
            pdf_files.append(os.path.join(research_folder, f))
    
    print(f"\nFound {len(pdf_files)} PDF files")
    print("=" * 60)
    
    all_tunes = []
    for pdf_path in pdf_files:
        try:
            tunes = process_pdf(pdf_path)
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
    print(f"\nTo seed database, run:")
    print(f"  node scripts/seed-community-tunes.js")


if __name__ == '__main__':
    main()
