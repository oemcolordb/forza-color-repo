// Parse the CSV data from the Google Sheet and add to carColors.json
const fs = require('fs');
const path = require('path');

// CSV data from the Google Sheet
const csvData = `Manufacturer,Colour Name,Paint Type,HSB Values,Source Material/Usage,Source
Mazda,Soul Red Crystal (46V),Metal Flake,"Low: (0.00, 0.96, 0.39) High: (0.00, 0.73, 0.50) / (0.99, 0.90, 0.60)",Manufacturer Classics; Added by Mazda entry,"1, 2"
Chevrolet,Soul Red Crystal (46V),Metal Flake,"Low: (0.00, 0.96, 0.39) High: (0.00, 0.73, 0.50)",Added by Mazda entry,1
Ferrari,Rosso Corsa,Normal,"Low: (0.01, 0.81, 0.80) High: Not in source / (0.00, 1.00, 0.85)",Ferrari Standard Colours (SF90 Stradale); Manufacturer Classics,"1, 2"
Subaru,World Rally Blue / Subaru Blue,Normal / Semigloss,"Hue: 0.61 R, Sat: 1.00, Bri: 0.60 / (0.60, 0.85, 0.65)",#003399; Manufacturer Classics,"2, 3"
Bugatti,Atlantic Blue,Normal / Metal Flake,"Low: (0.61, 0.79, 0.43) High: Not in source / Low: (0.60, 0.59, 0.29) High: (0.60, 0.62, 0.32)",Expensive Cars,4
Abarth,Modena Yellow,Metal Flake,"Low: (0.13, 0.87, 0.84) High: (0.13, 0.89, 0.94)",2023 Abarth Colour Lineup,1
Abarth,Snowflake White,Metal Flake,"Low: (0.00, 0.00, 0.94) High: (0.00, 0.00, 1.00)",Paint Code 819/C,1
Abarth,Sonic Silver,Metal Flake,"Low: (0.17, 0.01, 0.53) High: (0.17, 0.01, 0.64)",Paint Code 807/B,1
Abarth,Trofeo Grey,Metal Flake,"Low: (0.39, 0.07, 0.31) High: (0.19, 0.06, 0.42)",Paint Code 372/A,1
Abarth,Turini 1975 White,Normal,"Low: (0.00, 0.00, 0.93) High: Not in source",Paint Code 163/C,1
Abarth,Verde Monza 1958,Normal,"Low: (0.44, 0.31, 0.67) High: Not in source","2019 695 70th Anniversario, 745/A",1
Abarth,Acid Green,Metal Flake,"Low: (0.19, 0.70, 0.97) High: (0.18, 0.95, 0.90)",Not in source,1
Abarth,Adrenaline Red,Normal,"Low: (1.00, 1.00, 0.96) High: Not in source",Not in source,1
Abarth,White,Normal,"Low: (0.16, 0.04, 0.97) High: Not in source",Not in source,1
Acura,Longbeach Blue Metallic,Metal Flake,"Low: (0.65, 0.95, 0.55) High: (0.60, 0.78, 0.67)",2023 Acura Colour Lineup,1
Alfa Romeo,Alfa Black,Normal,"Low: (0.00, 0.00, 0.03) High: Not in source",Nero Alfa (601),1
Alfa Romeo,Alfa Red,Normal,"Low: (1.00, 0.83, 0.57) High: Not in source",PPG 944100,1
Alfa Romeo,Alfa White,Normal,"Low: (0.55, 0.02, 0.94) High: Not in source",Bianco Alfa (217/B),1
Alfa Romeo,Anodized Blue Metallic,Metal Flake,"Low: (0.60, 0.63, 0.22) High: (0.60, 0.77, 0.66)",Not in source,1
BMW,Frozen Brilliant White Metallic (X16),Two-Tone Matte,"Low: (0.00, 0.00, 0.89) High: (0.00, 0.00, 0.96)",2023 BMW Colour Lineup,1
BMW,Frozen Portimao Blue (X1E),Two-Tone Matte,"Low: (0.57, 0.99, 0.50) High: (0.58, 1.00, 0.44)",2023 BMW Colour Lineup,1
BMW,Isle Of Man Green Metallic (C4G),Metal Flake,"Low: (0.46, 0.95, 0.26) High: (0.47, 0.85, 0.48)",BMW INDIVIDUAL MANUFAKTUR (2023-2024),1
BMW,Alpine White,Normal,"(0.00, 0.00, 1.00)",Manufacturer Classics,2
Cadillac,Electric Blue Metallic,Metal Flake,"Low: (0.56, 0.79, 0.51) High: (0.54, 0.82, 0.75)",2023 Cadillac Colour Lineup,1
Ferrari,Ferrari Red,Normal / Semigloss,"Hue: 0.00, Sat: 1.00, Bri: 0.80",#CC0000,3
Toyota,Solar Shift,Normal,"Low: (0.08, 0.85, 0.89) High: Not in source",2023 GR86 10th Anniversary Special Edition,1
Bugatti,ABF Blue,Metal Flake,"Low: (0.17, 0.02, 0.40) High: (0.17, 0.02, 0.67)",Paint colour of first U.S.-bound Divo,4
Bugatti,Arancia Mira,Normal,"Low: (0.04, 0.92, 0.97) High: Not in source",Expensive Cars,4
Bugatti,Argent Matte,Two-Tone Matte,"Low: (0.61, 0.13, 0.67) High: (0.62, 0.12, 0.53)",Expensive Cars,4
Bugatti,Azure,Metal Flake,"Low: (0.55, 0.82, 0.95) High: (0.49, 0.49, 0.89)",Expensive Cars,4
Bugatti,Beige Gold Metallic,Metal Flake,"Low: (0.07, 0.20, 0.72) High: (0.09, 0.21, 0.85)",Expensive Cars,4
Bugatti,Bianco Monaco,Normal,"Low: (0.00, 0.00, 0.91) High: Not in source",Monaco White,4
Bugatti,Black Blue Metallic,Metal Flake,"Low: (0.60, 0.16, 0.20) High: (0.60, 0.48, 0.34)",Expensive Cars,4
Bugatti,Black Carbon,Carbon Fiber Polished,"Low: (0.00, 0.00, 0.33) High: Not in source",2015 Vision Gran Turismo,4
Bugatti,Blu Agile,Metal Flake,"Low: (0.55, 0.77, 0.76) High: (0.57, 1.00, 0.71)",Expensive Cars,4
Bugatti,Blu Bugatti,Normal,"Low: (0.58, 0.98, 0.95) High: Not in source","Bugatti Blue, EB110 (signature Colour)",4
Bugatti,Blue Metallic,Metal Flake,"Low: (0.58, 0.95, 0.58) High: (0.57, 0.82, 0.71)",Metallic Dark Blue,4
Bugatti,Carbon Fibre,Carbon Fibre Polished,"Low: (0.00, 0.00, 0.35) High: Not in source",Veyron Super Sport,4
Bugatti,Customer Special Red,Metal,"Low: (0.99, 0.92, 0.62) High: (0.00, 0.82, 0.89)",2021 Divo Lady Bug,4
Bugatti,Dark Blue Carbon,Carbon Fiber Polished,"Low: (0.58, 0.83, 0.88) High: Not in source",2015 Vision Gran Turismo,4
Bugatti,Giallo Bugatti,Normal,"Low: (0.15, 0.96, 0.99) High: Not in source",Bugatti Yellow,4
Bugatti,Glossy Light Gray,Metal Flake,"Low: (0.60, 0.04, 0.65) High: (0.60, 0.04, 0.49)",2015 Vision Gran Turismo,4
Bugatti,Graphite,Metal Flake,"Low: (0.62, 0.08, 0.22) High: (0.61, 0.06, 0.39)",2021 Divo Lady Bug,4
Bugatti,Jet Orange,Normal,"Low: (0.06, 0.95, 0.93) High: Not in source",2022 Chiron Super Sport 300+,4
Bugatti,Matt Blanc,Matte,"Low: (0.69, 0.03, 0.94) High: Not in source",2021 Chiron Alice,4
Bugatti,Matt Gray,Matte,"Low: (0.60, 0.03, 0.29) High: Not in source",2015 Vision Gran Turismo,4
Bugatti,Matt Green,Matte,"Low: (0.25, 0.27, 0.31) High: Not in source",2015 Vision Gran Turismo,4
Bugatti,Red Carbon,Carbon Fiber Polished,"Low: (0.00, 1.00, 1.00) High: Not in source",2015 Vision Gran Turismo,4
Bugatti,Silk Rosé,Metal Flake,"Low: (0.93, 0.30, 0.54) High: (0.97, 0.28, 0.87)",2021 Chiron Alice,4
Bugatti,Sprint Blue Gloss,Normal,"Low: (0.59, 0.96, 0.64) High: Not in source",Veyron Bleu Centenaire 2010,4
Bugatti,Steel Blue Matte,Two-Tone Semigloss,"Low: (0.60, 0.33, 0.62) High: (0.60, 0.39, 0.54)",2020 Chiron Sport 110 ans,4
Bugatti,Tangerine,Normal,"Low: (0.06, 1.00, 1.00) High: Not in source",2011 Veyron Super Sport accent Colour,4
McLaren,Accent Red,Normal,"Low: (0.01, 0.86, 0.95) High: Not in source",2022 Senna XP El Triunfo Absoluto,4
McLaren,Alaskan Diamond White,Metal Flake,"Low: (0.00, 0.00, 1.00) High: (0.59, 0.18, 0.82)",McLaren Special Orders,4
McLaren,Anniversary Orange,Metal Flake,"Low: (0.11, 1.00, 1.00) High: (0.11, 0.98, 0.94)",2019 720S Spa 68 Collection,4
McLaren,Blue LH,Metal Flake,"Low: (0.60, 0.81, 0.75) High: (0.56, 0.86, 0.95)",Colour of Lewis Hamilton's P1,4
McLaren,Mexican Green,Normal,"Low: (0.46, 0.99, 0.72) High: Not in source",2022 Senna XP El Triunfo Absoluto,4
McLaren,Verdant Theme,Two-Tone Semigloss,"Low: (0.31, 0.48, 0.56) High: (0.55, 0.71, 0.34)",2020 Verdant Theme GT by MSO,4
Zenvo,Fjord Blue,Normal,"Low: (0.89, 0.91, 0.53) High: Not in source",2017 TS1 GT 10th Anniversary Edition,4
Kawasaki,Kawasaki Green,Normal / Semigloss,"Hue: 0.25, Sat: 1.00, Bri: 0.99",#7CFC00,3
Lamborghini,Giallo Orion (Yellow),Two-Tone / Specialized,"(0.13, 0.85, 1.00)",Manufacturer Classics,2
Audi,Nardo Grey,Normal,"(0.00, 0.00, 0.65)",Manufacturer Classics,2
Nissan,Midnight Purple III,Multi-tone,"(0.75, 0.50, 0.30)",Manufacturer Classics,2
Tesla,Midnight Silver Metallic,Metal Flake,"Low: (0.63, 0.14, 0.15) High: (0.62, 0.15, 0.32)",Not in source,1
Not in source,Pure Red,Normal / Semigloss,"Hue: 0.00, Sat: 1.00, Bri: 1.00",#FF0000,3
Not in source,Pure Green,Normal / Semigloss,"Hue: 0.33, Sat: 1.00, Bri: 1.00",#00FF00,3
Not in source,Pure Blue,Normal / Semigloss,"Hue: 0.67, Sat: 1.00, Bri: 1.00",#0000FF,3
Not in source,Safety Orange,Normal / Semigloss,"Hue: 0.07, Sat: 1.00, Bri: 1.00",#FF6700,3
Not in source,Standard Gold,Polished Aluminium / Two-Tone Polished,"Hue: 0.14, Sat: 1.00, Bri: 1.00",#FFD700,3
3M Wraps,Matte Purple Wrap,Two-Tone,"Low: (0.77, 0.39, 0.62) High: (0.76, 0.37, 0.58)",Not in source,5
3M Wraps,Gloss Atomic Teal,Metal Flake,"Low: (0.53, 0.99, 0.77) High: (0.53, 0.98, 0.86)",Not in source,5
3M Wraps,Gloss Black Rose,Metal Flake,"Low: (0.06, 0.50, 0.23) High: (0.96, 0.59, 0.90)",Not in source,5
3M Wraps,Gloss Wicked,Metal Flake,"Low: (0.73, 0.35, 0.08) High: (0.72, 0.29, 0.56)",Not in source,5
3M Wraps,Matte Indigo,Two-Tone Matte,"Low: (0.60, 0.53, 0.34) High: (0.60, 0.53, 0.34)",Not in source,5
3M Wraps,Satin Bitter Yellow,Two-Tone Matte,"Low: (0.15, 0.97, 0.82) High: (0.15, 0.97, 0.82)",Not in source,5
3M Wraps,Satin Key West (557),Two-Tone Matte,"Low: (0.51, 1.00, 0.70) High: (0.51, 0.98, 0.65)",Not in source,5
3M Wraps,Gloss Liquid Copper Wrap,Metal Flake,"Low: (0.07, 0.87, 0.56) High: (0.09, 1.00, 0.60)",Not in source,5
3M Wraps,Gloss Hot Pink (G103),Gloss,"Low: (0.89, 0.94, 0.79) High: Not in source",Not in source,5
3M Wraps,Gloss Storm Grey (G31),Gloss,"Low: (0.00, 0.00, 0.54) High: Not in source",Not in source,5
3M Wraps,Gloss Light Ivory (G79),Gloss,"Low: (0.10, 0.35, 0.78) High: Not in source",Not in source,5
3M Wraps,Gloss Cosmic Blue Wrap,Metal Flake,"Low: (0.61, 1.00, 0.46) High: (0.61, 0.98, 0.58)",Not in source,5
3M Wraps,Blue Carbon Fiber Wrap,Carbon Fiber Polished,"Low: (0.57, 0.89, 0.56) High: Not in source",Not in source,5
3M Wraps,Gloss Green Envy,Metal Flake,"Low: (0.40, 0.49, 0.46) High: (0.39, 0.53, 0.56)",Not in source,5
3M Wraps,Matte Metallic Pine Green,Two-Tone Matte,"Low: (0.39, 0.33, 0.57) High: (0.41, 0.33, 0.40)",Not in source,5
3M Wraps,Gloss Hot Rod Red (G13),Gloss,"Low: (0.00, 1.00, 0.51) High: Not in source",Not in source,5
3M Wraps,Matte Battleship Grey (851),Two-Tone Matte,"Low: (0.57, 0.15, 0.80) High: (0.57, 0.15, 0.75)",Not in source,5
AC Cars,Princess Blue,Metal Flake,"Low: (0.50, 0.29, 0.69) High: (0.55, 0.21, 0.94)",Not in source,5
AC Cars,Beige,Normal,"Low: (0.12, 0.52, 0.79) High: Not in source",Not in source,5
AC Cars,Black,Normal,"Low: (0.67, 0.15, 0.04) High: Not in source",Not in source,5
AC Cars,Canary Yellow,Normal,"Low: (0.14, 0.74, 0.96) High: Not in source",Not in source,5
AC Cars,Charcoal,Metal Flake,"Low: (0.65, 0.14, 0.25) High: (0.65, 0.09, 0.36)",Not in source,5
AC Cars,Cherry Red,Normal,"Low: (1.00, 0.95, 0.62) High: Not in source",Not in source,5
AC Cars,Guardsman Blue,Metal Flake,"Low: (0.59, 0.71, 0.57) High: (0.59, 0.54, 0.85)",Not in source,5
AC Cars,Ivy Green,Normal,"Low: (0.33, 0.88, 0.20) High: Not in source",Not in source,5
AC Cars,Live Oak,Metal Flake,"Low: (0.46, 0.15, 0.42) High: (0.46, 0.11, 0.57)",Not in source,5
AC Cars,Mist Silver,Metal Flake,"Low: (0.61, 0.11, 0.61) High: (0.61, 0.09, 0.73)",Not in source,5
AC Cars,Off White,Normal,"Low: (0.14, 0.04, 0.82) High: Not in source",Not in source,5
AC Cars,Rangoon Red,Normal,"Low: (1.00, 0.82, 0.83) High: Not in source",Not in source,5
AC Cars,Raven Black,Normal,"Low: (0.00, 0.00, 0.03) High: Not in source",Not in source,5
AC Cars,Ruby Red,Metal Flake,"Low: (0.99, 0.70, 0.35) High: (0.98, 0.91, 0.55)",Not in source,5
AC Cars,Sand,Metal Flake,"Low: (0.09, 0.29, 0.44) High: (0.09, 0.23, 0.56)",Not in source,5
AC Cars,Silver,Metal Flake,"Low: (0.58, 0.06, 0.53) High: (0.58, 0.05, 0.64)",Not in source,5
AC Cars,Vineyard Green,Two-Tone Polished,"Low: (0.38, 0.32, 0.19) High: (0.38, 0.34, 0.31)",Not in source,5
AC Cars,Wimbledon White,Normal,"Low: (0.17, 0.04, 0.97) High: Not in source",Not in source,5
Autogoody,PREMIUM GLOSS GREEN,Metal Flake,"Low: (0.28, 0.97, 0.70) High: (0.25, 0.99, 0.73)",Not in source,5
Autogoody,PREMIUM GLOSS ORANGE,Metal Flake,"Low: (0.08, 1.00, 0.69) High: (0.10, 0.98, 0.80)",Not in source,5
Autogoody,PREMIUM GLOSS NARDO GRAY,Gloss,"Low: (0.57, 0.03, 0.49) High: (0.08, 0.65, 0.94)",Not in source,5
Autogoody,SUPER GLOSS METALLIC PEACH Color,Metal Flake,"Low: (0.04, 0.69, 0.63) High: (0.00, 0.00, 0.90)",Not in source,5
Autogoody,PREMIUM SUPER GLOSS METALLIC SILVER,Metal Flake,"Low: (0.67, 0.03, 0.85) High: (0.00, 0.00, 0.90)",Not in source,5
Autogoody,PREMIUM SUPER GLOSS METALLIC BLUE,Metal Flake,"Low: (0.61, 0.98, 0.51) High: (0.61, 0.99, 0.54)",Not in source,5
Custom Paints,Candy Cherry Red,Metal Flake,"Low: (0.00, 0.99, 0.46) High: (0.00, 1.00, 0.55)",Not in source,5
Custom Paints,Candy Blue,Metal Flake,"Low: (0.54, 0.80, 0.36) High: (0.54, 0.74, 0.53)",Not in source,5
Custom Paints,Candy Gold,Metal Flake,"Low: (0.12, 0.65, 0.48) High: (0.13, 0.67, 0.70)",Not in source,5
Custom Paints,Candy Fools Gold,Metal Flake,"Low: (0.06, 0.70, 0.51) High: (0.07, 0.81, 0.65)",Not in source,5
Custom Paints,Candy Green,Metal Flake,"Low: (0.37, 0.45, 0.46) High: (0.38, 0.47, 0.53)",Not in source,5
Custom Paints,Candy Yellow,Metal Flake,"Low: (0.12, 0.64, 0.48) High: (0.13, 0.61, 0.55)",Not in source,5
The Barbie Movie,Barbie Pink,Normal,"Low: (0.86, 0.70, 1.00) High: Not in source",Not in source,5
WCC,Jeffery Star's 570s Pink,Metal Flake,"Low: (0.92, 0.56, 0.77) High: (0.84, 0.81, 0.76)",Not in source,5
WCC,Jeffery Star's Senna Taffy Blue,Metal,"Low: (0.52, 0.75, 0.74) High: (0.52, 0.77, 0.74)",Not in source,5
WCC,765LT Pink Magic,Metal Flake,"Low: (0.88, 0.80, 1.00) High: (0.83, 0.95, 0.85)",Not in source,5
WCC,Jeffery Star's Rolls Royce Yellow,Metal Flake,"Low: (0.18, 0.79, 0.71) High: (0.19, 0.73, 0.87)",Not in source,5
WCC,Jeffery Star's Rolls Royce Light Pink,Metal Flake,"Low: (0.85, 0.45, 0.95) High: (0.85, 0.38, 1.00)",Not in source,5
WCC,Jeffery Star's Huracan Pink,Two-Tone Matte,"Low: (0.85, 0.55, 0.95) High: (0.85, 0.54, 0.85)",Not in source,5
WCC,Jeffery Star's Urus Pink,Two-Tone Matte,"Low: (0.93, 0.88, 0.54) High: (0.93, 0.78, 0.85)",Not in source,5
WCC,Jeffery Star's Vantage Pink,Metal Flake,"Low: (0.90, 0.80, 0.75) High: (0.90, 0.75, 0.80)",Not in source,5
WCC,West Cost Customs CEO BMW i8,Metal Flake,": (0.58, 0.54, 1.00) High: (0.56, 0.89, 0.74)",Not in source,5
WCC,Justin Bieber's Matte black Cadillac,Two-Tone Matte,"Low: (0.67, 0.05, 0.19) High: (0.00, 0.00, 0.00)",Not in source,5
WCC,Justin Bieber's Matte blue 458,Two-Tone,"Low: (0.57, 0.91, 0.60) High: (0.61, 0.97, 0.46)",Not in source,5
WCC,Justin Bieber's Lamborghini Urus,Two-Tone Matte,"Low: (0.15, 0.20, 1.00) High: (0.15, 0.20, 1.00)",Not in source,5
VVIVID+,Ultra Gloss Nardo Dark Grey,Gloss,"Low: (0.53, 0.02, 0.35) High: Not in source",Not in source,5
Not in source,Carbon Fibre (Base),Polished Carbon Fibre,"(0.00, 0.00, 0.15)",Popular Materials,2
Not in source,Pure White,Normal,"(0.00, 0.00, 1.00)",Popular Materials,2
Not in source,"""Murdered Out"" Matte Black",Matte,"(0.00, 0.00, 0.05)",Popular Materials,2
Lamborghini,Verde Ithaca,Not in source,"(0.21, 0.77, 0.90)",Manufacturer Classics,2
RUF,Yellowbird,Not in source,Not in source,1987 RUF CTR Yellowbird,6
Chevrolet,Jordan Luka 3 Motorsport Edition,Not in source,Not in source,1969 Chevrolet Camaro Jordan Luka 3 Motorsport Edition,7
Nissan,Gold Leader,Not in source,Not in source,1975 Nissan Datsun 280Z,7
Volkswagen,Macaron,Not in source,Not in source,2022 Wuling Hongguang Mini EV Macaron,7
Saleen,Black Label,Not in source,Not in source,2020 Saleen Sportruck XR Black Label,7
3M Wraps,Gloss White (G10),Not in source,"Low: (0.53, 0.01, 0.99) High: Not in source",Not in source,5
Autogoody,Matte Black,Not in source,"Low: (0.00, 0.00, 0.16) High: (0.00, 0.00, 0.08)",Not in source,5
VVIVID+,Ultra Gloss Smurf Blue,Not in source,"Low: (0.59, 0.79, 1.00) High: Not in source",Not in source,5
Nissan,Midnight Purple II,Two-Tone,"Low: (0.81, 0.85, 0.25) High: (0.65, 0.75, 0.35)",Reddit Community Deep Dive,Reddit
Nissan,Bayside Blue,Metal Flake,"Low: (0.62, 0.88, 0.45) High: (0.60, 0.70, 0.85)",Reddit Community Deep Dive,Reddit
Ford,Mystichrome,Two-Tone,"Low: (0.56, 1.00, 0.40) High: (0.76, 1.00, 0.55)",Reddit Community Deep Dive,Reddit
Porsche,Rubystar (Ruby Star),Normal,"Low: (0.93, 0.65, 0.75) High: Not in source",Reddit Community Deep Dive,Reddit
BMW,Yas Marina Blue,Metal Flake,"Low: (0.58, 0.65, 0.70) High: (0.58, 0.40, 0.85)",Reddit Community Deep Dive,Reddit
Lexus,Structural Blue,Metal Flake,"Low: (0.63, 0.95, 0.55) High: (0.61, 0.80, 0.85)",Reddit Community Deep Dive,Reddit
Nissan,Millennium Jade,Metal Flake,"Low: (0.22, 0.20, 0.55) High: (0.20, 0.15, 0.75)",Reddit Community Deep Dive,Reddit
Subaru,Hyper Blue,Normal,"Low: (0.57, 0.85, 0.85) High: Not in source",Reddit Community Deep Dive,Reddit
Porsche,Chalk / Crayon,Normal,"Low: (0.10, 0.05, 0.75) High: Not in source",Reddit Community Deep Dive,Reddit
Dodge,Stryker Red,Two-Tone,"Low: (0.01, 1.00, 0.65) High: (0.04, 0.95, 0.85)",Reddit Community Deep Dive,Reddit
McLaren,Cerulean Blue,Metal Flake,"Low: (0.59, 0.85, 0.60) High: (0.55, 0.75, 0.90)",Reddit Community Deep Dive,Reddit`;

