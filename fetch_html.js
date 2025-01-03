const puppeteer = require("puppeteer-extra");

const fs = require("fs");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the page
    const url =
        "https://m.skelbiu.lt/skelbimai/1?cities=&category_id=4&search=1&keywords=nesiojamas+kompiuteris&cost_min=150&cost_max=400&condition=0&user_type=0&type=0";
    console.log("Opening the page...");
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Get the HTML content
    console.log("Fetching HTML content...");
    const htmlContent = await page.content();

    // Save the HTML content into a file
    console.log("Saving HTML content to file...");
    fs.writeFileSync("page_content.html", htmlContent, "utf-8");

    console.log("HTML content saved to page_content.html");
    await browser.close();
})();
