(async () => {
  try {
    const apiKey = "fc-5d313c8cc6a9486698eefa3a42b6a265";
    const target = "https://www.ign.com/maps/forza-horizon-5/mexico";
    const payload = {
      url: target,
      formats: ["markdown"],
      onlyMainContent: true,
      waitFor: 2500,
      actions: [{ type: "wait", milliseconds: 2000 }],
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'application/json',
    };

    async function post(url, body) {
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      const text = await res.text();
      return { status: res.status, text };
    }

    console.log('Posting to /v1/scrape...');
    const r1 = await post('https://api.firecrawl.dev/v1/scrape', payload);
    console.log('SCRAPE STATUS', r1.status);
    console.log('--- BODY (truncated) ---');
    console.log(r1.text.slice(0, 5000));

    if (r1.status === 403) {
      console.log('\nReceived 403 — retrying /v1/crawl with javascript:true');
      const r2 = await post('https://api.firecrawl.dev/v1/crawl', { ...payload, javascript: true });
      console.log('CRAWL STATUS', r2.status);
      console.log('--- CRAWL BODY (truncated) ---');
      console.log(r2.text.slice(0, 5000));
    }
  } catch (err) {
    console.error('Error running Firecrawl test:', err);
    process.exitCode = 1;
  }
})();
