#!/usr/bin/env python3
"""
Enhanced PDF tune extractor v2 - comprehensive extraction with OCR fallback
"""

import sys
import os
import re
import json
from pathlib import Path

# Try to import pdfplumber
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    print("Error: pdfplumber not installed. Run: pip install pdfplumber")
    sys.exit(1)

# Try to import OCR libraries
try:
    from PIL import Image
    import pytesseract

    # Auto-detect Tesseract on Windows if it's not in the PATH
    if os.name == 'nt':
        # Hardcoded Tesseract path
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    HAS_OCR = True
except ImportError:
    HAS_OCR = False
    print("Warning: OCR not available (pip install pytesseract pillow)")

# Known car manufacturers for validation
KNOWN_MAKES = [
    'Acura', 'Alfa Romeo', 'Ariel', 'Aston Martin', 'Audi', 'BAC', 'BMW', 'Bentley',
    'Bugatti', 'Buick', 'Cadillac', 'Caterham', 'Chevrolet', 'Chrysler', 'Citroen',
    'Datsun', 'DeLorean', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'GMC', 'Hennessey',
    'Honda', 'Hoonigan', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Koenigsegg',
    'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati',
    'Mazda', 'McLaren', 'Mercedes', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan',
    'Noble', 'Opel', 'Pagani', 'Peugeot', 'Plymouth', 'Polaris', 'Pontiac', 'Porsche',
    'Radical', 'Ram', 'Renault', 'Rimac', 'Rolls-Royce', 'Saleen', 'Scion', 'Shelby',
    'Subaru', 'TVR', 'Tesla', 'Toyota', 'Vauxhall', 'Volkswagen', 'Volvo', 'Wiesmann',
    'AMC', 'Ascari', 'Donkervoort', 'Ginetta', 'Holden', 'HSV', 'KTM', 'Lola',
    'Morgan', 'Noble', 'Ruf', 'Spyker', 'Ultima', 'Zenvo'
]

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


def extract_share_codes(text):
    """Find all share codes in text."""
    codes = []
    if not text:
        return codes

    # Pattern: 123 456 789 or 123-456-789 or 123456789
    for match in re.finditer(r'\b(\d{3})[\s\-]?(\d{3})[\s\-]?(\d{3})\b', text):
        code = f"{match.group(1)} {match.group(2)} {match.group(3)}"
        # Get context (100 chars before and after)
        start = max(0, match.start() - 100)
        end = min(len(text), match.end() + 100)
        context = text[start:end]
        codes.append({
            'code': code,
            'position': match.start(),
            'context': context,
            'line': text[max(0, text.rfind('\n', 0, match.start())):text.find('\n', match.end())].strip()
        })
    return codes


def extract_car_candidates(text, lines_context=5):
    """Extract potential car names from text."""
    candidates = []
    if not text:
        return candidates

    lines = text.split('\n')

    for i, line in enumerate(lines):
        line = line.strip()
        if not line or len(line) < 3 or len(line) > 100:
            continue

        # Skip lines that are obviously not cars
        skip_patterns = [
            r'^\d+$', r'^\d+\.\d+$', r'^\d{3}\s+\d{3}\s+\d{3}$',  # Numbers
            r'^http', r'^www\.',  # URLs
            r'^(share|code|tune|hp|pi|class|url|source|page|of)$',  # Headers
            r'^(the|and|for|with|from|this|that|these|those|a|an)$',  # Articles
        ]

        should_skip = False
        for pattern in skip_patterns:
            if re.match(pattern, line, re.IGNORECASE):
                should_skip = True
                break

        if should_skip:
            continue

        # Check if it contains a known make
        contains_make = False
        for make in KNOWN_MAKES:
            if make.lower() in line.lower():
                contains_make = True
                break

        # Check for year + make pattern
        year_pattern = r'\b(19[5-9]\d|20[0-2]\d)\b'
        has_year = bool(re.search(year_pattern, line))

        if contains_make or has_year:
            # Get surrounding context
            context_start = max(0, i - lines_context)
            context_end = min(len(lines), i + lines_context + 1)
            context = '\n'.join(lines[context_start:context_end])

            candidates.append({
                'line': line,
                'index': i,
                'has_year': has_year,
                'contains_make': contains_make,
                'context': context
            })

    return candidates


