22"""
Detailed HSB Audit Script
Checks all color source files for:
1. HSB values out of valid range (0-1)
2. Suspicious decimal place errors (e.g. 0.053 when 0.53 was intended)
3. Leading/trailing spaces in string fields
4. Missing or null HSB fields
5. Duplicate entries with conflicting HSB values
6. Values that look like they belong to a different scale (e.g., 0-255 or 0-360)
"""

import json
import re
import sys
from pathlib import Path

FILES_TO_CHECK = [
    "public/carColors.json",
    "public/carColors_fixed.json",
    "public/carColors_name_fixed.json",
]

# HSB key names to look for in color objects
HSB_COLOR_KEYS = ["color1", "color2", "original_hsb"]

def check_hsb_object(hsb_obj, field_name, entry_idx, entry_info):
    """Check a single HSB object for issues."""
    issues = []
    if not isinstance(hsb_obj, dict):
        issues.append(f"  [{field_name}] Not a dict: {hsb_obj}")
        return issues

    for component in ["h", "s", "b"]:
        if component not in hsb_obj:
            issues.append(f"  [{field_name}] Missing component '{component}'")
            continue

        val = hsb_obj[component]

        # Check type
        if not isinstance(val, (int, float)):
            issues.append(f"  [{field_name}.{component}] Not a number: repr={repr(val)}")
            continue

        # Check range
        if val < 0 or val > 1:
            issues.append(f"  [{field_name}.{component}] OUT OF RANGE: {val}")

        # Check for suspicious values that might be decimal place errors
        # E.g., 5.3 instead of 0.53 (would be caught above)
        # E.g., 0.053 instead of 0.53 — harder to detect without ground truth
        # Flag values with more than 3 decimal places that look unusual
        val_str = str(val)
        if '.' in val_str:
            decimal_part = val_str.split('.')[1]
            if len(decimal_part) > 4:
                issues.append(f"  [{field_name}.{component}] Unusual precision: {val}")

    return issues


def check_string_field(value, field_name):
    """Check for spacing issues in string fields."""
    issues = []
    if not isinstance(value, str):
        return issues
    if value != value.strip():
        issues.append(f"  [{field_name}] Leading/trailing spaces: repr={repr(value)}")
    if '  ' in value:
        issues.append(f"  [{field_name}] Double spaces: repr={repr(value)}")
    # Check for non-printable characters
    if re.search(r'[\x00-\x1f\x7f-\x9f]', value):
        issues.append(f"  [{field_name}] Contains control characters: repr={repr(value)}")
    return issues


def audit_file(filepath):
    """Audit a single JSON color file."""
    print(f"\n{'='*70}")
    print(f"Auditing: {filepath}")
    print('='*70)

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"ERROR loading file: {e}")
        return

    if not isinstance(data, list):
        print(f"ERROR: Expected a list, got {type(data)}")
        return

    print(f"Total entries: {len(data)}")

    all_issues = []
    out_of_range_count = 0
    missing_hsb_count = 0
    spacing_issue_count = 0
    unusual_precision_count = 0

    for idx, entry in enumerate(data):
        if not isinstance(entry, dict):
            print(f"WARNING: Entry {idx} is not a dict: {type(entry)}")
            continue

        entry_make = entry.get("make", "?")
        entry_model = entry.get("model", "?")
        entry_name = entry.get("colorName", entry.get("name", "?"))
        entry_info = f"[{idx}] {entry_make} {entry_model} '{entry_name}'"

        entry_issues = []

        # Check string fields for spacing issues
        for str_field in ["make", "model", "colorName", "name", "colorType"]:
            if str_field in entry:
                entry_issues += check_string_field(entry[str_field], str_field)

        # Check HSB color objects
        has_any_hsb = False
        for color_key in HSB_COLOR_KEYS:
            if color_key in entry:
                has_any_hsb = True
                entry_issues += check_hsb_object(
                    entry[color_key], color_key, idx, entry_info
                )

        # Also handle flat h/s/b at top level
        if "h" in entry or "s" in entry or "b" in entry:
            has_any_hsb = True
            entry_issues += check_hsb_object(entry, "top-level", idx, entry_info)

        if not has_any_hsb:
            missing_hsb_count += 1

        if entry_issues:
            all_issues.append((entry_info, entry_issues))
            for issue in entry_issues:
                if "OUT OF RANGE" in issue:
                    out_of_range_count += 1
                if "spaces" in issue or "control" in issue:
                    spacing_issue_count += 1
                if "precision" in issue:
                    unusual_precision_count += 1

    # Summary
    print(f"\n--- SUMMARY ---")
    print(f"  Entries checked:          {len(data)}")
    print(f"  Entries missing HSB:      {missing_hsb_count}")
    print(f"  Out-of-range values:      {out_of_range_count}")
    print(f"  Spacing/format issues:    {spacing_issue_count}")
    print(f"  Unusual precision values: {unusual_precision_count}")
    print(f"  Total entries with issues:{len(all_issues)}")

    if all_issues:
        print(f"\n--- ISSUES FOUND ---")
        for entry_info, issues in all_issues:
            print(f"\n  {entry_info}")
            for issue in issues:
                print(f"    {issue.strip()}")
    else:
        print("\n  No issues found! ✓")

    return all_issues


