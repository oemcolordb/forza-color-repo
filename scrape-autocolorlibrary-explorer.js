import puppeteer from 'puppeteer';
import fs from 'fs';

async function exploreAutoColorLibrary() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  const siteStructure = {
    baseUrl: 'https://www.autocolorlibrary.com/',
    pages: [],
    manufacturers: [],
    colorCategories: [],
    navigationStructure: {},
    validSections: []
  };
  
  try {
    console.log('Exploring main page...');
    await page.goto('https://www.autocolorlibrary.com/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Extract main navigation and structure with error handling
    let mainPageData;
    try {
      mainPageData = await page.evaluate(() => {
        const data = {
          title: document.title || 'Unknown',
          navigation: [],
          manufacturers: [],
          categories: [],
          links: [],
          sections: [],
          bodyText: document.body ? document.body.innerText.substring(0, 1000) : 'No body content'
        };
        
        try {
          // Get all links on the page
          const allLinks = document.querySelectorAll('a[href]');
          allLinks.forEach(link => {
            try {
              if (link.href && link.textContent && link.textContent.trim()) {
                const isInternal = link.href.includes('autocolorlibrary.com');
                const linkData = {
                  text: link.textContent.trim(),
                  href: link.href,
                  className: link.className || '',
                  isInternal
                };
                
                data.links.push(linkData);
                
                // Also add to navigation if it looks like navigation
                if (isInternal && (link.closest('nav') || link.closest('.nav') || link.closest('header'))) {
                  data.navigation.push(linkData);
                }
              }
            } catch (e) {
              console.log('Error processing link:', e);
            }
          });
          
          // Look for text that might indicate manufacturers
          const textContent = document.body.innerText || '';
          const carMakes = ['Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes', 'Mitsubishi', 'Nissan', 'Pontiac', 'Porsche', 'Ram', 'Subaru', 'Toyota', 'Volkswagen', 'Volvo'];
          
          carMakes.forEach(make => {
            if (textContent.includes(make)) {
              data.manufacturers.push(make);
            }
          });
          
        } catch (e) {
          console.log('Error in page evaluation:', e);
        }
        
        return data;
      });
    } catch (evalError) {
      console.log('Page evaluation failed:', evalError.message);
      mainPageData = {
        title: 'Error loading page',
        navigation: [],
        manufacturers: [],
        categories: [],
        links: [],
        sections: [],
        bodyText: 'Failed to load content'
      };
    }
    
    siteStructure.pages.push({
      url: 'https://www.autocolorlibrary.com/',
      ...mainPageData
    });
    
    console.log('Found navigation links:', mainPageData.navigation.length);
    console.log('Found internal links:', mainPageData.links.length);
    
    // Explore a few key pages based on links found
    const keyPages = mainPageData.links
      .filter(link => link.isInternal && 
        link.href !== 'https://www.autocolorlibrary.com/' &&
        (link.text.toLowerCase().includes('color') || 
         link.text.toLowerCase().includes('paint') ||
         link.text.toLowerCase().includes('search') ||
         link.href.includes('make') ||
         link.href.includes('model')))
      .slice(0, 5); // Limit to first 5 relevant pages
    
    console.log(`Found ${keyPages.length} relevant pages to explore`);
    
    for (const linkItem of keyPages) {
      try {
        console.log(`Exploring: ${linkItem.text} - ${linkItem.href}`);
        await page.goto(linkItem.href, { 
          waitUntil: 'domcontentloaded', 
          timeout: 20000 
        });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const pageData = await page.evaluate(() => {
          const data = {
            title: document.title || 'Unknown',
            colorData: [],
            manufacturers: [],
            models: [],
            years: [],
            colorTypes: [],
            bodyText: document.body ? document.body.innerText.substring(0, 500) : ''
          };
          
          try {
            // Look for any elements that might contain color information
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
              const text = el.textContent || '';
              const className = el.className || '';
              
              // Check if element might contain color data
              if (text.length > 0 && text.length < 200 && 
                  (text.match(/\b(red|blue|green|black|white|silver|gray|grey|yellow|orange|purple|brown|tan|beige|metallic|pearl|solid)\b/gi) ||
                   className.includes('color') ||
                   className.includes('paint') ||
                   el.hasAttribute('data-color'))) {
                
                data.colorData.push({
                  element: el.tagName,
                  className: className,
                  textContent: text.trim().substring(0, 100),
                  hasColorAttribute: el.hasAttribute('data-color')
                });
              }
            });
            
            // Look for year patterns in text
            const bodyText = document.body.innerText || '';
            const yearMatches = bodyText.match(/\b(19|20)\d{2}\b/g);
            if (yearMatches) {
              data.years = [...new Set(yearMatches.map(y => parseInt(y)))].filter(y => y >= 1950 && y <= 2025);
            }
            
          } catch (e) {
            console.log('Error processing page data:', e);
          }
          
          return data;
        });
        
        siteStructure.pages.push({
          url: linkItem.href,
          navigationText: linkItem.text,
          ...pageData
        });
        
        console.log(`  Found ${pageData.colorData.length} potential color elements`);
        console.log(`  Found ${pageData.years.length} years`);
        
      } catch (error) {
        console.log(`  Error exploring ${linkItem.href}:`, error.message);
      }
    }
    
    // Analyze and categorize valid sections
    siteStructure.validSections = siteStructure.pages
      .filter(page => page.colorData && page.colorData.length > 0)
      .map(page => ({
        url: page.url,
        navigationText: page.navigationText || 'Home',
        colorElementCount: page.colorData.length,
        hasManufacturerData: (page.manufacturers || []).length > 0,
        hasModelData: (page.models || []).length > 0,
        hasYearData: (page.years || []).length > 0,
        yearRange: page.years && page.years.length > 0 ? 
          `${Math.min(...page.years)}-${Math.max(...page.years)}` : 'No years'
      }));
    
    // Extract unique manufacturers and categories
    siteStructure.manufacturers = [...new Set(
      siteStructure.pages.flatMap(page => page.manufacturers || [])
    )].filter(m => m.length > 0 && m.length < 50);
    
    siteStructure.colorCategories = [...new Set(
      siteStructure.pages.flatMap(page => page.colorTypes || [])
    )].filter(c => c.length > 0 && c.length < 50);
    
    // Save the complete site structure
    fs.writeFileSync('autocolorlibrary-structure.json', JSON.stringify(siteStructure, null, 2));
    
    console.log('\n=== SITE EXPLORATION COMPLETE ===');
    console.log(`Total pages explored: ${siteStructure.pages.length}`);
    console.log(`Valid sections found: ${siteStructure.validSections.length}`);
    console.log(`Unique manufacturers: ${siteStructure.manufacturers.length}`);
    console.log(`Total links found: ${mainPageData.links.length}`);
    
    console.log('\nMain page info:');
    console.log(`  Title: ${mainPageData.title}`);
    console.log(`  Body preview: ${mainPageData.bodyText.substring(0, 200)}...`);
    
    console.log('\nValid sections for scraping:');
    siteStructure.validSections.forEach(section => {
      console.log(`  - ${section.navigationText}: ${section.url}`);
      console.log(`    Color elements: ${section.colorElementCount}, Years: ${section.yearRange}`);
    });
    
    console.log('\nAll internal links found:');
    mainPageData.links.filter(l => l.isInternal).slice(0, 20).forEach(link => {
      console.log(`  - ${link.text}: ${link.href}`);
    });
    
    if (siteStructure.manufacturers.length > 0) {
      console.log('\nManufacturers found:');
      siteStructure.manufacturers.slice(0, 10).forEach(make => {
        console.log(`  - ${make}`);
      });
    }
    
  } catch (error) {
    console.error('Error during exploration:', error);
  } finally {
    await browser.close();
  }
}

exploreAutoColorLibrary();