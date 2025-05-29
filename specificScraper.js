import puppeteer from "puppeteer-extra";
import fs from "fs";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Use the stealth plugin
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: true });

    // Array of links to scrape
    const links = [
        "https://m.skelbiu.lt/skelbimai/hp-elitebook-840-g8-i5-1135g7-16gb-512ssd-76156135.html",
        "https://m.skelbiu.lt/skelbimai/lenovo-i5-8250-8-gb-ddr4-256-nvme-fhd-76605141.html",
    ];

    const results = [];

    for (let i = 0; i < links.length; i++) {
        let link = links[i];

        // Make sure the link starts with the correct domain
        if (!link.startsWith("https://m.skelbiu.lt")) {
            link = `https://m.skelbiu.lt${link}`;
        }

        try {
            console.log(`Visiting page ${i + 1}/${links.length}: ${link}`);
            const listingPage = await browser.newPage();

            await listingPage.goto(link, { waitUntil: "domcontentloaded" });

            // Wait for the important elements
            await listingPage.waitForSelector("h1.item-title");
            await listingPage.waitForSelector("#description");

            // Extract details
            const title = await listingPage.$eval("h1.item-title", (el) =>
                el.textContent.trim()
            );
            const price = await listingPage.$eval("div#price", (el) =>
                el.textContent.trim().split("€")[0].trim()
            );
            const description = await listingPage.$eval("#description", (el) =>
                el.textContent.trim()
            );

            // Push the scraped data to the results array
            results.push({
                title,
                price: `${price} €`,
                description,
                link,
            });

            await listingPage.close();

            // Save results every 5 pages or at the end
            if ((i + 1) % 5 === 0 || i + 1 === links.length) {
                fs.writeFileSync(
                    "listingsSpec.json",
                    JSON.stringify(results, null, 2),
                    "utf-8"
                );
            }
        } catch (error) {
            console.error(`Failed to scrape ${link}:`, error);
        }
    }

    await browser.close();
    console.log("Scraping complete. Results saved to listingsSpec.json");
})();
