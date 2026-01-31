import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Search products with filters
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const q = searchParams.get("q") || "";
        const category = searchParams.get("category");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        // Text search on name and description
        if (q) {
            where.OR = [
                { name: { contains: q } },
                { description: { contains: q } },
            ];
        }

        // Category filter
        if (category) {
            where.category = { slug: category };
        }

        // Price range filters
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        // Build orderBy
        const orderBy: any = {};
        if (sortBy === "price") {
            orderBy.price = sortOrder;
        } else if (sortBy === "name") {
            orderBy.name = sortOrder;
        } else {
            orderBy.createdAt = sortOrder;
        }

        // Execute queries
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: { select: { name: true, slug: true } },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            query: q,
        });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Failed to search products" },
            { status: 500 }
        );
    }
}
