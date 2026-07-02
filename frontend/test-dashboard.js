const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  try {
    console.log("Testing as Admin...");
    await page.goto('http://localhost:4200/login');
    await page.type('input[type="email"]', 'admin@kognitive.com');
    await page.type('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    // Check Dashboard
    await page.waitForSelector('.dashboard-card');
    const pageContentAdmin = await page.content();
    console.log("Admin sees Past Auctions:", pageContentAdmin.includes("Past Auctions"));
    console.log("Admin sees participants:", pageContentAdmin.includes("participants"));
    
    // Logout
    await page.click('.btn-logout');
    await page.waitForNavigation();
    
    console.log("Testing as Rep...");
    await page.goto('http://localhost:4200/login');
    await page.type('input[type="email"]', 'user@kognitive.com');
    await page.type('input[type="password"]', 'user');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    await page.waitForSelector('.dashboard-card');
    const pageContentRep = await page.content();
    console.log("Rep sees Past Auctions:", pageContentRep.includes("Past Auctions"));
    console.log("Rep sees participants:", pageContentRep.includes("participants"));
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
  }
})();
