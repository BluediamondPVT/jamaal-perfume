import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: All categories with product count
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: "asc" },
        });

        // Transform response for cleaner API
        const formattedCategories = categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            productCount: category._count.products,
            createdAt: category.createdAt,
        }));

        return NextResponse.json({
            categories: formattedCategories,
            total: categories.length,
        });
    } catch (error) {
        console.error("Categories fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
