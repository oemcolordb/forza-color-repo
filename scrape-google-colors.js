import puppeteer from 'puppeteer';
import fs from 'fs';

// Sample colors from your app to enhance
const sampleColors = [
  { make: "3M", colorName: "Gloss Atomic Teal", colorType: "Metal Flake" },
  { make: "Abarth", colorName: "Abarth Red", colorType: "Normal" },
  { make: "Acura", colorName: "130R White", colorType: "Normal" },
  { make: "Alfa Romeo", colorName: "Alfa Red", colorType: "Normal" },
  { make: "Alpine", colorName: "Alpine Blue", colorType: "Metal Flake" },
  { make: "Aston Martin", colorName: "British Racing Green", colorType: "Normal" },
  { make: "BMW", colorName: "Estoril Blue", colorType: "Metal Flake" },
  { make: "Ferrari", colorName: "Rosso Corsa", colorType: "Normal" },
  { make: "Lamborghini", colorName: "Verde Mantis", colorType: "Metal Flake" },
  { make: "Porsche", colorName: "Guards Red", colorType: "Normal" }
];

async function scrapeGoogleForColors() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  const enhancedColors = [];
  const sampleSize = 10; // Process 10 sample colors for demonstration
  
  try {
    console.log(`Processing ${Math.min(sampleSize, sampleColors.length)} sample colors from your existing data...`);
    
    for (let i = 0; i < Math.min(sampleSize, sampleColors.length); i++) {
      const color = sampleColors[i];
      const searchQuery = `"${color.make}" "${color.colorName}" automotive paint color`;
      
      console.log(`${i + 1}/${sampleSize}: Searching for ${color.make} ${color.colorName}...`);
      
      try {
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const searchResults = await page.evaluate(() => {
          const results = [];
          
          // Get search result snippets
          const snippets = document.querySelectorAll('.VwiC3b, .s3v9rd, .hgKElc');
          snippets.forEach(snippet => {
            const text = snippet.textContent?.trim();
            if (text && text.length > 20 && text.length < 300) {
              results.push({
                type: 'snippet',
                content: text
              });
            }
          });
          
          // Get featured snippet content
          const featuredSnippet = document.querySelector('.hgKElc, .kno-rdesc span');
          if (featuredSnippet) {
            results.push({
              type: 'featured',
              content: featuredSnippet.textContent?.trim()
            });
          }
          
          // Look for color-related information
          const colorInfo = [];
          const allText = document.body.innerText;
          
          // Extract hex codes
          const hexMatches = allText.match(/#[0-9A-Fa-f]{6}/g);
          if (hexMatches) {
            colorInfo.push(...hexMatches.slice(0, 3));
          }
          
          // Extract RGB values
          const rgbMatches = allText.match(/rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi);
          if (rgbMatches) {
            colorInfo.push(...rgbMatches.slice(0, 3));
          }
          
          // Extract year information
          const yearMatches = allText.match(/\b(19|20)\d{2}\b/g);
          const validYears = yearMatches ? 
            [...new Set(yearMatches.map(y => parseInt(y)))]
              .filter(y => y >= 1950 && y <= 2025)
              .slice(0, 5) : [];
          
          return {
            snippets: results.slice(0, 5),
            colorInfo: colorInfo.slice(0, 5),
            years: validYears,
            hasResults: results.length > 0
          };
        });
        
        // Enhance the color data with Google results
        const enhancedColor = {
          ...color,
          googleData: {
            searchQuery,
            snippets: searchResults.snippets,
            colorCodes: searchResults.colorInfo,
            relatedYears: searchResults.years,
            hasAdditionalInfo: searchResults.hasResults,
            searchDate: new Date().toISOString()
          }
        };
        
        // Try to extract additional color information from snippets
        const allSnippetText = searchResults.snippets.map(s => s.content).join(' ');
        
        // Look for color type information
        if (allSnippetText.match(/metallic|pearl|solid|matte|gloss|satin/i)) {
          const typeMatch = allSnippetText.match(/(metallic|pearl|solid|matte|gloss|satin)/i);
          if (typeMatch && !color.colorType.toLowerCase().includes(typeMatch[1].toLowerCase())) {
            enhancedColor.googleData.suggestedColorType = typeMatch[1];
          }
        }
        
        // Look for model information
        const modelMatches = allSnippetText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
        if (modelMatches) {
          const potentialModels = modelMatches
            .filter(m => m.length > 2 && m.length < 20)
            .filter(m => !['Color', 'Paint', 'Automotive', 'Car'].includes(m))
            .slice(0, 3);
          if (potentialModels.length > 0) {
            enhancedColor.googleData.suggestedModels = potentialModels;
          }
        }
        
        enhancedColors.push(enhancedColor);
        console.log(`  Found ${searchResults.snippets.length} snippets, ${searchResults.colorInfo.length} color codes`);
        
      } catch (searchError) {
        console.log(`  Error searching for ${color.make} ${color.colorName}:`, searchError.message);
        enhancedColors.push({
          ...color,
          googleData: {
            searchQuery,
            error: searchError.message,
            searchDate: new Date().toISOString()
          }
        });
      }
      
      // Add delay to avoid being blocked
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    }
    
    // Save enhanced color data
    fs.writeFileSync('enhanced-colors-google.json', JSON.stringify(enhancedColors, null, 2));
    
    // Generate summary statistics
    const withAdditionalInfo = enhancedColors.filter(c => c.googleData?.hasAdditionalInfo);
    const withColorCodes = enhancedColors.filter(c => c.googleData?.colorCodes?.length > 0);
    const withSuggestedTypes = enhancedColors.filter(c => c.googleData?.suggestedColorType);
    const withSuggestedModels = enhancedColors.filter(c => c.googleData?.suggestedModels?.length > 0);
    
    console.log(`\n=== GOOGLE ENHANCEMENT COMPLETE ===`);
    console.log(`Total sample colors processed: ${enhancedColors.length}`);
    console.log(`This is a demonstration - you can expand this to process all ${colorData?.length || 'your'} colors`);
    console.log(`Colors with additional info: ${withAdditionalInfo.length}`);
    console.log(`Colors with color codes found: ${withColorCodes.length}`);
    console.log(`Colors with suggested types: ${withSuggestedTypes.length}`);
    console.log(`Colors with suggested models: ${withSuggestedModels.length}`);
    
    // Show some examples
    console.log(`\nSample enhanced colors:`);
    enhancedColors.slice(0, 5).forEach(color => {
      console.log(`\n${color.make} ${color.colorName}:`);
      if (color.googleData?.colorCodes?.length > 0) {
        console.log(`  Color codes: ${color.googleData.colorCodes.join(', ')}`);
      }
      if (color.googleData?.suggestedColorType) {
        console.log(`  Suggested type: ${color.googleData.suggestedColorType}`);
      }
      if (color.googleData?.snippets?.length > 0) {
        console.log(`  Info: ${color.googleData.snippets[0].content.substring(0, 100)}...`);
      }
    });
    
  } catch (error) {
    console.error('Error during Google scraping:', error);
  } finally {
    await browser.close();
  }
}

scrapeGoogleForColors();