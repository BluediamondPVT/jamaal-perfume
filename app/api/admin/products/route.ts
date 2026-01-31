import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, slug, description, price, stock, categoryId, images, isFeatured, variants } = body;

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                price,
                stock,
                categoryId,
                images,
                isFeatured: isFeatured || false,
                variants: variants || null,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Product creation error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Get products with category info
        const products = await prisma.product.findMany({
            include: {
                category: true,
                orderItems: {
                    select: {
                        quantity: true,
                        price: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate analytics for each product
        const productsWithAnalytics = products.map((product) => {
            const totalSold = product.orderItems.reduce(
                (sum, item) => sum + item.quantity, 0
            );
            const totalRevenue = product.orderItems.reduce(
                (sum, item) => sum + (item.price * item.quantity), 0
            );

            // Remove orderItems from response, keep only analytics
            const { orderItems, ...productData } = product;

            return {
                ...productData,
                analytics: {
                    totalSold,
                    totalRevenue: Math.round(totalRevenue * 100) / 100,
                },
            };
        });

        return NextResponse.json(productsWithAnalytics);
    } catch (error) {
        console.error("Products fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