def parse_car_name(text):
    """Parse car name from text."""
    if not text:
        return None

    text = text.strip()

    # Try to find Year Make Model
    # Patterns:
    # 2018 Porsche 911 GT3
    # Porsche 911 GT3
    # Porsche 911

    for make in KNOWN_MAKES:
        if make.lower() in text.lower():
            # Find where make starts
            idx = text.lower().find(make.lower())
            if idx == -1:
                continue

            # Look for year before make
            before = text[:idx].strip()
            year_match = re.search(r'\b(19[5-9]\d|20[0-2]\d)\b', before)
            year = year_match.group(1) if year_match else ''

            # Get model (everything after make)
            after = text[idx + len(make):].strip()
            # Clean up model (remove share codes, etc.)
            after = re.sub(r'\d{3}[\s\-]?\d{3}[\s\-]?\d{3}', '', after)
            after = re.sub(r'\b(pi|class|share|code)\b.*', '', after, flags=re.I)
            model = after.strip()

            if len(model) > 1:
                return {
                    'year': year,
                    'make': make,
                    'model': model,
                    'full_name': f"{year} {make} {model}".strip()
                }

    # Fallback: try generic pattern
    pattern = r'(?:(\d{4})\s+)?([A-Za-z][A-Za-z\s\-]+?)\s+([A-Za-z0-9][A-Za-z0-9\s\-]+)'
    match = re.match(pattern, text)
    if match:
        year = match.group(1) or ''
        make = match.group(2).strip()
        model = match.group(3).strip()

        # Validate
        if len(make) > 2 and len(model) > 1 and make.lower() not in ['the', 'and', 'for']:
            return {
                'year': year,
                'make': make,
                'model': model,
                'full_name': f"{year} {make} {model}".strip()
            }

    return None


def extract_pi_from_text(text):
    """Extract PI value from text."""
    if not text:
        return None, None

    # Look for PI patterns
    for match in re.finditer(r'PI[:\s]*(\d{3})', text, re.IGNORECASE):
        val = int(match.group(1))
        return get_pi_class(val), val

    # Look for standalone numbers in PI range
    for match in re.finditer(r'\b([6-9]\d{2})\b', text):
        val = int(match.group(1))
        return get_pi_class(val), val

    return None, None


def get_pi_class(pi_value):
    """Get PI class from value."""
    if pi_value >= 901:
        return 'S2'
    elif pi_value >= 800:
        return 'S1'
    elif pi_value >= 700:
        return 'A'
    elif pi_value >= 600:
        return 'B'
    elif pi_value >= 500:
        return 'C'
    return 'D'


def extract_from_tables(page):
    """Extract data from tables on a page."""
    tunes = []

    try:
        tables = page.extract_tables()

        for table in tables:
            if not table or len(table) < 2:
                continue

            # Find relevant columns
            headers = table[0] if table else []
            car_col = None
            code_col = None
            pi_col = None
            tune_col = None

            for i, header in enumerate(headers):
                if not header:
                    continue
                h_str = str(header).lower()

                if any(x in h_str for x in ['car', 'vehicle', 'name', 'model', 'make']):
                    car_col = i
                elif any(x in h_str for x in ['share', 'code', 'tune', 'id']):
                    code_col = i
                elif any(x in h_str for x in ['pi', 'class', 'performance']):
                    pi_col = i
                elif any(x in h_str for x in ['tune', 'setup', 'build']):
                    tune_col = i

            # Process rows
            for row in table[1:]:
                if not row:
                    continue

                # Extract car
                car_text = str(row[car_col]) if car_col is not None and len(row) > car_col else ''
                car_info = parse_car_name(car_text)

                # Fallback: if car name isn't perfectly recognized, use the raw text anyway
                if not car_info and car_text:
                    clean_text = re.sub(r'\s+', ' ', car_text).strip()
                    if clean_text:
                        parts = clean_text.split(' ')
                        car_info = {
                            'year': '', 'make': parts[0],
                            'model': ' '.join(parts[1:]) if len(parts)>1 else parts[0],
                            'full_name': clean_text[:80]
                        }

                # Extract share code
                code_text = str(row[code_col]) if code_col is not None and len(row) > code_col else ''
                share_code = None
                for match in re.finditer(r'\b(\d{3})[\s\-]?(\d{3})[\s\-]?(\d{3})\b', code_text):
                    share_code = f"{match.group(1)} {match.group(2)} {match.group(3)}"
                    break

                # If no code in code column, try car column
                if not share_code and car_text:
                    for match in re.finditer(r'\b(\d{3})[\s\-]?(\d{3})[\s\-]?(\d{3})\b', car_text):
                        share_code = f"{match.group(1)} {match.group(2)} {match.group(3)}"
                        break

                if share_code:
                    # Get PI
                    pi_text = str(row[pi_col]) if pi_col is not None and len(row) > pi_col else ''
                    pi_class, pi_value = extract_pi_from_text(pi_text)

                    # Get tune name
                    tune_name = str(row[tune_col]) if tune_col is not None and len(row) > tune_col else None

                    tunes.append({
                        'car_info': car_info,
                        'share_code': share_code,
                        'pi_class': pi_class,
                        'pi_value': pi_value,
                        'tune_name': tune_name,
                        'source': 'table'
                    })

    except Exception as e:
        print(f"    Table extraction error: {e}")

    return tunes


def extract_with_ocr(page):
    """Extract text from page using OCR (for image-based PDFs)."""
    if not HAS_OCR:
        return ""

    try:
        # Convert page to image
        im = page.to_image(resolution=150)
        pil_image = im.original

        # Run OCR
        text = pytesseract.image_to_string(pil_image)
        return text
    except Exception as e:
        print(f"    OCR error: {e}")
        return ""


