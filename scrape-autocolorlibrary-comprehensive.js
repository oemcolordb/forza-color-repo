import puppeteer from 'puppeteer';
import fs from 'fs';

async function comprehensiveScrapeAutoColorLibrary() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  // Valid sections identified from site exploration
  const validSections = [
    {
      name: 'Classic Library',
      url: 'https://www.autocolorlibrary.com/pages/classic-library',
      yearRange: '1950-1977',
      description: 'Classic automotive colors from 1950-1977'
    },
    {
      name: 'Modern Library', 
      url: 'https://www.autocolorlibrary.com/pages/modern-library',
      yearRange: '1978-Present',
      description: 'Modern automotive colors from 1978-Present'
    },
    {
      name: 'Vintage Library',
      url: 'https://www.autocolorlibrary.com/pages/vintage-library', 
      yearRange: '1930-1949',
      description: 'Vintage automotive colors from 1930-1949'
    },
    {
      name: 'Antique Library',
      url: 'https://www.autocolorlibrary.com/pages/antique-library',
      yearRange: '1924-1929', 
      description: 'Antique automotive colors from 1924-1929'
    }
  ];
  
  const scrapingResults = {
    validSections: validSections,
    scrapedColors: [],
    siteStructure: {
      baseUrl: 'https://www.autocolorlibrary.com/',
      hasYearSelectors: true,
      requiresInteraction: true,
      colorDataLocation: 'Dynamic loading after year/make selection'
    },
    recommendations: []
  };
  
  try {
    console.log('=== COMPREHENSIVE AUTOCOLORLIBRARY.COM ANALYSIS ===\\n');
    
    for (const section of validSections) {
      console.log(`Analyzing ${section.name} (${section.yearRange})...`);
      
      await page.goto(section.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Analyze page structure
      const pageStructure = await page.evaluate((sectionInfo) => {
        const structure = {
          title: document.title,
          hasYearSelector: !!document.querySelector('select'),
          yearOptions: [],
          formElements: [],
          potentialColorElements: [],
          interactiveElements: []
        };
        
        // Get year options
        const yearSelect = document.querySelector('select');
        if (yearSelect) {
          const options = yearSelect.querySelectorAll('option');
          options.forEach(option => {
            if (option.value && option.value !== '') {
              structure.yearOptions.push(option.value);
            }
          });
        }
        
        // Find form elements
        document.querySelectorAll('form, select, input, button').forEach(el => {
          structure.formElements.push({
            tag: el.tagName,
            type: el.type || '',
            name: el.name || '',
            id: el.id || '',
            className: el.className || ''
          });
        });
        
        // Look for elements that might contain color data after interaction
        document.querySelectorAll('*').forEach(el => {
          const text = el.textContent?.trim();
          if (text && (
            el.className.includes('color') ||
            el.className.includes('paint') ||
            el.className.includes('product') ||
            el.hasAttribute('data-color') ||
            text.match(/\\b(red|blue|green|black|white|silver|gray|grey|yellow|orange|purple|brown|tan|beige|metallic|pearl)\\b/gi)
          )) {
            structure.potentialColorElements.push({
              tag: el.tagName,
              className: el.className,
              text: text.substring(0, 100),
              hasDataColor: el.hasAttribute('data-color')
            });
          }
        });
        
        // Find interactive elements
        document.querySelectorAll('button, [role="button"], [onclick], [data-action]').forEach(el => {
          structure.interactiveElements.push({
            tag: el.tagName,
            text: el.textContent?.trim().substring(0, 50) || '',
            className: el.className,
            hasOnClick: !!el.onclick,
            hasDataAction: el.hasAttribute('data-action')
          });
        });
        
        return structure;
      }, section);
      
      console.log(`  Year selector: ${pageStructure.hasYearSelector ? 'Yes' : 'No'}`);
      console.log(`  Year options: ${pageStructure.yearOptions.length} (${pageStructure.yearOptions.slice(0, 5).join(', ')}${pageStructure.yearOptions.length > 5 ? '...' : ''})`);
      console.log(`  Form elements: ${pageStructure.formElements.length}`);
      console.log(`  Potential color elements: ${pageStructure.potentialColorElements.length}`);
      console.log(`  Interactive elements: ${pageStructure.interactiveElements.length}`);
      
      // Try to interact with year selector if available
      if (pageStructure.hasYearSelector && pageStructure.yearOptions.length > 0) {
        const testYear = pageStructure.yearOptions[Math.floor(pageStructure.yearOptions.length / 2)];
        console.log(`  Testing year selection: ${testYear}`);
        
        try {
          await page.select('select', testYear);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Check if content changed
          const afterSelection = await page.evaluate(() => {
            const newElements = [];
            document.querySelectorAll('*').forEach(el => {
              const text = el.textContent?.trim();
              if (text && text.length > 5 && text.length < 200 && (
                text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi) ||
                text.match(/\\b(red|blue|green|black|white|silver|gray|grey|yellow|orange|purple|brown|tan|beige|metallic|pearl)\\b/gi) ||
                el.className.includes('color') ||
                el.className.includes('paint')
              )) {
                newElements.push({
                  text: text,
                  tag: el.tagName,
                  className: el.className
                });
              }
            });
            return newElements;
          });
          
          console.log(`    New elements after selection: ${afterSelection.length}`);
          
          // Convert any found elements to color format
          afterSelection.forEach(element => {
            const makeMatch = element.text.match(/\\b(ford|chevy|chevrolet|dodge|toyota|honda|nissan|bmw|mercedes|audi|volkswagen|buick|cadillac|chrysler|gmc|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mitsubishi|pontiac|porsche|subaru|volvo|acura|ram)\\b/gi);
            
            scrapingResults.scrapedColors.push({
              make: makeMatch ? makeMatch[0] : '',
              model: '',
              year: parseInt(testYear) || null,
              colorName: element.text.replace(/[^a-zA-Z0-9\\s-]/g, '').trim(),
              color1: { h: 0, s: 0, b: 0 },
              color2: { h: 0, s: 0, b: 0 },
              colorType: element.text.includes('metallic') ? 'Metallic' : element.text.includes('pearl') ? 'Pearl' : 'Normal',
              source: 'AutoColorLibrary',
              section: section.name,
              yearRange: section.yearRange,
              scrapedFrom: 'Year selector interaction'
            });
          });
          
        } catch (selectionError) {
          console.log(`    Error with year selection: ${selectionError.message}`);
        }
      }
      
      // Store section analysis
      section.analysis = pageStructure;
      console.log('');
    }
    
    // Generate recommendations for effective scraping
    scrapingResults.recommendations = [
      {
        priority: 'High',
        action: 'Implement year-by-year scraping',
        description: 'The site requires selecting specific years to load color data. Iterate through all available years in each section.'
      },
      {
        priority: 'High', 
        action: 'Handle dynamic content loading',
        description: 'Color data appears to be loaded dynamically after form interactions. Wait for content to load after each selection.'
      },
      {
        priority: 'Medium',
        action: 'Implement manufacturer selection',
        description: 'After selecting a year, the site likely provides manufacturer options. Implement secondary selection logic.'
      },
      {
        priority: 'Medium',
        action: 'Add retry logic',
        description: 'Some interactions may fail due to timing. Implement retry mechanisms for form interactions.'
      },
      {
        priority: 'Low',
        action: 'Explore API endpoints',
        description: 'Check if the site has API endpoints for color data that could be accessed directly.'
      }
    ];
    
    // Clean and deduplicate any colors found
    const cleanedColors = scrapingResults.scrapedColors
      .filter(color => color.colorName && color.colorName.length > 2)
      .filter((color, index, arr) => 
        arr.findIndex(c => c.make === color.make && c.colorName === color.colorName && c.year === color.year) === index
      );
    
    scrapingResults.scrapedColors = cleanedColors;
    
    // Save comprehensive results
    fs.writeFileSync('autocolorlibrary-comprehensive-analysis.json', JSON.stringify(scrapingResults, null, 2));
    
    console.log('=== COMPREHENSIVE ANALYSIS COMPLETE ===');
    console.log(`Valid sections identified: ${validSections.length}`);
    console.log(`Colors scraped: ${cleanedColors.length}`);
    console.log(`\\nValid sections for targeted scraping:`);
    
    validSections.forEach(section => {
      console.log(`\\n${section.name}:`);
      console.log(`  URL: ${section.url}`);
      console.log(`  Year Range: ${section.yearRange}`);
      console.log(`  Has Year Selector: ${section.analysis?.hasYearSelector ? 'Yes' : 'No'}`);
      console.log(`  Available Years: ${section.analysis?.yearOptions?.length || 0}`);
      console.log(`  Description: ${section.description}`);
    });
    
    console.log(`\\nRecommendations for effective scraping:`);
    scrapingResults.recommendations.forEach((rec, index) => {
      console.log(`\\n${index + 1}. [${rec.priority}] ${rec.action}`);
      console.log(`   ${rec.description}`);
    });
    
    if (cleanedColors.length > 0) {
      console.log(`\\nSample scraped colors:`);
      cleanedColors.slice(0, 10).forEach(color => {
        console.log(`  ${color.year || 'Unknown'} ${color.make || 'Unknown'} - ${color.colorName}`);
      });
    }
    
  } catch (error) {
    console.error('Error during comprehensive analysis:', error);
  } finally {
    await browser.close();
  }
}

comprehensiveScrapeAutoColorLibrary();