// Parse CSV
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Handle quoted fields properly
    const fields = [];
    let field = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    fields.push(field.trim());

    if (fields.length >= 4) {
      data.push({
        make: fields[0],
        colorName: fields[1],
        paintType: fields[2],
        hsbValues: fields[3]
      });
    }
  }

  return data;
}

// Parse HSB values from string like "Low: (0.00, 0.96, 0.39) High: (0.00, 0.73, 0.50)"
function parseHSB(hsbString) {
  const lowMatch = hsbString.match(/Low:\s*\(([^)]+)\)/);
  const highMatch = hsbString.match(/High:\s*\(([^)]+)\)/);

  let color1 = { h: 0, s: 0, b: 0 };
  let color2 = { h: 0, s: 0, b: 0 };

  if (lowMatch) {
    const values = lowMatch[1].split(',').map(v => parseFloat(v.trim()));
    if (values.length >= 3) {
      color1 = { h: values[0], s: values[1], b: values[2] };
    }
  }

  if (highMatch) {
    const values = highMatch[1].split(',').map(v => parseFloat(v.trim()));
    if (values.length >= 3) {
      color2 = { h: values[0], s: values[1], b: values[2] };
    }
  } else {
    // If no high value, use low value
    color2 = { ...color1 };
  }

  // Validate values are in range
  color1.h = Math.max(0, Math.min(1, color1.h));
  color1.s = Math.max(0, Math.min(1, color1.s));
  color1.b = Math.max(0, Math.min(1, color1.b));
  color2.h = Math.max(0, Math.min(1, color2.h));
  color2.s = Math.max(0, Math.min(1, color2.s));
  color2.b = Math.max(0, Math.min(1, color2.b));

  return { color1, color2 };
}

