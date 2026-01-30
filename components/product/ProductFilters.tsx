"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useCallback } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SlidersHorizontal, X } from "lucide-react";

interface ProductFiltersProps {
    maxPrice?: number;
}

export function ProductFilters({ maxPrice = 5000 }: ProductFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [priceRange, setPriceRange] = useState<number[]>([
        Number(searchParams.get("minPrice")) || 0,
        Number(searchParams.get("maxPrice")) || maxPrice
    ]);

    const currentSort = searchParams.get("sort") || "featured";

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([key, value]) => {
                if (value === null) {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            });

            return newParams.toString();
        },
        [searchParams]
    );

    const handleSortChange = (value: string) => {
        router.push(`${pathname}?${createQueryString({ sort: value })}`);
    };

    const handlePriceApply = () => {
        router.push(`${pathname}?${createQueryString({
            minPrice: priceRange[0].toString(),
            maxPrice: priceRange[1].toString()
        })}`);
    };

    const handleClearFilters = () => {
        setPriceRange([0, maxPrice]);
        router.push(pathname);
    };

    const hasActiveFilters = searchParams.has("minPrice") || searchParams.has("maxPrice");

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8 pb-6 border-b">
            {/* Mobile Filter Button */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="sm:hidden gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && <span className="h-2 w-2 bg-primary rounded-full" />}
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                    <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 space-y-6">
                        <div>
                            <label className="text-sm font-medium mb-4 block">Price Range</label>
                            <Slider
                                value={priceRange}
                                onValueChange={setPriceRange}
                                max={maxPrice}
                                step={100}
                                className="mb-4"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>₹{priceRange[0]}</span>
                                <span>₹{priceRange[1]}</span>
                            </div>
                            <Button onClick={handlePriceApply} className="w-full mt-4">
                                Apply
                            </Button>
                        </div>
                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={handleClearFilters} className="w-full gap-2">
                                <X className="h-4 w-4" /> Clear Filters
                            </Button>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Filters */}
            <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <div className="w-48">
                        <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={maxPrice}
                            step={100}
                        />
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        ₹{priceRange[0]} - ₹{priceRange[1]}
                    </span>
                    <Button size="sm" variant="secondary" onClick={handlePriceApply}>
                        Apply
                    </Button>
                </div>
                {hasActiveFilters && (
                    <Button size="sm" variant="ghost" onClick={handleClearFilters} className="gap-1">
                        <X className="h-3 w-3" /> Clear
                    </Button>
                )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={currentSort} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
