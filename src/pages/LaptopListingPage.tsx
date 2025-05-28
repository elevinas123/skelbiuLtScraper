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
import {
    StarIcon,
    SearchIcon,
    FilterIcon,
    SortAscIcon,
    SortDescIcon,
    ExternalLinkIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { items } from "../../listings";

const ITEMS_PER_PAGE = 20;

// Enhanced Fuse configuration for better search
const fuseOptions = {
    threshold: 0.4,
    keys: [
        { name: "title", weight: 0.7 },
        { name: "description", weight: 0.3 },
        { name: "justification", weight: 0.2 },
    ],
    includeScore: true,
    includeMatches: true,
};

export default function LaptopListingPage() {
    // States
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minRating, setMinRating] = useState("");
    const [maxRating, setMaxRating] = useState("");
    const [sortKey, setSortKey] = useState("rating");
    const [sortOrder, setSortOrder] = useState("desc");
    const [showFilters, setShowFilters] = useState(false);

    // Create Fuse instance
    const fuse = useMemo(() => new Fuse(items, fuseOptions), []);

    // Enhanced filtering and sorting
    const filteredLaptops = useMemo(() => {
        let results = search.trim()
            ? fuse.search(search).map((res) => res.item)
            : items;

        // Price filtering
        const minP = minPrice ? parseFloat(minPrice) : undefined;
        const maxP = maxPrice ? parseFloat(maxPrice) : undefined;

        if (minP !== undefined) {
            results = results.filter((laptop) => {
                const price = parseFloat(laptop.price.replace(/[^\d.]/g, ""));
                return price >= minP;
            });
        }
        if (maxP !== undefined) {
            results = results.filter((laptop) => {
                const price = parseFloat(laptop.price.replace(/[^\d.]/g, ""));
                return price <= maxP;
            });
        }

        // Rating filtering
        const minR = minRating ? parseFloat(minRating) : undefined;
        const maxR = maxRating ? parseFloat(maxRating) : undefined;
        if (minR !== undefined) {
            results = results.filter((laptop) => laptop.rating >= minR);
        }
        if (maxR !== undefined) {
            results = results.filter((laptop) => laptop.rating <= maxR);
        }

        // Sorting
        results = results.sort((a, b) => {
            if (sortKey === "price") {
                const priceA = parseFloat(a.price.replace(/[^\d.]/g, ""));
                const priceB = parseFloat(b.price.replace(/[^\d.]/g, ""));
                return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
            } else if (sortKey === "rating") {
                return sortOrder === "asc"
                    ? a.rating - b.rating
                    : b.rating - a.rating;
            } else if (sortKey === "title") {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (titleA < titleB) return sortOrder === "asc" ? -1 : 1;
                if (titleA > titleB) return sortOrder === "asc" ? 1 : -1;
                return 0;
            }
            return 0;
        });

        return results;
    }, [
        search,
        minPrice,
        maxPrice,
        minRating,
        maxRating,
        sortKey,
        sortOrder,
        fuse,
    ]);

    // Pagination
    const totalPages = Math.ceil(filteredLaptops.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLaptops = filteredLaptops.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const clearFilters = () => {
        setSearch("");
        setMinPrice("");
        setMaxPrice("");
        setMinRating("");
        setMaxRating("");
        setCurrentPage(1);
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 80) return "text-green-600 bg-green-100";
        if (rating >= 60) return "text-blue-600 bg-blue-100";
        if (rating >= 40) return "text-yellow-600 bg-yellow-100";
        if (rating >= 20) return "text-orange-600 bg-orange-100";
        return "text-red-600 bg-red-100";
    };

    const getPriceValue = (priceStr: string) => {
        return parseFloat(priceStr.replace(/[^\d.]/g, ""));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    S
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Skelbiu Laptopai
                                </h1>
                                <p className="text-sm text-slate-600">
                                    Find your perfect laptop deal
                                </p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <Input
                                className="pl-10 pr-4 py-3 w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                                type="search"
                                placeholder="Search laptops..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FilterIcon className="h-4 w-4" />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Filters Section */}
            <section
                className={`bg-white border-b border-slate-200 transition-all duration-300 ${
                    showFilters ? "block" : "hidden"
                } lg:block`}
            >
                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                        {/* Price Filters */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Min Price (€)
                            </label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => {
                                    setMinPrice(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Max Price (€)
                            </label>
                            <Input
                                type="number"
                                placeholder="1000"
                                value={maxPrice}
                                onChange={(e) => {
                                    setMaxPrice(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        {/* Rating Filters */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Min Rating
                            </label>
                            <Input
                                type="number"
                                placeholder="0"
                                min="0"
                                max="100"
                                value={minRating}
                                onChange={(e) => {
                                    setMinRating(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Max Rating
                            </label>
                            <Input
                                type="number"
                                placeholder="100"
                                min="0"
                                max="100"
                                value={maxRating}
                                onChange={(e) => {
                                    setMaxRating(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        {/* Sort Options */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Sort By
                            </label>
                            <select
                                value={sortKey}
                                onChange={(e) => {
                                    setSortKey(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white"
                            >
                                <option value="rating">Rating</option>
                                <option value="price">Price</option>
                                <option value="title">Title</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Order
                            </label>
                            <button
                                onClick={() => {
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    );
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md hover:bg-slate-50 focus:border-blue-500 focus:ring-blue-500 bg-white flex items-center justify-center space-x-2"
                            >
                                {sortOrder === "asc" ? (
                                    <>
                                        <SortAscIcon className="h-4 w-4" />
                                        <span>Ascending</span>
                                    </>
                                ) : (
                                    <>
                                        <SortDescIcon className="h-4 w-4" />
                                        <span>Descending</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="text-sm text-slate-600">
                            Showing {paginatedLaptops.length} of{" "}
                            {filteredLaptops.length} laptops
                        </div>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Laptop Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
                    {paginatedLaptops.map((laptop, index) => (
                        <Card
                            key={`${laptop.title}-${index}`}
                            className="laptop-card bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold text-slate-900 leading-tight mb-2 line-clamp-2">
                                            {laptop.title}
                                        </h2>
                                    </div>
                                    <div
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(
                                            laptop.rating
                                        )}`}
                                    >
                                        {laptop.rating}/100
                                    </div>
                                </div>

                                <div className="text-2xl font-bold text-blue-600 mb-4">
                                    {laptop.price}
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                        AI Analysis:
                                    </h4>
                                    <p className="text-sm text-slate-600 line-clamp-3">
                                        {laptop.justification}
                                    </p>
                                </div>
                            </CardContent>

                            <CardFooter className="p-6 pt-0">
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 flex items-center justify-center space-x-2 transition-colors"
                                    onClick={() =>
                                        window.open(
                                            laptop.link,
                                            "_blank",
                                            "noopener,noreferrer"
                                        )
                                    }
                                >
                                    <span>View on Skelbiu</span>
                                    <ExternalLinkIcon className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center">
                        <Pagination>
                            <PaginationContent className="flex items-center space-x-2">
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            handlePageChange(
                                                Math.max(1, currentPage - 1)
                                            )
                                        }
                                        className={`px-3 py-2 rounded-lg border ${
                                            currentPage === 1
                                                ? "pointer-events-none opacity-50 bg-slate-100 text-slate-400"
                                                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-300"
                                        }`}
                                    />
                                </PaginationItem>

                                {Array.from(
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (
                                            currentPage >=
                                            totalPages - 2
                                        ) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pageNum
                                                        )
                                                    }
                                                    isActive={
                                                        currentPage === pageNum
                                                    }
                                                    className={`px-3 py-2 rounded-lg border cursor-pointer ${
                                                        currentPage === pageNum
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : "bg-white text-slate-700 hover:bg-slate-50 border-slate-300"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            handlePageChange(
                                                Math.min(
                                                    totalPages,
                                                    currentPage + 1
                                                )
                                            )
                                        }
                                        className={`px-3 py-2 rounded-lg border ${
                                            currentPage === totalPages
                                                ? "pointer-events-none opacity-50 bg-slate-100 text-slate-400"
                                                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-300"
                                        }`}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                {/* No Results */}
                {paginatedLaptops.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SearchIcon className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            No laptops found
                        </h3>
                        <p className="text-slate-600 mb-4">
                            Try adjusting your search terms or filters to find
                            more results.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-16">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-slate-600">
                        <p className="mb-2">
                            &copy; 2024 Skelbiu Laptopai. All rights reserved.
                        </p>
                        <p className="text-sm">
                            Find the best laptop deals with AI-powered
                            recommendations.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
