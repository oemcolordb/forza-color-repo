#!/usr/bin/env python3
"""
Parse ManteoMax's Forza HORIZON 5 Spreadsheets using pdfplumber table extraction
"""

import pdfplumber
import json
import sys
import re
from datetime import datetime


def parse_car_table(page):
    """Extract car data from a page using table extraction."""
    cars = []
    
    # Try to extract table
    tables = page.extract_tables()
    
    for table in tables:
        if not table or len(table) < 2:
            continue
        
        # First row is likely headers
        headers = table[0] if table else []
        
        for row in table[1:]:
            if not row or len(row) < 10:
                continue
            
            # Try to find year, make, model, hp, weight, drivetrain
            year = None
            make = None
            model = None
            hp = None
            weight = None
            drivetrain = 'RWD'
            
            for i, cell in enumerate(row):
                if not cell:
                    continue
                cell = str(cell).strip()
                
                # Find year
                if not year and re.match(r'^(19|20)\d{2}$', cell):
                    year = cell
                
                # Find HP (2-4 digits, likely after year)
                if not hp and re.match(r'^\d{2,4}$', cell):
                    val = int(cell)
                    if 20 <= val <= 2000:
                        hp = val
                
                # Find weight (3-4 digits, larger than HP usually)
                if not weight and re.match(r'^\d{3,5}$', cell):
                    val = int(cell)
                    if 500 <= val <= 10000:
                        weight = val
                
                # Find drivetrain
                if cell in ['RWD', 'FWD', 'AWD']:
                    drivetrain = cell
                
                # Build make/model from text cells
                if cell and not year and not re.match(r'^\d+$', cell):
                    if not make and len(cell) < 30:
                        # Check if it's a known make
                        known_makes = ['Ford', 'Chevrolet', 'Porsche', 'Ferrari', 'Lamborghini', 
                                       'BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda', 'Nissan',
                                       'McLaren', 'Bugatti', 'Koenigsegg', 'Pagani', 'Aston Martin',
                                       'Jaguar', 'Land Rover', 'Lexus', 'Mazda', 'Subaru',
                                       'Alfa Romeo', 'Fiat', 'Volkswagen', 'Volvo', 'Tesla',
                                       'Cadillac', 'Dodge', 'Jeep', 'Lincoln', 'Lotus',
                                       'Maserati', 'Mini', 'Mitsubishi', 'Pontiac', 'Shelby']
                        for km in known_makes:
                            if km.lower() in cell.lower():
                                make = km
                                break
            
            if year and make and hp and weight:
                # Estimate model from other cells
                model_parts = []
                for cell in row:
                    if cell and str(cell).strip() not in [year, make, str(hp), str(weight), drivetrain]:
                        cell_str = str(cell).strip()
                        if len(cell_str) > 2 and not re.match(r'^\d+$', cell_str):
                            model_parts.append(cell_str)
                
                model = ' '.join(model_parts[:3]) if model_parts else 'Unknown'
                
                weight_lbs = weight
                weight_kg = round(weight * 0.453592)
                
                # Estimate front weight %
                front_pct = 52
                if drivetrain == 'FWD':
                    front_pct = 60
                elif drivetrain == 'AWD':
                    front_pct = 55
                
                car = {
                    'manufacturer': make,
                    'model': model,
                    'year': year,
                    'horsepower': hp,
                    'weightLbs': weight_lbs,
                    'weightKg': weight_kg,
                    'frontPct': front_pct,
                    'rearPct': 100 - front_pct,
                    'drivetrain': drivetrain,
                    'engine': 'Unknown',
                    'division': 'Unknown',
                    'hpPerLb': round(hp / weight_lbs, 4),
                    'hpPerKg': round(hp / weight_kg, 4),
                    'specSource': 'ManteoMax'
                }
                cars.append(car)
    
    return cars


