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
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
