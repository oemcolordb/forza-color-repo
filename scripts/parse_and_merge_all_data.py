#!/usr/bin/env python3
import os
import re
import json

ROOT_DIR = os.getcwd()
CAR_COLORS_PATH = os.path.join(ROOT_DIR, "public", "carColors.json")

# Known multi-word makes to help with parsing
MULTI_WORD_MAKES = [
    "3M WRAPS", "AC CARS", "ASTON MARTIN", "BUDDY CLUB", "HRE WHEELS", "OZ RIMS", 
    "TOM'S RACING", "TECHWRAP USA", "TECKWRAP USA", "TOP SECRET", "W MOTORS", 
    "WEST COAST CUSTOMS", "MY OWN CUSTOM PAINTS", "MY OWN CUTOM PAINTS", 
    "THE BARBIE MOVIE", "CUSTOM PAINTS", "RAYS ENGINEERING", "VOLK RACING"
]

# Known paint types sorted by length descending to match longest first
PAINT_TYPES = [
    "TWO-TONE SEMIGLOSS", "TWO-TONE POLISHED", "TWO-TONE MATTE", 
    "TWO TONE SEMI GLOSS", "TWO TONE SEMIGLOSS", "TWO TONE POLISHED", "TWO TONE MATTE",
    "TWO-TONE", "TWO TONE", "METAL FLAKE", "MATTE", "GLOSS", "SEMIGLOSS", "NORMAL",
    "CARBON FIBER POLISHED", "CARBON FIBRE POLISHED", "CARBON FIBER", "CARBON FIBRE",
    "POLISHED CARBON FIBRE", "POLISHED ALUMINIUM", "POLISHED ALUMINUM",
    "BRUSHED ALUMINUM", "BRUSHED ALUMINIUM", "ALUMINUM SEMIGLOSS", "ALUMINIUM SEMIGLOSS",
    "ALUMINUM POLISHED", "ALUMINIUM POLISHED", "ALUMINUM BRUSHED", "ALUMINIUM BRUSHED",
    "ALUMINUM", "ALUMINIUM", "CHROME", "METAL"
]

def clean_float(s):
    # Strip garbage characters
    s = s.strip("(),; \t\n\r").upper()
    s = s.replace("L", "").replace("R", "")
    if not s:
        return 0.0
    
    # Fix typos like 0..56 -> 0.56
    s = s.replace("..", ".")
    
    # Fix typos like 0.0.0 -> 0.00
    parts = s.split(".")
    if len(parts) > 2:
        s = parts[0] + "." + "".join(parts[1:])
        
    # Fix .53 -> 0.53
    if s.startswith("."):
        s = "0" + s
        
    try:
        val = float(s)
        # Convert degrees to normalized 0-1 if it's > 1 and <= 360
        if val > 1.0 and val <= 360.0:
            val = round(val / 360.0, 4)
        # Clamp to 0-1
        return max(0.0, min(1.0, val))
    except ValueError:
        return 0.0

def is_float_token(token):
    t = token.strip("(),; \t\n\r").upper().replace("L", "").replace("R", "")
    if not t:
        return False
    return bool(re.match(r'^\d*\.?\d+$', t) or re.match(r'^\d+\.\.\d+$', t) or re.match(r'^\d+\.\d+\.\d+$', t))

