import { PrismaClient } from "@prisma/client";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { notFound } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

interface SearchParams {
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
}

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<SearchParams>;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

function getSortOrder(sort: SortOption) {
    switch (sort) {
        case 'price-asc':
            return { price: 'asc' as const };
        case 'price-desc':
            return { price: 'desc' as const };
        case 'newest':
            return { createdAt: 'desc' as const };
        case 'featured':
        default:
            return { isFeatured: 'desc' as const };
    }
}

// 🔥 FETCH ALL CATEGORIES FOR SIDEBAR
async function getAllCategories() {
    return await prisma.category.findMany({
        orderBy: { name: 'asc' }
    });
}

async function getProducts(slug: string, searchParams: SearchParams) {
    const sort = (searchParams.sort as SortOption) || 'featured';
    const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
    const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;

    const priceFilter: { gte?: number; lte?: number } = {};
    if (minPrice !== undefined) priceFilter.gte = minPrice;
    if (maxPrice !== undefined) priceFilter.lte = maxPrice;

    const priceWhere = Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {};

    if (slug === 'all') {
        return {
            products: await prisma.product.findMany({
                where: { stock: { gt: 0 }, ...priceWhere },
                include: { category: true },
                orderBy: getSortOrder(sort)
            }),
            title: "All Products",
            description: "Explore our complete collection of luxury fragrances."
        };
    }

    const category = await prisma.category.findUnique({
        where: { slug },
    });

    if (!category) return null;

    const products = await prisma.product.findMany({
        where: {
            categoryId: category.id,
            stock: { gt: 0 },
            ...priceWhere
        },
        include: { category: true },
        orderBy: getSortOrder(sort)
    });

    return {
        products,
        title: category.name,
        description: category.description || ""
    };
}

export default async function CollectionPage(props: PageProps) {
    const { slug } = await props.params;
    const searchParams = await props.searchParams;
    const data = await getProducts(slug, searchParams);
    const categories = await getAllCategories();

    if (!data) return notFound();

    const { products, title, description } = data;

    return (
        <div className="container mx-auto px-4 py-16">
            {/* HEADER */}
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-display font-bold">{title}</h1>
                {description && (
                    <p className="text-muted-foreground font-body text-lg">{description}</p>
                )}
            </div>

            {/* MAIN LAYOUT WITH SIDEBAR */}
            <div className="flex gap-8 lg:gap-12">
                {/* 🔥 SIDEBAR - Categories */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-4 space-y-6">
                        <div>
                            <h3 className="font-display font-bold text-lg mb-4">Categories</h3>
                            <nav className="space-y-2">
                                {/* All Products Link */}
                                <Link
                                    href="/collections/all"
                                    className={`block px-4 py-2 rounded-lg transition-colors ${
                                        slug === 'all'
                                            ? 'bg-primary text-primary-foreground font-medium'
                                            : 'text-foreground hover:bg-secondary/50'
                                    }`}
                                >
                                    All Products
                                </Link>

                                {/* Category Links */}
                                {categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/collections/${category.slug}`}
                                        className={`block px-4 py-2 rounded-lg transition-colors ${
                                            slug === category.slug
                                                ? 'bg-primary text-primary-foreground font-medium'
                                                : 'text-foreground hover:bg-secondary/50'
                                        }`}
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <div className="flex-1 min-w-0">
                    <ProductFilters maxPrice={5000} />

                    {products.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground mb-6">{products.length} products</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={{
                                            ...product,
                                            price: Number(product.price)
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