// Normalize paint type
function normalizePaintType(type) {
  if (!type || type === 'Not in source') return 'Normal';

  const normalized = type.toLowerCase();
  if (normalized.includes('metal flake')) return 'Metal Flake';
  if (normalized.includes('matte')) return 'Matte';
  if (normalized.includes('gloss')) return 'Gloss';
  if (normalized.includes('semigloss')) return 'Semigloss';
  if (normalized.includes('carbon')) return 'Carbon Fiber Polished';
  if (normalized.includes('polished')) return 'Polished';
  if (normalized.includes('two-tone')) return 'Two-Tone';
  if (normalized.includes('normal')) return 'Normal';

  return type;
}

// Convert to carColors.json format
function convertToCarColorFormat(data) {
  return data
    .filter(item => item.make && item.colorName && item.hsbValues && item.hsbValues !== 'Not in source')
    .map(item => {
      const { color1, color2 } = parseHSB(item.hsbValues);

      // Skip if HSB values couldn't be parsed
      if (color1.h === 0 && color1.s === 0 && color1.b === 0) {
        return null;
      }

      return {
        make: item.make === 'Not in source' ? 'Custom' : item.make,
        model: '',
        year: null,
        colorName: item.colorName,
        colorType: normalizePaintType(item.paintType),
        color1,
        color2
      };
    })
    .filter(item => item !== null);
}