def parse_txt_sheet(file_path):
    print(f"Parsing: {os.path.basename(file_path)}")
    parsed_colors = []
    
    if not os.path.exists(file_path):
        print(f"  Warning: File does not exist: {file_path}")
        return parsed_colors

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        current_manufacturer = None
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            
            # Skip typical headers
            if any(line.upper().startswith(h) for h in [
                "COLOR 1", "MAKE COLOUR", "MANUFACTURER", "EXPENSIVE CARS", "PERSON WORKING"
            ]):
                continue
            
            # Check if line is a single manufacturer header name
            if len(line.split()) == 1 and not is_float_token(line):
                current_manufacturer = line
                continue
                
            # Determine make
            make = None
            upper_line = line.upper()
            for m in MULTI_WORD_MAKES:
                if upper_line.startswith(m):
                    make = line[:len(m)]
                    remaining = line[len(m):].strip()
                    break
            
            if not make:
                parts = line.split(maxsplit=1)
                make = parts[0]
                remaining = parts[1].strip() if len(parts) > 1 else ""
            
            if not remaining:
                # Blank entry with just manufacturer name
                continue

            # Check for paint type
            paint_type = "Normal"
            color_name = remaining
            rest_of_line = ""
            
            upper_remaining = remaining.upper()
            matched_ptype = None
            for pt in PAINT_TYPES:
                idx = upper_remaining.find(pt)
                if idx != -1:
                    # Verify word boundary
                    before_idx = idx - 1
                    after_idx = idx + len(pt)
                    boundary_before = (before_idx < 0 or remaining[before_idx].isspace())
                    boundary_after = (after_idx >= len(remaining) or remaining[after_idx].isspace())
                    if boundary_before and boundary_after:
                        matched_ptype = pt
                        color_name = remaining[:idx].strip()
                        rest_of_line = remaining[idx + len(pt):].strip()
                        # Normalize paint type
                        paint_type = pt.title()
                        break
            
            # Extract HSB values from rest_of_line (or from color_name if no paint type found)
            target_text = rest_of_line if matched_ptype else color_name
            tokens = target_text.split()
            
            hsb_tokens = []
            comment_tokens = []
            collecting_hsb = True
            
            # Determine maximum HSB values we expect
            # Two-Tone or Metal Flake has 6 HSB values, others have 3
            is_two_color = any(x in paint_type.lower() for x in ["two", "flake"])
            max_hsb_values = 6 if is_two_color else 3
            
            for t in tokens:
                if collecting_hsb:
                    if is_float_token(t):
                        hsb_tokens.append(t)
                        if len(hsb_tokens) >= max_hsb_values:
                            collecting_hsb = False
                    elif t.upper() in ["L", "R"]:
                        continue
                    else:
                        collecting_hsb = False
                        comment_tokens.append(t)
                else:
                    comment_tokens.append(t)
            
            comment = " ".join(comment_tokens).strip()
            
            # If no paint type matched but we found HSB tokens, adjust color name
            if not matched_ptype and hsb_tokens:
                # Find where the first HSB token starts in remaining and slice it
                first_token = hsb_tokens[0]
                idx = remaining.find(first_token)
                if idx != -1:
                    color_name = remaining[:idx].strip()
            
            # Handle clean values
            hsb_floats = [clean_float(x) for x in hsb_tokens]
            
            color1 = None
            color2 = None
            
            if len(hsb_floats) >= 6:
                color1 = {"h": hsb_floats[0], "s": hsb_floats[1], "b": hsb_floats[2]}
                color2 = {"h": hsb_floats[3], "s": hsb_floats[4], "b": hsb_floats[5]}
            elif len(hsb_floats) >= 3:
                color1 = {"h": hsb_floats[0], "s": hsb_floats[1], "b": hsb_floats[2]}
                color2 = {"h": hsb_floats[0], "s": hsb_floats[1], "b": hsb_floats[2]}
            
            # Clean up color name if it ends with '--'
            color_name = color_name.strip(" -")
            if not color_name:
                color_name = "--"
                
            parsed_colors.append({
                "make": make,
                "model": "",
                "year": None,
                "colorName": color_name,
                "colorType": paint_type,
                "color1": color1,
                "color2": color2,
                "comment": comment,
                "source_file": os.path.basename(file_path),
                "line": line_num
            })
            
    print(f"  Parsed {len(parsed_colors)} rows.")
    return parsed_colors

