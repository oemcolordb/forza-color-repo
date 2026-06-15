#!/usr/bin/env python3
"""
Parse Forza_Horizon_Cars.csv and create master_database.json
"""

import csv
import json
import sys
from datetime import datetime


def normalize_drivetrain(dt):
    """Normalize drivetrain to RWD/FWD/AWD."""
    dt = str(dt).upper().strip()
    if 'AWD' in dt:
        return 'AWD'
    if 'FWD' in dt:
        return 'FWD'
    return 'RWD'


def parse_weight(value):
    """Parse weight in kg or lbs."""
    try:
        # Remove commas and quotes
        clean = str(value).replace(',', '').replace('"', '').strip()
        val = float(clean)
        if val > 1000:  # Assume lbs if > 1000
            return round(val), round(val * 0.453592)
        else:  # Assume kg
            return round(val * 2.20462), round(val)
    except:
        return 3000, 1361  # Default values


def parse_horsepower(value):
    """Parse horsepower."""
    try:
        clean = str(value).replace(',', '').replace('"', '').strip()
        return int(float(clean))
    except:
        return 300  # Default


def parse_front_pct(drivetrain, car_type=''):
    """Estimate front weight percentage."""
    car_type = str(car_type).lower()

    if drivetrain == 'FWD':
        return 60
    elif drivetrain == 'AWD':
        return 55
    elif 'mid' in car_type or 'rear' in car_type:
        return 45
    else:
        return 52  # Default RWD


def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else 'Forza_Horizon_Cars.csv'

    print(f"Parsing: {csv_path}")

    cars = []

    try:
        with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)

            for i, row in enumerate(reader):
                try:
                    # Parse Name_and_model field: "2001 Acura Integra Type R"
                    name_model = str(row.get('Name_and_model', '')).strip()
                    if not name_model:
                        continue

                    # Extract year, make, model from name
                    parts = name_model.split(' ', 2)
                    if len(parts) < 2:
                        continue

                    year = parts[0] if parts[0].isdigit() else ''
                    make = parts[1] if len(parts) > 1 else ''
                    model = parts[2] if len(parts) > 2 else ''

                    if not year or not make:
                        continue

                    hp = parse_horsepower(row.get('Horse_Power', 0))
                    weight_lbs, weight_kg = parse_weight(row.get('Weight_lbs', 3000))
                    drivetrain = normalize_drivetrain(row.get('Drive_Type', 'RWD'))

                    car_type = str(row.get('Model_type', ''))
                    front_pct = parse_front_pct(drivetrain, car_type)

                    engine = 'Unknown'
                    division = car_type or 'Unknown'

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
                        'engine': engine,
                        'division': division,
                        'hpPerLb': round(hp / weight_lbs, 4) if weight_lbs else 0,
                        'hpPerKg': round(hp / weight_kg, 4) if weight_kg else 0,
                        'specSource': 'ManteoMax'
                    }
                    cars.append(car)

                    if (i + 1) % 100 == 0:
                        print(f"  Processed {i+1} cars...")

                except Exception as e:
                    continue

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"Total cars: {len(cars)}")

    # Create master database
    master_db = {
        'version': '1.0.0',
        'generated': datetime.now().isoformat(),
        'source': 'ManteoMax Forza Horizon 5 Spreadsheets',
        'totalCars': len(cars),
        'totalMatched': len(cars),
        'cars': cars
    }

    output_path = 'app/data/master_database.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(master_db, f, indent=2, ensure_ascii=False)

    print(f"[SUCCESS] Saved to: {output_path}")

    if cars:
        print(f"\nSample entries:")
        for car in cars[:5]:
            print(f"  {car['year']} {car['manufacturer']} {car['model']}: {car['horsepower']}hp, {car['weightKg']}kg, {car['drivetrain']}")


if __name__ == '__main__':
    main()
