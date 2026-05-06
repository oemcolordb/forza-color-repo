#!/usr/bin/env python3
"""
Clean up raw extracted data and generate valid tune entries
"""

import json
import os
import re

def load_raw_data():
    """Load the raw extracted data."""
    input_file = os.path.join(os.path.dirname(__file__), 'raw_extracted_data.json')
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found. Run extract_raw_tunes.py first.")
        return None
    
    with open(input_file, 'r', encoding='utf-8') as f:
        return json.load(f)


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


def extract_car_from_table_row(row):
    """Try to extract car info from a table row."""
    if not row:
        return None
    
    # Look through all cells
    for cell in row:
        if not cell:
            continue
        cell_str = str(cell).strip()
        
        # Skip share codes
        if re.match(r'\d{3}[\s\-]?\d{3}[\s\-]?\d{3}', cell_str):
            continue
        
        # Look for car-like patterns
        # Year Make Model or Make Model
        car_pattern = r'(?:(\d{4})\s+)?([A-Za-z][A-Za-z\s\-]+?)\s+([A-Za-z0-9][A-Za-z0-9\s\-]*)'
        match = re.match(car_pattern, cell_str)
        
        if match:
            year = match.group(1) or ''
            make = match.group(2).strip()
            model = match.group(3).strip()
            
            # Validate
            skip_words = ['the', 'and', 'for', 'with', 'from', 'tune', 'share', 
                          'code', 'class', 'pi', 'hp', 'url']
            if make.lower() in skip_words or len(make) < 2:
                continue
            if len(model) < 2:
                continue
            
            return {
                'year': year,
                'make': make,
                'model': model,
                'full_name': f"{year} {make} {model}".strip()
            }
    
    return None


def extract_share_code_from_row(row):
    """Extract share code from a table row."""
    if not row:
        return None
    
    for cell in row:
        if not cell:
            continue
        cell_str = str(cell).strip()
        
        # Match 9-digit patterns
        match = re.search(r'\b(\d{3})[\s\-]?(\d{3})[\s\-]?(\d{3})\b', cell_str)
        if match:
            return f"{match.group(1)} {match.group(2)} {match.group(3)}"
    
    return None


def process_tables(raw_data):
    """Process table data to extract tunes."""
    tunes = []
    
    for pdf_data in raw_data:
        filename = pdf_data['filename']
        discipline = parse_discipline(filename)
        
        for table_info in pdf_data.get('tables', []):
            table = table_info.get('data', [])
            if not table or len(table) < 2:
                continue
            
            # Process each row (skip header)
            for row in table[1:]:
                car_info = extract_car_from_table_row(row)
                share_code = extract_share_code_from_row(row)
                
                if car_info and share_code:
                    # Try to extract PI from row
                    pi_value = None
                    pi_class = None
                    for cell in row:
                        if cell and re.search(r'\b([6-9]\d{2})\b', str(cell)):
                            pi_value = int(re.search(r'\b([6-9]\d{2})\b', str(cell)).group(1))
                            if pi_value >= 901:
                                pi_class = 'S2'
                            elif pi_value >= 800:
                                pi_class = 'S1'
                            elif pi_value >= 700:
                                pi_class = 'A'
                            elif pi_value >= 600:
                                pi_class = 'B'
                            else:
                                pi_class = 'C'
                            break
                    
                    tunes.append({
                        'car_make': car_info['make'],
                        'car_model': car_info['model'],
                        'tune_name': f"{pi_class or 'A'} {discipline} Tune" if pi_class else f"{discipline} Tune",
                        'tuner_name': 'Community',
                        'share_code': share_code,
                        'discipline': discipline,
                        'pi_class': pi_class,
                        'pi_value': pi_value,
                        'source': filename
                    })
    
    return tunes