def parse_text_heuristic(page):
    """Parse using text extraction with heuristics."""
    text = page.extract_text()
    lines = text.split('\n')
    cars = []
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 40:
            continue
        
        # Skip headers
        if any(h in line for h in ['Year', 'Makes:', 'Models:', 'Spreadsheet']):
            continue
        
        # Look for pattern: Year Make Model ... HP ... Weight
        # Example: 2024 Ford Mustang Dark Horse ... 500 ... 3949
        
        # Extract year
        year_match = re.search(r'\b(19\d{2}|20\d{2})\b', line)
        if not year_match:
            continue
        year = year_match.group(1)
        
        # Extract all numbers
        numbers = re.findall(r'\b(\d{2,5})\b', line)
        if len(numbers) < 3:
            continue
        
        # HP is usually a 2-4 digit number (20-2000)
        hp = None
        weight = None
        
        for num in numbers:
            val = int(num)
            if 20 <= val <= 2000 and not hp:
                hp = val
            elif 500 <= val <= 10000 and not weight:
                weight = val
        
        if not hp or not weight:
            continue
        
        # Extract make and model from text
        text_before_year = line[:year_match.start()].strip()
        text_after_year = line[year_match.end():].strip()
        
        # Make and model are after year
        remaining = text_after_year
        
        # Find known makes
        known_makes = ['Ford', 'Chevrolet', 'Chevy', 'Porsche', 'Ferrari', 'Lamborghini', 
                       'BMW', 'Mercedes', 'Mercedes-Benz', 'Audi', 'Toyota', 'Honda', 'Nissan',
                       'McLaren', 'Bugatti', 'Koenigsegg', 'Pagani', 'Aston Martin',
                       'Jaguar', 'Land Rover', 'Lexus', 'Mazda', 'Subaru',
                       'Alfa Romeo', 'Fiat', 'Volkswagen', 'VW', 'Volvo', 'Tesla',
                       'Cadillac', 'Dodge', 'Jeep', 'Lincoln', 'Lotus',
                       'Maserati', 'Mini', 'Mitsubishi', 'Pontiac', 'Shelby',
                       'Hoonigan', 'Hot Wheels', 'AMC', 'Buick', 'Chrysler',
                       'Datsun', 'GMC', 'Holden', 'Infiniti', 'Kia',
                       'Mercury', 'Oldsmobile', 'Plymouth', 'Ram', 'Saab',
                       'Scion', 'Smart', 'Suzuki', 'TVR', 'Vauxhall']
        
        make = None
        for km in sorted(known_makes, key=len, reverse=True):
            if km.lower() in remaining.lower():
                make = km
                # Remove make from remaining text to get model
                idx = remaining.lower().find(km.lower())
                before = remaining[:idx].strip()
                after = remaining[idx + len(km):].strip()
                remaining = after
                break
        
        if not make:
            # Try first word after year
            words = remaining.split()
            if words:
                make = words[0]
                remaining = ' '.join(words[1:])
        
        # Model is the remaining text before numbers
        model = remaining
        # Clean up model - remove engine conversions, etc.
        model = re.sub(r'\d{3},?\s*\d{3}.*$', '', model).strip()
        model = re.sub(r'\d+\s*hp.*$', '', model, flags=re.I).strip()
        model = re.sub(r'\d+\.\d+.*$', '', model).strip()
        
        if len(model) < 2 or len(model) > 60:
            continue
        
        # Find drivetrain
        drivetrain = 'RWD'
        if 'FWD' in line:
            drivetrain = 'FWD'
        elif 'AWD' in line:
            drivetrain = 'AWD'
        elif 'RWD' in line:
            drivetrain = 'RWD'
        
        # Estimate front weight %
        front_pct = 52
        if drivetrain == 'FWD':
            front_pct = 60
        elif drivetrain == 'AWD':
            front_pct = 55
        elif any(x in model.lower() for x in ['mid', 'mr ', 'rear']):
            front_pct = 45
        
        weight_lbs = weight
        weight_kg = round(weight * 0.453592)
        
        car = {
            'manufacturer': make,
            'model': model,
            'year': year,
            'horsepower': hp,
            'weightLbs': weight_lbs,
            'weightKg': weight_kg,
            'frontPct': front_pct,
            'rearPct': 100 - front_pct,
            'drivetrain': drivetrain,
            'engine': 'Unknown',
            'division': 'Unknown',
            'hpPerLb': round(hp / weight_lbs, 4) if weight_lbs else 0,
            'hpPerKg': round(hp / weight_kg, 4) if weight_kg else 0,
            'specSource': 'ManteoMax'
        }
        cars.append(car)
    
    return cars


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/parse_manteomax_table.py <pdf_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    print(f"Parsing: {pdf_path}")
    
    all_cars = []
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        
        for i, page in enumerate(pdf.pages):
            # Try table extraction first
            cars = parse_car_table(page)
            
            # If no cars found, try text heuristic
            if not cars:
                cars = parse_text_heuristic(page)
            
            all_cars.extend(cars)
            
            if (i + 1) % 10 == 0:
                print(f"  Processed {i+1} pages, {len(all_cars)} cars found...")
    
    # Remove duplicates
    seen = set()
    unique_cars = []
    for car in all_cars:
        key = f"{car['year']}|{car['manufacturer']}|{car['model']}"
        if key not in seen:
            seen.add(key)
            unique_cars.append(car)
    
    print(f"\n{'='*60}")
    print(f"Total cars extracted: {len(all_cars)}")
    print(f"Unique cars: {len(unique_cars)}")
    
    # Create master database
    master_db = {
        'version': '1.0.0',
        'generated': datetime.now().isoformat(),
        'source': 'ManteoMax Forza Horizon 5 Spreadsheets',
        'totalCars': len(unique_cars),
        'totalMatched': len(unique_cars),
        'cars': unique_cars
    }
    
    output_path = 'app/data/master_database.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(master_db, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved to: {output_path}")
    
    if unique_cars:
        print(f"\nSample entries:")
        for car in unique_cars[:5]:
            print(f"  {car['year']} {car['manufacturer']} {car['model']}: {car['horsepower']}hp, {car['weightLbs']}lbs, {car['drivetrain']}")


if __name__ == '__main__':
    main()
