import fitz
import os
import json
import re

pdf_files = [f for f in os.listdir('.') if f.endswith('.pdf')]
all_colors = []

# Pattern to extract HSB values: (Hue, Saturation, Brightness)
# For example: 0.13 L    0.04 R    0.92 R
# Or: 1.00    0.83    0.57

def parse_hsb(text):
    if not text or "Not in source" in text:
        return None
    # match numbers
    nums = re.findall(r'(\d+\.\d+)', text)
    if len(nums) >= 3:
        return {
            'h': float(nums[0]),
            's': float(nums[1]),
            'b': float(nums[2])
        }
    return None

def normalize_paint_type(ptype):
    ptype = str(ptype).strip()
    if not ptype: return "Normal"
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

for pdf_file in pdf_files:
    print(f"Processing {pdf_file}...")
    doc = fitz.open(pdf_file)
    for page in doc:
        # Using 'blocks' gives us: (x0, y0, x1, y1, "lines in block", block_no, block_type)
        blocks = page.get_text("blocks")

        # Sort blocks vertically (y0) then horizontally (x0) for better reading order
        blocks.sort(key=lambda b: (b[1], b[0]))

        text_content = ""
        for block in blocks:
            # block[6] == 0 indicates text (1 is for an image block)
            if block[6] == 0:
                # Clean up excess newlines inside the block
                text_content += block[4].strip() + "\n"

        # Let's save the raw text to see its structure
        with open('pdf_text_sample.txt', 'a', encoding='utf-8') as f:
            f.write(f"--- New Page ---\n{text_content}\n")
