import puppeteer from 'puppeteer';
import fs from 'fs';

async function scrapeAutoColorLibrary() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  const validSections = [
    { name: 'Classic Library', url: 'https://www.autocolorlibrary.com/pages/classic-library', yearRange: '1950-1977' },
    { name: 'Modern Library', url: 'https://www.autocolorlibrary.com/pages/modern-library', yearRange: '1978-Present' },
    { name: 'Vintage Library', url: 'https://www.autocolorlibrary.com/pages/vintage-library', yearRange: '1930-1949' },
    { name: 'Antique Library', url: 'https://www.autocolorlibrary.com/pages/antique-library', yearRange: '1924-1929' }
  ];
  
  const allColors = [];
  
  try {
    for (const section of validSections) {
      console.log(`\\nScraping ${section.name} (${section.yearRange})...`);
      
      await page.goto(section.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const sectionColors = await page.evaluate((sectionInfo) => {
        const colors = [];
        
        // Look for manufacturer/make links or sections
        const makeLinks = document.querySelectorAll('a[href*="make"], a[href*="manufacturer"], a[href*="brand"]');
        const makeElements = document.querySelectorAll('[class*="make"], [class*="manufacturer"], [class*="brand"]');
        
        // Get all links that might lead to color pages
        const allLinks = document.querySelectorAll('a[href]');
        const colorLinks = [];
        
        allLinks.forEach(link => {
          const href = link.href;
          const text = link.textContent.trim();
          
          // Check if link might contain color data
          if (href.includes('autocolorlibrary.com') && 
              (text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi) ||
               href.includes('collections') ||
               href.includes('products'))) {
            colorLinks.push({
              text: text,
              href: href,
              make: text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi)?.[0] || ''
            });
          }
        });
        
        // Look for color information in current page
        const colorElements = document.querySelectorAll('[class*="color"], [class*="paint"], [data-color]');
        colorElements.forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 0 && text.length < 100) {
            colors.push({
              make: '',
              model: '',
              year: null,
              colorName: text,
              color1: { h: 0, s: 0, b: 0 },
              color2: { h: 0, s: 0, b: 0 },
              colorType: 'Normal',
              source: 'AutoColorLibrary',
              section: sectionInfo.name,
              yearRange: sectionInfo.yearRange
            });
          }
        });
        
        return {
          colors: colors,
          colorLinks: colorLinks,
          pageText: document.body.innerText.substring(0, 500)
        };
      }, section);
      
      console.log(`  Found ${sectionColors.colors.length} colors on main page`);
      console.log(`  Found ${sectionColors.colorLinks.length} potential color links`);
      
      allColors.push(...sectionColors.colors);
      
      // Explore a few manufacturer pages if found
      const manufacturerLinks = sectionColors.colorLinks
        .filter(link => link.make)
        .slice(0, 3); // Limit to 3 manufacturers per section
      
      for (const makeLink of manufacturerLinks) {
        try {
          console.log(`    Exploring ${makeLink.make}: ${makeLink.href}`);
          await page.goto(makeLink.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const makeColors = await page.evaluate((makeInfo, sectionInfo) => {
            const colors = [];
            
            // Look for product listings, color swatches, or color names
            const productElements = document.querySelectorAll('[class*="product"], [class*="item"], [class*="color"], [class*="paint"]');
            
            productElements.forEach(el => {
              const text = el.textContent.trim();
              const colorMatch = text.match(/\\b([A-Z][a-z]+\\s*)+\\b/g);
              
              if (colorMatch && text.length < 200) {
                // Try to extract color name, year, model
                const yearMatch = text.match(/\\b(19|20)\\d{2}\\b/);
                const modelMatch = text.match(/\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\b/);
                
                colors.push({
                  make: makeInfo.make,
                  model: modelMatch ? modelMatch[0] : '',
                  year: yearMatch ? parseInt(yearMatch[0]) : null,
                  colorName: text.replace(/\\b(19|20)\\d{2}\\b/g, '').trim(),
                  color1: { h: 0, s: 0, b: 0 },
                  color2: { h: 0, s: 0, b: 0 },
                  colorType: text.includes('metallic') ? 'Metallic' : text.includes('pearl') ? 'Pearl' : 'Normal',
                  source: 'AutoColorLibrary',
                  section: sectionInfo.name,
                  yearRange: sectionInfo.yearRange
                });
              }
            });
            
            // Also look for structured data
            const structuredElements = document.querySelectorAll('[data-product], [data-color], [data-make], [data-model]');
            structuredElements.forEach(el => {
              if (el.textContent.trim()) {
                colors.push({
                  make: el.getAttribute('data-make') || makeInfo.make,
                  model: el.getAttribute('data-model') || '',
                  year: el.getAttribute('data-year') ? parseInt(el.getAttribute('data-year')) : null,
                  colorName: el.getAttribute('data-color') || el.textContent.trim(),
                  color1: { h: 0, s: 0, b: 0 },
                  color2: { h: 0, s: 0, b: 0 },
                  colorType: 'Normal',
                  source: 'AutoColorLibrary',
                  section: sectionInfo.name,
                  yearRange: sectionInfo.yearRange
                });
              }
            });
            
            return colors.slice(0, 50); // Limit per manufacturer
          }, makeLink, section);
          
          console.log(`      Found ${makeColors.length} colors for ${makeLink.make}`);
          allColors.push(...makeColors);
          
        } catch (error) {
          console.log(`      Error exploring ${makeLink.make}:`, error.message);
        }
      }
    }
    
    // Clean and deduplicate colors
    const cleanedColors = allColors
      .filter(color => color.colorName && color.colorName.length > 2 && color.colorName.length < 100)
      .map(color => ({
        ...color,
        colorName: color.colorName.replace(/[^a-zA-Z0-9\\s-]/g, '').trim(),
        make: color.make.toLowerCase().replace(/\\b\\w/g, l => l.toUpperCase())
      }))
      .filter((color, index, arr) => 
        arr.findIndex(c => c.make === color.make && c.colorName === color.colorName && c.year === color.year) === index
      );
    
    // Save results
    fs.writeFileSync('autocolorlibrary-colors.json', JSON.stringify(cleanedColors, null, 2));
    
    console.log(`\\n=== SCRAPING COMPLETE ===`);
    console.log(`Total colors scraped: ${cleanedColors.length}`);
    console.log(`Unique makes: ${[...new Set(cleanedColors.map(c => c.make))].length}`);
    console.log(`Colors by section:`);
    
    validSections.forEach(section => {
      const sectionColors = cleanedColors.filter(c => c.section === section.name);
      console.log(`  ${section.name}: ${sectionColors.length} colors`);
    });
    
    // Show sample colors
    console.log(`\\nSample colors:`);
    cleanedColors.slice(0, 10).forEach(color => {
      console.log(`  ${color.make} ${color.model} ${color.year || 'Unknown'} - ${color.colorName} (${color.colorType})`);
    });
    
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
}

scrapeAutoColorLibrary();