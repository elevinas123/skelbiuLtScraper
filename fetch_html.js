import puppeteer from "puppeteer-extra";
import fs from "fs";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Set to false to see what's happening
    const page = await browser.newPage();

    // Navigate to the laptop listings page
    const url =
        "https://www.skelbiu.lt/skelbimai/1?autocompleted=1&type=0&distance=0&mainCity=1&search=1&category_id=519&user_type=0&ad_since_min=0&ad_since_max=0&visited_page=1&orderBy=3&detailsSearch=0&place_category_id=33&facets=1&changeView=1";
    console.log("Opening the page...");
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Wait a bit for dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Get the HTML content
    console.log("Fetching HTML content...");
    const htmlContent = await page.content();

    // Save the HTML content into a file
    console.log("Saving HTML content to file...");
    fs.writeFileSync("page_content.html", htmlContent, "utf-8");

    // Try to find what selectors actually exist
    console.log("Checking for different selectors...");

    const selectors = [
        ".list-item",
        ".standard-list-item",
        ".item",
        ".listing",
        ".ad-item",
        '[data-testid*="item"]',
        ".result-item",
        ".search-item",
    ];

    for (const selector of selectors) {
        try {
            const elements = await page.$$(selector);
            console.log(
                `Found ${elements.length} elements with selector: ${selector}`
            );
        } catch (error) {
            console.log(`Error with selector ${selector}:`, error.message);
        }
    }

    // Also check for any elements with "item" in their class name
    const itemElements = await page.evaluate(() => {
        const allElements = document.querySelectorAll("*");
        const itemElements = [];
        allElements.forEach((el) => {
            if (
                el.className &&
                typeof el.className === "string" &&
                el.className.includes("item")
            ) {
                itemElements.push(el.className);
            }
        });
        return [...new Set(itemElements)]; // Remove duplicates
    });

    console.log("Elements with 'item' in class name:", itemElements);

    console.log("HTML content saved to page_content.html");
    await browser.close();
})();
