"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import { items } from "../../listings";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import Fuse from "fuse.js";

// Pagination items to display per page
const ITEMS_PER_PAGE = 20;

// Fuse.js options: adjust threshold & keys as needed
const fuseOptions = {
    threshold: 0.3, // sensitivity of the fuzzy search; lower = stricter
    keys: ["title", "description", ""],
};

export default function LaptopListingPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minRating, setMinRating] = useState("");
    const [maxRating, setMaxRating] = useState("");

    // -- 1. Fuzzy search with Fuse.js --
    // We create a Fuse instance in a memo so it's not recreated on every render
    const fuse = useMemo(() => {
        return new Fuse(items, fuseOptions);
    }, []);

    // Filter items using search, price, and rating filters
    const filteredLaptops = useMemo(() => {
        // Step 1: Fuzzy search if 'search' is not empty
        let results = search
            ? fuse.search(search).map((r) => r.item) // returns array of items
            : items;

        // Step 2: Price filter
        // Convert minPrice and maxPrice to numbers if they exist, otherwise keep them undefined
        const minP = minPrice ? parseFloat(minPrice) : undefined;
        const maxP = maxPrice ? parseFloat(maxPrice) : undefined;
        console.log(minP, maxP);
        if (minP !== undefined) {
            results = results.filter(
                (laptop) => parseFloat(laptop.price) >= minP
            );
        }
        if (maxP !== undefined) {
            results = results.filter(
                (laptop) => parseFloat(laptop.price) <= maxP
            );
        }

        // Step 3: Rating filter
        const minR = minRating ? parseFloat(minRating) : undefined;
        const maxR = maxRating ? parseFloat(maxRating) : undefined;

        console.log("minR", minR, "maxR", maxR);
        if (minR !== undefined) {
            results = results.filter((laptop) => laptop.rating >= minR);
        }
        if (maxR !== undefined) {
            results = results.filter((laptop) => laptop.rating <= maxR);
        }

        return results;
    }, [search, fuse, minPrice, maxPrice, minRating, maxRating]);

    // -- 2. Pagination: slice the filtered array --
    const totalPages = Math.ceil(filteredLaptops.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLaptops = filteredLaptops.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // -- 3. Handle page changes and scroll to top --
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // -- 4. Pagination Items --
    const paginationItems = () => {
        const itemsArr = [];
        const maxVisiblePages = 5;
        const ellipsisThreshold = 2;

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - ellipsisThreshold &&
                    i <= currentPage + ellipsisThreshold) ||
                (currentPage <= maxVisiblePages && i <= maxVisiblePages) ||
                (currentPage > totalPages - maxVisiblePages &&
                    i > totalPages - maxVisiblePages)
            ) {
                itemsArr.push(
                    <PaginationItem className="cursor-pointer" key={i}>
                        <PaginationLink
                            onClick={() => handlePageChange(i)}
                            isActive={currentPage === i}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            } else if (
                (i === currentPage - ellipsisThreshold - 1 &&
                    currentPage > maxVisiblePages) ||
                (i === currentPage + ellipsisThreshold + 1 &&
                    currentPage <= totalPages - maxVisiblePages)
            ) {
                itemsArr.push(<PaginationEllipsis key={i} />);
            }
        }
        return itemsArr;
    };

    // -- 5. UI Rendering --
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b sticky top-0 bg-white z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold">
                                Skelbiu laptopai
                            </h1>
                        </div>
                        {/* Main Search */}
                        <div className="flex items-center space-x-4">
                            <Input
                                className="w-[300px]"
                                placeholder="Fuzzy Search by Title/Description..."
                                type="search"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1); // reset to first page
                                }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters Section */}
            <section className="container mx-auto px-4 py-4 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Price Filters */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="minPrice">Min Price</label>
                        <Input
                            id="minPrice"
                            type="number"
                            value={minPrice}
                            placeholder="Minimum Price"
                            onChange={(e) => {
                                setMinPrice(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="maxPrice">Max Price</label>
                        <Input
                            id="maxPrice"
                            type="number"
                            value={maxPrice}
                            placeholder="Maximum Price"
                            onChange={(e) => {
                                setMaxPrice(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    {/* Rating Filters */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="minRating">Min Rating</label>
                        <Input
                            id="minRating"
                            type="number"
                            value={minRating}
                            placeholder="Minimum Rating (0-100)"
                            onChange={(e) => {
                                setMinRating(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="maxRating">Max Rating</label>
                        <Input
                            id="maxRating"
                            type="number"
                            value={maxRating}
                            placeholder="Maximum Rating (0-100)"
                            onChange={(e) => {
                                setMaxRating(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {paginatedLaptops.map((laptop) => (
                        <Card key={laptop.title} className="flex flex-col">
                            <CardContent className="flex-1 p-6">
                                <div className="flex items-start justify-between">
                                    <h2 className="text-xl font-semibold leading-tight mb-2">
                                        {laptop.title}
                                    </h2>
                                    <div className="flex items-center space-x-1 text-muted-foreground">
                                        <StarIcon className="h-4 w-4" />
                                        <span>{laptop.rating}/100</span>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-primary mb-3">
                                    {laptop.price}
                                </div>
                                <h4 className="text-xl font-bold">AI Laptop justification:</h4>
                                <p className="text-muted-foreground mt-4">
                                    {laptop.justification}
                                </p>
                            </CardContent>
                            <CardFooter className="p-6 pt-0">
                                <Button
                                    className="w-full"
                                    onClick={() =>
                                        window.open(
                                            laptop.link,
                                            "_blank",
                                            "noopener,noreferrer"
                                        )
                                    }
                                >
                                    View on Skelbiu
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem className="cursor-pointer">
                                <PaginationPrevious
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    className={
                                        currentPage === 1
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>
                            {paginationItems()}
                            <PaginationItem className="cursor-pointer">
                                <PaginationNext
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    className={
                                        currentPage === totalPages
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}

                {/* No Results Message */}
                {paginatedLaptops.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-muted-foreground">
                            No laptops found matching your search or filters.
                        </p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t">
                <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
                    <p>&copy; 2024 Laptop Marketplace. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