def main():
    print("[START] Forza Master Color Database Consolidation Script")
    
    # 1. Parse all text sheets
    sheets = [
        "Forza Colour Sheet (Est. 2019) - Vehicle Colours.txt",
        "Forza Colour Sheet (Est. 2019) - Wheel Colours.txt",
        "Forza Horizon 5 Color Sheet - Aftermarket Color.txt",
        "Forza Horizon 5 Color Sheet - Body Color.txt",
        "Forza Horizon 5 Color Sheet - Brake Caliper.txt",
        "Forza Horizon 5 Color Sheet - One of a kind body color.txt",
        "Forza Horizon 5 Color Sheet - VIP Body Color.txt",
        "Forza Horizon 5 Color Sheet - Wheel.txt",
        "Forza Horizon 5 Color Sheet-31.txt",
    ]
    
    all_parsed = []
    for sheet in sheets:
        sheet_path = os.path.join(ROOT_DIR, sheet)
        all_parsed.extend(parse_txt_sheet(sheet_path))
        
    print(f"Total parsed entries: {len(all_parsed)}")
    
    # 2. Read existing carColors.json if it exists
    existing_colors = []
    if os.path.exists(CAR_COLORS_PATH):
        print(f"Loading existing database: {CAR_COLORS_PATH}")
        try:
            with open(CAR_COLORS_PATH, "r", encoding="utf-8") as f:
                existing_colors = json.load(f)
            print(f"  Loaded {len(existing_colors)} existing entries.")
        except Exception as e:
            print(f"  Error loading existing database: {e}")
            
    # 3. Merge and Deduplicate
    merged_map = {}
    duplicates_count = 0
    blanks_count = 0
    inferred_count = 0
    
    # Simple color HSB lookup for blank entries based on common keywords
    inferences = {
        "black": {"h": 0.0, "s": 0.0, "b": 0.05},
        "nero": {"h": 0.0, "s": 0.0, "b": 0.08},
        "white": {"h": 0.0, "s": 0.0, "b": 0.95},
        "bianco": {"h": 0.0, "s": 0.0, "b": 0.94},
        "gray": {"h": 0.0, "s": 0.0, "b": 0.50},
        "grey": {"h": 0.0, "s": 0.0, "b": 0.50},
        "grigio": {"h": 0.0, "s": 0.0, "b": 0.48},
        "red": {"h": 0.0, "s": 0.90, "b": 0.80},
        "rosso": {"h": 0.0, "s": 0.85, "b": 0.75},
        "blue": {"h": 0.60, "s": 0.80, "b": 0.70},
        "blu": {"h": 0.60, "s": 0.80, "b": 0.70},
        "green": {"h": 0.33, "s": 0.80, "b": 0.60},
        "verde": {"h": 0.32, "s": 0.75, "b": 0.55},
        "yellow": {"h": 0.15, "s": 0.90, "b": 0.90},
        "giallo": {"h": 0.13, "s": 0.85, "b": 0.88},
        "orange": {"h": 0.08, "s": 0.90, "b": 0.85},
        "arancio": {"h": 0.07, "s": 0.85, "b": 0.88},
    }
    
    def infer_hsb(name):
        n = name.lower()
        for kw, hsb in inferences.items():
            if kw in n:
                return hsb
        # Fallback dark gray
        return {"h": 0.0, "s": 0.0, "b": 0.30}

    # Add existing entries first to preserve them
    for entry in existing_colors:
        make = entry.get("make", "Unknown")
        color_name = entry.get("colorName", "Unnamed")
        color_type = entry.get("colorType", "Normal")
        year = entry.get("year")
        
        # Deduplication key
        key = f"{make.lower()}||{color_name.lower()}||{color_type.lower()}||{year or ''}"
        merged_map[key] = entry
        
    # Add new parsed entries
    for entry in all_parsed:
        make = entry["make"]
        color_name = entry["colorName"]
        color_type = entry["colorType"]
        year = entry["year"]
        
        # Check if blank (no color1 HSB)
        if not entry["color1"]:
            blanks_count += 1
            # Infer from name
            inferred = infer_hsb(color_name)
            entry["color1"] = inferred
            entry["color2"] = inferred
            inferred_count += 1
            
        key = f"{make.lower()}||{color_name.lower()}||{color_type.lower()}||{year or ''}"
        
        if key in merged_map:
            duplicates_count += 1
            existing = merged_map[key]
            
            # Keep the one with better/more complete HSB (non-zero) or comments
            existing_c1 = existing.get("color1", {})
            existing_has_hsb = existing_c1 and not (existing_c1.get("h") == 0 and existing_c1.get("s") == 0 and existing_c1.get("b") == 0)
            
            current_c1 = entry["color1"]
            current_has_hsb = current_c1 and not (current_c1.get("h") == 0 and current_c1.get("s") == 0 and current_c1.get("b") == 0)
            
            # Swap if current has better HSB
            if current_has_hsb and not existing_has_hsb:
                merged_map[key] = {
                    "make": make,
                    "colorName": color_name,
                    "colorType": color_type,
                    "model": existing.get("model", ""),
                    "year": year or existing.get("year"),
                    "color1": entry["color1"],
                    "color2": entry["color2"],
                    "comment": entry["comment"] or existing.get("comment", "")
                }
        else:
            merged_map[key] = {
                "make": make,
                "colorName": color_name,
                "colorType": color_type,
                "model": "",
                "year": year,
                "color1": entry["color1"],
                "color2": entry["color2"],
                "comment": entry["comment"]
            }
            
    final_colors = list(merged_map.values())
    
    # 4. Save backup
    if os.path.exists(CAR_COLORS_PATH):
        backup_path = CAR_COLORS_PATH + ".bak"
        print(f"Creating backup: {backup_path}")
        os.replace(CAR_COLORS_PATH, backup_path)
        
    # 5. Write to carColors.json
    print(f"Saving {len(final_colors)} colors to {CAR_COLORS_PATH}")
    with open(CAR_COLORS_PATH, "w", encoding="utf-8") as f:
        json.dump(final_colors, f, indent=2, ensure_ascii=False)
        
    print("\n[SUCCESS] Consolidation Complete!")
    print(f"  Total final colors in database: {len(final_colors):,}")
    print(f"  New duplicates handled         : {duplicates_count:,}")
    print(f"  New blanks detected           : {blanks_count:,}")
    print(f"  New blank HSBs inferred       : {inferred_count:,}")

if __name__ == "__main__":
    main()