def process_share_codes_with_context(raw_data):
    """Process share codes with their surrounding context."""
    tunes = []
    
    for pdf_data in raw_data:
        filename = pdf_data['filename']
        discipline = parse_discipline(filename)
        
        for code_info in pdf_data.get('share_codes', []):
            context = code_info.get('context', '')
            share_code = code_info['code']
            
            # Try to find car name in context
            car_info = None
            lines = context.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line or len(line) < 5:
                    continue
                
                # Skip share codes
                if share_code in line:
                    line = line.replace(share_code, '').strip()
                
                # Try to match car pattern
                car_pattern = r'(?:(\d{4})\s+)?([A-Za-z][A-Za-z\s\-]+?)\s+([A-Za-z0-9][A-Za-z0-9\s\-]*)'
                match = re.match(car_pattern, line)
                
                if match:
                    year = match.group(1) or ''
                    make = match.group(2).strip()
                    model = match.group(3).strip()
                    
                    skip_words = ['the', 'and', 'for', 'with', 'from', 'share', 
                                  'code', 'class', 'pi', 'hp', 'url', 'recommended',
                                  'disable', 'video', 'guide', 'help', 'approach']
                    
                    if make.lower() in skip_words or len(make) < 2:
                        continue
                    if len(model) < 2:
                        continue
                    
                    car_info = {
                        'year': year,
                        'make': make,
                        'model': model
                    }
                    break
            
            if car_info:
                # Look for PI in context
                pi_value = None
                pi_class = None
                pi_match = re.search(r'\b([6-9]\d{2})\b', context)
                if pi_match:
                    pi_value = int(pi_match.group(1))
                    if pi_value >= 901:
                        pi_class = 'S2'
                    elif pi_value >= 800:
                        pi_class = 'S1'
                    elif pi_value >= 700:
                        pi_class = 'A'
                    elif pi_value >= 600:
                        pi_class = 'B'
                    else:
                        pi_class = 'C'
                
                tunes.append({
                    'car_make': car_info['make'],
                    'car_model': car_info['model'],
                    'tune_name': f"{pi_class or 'A'} {discipline} Tune" if pi_class else f"{discipline} Tune",
                    'tuner_name': 'Community',
                    'share_code': share_code,
                    'discipline': discipline,
                    'pi_class': pi_class,
                    'pi_value': pi_value,
                    'source': filename
                })
    
    return tunes


def deduplicate_tunes(tunes):
    """Remove duplicate tunes based on share code."""
    seen_codes = set()
    unique_tunes = []
    
    for tune in tunes:
        code = tune['share_code'].replace(' ', '')
        if code not in seen_codes:
            seen_codes.add(code)
            unique_tunes.append(tune)
    
    return unique_tunes


def generate_final_json(tunes):
    """Generate final JSON format for seeding."""
    final_tunes = []
    
    for i, tune in enumerate(tunes):
        final_tunes.append({
            'id': f"pdf-{i}",
            'car_make': tune['car_make'],
            'car_model': tune['car_model'],
            'tune_name': tune['tune_name'],
            'tuner_name': tune['tuner_name'],
            'share_code': tune['share_code'],
            'discipline': tune['discipline'],
            'pi_class': tune['pi_class'],
            'pi_value': tune['pi_value'],
            'tune_data': json.dumps({
                'source': tune['source'],
                'extracted_car': f"{tune['car_make']} {tune['car_model']}"
            }),
            'votes': 0
        })
    
    return final_tunes


def main():
    print("Loading raw data...")
    raw_data = load_raw_data()
    
    if not raw_data:
        return
    
    print(f"Processing {len(raw_data)} PDFs...")
    
    # Process tables
    table_tunes = process_tables(raw_data)
    print(f"Extracted {len(table_tunes)} tunes from tables")
    
    # Process share codes with context
    context_tunes = process_share_codes_with_context(raw_data)
    print(f"Extracted {len(context_tunes)} tunes from share code contexts")
    
    # Combine all tunes
    all_tunes = table_tunes + context_tunes
    print(f"Total tunes before deduplication: {len(all_tunes)}")
    
    # Deduplicate
    unique_tunes = deduplicate_tunes(all_tunes)
    print(f"Total tunes after deduplication: {len(unique_tunes)}")
    
    # Generate final JSON
    final_tunes = generate_final_json(unique_tunes)
    
    # Save
    output_file = os.path.join(os.path.dirname(__file__), 'extracted_tunes.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_tunes, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved {len(final_tunes)} tunes to: {output_file}")
    print(f"\nNext step: node scripts/seed-community-tunes.js")


if __name__ == '__main__':
    main()
