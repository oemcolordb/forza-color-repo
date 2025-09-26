import puppeteer from 'puppeteer';
import fs from 'fs';

async function deepScrapeAutoColorLibrary() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  const validSections = [
    { name: 'Classic Library', url: 'https://www.autocolorlibrary.com/pages/classic-library', yearRange: '1950-1977' },
    { name: 'Modern Library', url: 'https://www.autocolorlibrary.com/pages/modern-library', yearRange: '1978-Present' }
  ];
  
  const allColors = [];
  
  try {
    for (const section of validSections) {
      console.log(`\\nDeep scraping ${section.name} (${section.yearRange})...`);
      
      await page.goto(section.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Get full page content for analysis
      const pageAnalysis = await page.evaluate((sectionInfo) => {
        const analysis = {
          title: document.title,
          bodyText: document.body.innerText,
          allLinks: [],
          allElements: [],
          scripts: [],
          forms: []
        };
        
        // Get all links
        document.querySelectorAll('a[href]').forEach(link => {
          analysis.allLinks.push({
            text: link.textContent.trim(),
            href: link.href,
            className: link.className
          });
        });
        
        // Get all elements with text content
        document.querySelectorAll('*').forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 5 && text.length < 200) {
            analysis.allElements.push({
              tag: el.tagName,
              className: el.className,
              id: el.id,
              text: text,
              hasHref: !!el.href
            });
          }
        });
        
        // Look for scripts that might load content
        document.querySelectorAll('script').forEach(script => {
          if (script.src) {
            analysis.scripts.push(script.src);
          }
        });
        
        // Look for forms
        document.querySelectorAll('form').forEach(form => {
          analysis.forms.push({
            action: form.action,
            method: form.method,
            inputs: Array.from(form.querySelectorAll('input')).map(input => ({
              type: input.type,
              name: input.name,
              value: input.value
            }))
          });
        });
        
        return analysis;
      }, section);
      
      console.log(`  Page title: ${pageAnalysis.title}`);
      console.log(`  Body text length: ${pageAnalysis.bodyText.length}`);
      console.log(`  Total links: ${pageAnalysis.allLinks.length}`);
      console.log(`  Total elements: ${pageAnalysis.allElements.length}`);
      console.log(`  Scripts: ${pageAnalysis.scripts.length}`);
      
      // Look for manufacturer or color-related links
      const relevantLinks = pageAnalysis.allLinks.filter(link => 
        link.href.includes('autocolorlibrary.com') &&
        (link.text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi) ||
         link.href.includes('collections') ||
         link.href.includes('products') ||
         link.text.toLowerCase().includes('color') ||
         link.text.toLowerCase().includes('paint'))
      );
      
      console.log(`  Relevant links found: ${relevantLinks.length}`);
      
      // Try to find and click on manufacturer links or buttons
      const manufacturerButtons = await page.$$eval('button, a, [role="button"]', elements => {
        return elements
          .filter(el => {
            const text = el.textContent?.trim() || '';
            return text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi);
          })
          .map(el => ({
            text: el.textContent.trim(),
            tag: el.tagName,
            className: el.className
          }));
      });
      
      console.log(`  Manufacturer buttons/links: ${manufacturerButtons.length}`);
      
      // If we found manufacturer buttons, try clicking them
      if (manufacturerButtons.length > 0) {
        for (let i = 0; i < Math.min(3, manufacturerButtons.length); i++) {
          const button = manufacturerButtons[i];
          console.log(`    Trying to click: ${button.text}`);
          
          try {
            await page.click(`${button.tag}:has-text("${button.text}")`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check if new content loaded
            const newContent = await page.evaluate(() => {
              const colors = [];
              
              // Look for color-related content that might have appeared
              document.querySelectorAll('*').forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 3 && text.length < 100 &&
                    text.match(/\\b(red|blue|green|black|white|silver|gray|grey|yellow|orange|purple|brown|tan|beige|metallic|pearl|solid|color|paint)\\b/gi)) {
                  colors.push({
                    element: el.tagName,
                    className: el.className,
                    text: text
                  });
                }
              });
              
              return colors;
            });
            
            console.log(`      Found ${newContent.length} potential color elements after click`);
            
            // Convert to our color format
            newContent.forEach(item => {
              const make = button.text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi)?.[0] || '';
              const yearMatch = item.text.match(/\\b(19|20)\\d{2}\\b/);
              
              allColors.push({
                make: make,
                model: '',
                year: yearMatch ? parseInt(yearMatch[0]) : null,
                colorName: item.text.replace(/\\b(19|20)\\d{2}\\b/g, '').trim(),
                color1: { h: 0, s: 0, b: 0 },
                color2: { h: 0, s: 0, b: 0 },
                colorType: item.text.includes('metallic') ? 'Metallic' : item.text.includes('pearl') ? 'Pearl' : 'Normal',
                source: 'AutoColorLibrary',
                section: section.name,
                yearRange: section.yearRange
              });
            });
            
          } catch (clickError) {
            console.log(`      Error clicking ${button.text}:`, clickError.message);
          }
        }
      }
      
      // Also explore relevant links
      for (let i = 0; i < Math.min(3, relevantLinks.length); i++) {
        const link = relevantLinks[i];
        try {
          console.log(`    Exploring link: ${link.text} - ${link.href}`);
          await page.goto(link.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const linkColors = await page.evaluate((linkInfo, sectionInfo) => {
            const colors = [];
            
            // Look for product listings or color information
            document.querySelectorAll('*').forEach(el => {
              const text = el.textContent?.trim();
              if (text && text.length > 3 && text.length < 150) {
                // Check if it looks like a color name or product
                if (text.match(/\\b(red|blue|green|black|white|silver|gray|grey|yellow|orange|purple|brown|tan|beige|metallic|pearl|solid)\\b/gi) ||
                    text.match(/\\b\\d{4}\\b/) || // Year
                    el.className.includes('product') ||
                    el.className.includes('color') ||
                    el.className.includes('paint')) {
                  
                  const yearMatch = text.match(/\\b(19|20)\\d{2}\\b/);
                  const make = linkInfo.text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi)?.[0] || '';
                  
                  colors.push({
                    make: make,
                    model: '',
                    year: yearMatch ? parseInt(yearMatch[0]) : null,
                    colorName: text.replace(/\\b(19|20)\\d{2}\\b/g, '').replace(/[^a-zA-Z0-9\\s-]/g, '').trim(),
                    color1: { h: 0, s: 0, b: 0 },
                    color2: { h: 0, s: 0, b: 0 },
                    colorType: text.includes('metallic') ? 'Metallic' : text.includes('pearl') ? 'Pearl' : 'Normal',
                    source: 'AutoColorLibrary',
                    section: sectionInfo.name,
                    yearRange: sectionInfo.yearRange
                  });
                }
              }
            });
            
            return colors.slice(0, 30); // Limit per page
          }, link, section);
          
          console.log(`      Found ${linkColors.length} colors from link`);
          allColors.push(...linkColors);
          
        } catch (linkError) {
          console.log(`      Error exploring link:`, linkError.message);
        }
      }
      
      // Save section analysis for debugging
      fs.writeFileSync(`autocolorlibrary-${section.name.toLowerCase().replace(' ', '-')}-analysis.json`, 
        JSON.stringify(pageAnalysis, null, 2));
    }
    
    // Clean and deduplicate colors
    const cleanedColors = allColors
      .filter(color => color.colorName && color.colorName.length > 2 && color.colorName.length < 100)
      .filter(color => !color.colorName.match(/^(click|select|choose|view|more|info|details|buy|purchase|add|cart)$/i))
      .map(color => ({
        ...color,
        colorName: color.colorName.replace(/[^a-zA-Z0-9\\s-]/g, '').trim(),
        make: color.make ? color.make.toLowerCase().replace(/\\b\\w/g, l => l.toUpperCase()) : ''
      }))
      .filter((color, index, arr) => 
        arr.findIndex(c => c.make === color.make && c.colorName === color.colorName && c.year === color.year) === index
      );
    
    // Save results
    fs.writeFileSync('autocolorlibrary-colors-deep.json', JSON.stringify(cleanedColors, null, 2));
    
    console.log(`\\n=== DEEP SCRAPING COMPLETE ===`);
    console.log(`Total colors scraped: ${cleanedColors.length}`);
    console.log(`Unique makes: ${[...new Set(cleanedColors.map(c => c.make).filter(m => m))].length}`);
    
    if (cleanedColors.length > 0) {
      console.log(`\\nSample colors:`);
      cleanedColors.slice(0, 10).forEach(color => {
        console.log(`  ${color.make || 'Unknown'} ${color.model || ''} ${color.year || 'Unknown'} - ${color.colorName} (${color.colorType})`);
      });
    }
    
  } catch (error) {
    console.error('Error during deep scraping:', error);
  } finally {
    await browser.close();
  }
}

deepScrapeAutoColorLibrary();