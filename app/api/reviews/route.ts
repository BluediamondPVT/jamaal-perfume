import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// POST: Add a review
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { productId, rating, comment } = body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        // Find user by clerkId
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check for existing review
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: user.id,
                productId,
            },
        });

        if (existingReview) {
            // Update existing review
            const updatedReview = await prisma.review.update({
                where: { id: existingReview.id },
                data: { rating, comment },
                include: {
                    user: { select: { name: true, email: true } },
                },
            });
            return NextResponse.json(updatedReview);
        }

        // Create new review
        const review = await prisma.review.create({
            data: {
                rating,
                comment: comment || null,
                userId: user.id,
                productId,
            },
            include: {
                user: { select: { name: true, email: true } },
            },
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error("Review creation error:", error);
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        );
    }
}

// GET: Fetch product reviews
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({
            reviews,
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length,
        });
    } catch (error) {
        console.error("Reviews fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}