def check_for_scale_confusion(filepath):
    """
    Look for HSB values that might be on the wrong scale.
    E.g., hue given in 0-360 degrees instead of 0-1,
    or saturation/brightness given as 0-100 instead of 0-1.
    """
    print(f"\n--- Scale Confusion Check for {filepath} ---")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            raw_text = f.read()
    except Exception as e:
        print(f"ERROR: {e}")
        return

    # Look for values >= 2 in h, s, or b fields
    # Pattern: "h": 2.5 or "s": 45 etc.
    pattern = r'"([hsb])"\s*:\s*(\d+(?:\.\d+)?)'
    matches = re.findall(pattern, raw_text)

    scale_issues = [(comp, float(val)) for comp, val in matches if float(val) > 1.0]

    if scale_issues:
        print(f"  Found {len(scale_issues)} values > 1.0:")
        for comp, val in scale_issues[:50]:  # Show first 50
            print(f"    '{comp}': {val}")
    else:
        print(f"  No scale confusion detected ✓")


def check_raw_text_for_spacing(filepath):
    """Check raw JSON text for suspicious spacing patterns near numbers."""
    print(f"\n--- Raw Text Spacing Check for {filepath} ---")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            raw_text = f.read()
    except Exception as e:
        print(f"ERROR: {e}")
        return

    issues = []

    # Check for spaces inside number values like "0. 53" or "0 .53"
    space_in_number = re.findall(r'"[hsb]"\s*:\s*\d+\s+\.\s*\d+|\d+\.\s+\d+', raw_text)
    if space_in_number:
        issues.append(f"  Spaces within numbers: {space_in_number[:10]}")

    # Check for extra spaces in colorName values
    space_in_name = re.findall(r'"colorName"\s*:\s*"[^"]*  [^"]*"', raw_text)
    if space_in_name:
        issues.append(f"  Double spaces in colorName: {space_in_name[:10]}")

    # Check for leading/trailing spaces in colorName values
    leading_trailing = re.findall(r'"colorName"\s*:\s*" [^"]*"|"colorName"\s*:\s*"[^"]*\s"', raw_text)
    if leading_trailing:
        issues.append(f"  Leading/trailing spaces in colorName: {leading_trailing[:10]}")

    # Check for leading/trailing spaces in make values
    make_spaces = re.findall(r'"make"\s*:\s*" [^"]*"|"make"\s*:\s*"[^"]*\s"', raw_text)
    if make_spaces:
        issues.append(f"  Leading/trailing spaces in make: {make_spaces[:10]}")

    if issues:
        for issue in issues:
            print(issue)
    else:
        print(f"  No raw text spacing issues detected ✓")


def check_for_duplicate_names_different_hsb(filepath):
    """Check if the same colorName/make combo has conflicting HSB values."""
    print(f"\n--- Duplicate Name/HSB Conflict Check for {filepath} ---")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"ERROR: {e}")
        return

    seen = {}
    conflicts = []
    for idx, entry in enumerate(data):
        make = entry.get("make", "")
        name = entry.get("colorName", entry.get("name", ""))
        model = entry.get("model", "")
        key = (make, model, name)

        c1 = entry.get("color1") or entry.get("original_hsb")
        if c1 is None:
            continue

        c1_tuple = (c1.get("h"), c1.get("s"), c1.get("b"))

        if key in seen:
            prev_idx, prev_tuple = seen[key]
            if prev_tuple != c1_tuple:
                conflicts.append({
                    "key": key,
                    "first": {"idx": prev_idx, "hsb": prev_tuple},
                    "second": {"idx": idx, "hsb": c1_tuple},
                })
        else:
            seen[key] = (idx, c1_tuple)

    if conflicts:
        print(f"  Found {len(conflicts)} duplicate name entries with different HSB:")
        for c in conflicts[:20]:
            print(f"    {c['key']}:")
            print(f"      First  [idx {c['first']['idx']}]:  H={c['first']['hsb'][0]}, S={c['first']['hsb'][1]}, B={c['first']['hsb'][2]}")
            print(f"      Second [idx {c['second']['idx']}]: H={c['second']['hsb'][0]}, S={c['second']['hsb'][1]}, B={c['second']['hsb'][2]}")
    else:
        print(f"  No conflicting duplicates found ✓")


def main():
    print("Forza Color HSB Detailed Audit")
    print("=" * 70)

    all_file_issues = {}

    for filepath in FILES_TO_CHECK:
        p = Path(filepath)
        if not p.exists():
            print(f"\nSkipping {filepath} - file not found")
            continue

        issues = audit_file(filepath)
        all_file_issues[filepath] = issues

        # Additional checks
        check_for_scale_confusion(filepath)
        check_raw_text_for_spacing(filepath)
        check_for_duplicate_names_different_hsb(filepath)

    print("\n\n" + "=" * 70)
    print("FINAL SUMMARY")
    print("=" * 70)
    for filepath, issues in all_file_issues.items():
        total = len(issues) if issues else 0
        print(f"  {filepath}: {total} entries with issues")

    print("\nAudit complete.")


if __name__ == "__main__":
    main()
