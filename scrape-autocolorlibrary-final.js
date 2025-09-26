import puppeteer from 'puppeteer';
import fs from 'fs';

async function scrapeAutoColorLibraryFinal() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  const validSections = [
    { name: 'Modern Library', url: 'https://www.autocolorlibrary.com/pages/modern-library', yearRange: '1978-Present', years: ['1985', '1990', '1995', '2000', '2005', '2010'] },
    { name: 'Classic Library', url: 'https://www.autocolorlibrary.com/pages/classic-library', yearRange: '1950-1977', years: ['1965', '1970', '1975'] }
  ];
  
  const allColors = [];
  
  try {
    for (const section of validSections) {
      console.log(`\\nScraping ${section.name} (${section.yearRange})...`);
      
      await page.goto(section.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try to interact with year selector
      for (const year of section.years) {
        try {
          console.log(`  Trying year ${year}...`);
          
          // Select the year from dropdown
          await page.select('select.custom-select', year);
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Look for any new content that appears
          const yearContent = await page.evaluate((selectedYear, sectionInfo) => {
            const colors = [];
            const makes = [];
            
            // Look for any new elements that might have appeared
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
              const text = el.textContent?.trim();
              if (text && text.length > 2 && text.length < 100) {
                // Check for manufacturer names
                const makeMatch = text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi);
                if (makeMatch) {
                  makes.push(makeMatch[0]);
                }
                
                // Check for color-related content
                if (text.match(/\\b(red|blue|green|black|white|silver|gray|grey|yellow|orange|purple|brown|tan|beige|metallic|pearl|solid)\\b/gi) ||
                    el.className.includes('color') ||
                    el.className.includes('paint') ||
                    el.hasAttribute('data-color')) {
                  colors.push({
                    text: text,
                    className: el.className,
                    tag: el.tagName
                  });
                }
              }
            });
            
            // Also check for any links that might have appeared
            const newLinks = [];
            document.querySelectorAll('a[href]').forEach(link => {
              if (link.href.includes('autocolorlibrary.com') && 
                  link.href !== window.location.href &&
                  (link.textContent.includes('color') || 
                   link.textContent.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi))) {
                newLinks.push({
                  text: link.textContent.trim(),
                  href: link.href
                });
              }
            });
            
            return {
              colors: colors,
              makes: [...new Set(makes)],
              newLinks: newLinks,
              pageChanged: document.body.innerText.includes(selectedYear)
            };
          }, year, section);
          
          console.log(`    Found ${yearContent.colors.length} color elements`);
          console.log(`    Found ${yearContent.makes.length} manufacturers`);
          console.log(`    Found ${yearContent.newLinks.length} new links`);
          console.log(`    Page changed: ${yearContent.pageChanged}`);
          
          // Convert found content to our color format
          yearContent.colors.forEach(item => {
            allColors.push({
              make: '',
              model: '',
              year: parseInt(year),
              colorName: item.text.replace(/[^a-zA-Z0-9\\s-]/g, '').trim(),
              color1: { h: 0, s: 0, b: 0 },
              color2: { h: 0, s: 0, b: 0 },
              colorType: item.text.includes('metallic') ? 'Metallic' : item.text.includes('pearl') ? 'Pearl' : 'Normal',
              source: 'AutoColorLibrary',
              section: section.name,
              yearRange: section.yearRange
            });
          });
          
          // Explore any new links that appeared
          for (const link of yearContent.newLinks.slice(0, 2)) {
            try {
              console.log(`    Exploring link: ${link.text} - ${link.href}`);
              await page.goto(link.href, { waitUntil: 'domcontentloaded', timeout: 15000 });
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              const linkColors = await page.evaluate((linkInfo, yearInfo, sectionInfo) => {
                const colors = [];
                
                // Look for color swatches, product listings, or color names
                const colorElements = document.querySelectorAll('[class*="color"], [class*="paint"], [class*="product"], [data-color]');
                colorElements.forEach(el => {
                  const text = el.textContent?.trim();
                  if (text && text.length > 2 && text.length < 150) {
                    colors.push({
                      make: linkInfo.text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi)?.[0] || '',
                      model: '',
                      year: parseInt(yearInfo),
                      colorName: text.replace(/[^a-zA-Z0-9\\s-]/g, '').trim(),
                      color1: { h: 0, s: 0, b: 0 },
                      color2: { h: 0, s: 0, b: 0 },
                      colorType: text.includes('metallic') ? 'Metallic' : text.includes('pearl') ? 'Pearl' : 'Normal',
                      source: 'AutoColorLibrary',
                      section: sectionInfo.name,
                      yearRange: sectionInfo.yearRange
                    });
                  }
                });
                
                // Also look for any structured data or tables
                const tables = document.querySelectorAll('table, .table');
                tables.forEach(table => {
                  const rows = table.querySelectorAll('tr, .row');
                  rows.forEach(row => {
                    const cells = row.querySelectorAll('td, th, .cell');
                    if (cells.length > 0) {
                      const rowText = Array.from(cells).map(cell => cell.textContent.trim()).join(' ');
                      if (rowText.length > 5 && rowText.length < 200) {
                        colors.push({
                          make: linkInfo.text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi)?.[0] || '',
                          model: '',
                          year: parseInt(yearInfo),
                          colorName: rowText.replace(/[^a-zA-Z0-9\\s-]/g, '').trim(),
                          color1: { h: 0, s: 0, b: 0 },
                          color2: { h: 0, s: 0, b: 0 },
                          colorType: rowText.includes('metallic') ? 'Metallic' : rowText.includes('pearl') ? 'Pearl' : 'Normal',
                          source: 'AutoColorLibrary',
                          section: sectionInfo.name,
                          yearRange: sectionInfo.yearRange
                        });
                      }
                    }
                  });
                });
                
                return colors.slice(0, 20); // Limit per link
              }, link, year, section);
              
              console.log(`      Found ${linkColors.length} colors from link`);
              allColors.push(...linkColors);
              
              // Go back to the main section page
              await page.goto(section.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
              await new Promise(resolve => setTimeout(resolve, 2000));
              
            } catch (linkError) {
              console.log(`      Error exploring link:`, linkError.message);
            }
          }
          
        } catch (yearError) {
          console.log(`    Error with year ${year}:`, yearError.message);
        }
      }
    }
    
    // Clean and deduplicate colors
    const cleanedColors = allColors
      .filter(color => color.colorName && color.colorName.length > 2 && color.colorName.length < 100)
      .filter(color => !color.colorName.match(/^(click|select|choose|view|more|info|details|buy|purchase|add|cart|home|contact|about|support|privacy|terms)$/i))
      .filter(color => color.colorName.match(/[a-zA-Z]/)) // Must contain at least one letter
      .map(color => ({
        ...color,
        colorName: color.colorName.replace(/\\s+/g, ' ').trim(),
        make: color.make ? color.make.toLowerCase().replace(/\\b\\w/g, l => l.toUpperCase()) : ''
      }))
      .filter((color, index, arr) => 
        arr.findIndex(c => 
          c.make === color.make && 
          c.colorName === color.colorName && 
          c.year === color.year
        ) === index
      );
    
    // Save results
    fs.writeFileSync('autocolorlibrary-colors-final.json', JSON.stringify(cleanedColors, null, 2));
    
    console.log(`\\n=== FINAL SCRAPING COMPLETE ===`);
    console.log(`Total colors scraped: ${cleanedColors.length}`);
    console.log(`Unique makes: ${[...new Set(cleanedColors.map(c => c.make).filter(m => m))].length}`);
    console.log(`Years covered: ${[...new Set(cleanedColors.map(c => c.year).filter(y => y))].sort().join(', ')}`);
    
    // Group by section
    validSections.forEach(section => {
      const sectionColors = cleanedColors.filter(c => c.section === section.name);
      console.log(`\\n${section.name}: ${sectionColors.length} colors`);
      
      const sectionMakes = [...new Set(sectionColors.map(c => c.make).filter(m => m))];
      if (sectionMakes.length > 0) {
        console.log(`  Makes: ${sectionMakes.join(', ')}`);
      }
    });
    
    if (cleanedColors.length > 0) {
      console.log(`\\nSample colors:`);
      cleanedColors.slice(0, 15).forEach(color => {
        console.log(`  ${color.year || 'Unknown'} ${color.make || 'Unknown'} - ${color.colorName} (${color.colorType})`);
      });
    }
    
  } catch (error) {
    console.error('Error during final scraping:', error);
  } finally {
    await browser.close();
  }
}

scrapeAutoColorLibraryFinal();