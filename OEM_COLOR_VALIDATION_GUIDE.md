# OEM Color Validation Guide

## Overview
This guide documents the methodology for validating Forza Horizon 5 car colors against real-world OEM paint specifications to ensure 100% accuracy to OEM color tones.

## Validation Scope
Total colors requiring validation: 69

### Color List by Category

#### White Colors
- Aspen White Tricoat (QAC)
- Glacier White (QAK)
- Everest White Tricoat
- Pearl White TriCoat (QM1)
- Brilliant White Pearl (3P)
- Pure White Pearl (QAC)
- Prism White (QBE)
- White Pearl (QBB)
- Frozen Vanilla Pearl (HAK)

#### Silver/Gray Colors
- Brilliant Silver Metallic (K23)
- Gray Sky Pearl (KCH)
- Super Silver QuadCoat
- Millenium Jade
- Champagne Silver Metallic
- Dark Metal Gray (M)
- Dark Metal Gray (KAD)
- Sterling Silver (KBV)
- Titanium Gray (KBW)
- Ultimate Metal Silver (KAB)

#### Black Colors
- Jet Black Pearl
- Magnetic Black Pearl
- Meteor Flake Black Pearl (GAG)
- Pure Black (G42)
- Super Black (KH3)
- Diamond Black (G41)
- Midnight Black (GAT)
- Black (GAS)

#### Blue Colors
- Electric Blue Metallic
- Deep Ocean Blue Metallic
- Hermosa Blue Pearl (BW5)
- Caspian Blue (RBY)
- Azurite Blue (RBR)
- Turquoise Blue (FAN)
- Ocean Blue (RCD)
- Sorbet Blue (RCL)
- Wangan Blue (RCB)

#### Red Colors
- Monarch Orange (EBB)
- Garnet Pearl Metallic
- Passion Red Tricoat
- Coulis Red Pearl
- Red Alert (A20)
- Cardinal Red Tricoat (NBL)
- Carmine Red (CM)
- Radiant Red (NAH)
- Garnet Red (NBF)
- Sparkling Red (NBR)
- Vibrant Red (A54)
- Carmine Red (XJT)

#### Orange Colors
- Sunrise Orange (RPM)
- Premium Horizon Orange (EBB)
- Sunrise Copper (CBC)
- Premium Sunshine Orange (EBT)
- 432 Orange (ECD)

#### Green Colors
- Baja Storm Metallic (HAL)
- Obsidian Green Pearl (DAN)
- Tactical Green Metallic (DAQ)
- Surf Green (FAE)
- Kanjuk Cassis (NCD)

#### Purple Colors
- Night Veil Purple (GAB)
- Opera Mauve (NBZ)
- Midnight Purple (DAP)
- Amethyst Purple (LAL)

#### Brown/Other Colors
- Ash Brown (CBA)
- Titanium Khaki (EAN)
- Imperial Amber (CAS)
- Rikyu Likyu (HAN)
- Blossom Pink (NBS)
- Burgundy (NBQ)

## Validation Methodology

### Step 1: Identify OEM Paint Code
Each color has an associated OEM paint code (e.g., K23, QAC, KCH). These codes are manufacturer-specific.

### Step 2: Research OEM Specifications
For each color, research:
- Official manufacturer paint specifications
- OEM color chip references
- RGB/HSB values from official sources
- Production years and vehicle applications
- Paint type (metallic, pearlescent, tricoat, etc.)

### Step 3: Compare with Database Values
Compare the researched OEM specifications with current database values:
- HSB (Hue, Saturation, Brightness) values
- Color type classification
- Paint finish characteristics

### Step 4: Document Discrepancies
Record any discrepancies found between OEM specs and database values.

### Step 5: Update Database
Apply corrections to ensure 100% OEM accuracy.

## Research Sources

### Authoritative OEM Sources
1. **Manufacturer Official Documentation**
   - Nissan Color Code Charts
   - Technical Service Bulletins
   - Paint specification documents

2. **Professional Paint Databases**
   - PaintRef.com
   - TCP Global Auto Color Library
   - PPG Paint Color Database
   - Sherwin-Williams Automotive Finishes

3. **OEM Paint Suppliers**
   - The Spray Source
   - Tamco Paint
   - Express Paint
   - Color N Drive

### Validation Tools
- Color spectrophotometry data (when available)
- Official color chip comparisons
- Cross-reference with multiple sources

## Current Database Status

Based on initial validation script execution:
- Total colors to validate: 69
- Found in database: 69
- Not found in database: 0

