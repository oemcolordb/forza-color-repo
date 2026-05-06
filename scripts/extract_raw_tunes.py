#!/usr/bin/env python3
"""
RAW extraction - gets ALL possible tune data from PDFs
No filtering, no validation - extract everything then clean up later
"""

import sys
import os
import re
import json
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("Error: pdfplumber not installed. Run: pip install pdfplumber")
    sys.exit(1)


def extract_all_share_codes(text):
    """Find ALL 9-digit sequences that could be share codes."""
    if not text:
        return []
    
    share_codes = []
    # Match various formats: 123456789, 123 456 789, 123-456-789
    pattern = r'\b(\d{3})[\s\-]?(\d{3})[\s\-]?(\d{3})\b'
    
    for match in re.finditer(pattern, text):
        code = f"{match.group(1)} {match.group(2)} {match.group(3)}"
        share_codes.append({
            'code': code,
            'context': text[max(0, match.start()-100):min(len(text), match.end()+100)],
            'position': match.start()
        })
    
    return share_codes


def extract_all_car_candidates(text):
    """Extract ALL lines that look like they could be car names."""
    if not text:
        return []
    
    candidates = []
    lines = text.split('\n')
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line or len(line) < 3 or len(line) > 80:
            continue
        
        # Skip obvious non-car lines
        skip_patterns = [
            r'^\d+$',  # Just numbers
            r'^http',  # URLs
            r'^[\d\-\.\s]+$',  # Just numbers and punctuation
            r'^(share|code|tune|hp|torque|weight|class|url|source)$',  # Headers
            r'^(page|of|the|and|for|with|from|this|that|these|those)$',  # Common words
        ]
        
        should_skip = False
        for pattern in skip_patterns:
            if re.match(pattern, line, re.IGNORECASE):
                should_skip = True
                break
        
        if should_skip:
            continue
        
        # Check if it has car-like patterns
        # Contains at least one word that looks like a make/model
        has_car_word = bool(re.search(r'[A-Z][a-z]{2,}', line))  # Capitalized words
        has_year = bool(re.search(r'\b(19|20)\d{2}\b', line))  # Year pattern
        has_model = bool(re.search(r'[A-Z][a-z]*\s*[0-9]', line))  # Make + number
        
        if has_car_word or has_year or has_model:
            candidates.append({
                'line': line,
                'index': i,
                'has_year': has_year,
                'has_model': has_model
            })
    
    return candidates


def extract_all_pi_values(text):
    """Extract ALL PI-like values."""
    if not text:
        return []
    
    pi_values = []
    
    # Look for PI patterns
    for match in re.finditer(r'PI[:\s]*(\d{3})', text, re.IGNORECASE):
        pi_values.append({
            'value': int(match.group(1)),
            'context': text[max(0, match.start()-50):min(len(text), match.end()+50)],
            'position': match.start()
        })
    
    # Also look for standalone 3-digit numbers in car ranges
    for match in re.finditer(r'\b([6-9]\d{2})\b', text):
        val = int(match.group(1))
        # Check if preceded by PI-like context
        context = text[max(0, match.start()-30):match.start()]
        if re.search(r'(pi|class|performance|index)', context, re.IGNORECASE):
            pi_values.append({
                'value': val,
                'context': text[max(0, match.start()-50):min(len(text), match.end()+50)],
                'position': match.start()
            })
    
    return pi_values


def extract_raw_data_from_pdf(pdf_path):
    """Extract ALL raw data from a PDF."""
    filename = os.path.basename(pdf_path)
    print(f"Processing: {filename}")
    
    raw_data = {
        'filename': filename,
        'share_codes': [],
        'car_candidates': [],
        'pi_values': [],
        'tables': [],
        'text_snippets': []
    }
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            all_text = ""
            
            for page_num, page in enumerate(pdf.pages, 1):
                # Extract text
                text = page.extract_text()
                if text:
                    all_text += f"\n---PAGE {page_num}---\n{text}"
                    
                    # Extract share codes from this page
                    codes = extract_all_share_codes(text)
                    for code in codes:
                        code['page'] = page_num
                    raw_data['share_codes'].extend(codes)
                    
                    # Extract car candidates
                    cars = extract_all_car_candidates(text)
                    for car in cars:
                        car['page'] = page_num
                    raw_data['car_candidates'].extend(cars)
                    
                    # Extract PI values
                    pis = extract_all_pi_values(text)
                    for pi in pis:
                        pi['page'] = page_num
                    raw_data['pi_values'].extend(pis)
                
                # Extract tables
                tables = page.extract_tables()
                for table in tables:
                    if table:
                        raw_data['tables'].append({
                            'page': page_num,
                            'data': table
                        })
            
            # Store full text for later analysis
            raw_data['full_text'] = all_text
            
    except Exception as e:
        print(f"  Error: {e}")
        raw_data['error'] = str(e)
    
    print(f"  Share codes: {len(raw_data['share_codes'])}")
    print(f"  Car candidates: {len(raw_data['car_candidates'])}")
    print(f"  PI values: {len(raw_data['pi_values'])}")
    print(f"  Tables: {len(raw_data['tables'])}")
    
    return raw_data


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/extract_raw_tunes.py <research_folder_path>")
        sys.exit(1)
    
    research_folder = sys.argv[1]
    
    if not os.path.exists(research_folder):
        print(f"Error: Folder not found: {research_folder}")
        sys.exit(1)
    
    # Find ALL PDFs
    pdf_files = [f for f in os.listdir(research_folder) if f.endswith('.pdf')]
    pdf_files = [os.path.join(research_folder, f) for f in pdf_files]
    
    print(f"\nFound {len(pdf_files)} PDF files")
    print("=" * 60)
    
    all_raw_data = []
    
    for pdf_path in pdf_files:
        raw_data = extract_raw_data_from_pdf(pdf_path)
        all_raw_data.append(raw_data)
    
    print(f"\n{'=' * 60}")
    total_codes = sum(len(d['share_codes']) for d in all_raw_data)
    total_cars = sum(len(d['car_candidates']) for d in all_raw_data)
    total_tables = sum(len(d['tables']) for d in all_raw_data)
    
    print(f"Total share codes found: {total_codes}")
    print(f"Total car candidates: {total_cars}")
    print(f"Total tables: {total_tables}")
    
    # Save raw data
    output_file = os.path.join(os.path.dirname(__file__), 'raw_extracted_data.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_raw_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nRaw data saved to: {output_file}")
    print(f"\nNext step: Run cleanup script to generate clean tunes")


if __name__ == '__main__':
    main()
