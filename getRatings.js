import dotenv from "dotenv";
import fs from "fs";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

dotenv.config();

// 1. Define the Zod schema
const ComputerRating = z.object({
    title: z.string(),
    rating: z.number(),
    justification: z.string(),
});
const ComputerRatings = z.array(ComputerRating);
const ComputersIDK = z.object({
    computers: ComputerRating,
});

const apiKey ="API_KEY"
/**
 * Process a batch of computers by prompting the model to return an array of
 * { title, rating, justification } objects. We parse the response using
 * zodResponseFormat to ensure it matches the ComputerRatings array schema.
 */
async function processBatch(computers, batchIndex) {
    console.log(
        `Processing batch ${batchIndex + 1} with ${
            computers.length
        } computers...`
    );

    // 2. Initialize OpenAI client (ensure OPENAI_API_KEY is in your .env)
    const openai = new OpenAI({
        apiKey: apiKey,
    });

    // 3. Prepare messages for the prompt
    const messages = [
        {
            role: "system",
            content: `
        You are an expert evaluator. Rate the following computers based on their
        value for money, specifications, and condition. Provide a rating (0-100)
        and a justification. Respond strictly in JSON array format, where each
        item has "title", "rating", and "justification". Be very harsh and
        critical. Focus on the processor's value for the price. Consider RAM
        and the model year as well. Put the responses into an array called computers.
      `,
        },
        {
            role: "user",
            content: computers
                .map(
                    (comp, i) => `Computer ${i + 1}:
Title: ${comp.title}
Price: ${comp.price}
Description: ${comp.description}`
                )
                .join("\n Next computer \n"),
        },
    ];
    console.log("Messages:", messages);

    try {
        // 4. Make the structured outputs request using beta.chat.completions.parse
        const completion = await openai.beta.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages,
            // Instead of specifying the JSON schema by hand,
            // we use zodResponseFormat with our Zod schema and a name
            response_format: { type: "json_object" },
        });

        // 5. The parsed data is stored in completion.choices[0].message.parsed
        const responseMessage = completion.choices[0].message;
        console.log("Raw Response:", responseMessage);
        // If the model refused or returned something invalid, handle it
        if (responseMessage.refusal) {
            // The model refused to comply for policy reasons
            console.error("Model refusal:", responseMessage.refusal);
            return [];
        }
        const parsed = JSON.parse(responseMessage.content);

        // 6. The response is guaranteed to match our Zod schema if `parsed` is
        // defined
        console.log("Validated Response:", parsed);
        return parsed.computers;
    } catch (error) {
        console.error(`Error processing batch ${batchIndex + 1}:`, error);
        return [];
    }
}

(async () => {
    try {
        // Read listings from file
        const gotComputers = fs.readFileSync(
            "listingsMoreExpensive.json",
            "utf-8"
        );
        const parsedComputers = JSON.parse(gotComputers);

        // Split data into batches of 20
        const batchSize = 3;
        const batches = [];
        for (let i = 0; i < parsedComputers.length; i += batchSize) {
            batches.push(parsedComputers.slice(i, i + batchSize));
        }

        console.log(`Total batches to process: ${batches.length}`);

        // Process each batch and update the file
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            const ratings = await processBatch(batch, batchIndex);

            // Update the original data with the new ratings
            for (let i = 0; i < batch.length; i++) {
                const indexInOriginal = batchIndex * batchSize + i;
                parsedComputers[indexInOriginal] = {
                    ...parsedComputers[indexInOriginal],
                    rating: ratings[i]?.rating ?? null,
                    justification:
                        ratings[i]?.justification ??
                        "No justification provided",
                };
            }

            // Save updated listings back to file
            fs.writeFileSync(
                "listingsMoreExpensive.json",
                JSON.stringify(parsedComputers, null, 2),
                "utf-8"
            );
            console.log(`Updated listings.json after batch ${batchIndex + 1}`);
        }

        console.log("Processing complete. All listings have been rated.");
    } catch (error) {
        console.error("Error:", error);
    }
})();