All colors are present in the database with HSB values recorded.

## Sample Validation Results

### Aspen White Tricoat (QAC)
- **Database HSB**: H=0.13, S=0.02, B=0.99
- **OEM Code**: QAC
- **Type**: Tricoat (3-stage paint)
- **Years**: 2010-2025
- **Status**: Requires OEM specification verification

### Brilliant Silver Metallic (K23)
- **Database HSB**: H=0, S=0.1, B=0.7
- **OEM Code**: K23 (PPG#907322)
- **Type**: Metallic
- **Years**: 2005-2022
- **Applications**: Infiniti M35/M45, Nissan Sentra, etc.
- **Status**: Requires OEM specification verification

### Gray Sky Pearl (KCH)
- **Database HSB**: H=0, S=0, B=0.5
- **OEM Code**: KCH
- **Type**: Pearl
- **Applications**: Nissan Altima, Versa
- **Status**: Requires OEM specification verification

## Implementation Plan

1. **Phase 1**: Research representative sample (10 colors) to establish validation patterns
2. **Phase 2**: Create automated validation checks for common discrepancies
3. **Phase 3**: Systematic validation of remaining colors
4. **Phase 4**: Database corrections and updates
5. **Phase 5**: Implement ongoing validation processes

## Notes

- Many of these colors are Nissan/Infiniti specific based on paint codes
- Some colors may have variations across different production years
- Tricoat paints require special attention due to their 3-stage application process
- Pearl colors can appear different under various lighting conditions

## Research Challenges and Limitations

### Primary Challenges Identified

1. **Proprietary OEM Specifications**
   - OEM paint specifications are often proprietary and not publicly available as RGB/HSB values
   - Most paint supplier websites focus on selling paint rather than providing technical color data
   - Actual RGB/HSB values for OEM paint codes are rarely published online

2. **Limited Online Resources**
   - CarColourHex.com exists but appears to focus on popular/high-end vehicles, not mass-market Nissan colors
   - PaintRef.com provides paint code cross-references but not actual color values
   - TCP Global Auto Color Library has reference chips but digital access is limited

3. **Technical Complexity**
   - Tricoat and pearlescent paints cannot be accurately represented in simple RGB/HSB format
   - Metallic flake effects require complex rendering beyond basic color values
   - Lighting conditions significantly affect color perception

### Current Research Status

**Completed:**
- Validation script created and executed (all 69 colors found in database)
- OEM Color Validation Guide documented
- Initial research on sample colors (Aspen White, Brilliant Silver, Gray Sky Pearl)
- Identification of authoritative sources and research methodology

**Challenges Encountered:**
- Unable to locate actual OEM RGB/HSB specifications for the specific paint codes
- Most online sources provide paint codes but not digital color values
- Authoritative color databases either don't contain these specific Nissan colors or require paid access

### Recommendations

#### Option 1: Professional Color Analysis (Recommended)
- Contact professional automotive color analysis services
- Use spectrophotometry equipment to measure actual OEM paint samples
- This would provide accurate HSB/RGB values directly from physical samples

#### Option 2: Manufacturer Documentation
- Contact Nissan/Infiniti directly for technical paint specifications
- Request official color data sheets with digital color values
- This may require business partnerships or technical documentation requests

#### Option 3: Community Validation
- Create a community validation process where users can submit color corrections
- Implement a verification system for community-submitted color data
- Leverage crowd-sourced validation with photo references

#### Option 4: Approximate Validation
- Use available color databases as reference points
- Implement validation based on known color ranges and patterns
- Accept that 100% OEM accuracy may not be achievable without direct manufacturer data

### Current Database Assessment

Based on the validation script execution:
- All 69 colors are present in the database with HSB values
- The values appear to be from the Forza Horizon 5 game data
- These may already be game-accurate representations of the OEM colors
- Without OEM reference data, it's difficult to determine accuracy

## Next Steps

1. **Determine Validation Approach**
   - Choose from the recommended options above
   - Assess budget and timeline constraints
   - Evaluate required accuracy level (100% OEM vs. game-accurate)

2. **Implement Chosen Method**
   - If professional analysis: procure paint samples and equipment
   - If manufacturer contact: establish technical documentation requests
   - If community validation: build submission and verification system
   - If approximate validation: implement range-based checks

3. **Execute Validation**
   - Apply chosen validation method to all 69 colors
   - Document any discrepancies found
   - Update database with corrected values

4. **Ongoing Maintenance**
   - Implement regular validation processes
   - Update color database as new information becomes available
   - Maintain validation documentation and records