def extract_from_text_content(page_text):
    """Extract tunes from raw text content."""
    tunes = []

    if not page_text:
        return tunes

    # Find all share codes
    codes = extract_share_codes(page_text)

    for code_info in codes:
        # Look for car in context
        car_info = None
        context = code_info['context']
        lines = context.split('\n')

        # Try each line in context
        for line in lines:
            line = line.strip()
            if code_info['code'] in line:
                line = line.replace(code_info['code'], '').strip()

            car_info = parse_car_name(line)
            if car_info:
                break

        # Try nearby lines more aggressively
        if not car_info:
            # Get broader context
            idx = page_text.find(code_info['code'])
            if idx != -1:
                broader = page_text[max(0, idx-500):min(len(page_text), idx+500)]
                for line in broader.split('\n'):
                    car_info = parse_car_name(line.strip())
                    if car_info:
                        break

        # Fallback: Just grab the text next to the share code
        if not car_info:
            clean_line = code_info['line'].replace(code_info['code'], '').strip()
            clean_line = re.sub(r'\s+', ' ', clean_line)
            if clean_line:
                parts = clean_line.split(' ')
                car_info = {
                    'year': '', 'make': parts[0] if parts else 'Unknown',
                    'model': ' '.join(parts[1:]) if len(parts)>1 else 'Unknown',
                    'full_name': clean_line[:80]
                }
            else:
                car_info = {'year': '', 'make': 'Unknown', 'model': 'Unknown', 'full_name': 'Unknown Vehicle'}

        if code_info['code']:
            pi_class, pi_value = extract_pi_from_text(context)

            tunes.append({
                'car_info': car_info,
                'share_code': code_info['code'],
                'pi_class': pi_class,
                'pi_value': pi_value,
                'tune_name': None,
                'source': 'text'
            })

    return tunes


def process_pdf(pdf_path):
    """Process a single PDF file."""
    filename = os.path.basename(pdf_path)
    discipline = parse_discipline(filename)

    print(f"Processing: {filename}")

    all_tunes = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                # Try table extraction first
                table_tunes = extract_from_tables(page)
                all_tunes.extend(table_tunes)

                # Try text extraction
                text = page.extract_text()
                if text:
                    text_tunes = extract_from_text_content(text)
                    all_tunes.extend(text_tunes)
                elif HAS_OCR:
                    # Fallback to OCR for image-based PDFs
                    print(f"    Page {page_num}: Using OCR...")
                    ocr_text = extract_with_ocr(page)
                    if ocr_text:
                        ocr_tunes = extract_from_text_content(ocr_text)
                        all_tunes.extend(ocr_tunes)

    except Exception as e:
        print(f"  Error processing PDF: {e}")

    # Deduplicate
    seen_codes = set()
    unique_tunes = []
    for tune in all_tunes:
        code = tune['share_code'].replace(' ', '')
        if code not in seen_codes:
            seen_codes.add(code)
            unique_tunes.append(tune)

    print(f"  Found {len(unique_tunes)} unique tunes")

    return unique_tunes, discipline


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/extract_tunes_v2.py <research_folder>")
        sys.exit(1)

    research_folder = sys.argv[1]

    if not os.path.exists(research_folder):
        print(f"Error: Folder not found: {research_folder}")
        sys.exit(1)

    # Find ALL PDFs
    pdf_files = [f for f in os.listdir(research_folder) if f.endswith('.pdf')]
    pdf_paths = [os.path.join(research_folder, f) for f in pdf_files]

    print(f"\nFound {len(pdf_paths)} PDF files")
    print("=" * 60)

    all_tunes = []

    for pdf_path in pdf_paths:
        tunes, discipline = process_pdf(pdf_path)

        # Add metadata
        for tune in tunes:
            tune['discipline'] = discipline
            tune['filename'] = os.path.basename(pdf_path)

        all_tunes.extend(tunes)

    print(f"\n{'=' * 60}")
    print(f"Total unique tunes: {len(all_tunes)}")

    # Generate final output
    final_tunes = []
    for i, tune in enumerate(all_tunes):
        final_tunes.append({
            'id': f"pdf-{i}",
            'car_make': tune['car_info']['make'],
            'car_model': tune['car_info']['model'],
            'tune_name': tune['tune_name'] or f"{tune['pi_class'] or 'A'} {tune['discipline']} Tune",
            'tuner_name': 'Community',
            'share_code': tune['share_code'],
            'discipline': tune['discipline'],
            'pi_class': tune['pi_class'],
            'pi_value': tune['pi_value'],
            'tune_data': json.dumps({
                'source': tune['filename'],
                'extraction_method': tune['source'],
                'extracted_car': tune['car_info']['full_name']
            }),
            'votes': 0
        })

    # Save
    output_file = os.path.join(os.path.dirname(__file__), 'extracted_tunes.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_tunes, f, indent=2, ensure_ascii=False)

    print(f"Saved to: {output_file}")
    print(f"\nRun: node scripts/seed-community-tunes.js")


if __name__ == '__main__':
    main()
