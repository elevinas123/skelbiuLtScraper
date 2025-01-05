"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { items } from "../../listings"; // your data

// If you want the user to pick how many items per page, you could store this in state as well.
const ITEMS_PER_PAGE = 20;

// Configure Fuse (no empty string in keys)
const fuseOptions = {
    threshold: 0.3,
    keys: ["title", "description"],
};

export default function LaptopListingPage() {
    // States
    const [currentPage, setCurrentPage] = useState(1);

    // Search & Filters
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minRating, setMinRating] = useState("");
    const [maxRating, setMaxRating] = useState("");

    // Sorting
    const [sortKey, setSortKey] = useState("price"); // "price" | "rating" | "title"
    const [sortOrder, setSortOrder] = useState("asc"); // "asc" | "desc"

    // Create Fuse instance once
    const fuse = () => {
        return new Fuse(items, fuseOptions);
    };

    // Filter + Sort
    const filteredLaptops = () => {
        // 1) Fuzzy search
        let results = search
            ? fuse().search(search).map((res) => res.item)
            : items;

      
      
        // 2) Price filter
        const minP = minPrice ? parseFloat(minPrice) : undefined;
        const maxP = maxPrice ? parseFloat(maxPrice) : undefined;
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

        // 3) Rating filter
        const minR = minRating ? parseFloat(minRating) : undefined;
        const maxR = maxRating ? parseFloat(maxRating) : undefined;
        if (minR !== undefined) {
            results = results.filter((laptop) => laptop.rating >= minR);
        }
        if (maxR !== undefined) {
            results = results.filter((laptop) => laptop.rating <= maxR);
        }

        // 4) Sort
        results = results.sort((a, b) => {
            if (sortKey === "price") {
                const priceA = parseFloat(a.price);
                const priceB = parseFloat(b.price);
                return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
            } else if (sortKey === "rating") {
                return sortOrder === "asc"
                    ? a.rating - b.rating
                    : b.rating - a.rating;
            } else if (sortKey === "title") {
                // Compare strings
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (titleA < titleB) return sortOrder === "asc" ? -1 : 1;
                if (titleA > titleB) return sortOrder === "asc" ? 1 : -1;
                return 0;
            }
            return 0;
        });

        return results;
    };
    // Pagination
    const totalPages = Math.ceil(filteredLaptops.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLaptops = filteredLaptops().slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // Handle page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Build pagination items
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
                        {/* Search */}
                        <div className="flex items-center space-x-4">
                            <Input
                                className="w-[300px]"
                                type="search"
                                placeholder="Fuzzy Search by Title/Description..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters & Sorting */}
            <section className="container mx-auto px-4 py-4 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Min Price */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="minPrice">Min Price</label>
                        <Input
                            id="minPrice"
                            type="number"
                            placeholder="e.g. 300"
                            value={minPrice}
                            onChange={(e) => {
                                setMinPrice(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Max Price */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="maxPrice">Max Price</label>
                        <Input
                            id="maxPrice"
                            type="number"
                            placeholder="e.g. 1500"
                            value={maxPrice}
                            onChange={(e) => {
                                setMaxPrice(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Min Rating */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="minRating">Min Rating</label>
                        <Input
                            id="minRating"
                            type="number"
                            placeholder="0-100"
                            value={minRating}
                            onChange={(e) => {
                                setMinRating(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Max Rating */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="maxRating">Max Rating</label>
                        <Input
                            id="maxRating"
                            type="number"
                            placeholder="0-100"
                            value={maxRating}
                            onChange={(e) => {
                                setMaxRating(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Sorting */}
                <div className="flex space-x-4 mt-6">
                    <div className="flex flex-col">
                        <label htmlFor="sortKey">Sort By</label>
                        <select
                            id="sortKey"
                            className="border p-2 rounded"
                            value={sortKey}
                            onChange={(e) => {
                                setSortKey(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="price">Price</option>
                            <option value="rating">Rating</option>
                            <option value="title">Title</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="sortOrder">Order</label>
                        <select
                            id="sortOrder"
                            className="border p-2 rounded"
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Main */}
            <main className="container mx-auto px-4 py-8">
                {/* Laptops */}
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
                                <h4 className="text-xl font-bold">
                                    AI Laptop justification:
                                </h4>
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

                {/* No Results */}
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
