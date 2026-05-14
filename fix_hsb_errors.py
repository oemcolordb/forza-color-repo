"""
Fix HSB source file errors found by audit_hsb_detailed.py

Issues to fix across all 3 source files:
1. Trailing spaces in colorName (9 entries)
2. Trailing spaces in make (2 entries)
3. Double spaces in colorName (2 entries)
4. Space within number in colorName: "0. 00" -> "0.00"
5. Entries 18003 & 18004: corrupted TOM'S Racing make fields with
   embedded newlines + multiple rows merged into a single field.
   These are split back into proper individual entries.
"""

import json
import re
from copy import deepcopy
from pathlib import Path

FILES = [
    "public/carColors.json",
    "public/carColors_fixed.json",
    "public/carColors_name_fixed.json",
]

# ── TOM'S Racing entries to replace 18003 and 18004 ──────────────────────────
# Parsed manually from the embedded text in the corrupted make fields.
# HSB values are in the format: h s b (already 0-1 scale)
TOMS_REPLACEMENT_ENTRIES = [
    {
        "make": "TOM'S Racing",
        "model": "",
        "year": None,
        "colorName": "British Racing Green",
        "colorType": "Gloss",
        "color1": {"h": 0.45, "s": 0.48, "b": 0.23},
        "color2": {"h": 0.45, "s": 0.48, "b": 0.23},
    },
    {
        "make": "TOM'S Racing",
        "model": "",
        "year": None,
        "colorName": "TOM'S Favorite Orange",
        "colorType": "Gloss",
        "color1": {"h": 0.08, "s": 0.80, "b": 0.58},
        "color2": {"h": 0.08, "s": 0.80, "b": 0.58},
    },
    {
        "make": "TOM'S Racing",
        "model": "",
        "year": None,
        "colorName": "TOM'S Sky Blue",
        "colorType": "Gloss",
        "color1": {"h": 0.57, "s": 0.79, "b": 0.50},
        "color2": {"h": 0.57, "s": 0.79, "b": 0.50},
    },
    {
        "make": "TOM'S Racing",
        "model": "",
        "year": None,
        "colorName": "Performance Blue",       # note: original had typo "Preformance"
        "colorType": "Gloss",
        "color1": {"h": 0.60, "s": 0.73, "b": 0.59},
        "color2": {"h": 0.60, "s": 0.73, "b": 0.59},
    },
    {
        "make": "TOM'S Racing",
        "model": "",
        "year": None,
        "colorName": "TOM'S Speedway Yellow",
        "colorType": "Gloss",
        "color1": {"h": 0.13, "s": 0.85, "b": 0.60},
        "color2": {"h": 0.13, "s": 0.85, "b": 0.60},
    },
    {
        "make": "TOM'S Racing",
        "model": "",
        "year": None,
        "colorName": "Bubble Gum Pink",
        "colorType": "Gloss",
        "color1": {"h": 0.85, "s": 0.58, "b": 0.71},
        "color2": {"h": 0.85, "s": 0.58, "b": 0.71},
    },
    {
        "make": "TOM'S Racing",
        "model": "",
        "year": None,
        "colorName": "TOM'S Gunmetal Grey",    # note: original had typo "Gunmedal"
        "colorType": "Gloss",
        "color1": {"h": 0.00, "s": 0.00, "b": 0.34},
        "color2": {"h": 0.00, "s": 0.00, "b": 0.34},
    },
    {
        "make": "TOM'S Racing",
        "model": "",
        "year": None,
        "colorName": "TOM'S Baby Blue",
        "colorType": "Gloss",
        "color1": {"h": 0.53, "s": 0.49, "b": 0.60},
        "color2": {"h": 0.53, "s": 0.49, "b": 0.60},
    },
    {
        "make": "TOM'S Racing",
        "model": "",
        "year": None,
        "colorName": "TOM'S Racing Purple",
        "colorType": "Gloss",
        "color1": {"h": 0.85, "s": 0.23, "b": 0.59},
        "color2": {"h": 0.85, "s": 0.23, "b": 0.59},
    },
]


def fix_string_fields(entry):
    """Strip leading/trailing spaces and fix double spaces in string fields."""
    changes = []
    for field in ["make", "model", "colorName", "name", "colorType"]:
        if field in entry and isinstance(entry[field], str):
            original = entry[field]
            # Strip leading/trailing spaces
            fixed = original.strip()
            # Collapse double spaces to single
            fixed = re.sub(r'  +', ' ', fixed)
            # Fix "0. 00" style spaces within numbers in colorName
            if field == "colorName":
                fixed = re.sub(r'(\d+)\.\s+(\d+)', r'\1.\2', fixed)
            if fixed != original:
                entry[field] = fixed
                changes.append(f"  {field}: {repr(original)} -> {repr(fixed)}")
    return changes


def fix_data(data):
    """Apply all fixes to the data list. Returns (fixed_data, change_log)."""
    fixed = []
    change_log = []

    for idx, entry in enumerate(data):
        if not isinstance(entry, dict):
            fixed.append(entry)
            continue

        make = entry.get("make", "")

        # ── Detect corrupted TOM'S Racing entries (18003, 18004) ──────────────
        if isinstance(make, str) and "TOM'S Racing" in make and '\n' in make:
            change_log.append(
                f"\n[{idx}] CORRUPTED TOM'S Racing entry detected — "
                f"removing and will insert proper entries after processing."
            )
            # Skip these corrupted entries; replacements inserted at end
            continue

        entry = deepcopy(entry)
        str_changes = fix_string_fields(entry)
        if str_changes:
            change_log.append(f"\n[{idx}] {entry.get('make','?')} '{entry.get('colorName', entry.get('name','?'))}'")
            change_log.extend(str_changes)

        fixed.append(entry)

    # Insert the proper TOM'S Racing entries at the position of 18003
    # (which is where the first corrupted entry was)
    insert_pos = 18003
    for i, toms_entry in enumerate(TOMS_REPLACEMENT_ENTRIES):
        fixed.insert(insert_pos + i, toms_entry)
        change_log.append(
            f"\n[INSERT @ {insert_pos + i}] TOM'S Racing '{toms_entry['colorName']}' "
            f"H={toms_entry['color1']['h']} S={toms_entry['color1']['s']} B={toms_entry['color1']['b']}"
        )

    return fixed, change_log


def main():
    print("Forza Color HSB Error Fixer")
    print("=" * 70)

    for filepath in FILES:
        p = Path(filepath)
        if not p.exists():
            print(f"\nSkipping {filepath} — file not found")
            continue

        print(f"\nProcessing: {filepath}")

        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        original_count = len(data)
        fixed_data, change_log = fix_data(data)
        new_count = len(fixed_data)

        print(f"  Original entries: {original_count}")
        print(f"  Fixed entries:    {new_count}  ({new_count - original_count:+d})")
        print(f"  Changes logged:   {len(change_log)}")

        # Print changes
        for line in change_log:
            print(line)

        # Write fixed file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(fixed_data, f, indent=2, ensure_ascii=False)

        print(f"\n  ✓ Written: {filepath}")

    print("\n\nAll files fixed successfully.")
    print("Run 'python audit_hsb_detailed.py' to verify no issues remain.")


if __name__ == "__main__":
    main()