// Main execution
const parsed = parseCSV(csvData);
const newColors = convertToCarColorFormat(parsed);

console.log(`Parsed ${parsed.length} rows from CSV`);
console.log(`Converted ${newColors.length} valid colors`);

// Read existing colors
const colorsPath = path.join(__dirname, '..', 'public', 'carColors.json');
const existingColors = JSON.parse(fs.readFileSync(colorsPath, 'utf8'));

console.log(`Existing colors: ${existingColors.length}`);

// Create a set of existing color names for deduplication
const existingKeys = new Set(existingColors.map(c => `${c.make}-${c.colorName}`));

// Filter out duplicates
const uniqueNewColors = newColors.filter(c => !existingKeys.has(`${c.make}-${c.colorName}`));

console.log(`New unique colors to add: ${uniqueNewColors.length}`);

if (uniqueNewColors.length > 0) {
  // Combine and write back
  const combined = [...existingColors, ...uniqueNewColors];
  fs.writeFileSync(colorsPath, JSON.stringify(combined, null, 2));
  console.log(`Updated carColors.json with ${uniqueNewColors.length} new colors`);
  console.log(`Total colors now: ${combined.length}`);

  // Log some examples
  console.log('\nSample new colors:');
  uniqueNewColors.slice(0, 5).forEach(c => {
    console.log(`  - ${c.make}: ${c.colorName} (${c.colorType})`);
  });
} else {
  console.log('No new colors to add (all were duplicates)');
}
