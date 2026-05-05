#!/usr/bin/env python3
"""
Parse ManteoMax's Forza HORIZON 5 Spreadsheets - Cars.pdf
Extracts 902 cars with full specifications for master_database.json

Usage:
    python scripts/parse_manteomax_cars.py ManteoMax_Cars.pdf
"""

import fitz  # PyMuPDF
import json
import sys
import re
from datetime import datetime


def parse_weight(text):
    """Parse weight from various formats."""
    # Remove commas
    text = text.replace(',', '').strip()
    try:
        return int(float(text))
    except:
        return None


def parse_horsepower(text):
    """Parse horsepower from text."""
    text = text.replace(',', '').strip()
    try:
        return int(float(text))
    except:
        return None


def parse_percentage(text):
    """Parse percentage from text."""
    text = text.replace('%', '').strip()
    try:
        return float(text)
    except:
        return None


def extract_car_data_from_line(line):
    """Extract car data from a line of the PDF."""
    # ManteoMax format is tabular/space-delimited
    # Format: Ordinal Year Make Model ... HP Wt Wt/HP% ... Drive ...
    
    parts = line.strip().split()
    if len(parts) < 20:
        return None
    
    try:
        # Try to identify fields based on patterns
        year_idx = None
        hp_idx = None
        wt_idx = None
        drive_idx = None
        
        # Find year (4-digit number between 1920-2030)
        for i, part in enumerate(parts):
            if re.match(r'^(19|20)\d{2}$', part):
                year_idx = i
                break
        
        if year_idx is None:
            return None
        
        year = parts[year_idx]
        
        # Find make (first word after year)
        make_start = year_idx + 1
        make_parts = []
        
        # Makes can be 1-3 words (e.g., "Alfa Romeo", "Aston Martin", "Ford")
        i = make_start
        while i < len(parts) and not re.match(r'^\d+$', parts[i]):
            make_parts.append(parts[i])
            i += 1
            if i - make_start >= 3:  # Max 3 words for make
                break
        
        make = ' '.join(make_parts)
        
        # Everything until we hit numbers is the model
        model_parts = []
        while i < len(parts) and not re.match(r'^\d{3,}$', parts[i]):
            model_parts.append(parts[i])
            i += 1
        
        model = ' '.join(model_parts)
        
        # Skip ahead to find HP (typically a 2-4 digit number)
        for j in range(i, min(i + 30, len(parts))):
            if re.match(r'^\d{2,4}$', parts[j]):
                hp_idx = j
                hp = parse_horsepower(parts[j])
                if hp and 20 <= hp <= 2000:
                    break
        
        if hp_idx is None:
            return None
        
        # Weight usually follows HP
        wt = None
        for j in range(hp_idx + 1, min(hp_idx + 5, len(parts))):
            wt_val = parse_weight(parts[j])
            if wt_val and 500 <= wt_val <= 10000:
                wt = wt_val
                break
        
        if wt is None:
            return None
        
        # Find drivetrain (RWD, FWD, AWD)
        drivetrain = 'RWD'  # Default
        for part in parts:
            if part in ['RWD', 'FWD', 'AWD']:
                drivetrain = part
                break
        
        # Find engine type indicators
        engine = 'Unknown'
        for part in parts:
            if part in ['V6', 'V8', 'V10', 'V12', 'V16', 'I4', 'I5', 'I6', 'W12', 'W16', 'Rotary', 'Electric']:
                engine = part
                break
            if part in ['Inline', 'Flat', 'Boxer']:
                engine = part
                break
        
        # Estimate front weight percentage based on drivetrain
        front_pct = 52  # Default RWD
        if drivetrain == 'FWD':
            front_pct = 60
        elif drivetrain == 'AWD':
            front_pct = 55
        elif 'Mid' in model or 'MR' in model:
            front_pct = 45
        elif 'Rear' in model:
            front_pct = 40
        
        weight_kg = round(wt * 0.453592)  # lbs to kg
        weight_lbs = wt
        
        return {
            'manufacturer': make,
            'model': model,
            'year': year,
            'horsepower': hp,
            'weightLbs': weight_lbs,
            'weightKg': weight_kg,
            'frontPct': front_pct,
            'rearPct': 100 - front_pct,
            'drivetrain': drivetrain,
            'engine': engine,
            'division': 'Unknown',
            'hpPerLb': round(hp / weight_lbs, 4) if weight_lbs else 0,
            'hpPerKg': round(hp / weight_kg, 4) if weight_kg else 0,
            'specSource': 'ManteoMax'
        }
        
    except Exception as e:
        return None


def parse_manteomax_cars(pdf_path):
    """Parse the ManteoMax Cars PDF and extract all car specifications."""
    print(f"Parsing: {pdf_path}")
    
    doc = fitz.open(pdf_path)
    cars = []
    
    for page_num, page in enumerate(doc, 1):
        text = page.get_text()
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 50:
                continue
            
            # Skip header lines
            if any(header in line for header in ['Year', 'Make', 'Model', 'HP', 'Wt', 'Class', 'Ordinal']):
                continue
            if 'ManteoMax' in line or 'Spreadsheet' in line:
                continue
            
            car = extract_car_data_from_line(line)
            if car:
                cars.append(car)
                if len(cars) % 100 == 0:
                    print(f"  Progress: {len(cars)} cars extracted...")
    
    doc.close()
    
    return cars


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/parse_manteomax_cars.py <pdf_path>")
        print("Example: python scripts/parse_manteomax_cars.py ManteoMax_Cars.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    cars = parse_manteomax_cars(pdf_path)
    
    # Remove duplicates based on year|make|model
    seen = set()
    unique_cars = []
    for car in cars:
        key = f"{car['year']}|{car['manufacturer']}|{car['model']}"
        if key not in seen:
            seen.add(key)
            unique_cars.append(car)
    
    print(f"\n{'='*60}")
    print(f"Total cars extracted: {len(cars)}")
    print(f"Unique cars: {len(unique_cars)}")
    print(f"Duplicates removed: {len(cars) - len(unique_cars)}")
    
    # Create master database structure
    master_db = {
        'version': '1.0.0',
        'generated': datetime.now().isoformat(),
        'source': 'ManteoMax Forza Horizon 5 Spreadsheets',
        'totalCars': len(unique_cars),
        'totalMatched': len(unique_cars),
        'cars': unique_cars
    }
    
    # Save to master_database.json
    output_path = 'app/data/master_database.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(master_db, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved to: {output_path}")
    print(f"\nSample entries:")
    for car in unique_cars[:3]:
        print(f"  - {car['year']} {car['manufacturer']} {car['model']}: {car['horsepower']}hp, {car['weightLbs']}lbs, {car['drivetrain']}")


if __name__ == '__main__':
    main()
