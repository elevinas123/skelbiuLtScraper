import puppeteer from "puppeteer-extra";
import fs from "fs";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const results = [];

    // Scrape multiple pages of bicycle listings
    for (let pageNum = 1; pageNum <= 10; pageNum++) {
        const url = `https://www.skelbiu.lt/skelbimai/${pageNum}?autocompleted=1&type=0&distance=0&mainCity=1&search=1&category_id=519&user_type=0&ad_since_min=0&ad_since_max=0&visited_page=1&orderBy=3&detailsSearch=0&place_category_id=33&facets=1&changeView=1`;
        console.log(`Opening page ${pageNum}: ${url}...`);

        try {
            await page.goto(url, { waitUntil: "domcontentloaded" });

            // Wait for listings to load
            console.log("Waiting for listings to load...");
            await page.waitForSelector(".standard-list-item", {
                timeout: 10000,
            });

            // Extract all listing links
            console.log("Extracting listing links...");
            const links = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll(".standard-list-item a")
                )
                    .map((a) => a.href)
                    .filter((href) => href.includes("/skelbimai/")); // Ensure valid links
            });

            console.log(
                `Found ${links.length} listings on page ${pageNum}. Starting to scrape details...`
            );

            if (links.length === 0) {
                console.log(
                    `No more listings found on page ${pageNum}. Stopping.`
                );
                break;
            }

            for (let i = 0; i < links.length; i++) {
                let link = links[i];

                // Convert to mobile version for easier scraping
                if (!link.startsWith("https://m.skelbiu.lt")) {
                    link = link.replace(
                        "https://www.skelbiu.lt",
                        "https://m.skelbiu.lt"
                    );
                }

                try {
                    console.log(
                        `Visiting listing ${i + 1}/${
                            links.length
                        } on page ${pageNum}: ${link}`
                    );
                    const listingPage = await browser.newPage();
                    await listingPage.goto(link, {
                        waitUntil: "domcontentloaded",
                    });

                    // Wait for content to load
                    await listingPage.waitForSelector("h1.item-title", {
                        timeout: 5000,
                    });
                    await listingPage.waitForSelector("#description", {
                        timeout: 5000,
                    });

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

                    // Save results every 10 listings
                    if (results.length % 10 === 0) {
                        fs.writeFileSync(
                            "bicycle_listings.json",
                            JSON.stringify(results, null, 2),
                            "utf-8"
                        );
                        console.log(
                            `Saved ${results.length} bicycle listings so far...`
                        );
                    }
                } catch (error) {
                    console.error(`Failed to scrape ${link}:`, error.message);
                }
            }
        } catch (error) {
            console.error(`Failed to scrape page ${pageNum}:`, error.message);
            break;
        }
    }

    await browser.close();

    // Final save
    fs.writeFileSync(
        "bicycle_listings.json",
        JSON.stringify(results, null, 2),
        "utf-8"
    );

    console.log(
        `Scraping complete! Found ${results.length} bicycle listings. Results saved to bicycle_listings.json`
    );
})();
