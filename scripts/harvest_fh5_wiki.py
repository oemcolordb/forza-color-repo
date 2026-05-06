#!/usr/bin/env python3
"""
Horizon Oracle Harvester: FH5 Wiki Scraper
Extracts up-to-date car lists, PI classes, and base specs from the Forza Wiki.

Dependencies:
    pip install requests beautifulsoup4
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import re

def harvest_wiki_cars():
    print("🔍 Initiating HARVESTER mode: Targeting Forza Wiki...")
    url = "https://forza.fandom.com/wiki/Forza_Horizon_5/Cars"

    # Wiki APIs require a legitimate-looking User-Agent
    headers = {"User-Agent": "HorizonOracle-DataAcquisition/1.0 (Forza Tuning Database)"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print(f"❌ Failed to fetch wiki: {e}")
        return

    print("📡 Page acquired. Parsing data tables...")
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find all sortable tables (The wiki splits cars by Make, but there's a master table)
    tables = soup.find_all('table', class_='wikitable sortable')

    if not tables:
        print("❌ Could not locate data tables on the page.")
        return

    cars = []

    # Loop through the tables (usually one massive one, but sometimes split by category)
    for table in tables:
        rows = table.find_all('tr')[1:] # Skip header row

        for row in rows:
            cols = row.find_all(['td', 'th'])
            if len(cols) >= 5:
                try:
                    year = cols[0].text.strip()
                    make = cols[1].text.strip()
                    model = cols[2].text.strip()
                    car_type = cols[3].text.strip()

                    # PI/Class is usually combined like "S1 800" or has an image icon next to it
                    pi_raw = cols[4].text.strip()

                    # Extract the letter (D, C, B, A, S1, S2, X) and the number (100-999)
                    pi_match = re.search(r'([DCBASX][12]?)\s*(\d{3})', pi_raw)
                    pi_class = pi_match.group(1) if pi_match else "Unknown"
                    pi_value = int(pi_match.group(2)) if pi_match else 0

                    # Filter out empty rows or malformed data
                    if not year.isdigit() or not make:
                        continue

                    car = {
                        "year": year,
                        "manufacturer": make,
                        "model": model,
                        "type": car_type,
                        "fullName": f"{year} {make} {model}",
                        "pi": {
                            "class": pi_class,
                            "value": pi_value
                        }
                    }
                    cars.append(car)
                except Exception as e:
                    continue

    # Save to the databank
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'wiki_harvested_cars.json')

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(cars, f, indent=2, ensure_ascii=False)

    print(f"✅ HARVEST COMPLETE: Successfully extracted {len(cars)} cars.")
    print(f"💾 Saved to: {out_path}")

if __name__ == "__main__":
    harvest_wiki_cars()
