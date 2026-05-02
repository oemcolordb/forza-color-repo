import fitz
import os
import json
import re

pdf_files = [f for f in os.listdir('.') if f.endswith('.pdf') and 'Sheet' in f]

all_colors = []

def normalize_paint_type(ptype):
    ptype = str(ptype).strip()
    if not ptype or ptype.lower() == 'not in source': return "Normal"
    low = ptype.lower()
    if "metal flake" in low: return "Metal Flake"
    if "matte" in low: return "Matte"
    if "gloss" in low: return "Gloss"
    if "semigloss" in low: return "Semigloss"
    if "carbon" in low: return "Carbon Fiber Polished"
    if "polished" in low: return "Polished"
    if "two-tone" in low or "two tone" in low: return "Two-Tone"
    if "normal" in low: return "Normal"
    return ptype

def extract_from_pdf(pdf_path):
    print(f"Extracting from {pdf_path}...")
    doc = fitz.open(pdf_path)
    colors = []
    
    for page in doc:
        # get text as table, PyMuPDF has a table finding utility in recent versions
        # Or we can use page.get_text("words") and sort by y, then x
        tabs = page.find_tables()
        if tabs and len(tabs.tables) > 0:
            for tab in tabs:
                df = tab.extract()
                for row in df:
                    if len(row) < 6: continue
                    # check if first cell is manufacturer
                    make = str(row[0]).strip()
                    if not make or make.lower() in ['manufacturer', 'make', 'color 1', 'how it works:']: 
                        continue
                    
                    color_name = str(row[1]).strip()
                    if not color_name or color_name.lower() in ['colour name', 'color name']: continue
                    
                    paint_type = str(row[2]).strip()
                    
                    try:
                        # Sometimes hue is "0.53 L", we need to extract float
                        def get_val(val):
                            v = str(val)
                            nums = re.findall(r'(\d+\.\d+|\d+)', v)
                            if nums: return float(nums[0])
                            return 0.0
                            
                        c1h = get_val(row[3])
                        c1s = get_val(row[4])
                        c1b = get_val(row[5])
                        
                        c2h, c2s, c2b = c1h, c1s, c1b
                        if len(row) >= 9:
                            try:
                                c2h_val = get_val(row[6])
                                c2s_val = get_val(row[7])
                                c2b_val = get_val(row[8])
                                if c2h_val or c2s_val or c2b_val:
                                    c2h, c2s, c2b = c2h_val, c2s_val, c2b_val
                            except:
                                pass
                                
                        colors.append({
                            "make": make,
                            "model": "",
                            "year": None,
                            "colorName": color_name,
                            "colorType": normalize_paint_type(paint_type),
                            "color1": {"h": c1h, "s": c1s, "b": c1b},
                            "color2": {"h": c2h, "s": c2s, "b": c2b}
                        })
                    except Exception as e:
                        print(f"Error parsing row: {row}")
    return colors

for pf in pdf_files:
    all_colors.extend(extract_from_pdf(pf))

print(f"Extracted {len(all_colors)} total colors from PDFs.")

# Load existing
existing_path = os.path.join('public', 'carColors.json')
with open(existing_path, 'r', encoding='utf-8') as f:
    existing_colors = json.load(f)

print(f"Existing colors: {len(existing_colors)}")

# Deduplicate
existing_keys = set()
for c in existing_colors:
    existing_keys.add(f"{str(c.get('make')).lower()}-{str(c.get('colorName')).lower()}")

new_colors = []
for c in all_colors:
    key = f"{str(c['make']).lower()}-{str(c['colorName']).lower()}"
    if key not in existing_keys:
        new_colors.append(c)
        existing_keys.add(key)

print(f"Found {len(new_colors)} new colors.")

if new_colors:
    existing_colors.extend(new_colors)
    with open(existing_path, 'w', encoding='utf-8') as f:
        json.dump(existing_colors, f, indent=2)
    print(f"Successfully saved {len(existing_colors)} colors to {existing_path}")
    
    # Save a log of what was added
    with open('added_colors.log', 'w', encoding='utf-8') as f:
        for c in new_colors:
            f.write(f"Added: {c['make']} - {c['colorName']} ({c['colorType']})\n")
