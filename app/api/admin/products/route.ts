import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check admin role (Clerk metadata ya DB)
        // TEMP: sabko admin allow karte hain
        // const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        // if (!user || user.role !== "ADMIN") {
        //     return NextResponse.json({ error: "Admin required" }, { status: 403 });
        // }

        // 🔥 MULTIPART FORM DATA (Images + Text)
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const slug = formData.get('slug') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const discount = parseFloat(formData.get('discount') as string) || 0;
        const stock = parseInt(formData.get('stock') as string);
        const categoryId = formData.get('categoryId') as string || null;
        const isFeatured = formData.get('isFeatured') === 'true';
        const isBestSeller = formData.get('isBestSeller') === 'true';

        // 🔥 IMAGE UPLOAD HANDLING
        const imageFiles = formData.getAll('images') as File[];
        const imageUrls: string[] = [];

        for (const file of imageFiles) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${file.name}`;
            const filepath = path.join(process.cwd(), 'public/uploads', filename);
            
            await writeFile(filepath, buffer);
            imageUrls.push(`/uploads/${filename}`);
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                price,
                discount,
                stock,
                categoryId,
                images: JSON.stringify(imageUrls), // Store as JSON array
                isFeatured,
                isBestSeller,
            },
        });

        console.log('✅ NEW PRODUCT + IMAGES:', name);
        return NextResponse.json({ product, message: "Created successfully" });
    } catch (error) {
        console.error("Product creation error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

// 🔥 NEW API: GET CATEGORIES for Dropdown
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Categories fetch for dropdown
        if (req.nextUrl.searchParams.has('categories')) {
            const categories = await prisma.category.findMany({
                select: { id: true, name: true }
            });
            return NextResponse.json(categories);
        }

        // Products fetch (existing code)
        const products = await prisma.product.findMany({
            include: {
                category: true,
                orderItems: {
                    select: { quantity: true, price: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const productsWithAnalytics = products.map((product) => {
            const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalRevenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
        console.error("API error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
