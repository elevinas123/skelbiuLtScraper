const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const results = [];

    for (let id = 1; id <= 23; id++) {
        const url = `https://m.skelbiu.lt/skelbimai/${id}?cities=&category_id=4&search=1&keywords=nesiojamas+kompiuteris&cost_min=150&cost_max=400&condition=0&user_type=0&type=0`;
        console.log(`Opening main page for category ${url}...`);

        try {
            await page.goto(url, { waitUntil: "domcontentloaded" });

            // Wait for listings to load
            console.log("Waiting for listings to load...");
            await page.waitForSelector(".list-item");

            // Extract all listing links
            console.log("Extracting listing links...");
            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll(".list-item a"))
                    .map((a) => a.href)
                    .filter((href) => href.includes("/skelbimai/")); // Ensure valid links
            });

            console.log(
                `Found ${links.length} listings in category ${id}. Starting to scrape details...`
            );

            for (let i = 0; i < links.length; i++) {
                let link = links[i];
                if (!link.startsWith("https://m.skelbiu.lt")) {
                    link = `https://m.skelbiu.lt${link}`;
                }

                try {
                    console.log(
                        `Visiting page ${i + 1}/${links.length}: ${link}`
                    );
                    const listingPage = await browser.newPage();
                    await listingPage.goto(link, {
                        waitUntil: "domcontentloaded",
                    });

                    // Wait for content to load
                    await listingPage.waitForSelector("h1.item-title");
                    await listingPage.waitForSelector("#description");

                    // Extract details
                    const title = await listingPage.$eval(
                        "h1.item-title",
                        (el) => el.textContent.trim()
                    );
                    const price = await listingPage.$eval("div#price", (el) =>
                        el.textContent.trim().split("€")[0].trim()
                    );
                    const description = await listingPage.$eval(
                        "#description",
                        (el) => el.textContent.trim()
                    );

                    results.push({
                        title,
                        price: `${price} €`,
                        description,
                        link,
                    });

                    await listingPage.close();

                    // Save results every 5 pages
                    if ((i + 1) % 5 === 0 || i + 1 === links.length) {
                        fs.writeFileSync(
                            "listings.json",
                            JSON.stringify(results, null, 2),
                            "utf-8"
                        );
                    }
                } catch (error) {
                    console.error(`Failed to scrape ${link}:`, error);
                }
            }
        } catch (error) {
            console.error(`Failed to scrape id ${id}:`, error);
        }
    }

    await browser.close();
    console.log("Scraping complete. Results saved to listings.json");
})();
