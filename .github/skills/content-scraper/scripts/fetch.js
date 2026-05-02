const url = process.argv[2];

if (!url) {
  console.error("❌ Please provide a URL to scrape.");
  console.error("Usage: node fetch.js <URL>");
  process.exit(1);
}

// Using the project's Firecrawl API Key
const apiKey = process.env.FIRECRAWL_API_KEY || "fc-5d313c8cc6a9486698eefa3a42b6a265";
const cloudflareWorkerUrl = process.env.CLOUDFLARE_WORKER_URL; // e.g. "https://my-proxy.workers.dev/?url="

async function scrape() {
  console.error(`Scraping: ${url}`);
  
  try {
    console.error(`Attempt 1: Firecrawl API (Handles anti-bot/IP rotation automatically)...`);
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        formats: ["markdown", "html"],
        onlyMainContent: true,
        waitFor: 3000, 
        actions: [{ type: "wait", milliseconds: 2000 }], 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firecrawl API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const json = await response.json();
    
    // Output just the scraped data so the AI can parse it natively
    console.log(JSON.stringify(json.data, null, 2));
    return;
  } catch (error) {
    console.error(`❌ Firecrawl failed: ${error.message}`);
    console.error(`Attempt 2: Fallback to Cloudflare Worker / BrightData...`);
    
    try {
      if (cloudflareWorkerUrl) {
        console.error(`Using Cloudflare Worker Proxy...`);
        const fallbackResponse = await fetch(`${cloudflareWorkerUrl}${encodeURIComponent(url)}`);
        if (!fallbackResponse.ok) throw new Error(`Cloudflare Worker error: ${fallbackResponse.status}`);
        const html = await fallbackResponse.text();
        console.log(JSON.stringify({ markdown: html, html: html }, null, 2));
        return;
      } else {
        console.error("⚠️ No CLOUDFLARE_WORKER_URL found. Please configure a Cloudflare Worker or BrightData Proxy if Firecrawl fails frequently.");
        console.error("Falling back to direct fetch (may be blocked by target's Cloudflare)...");
        
        // This is a direct fallback. To use BrightData, you would wrap this fetch with https-proxy-agent.
        const directResponse = await fetch(url);
        const html = await directResponse.text();
        console.log(JSON.stringify({ markdown: html, html: html }, null, 2));
      }
    } catch (fallbackError) {
      console.error("❌ Fallback scraping failed:", fallbackError.message);
      process.exit(1);
    }
  }
}

scrape();