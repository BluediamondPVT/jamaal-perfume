import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET wishlist for user
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get wishlist from user metadata or create a new wishlist
    let wishlist = user.wishlist || "[]";
    const wishlistIds = JSON.parse(wishlist);

    // Fetch full product details for wishlist items
    const products = await prisma.product.findMany({
      where: {
        id: { in: wishlistIds },
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      wishlist: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    return NextResponse.json(
      { error: `Failed to fetch wishlist: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// ADD/REMOVE from wishlist
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, action } = await req.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let wishlistIds = user.wishlist ? JSON.parse(user.wishlist) : [];

    if (action === "add") {
      if (!wishlistIds.includes(productId)) {
        wishlistIds.push(productId);
      }
    } else if (action === "remove") {
      wishlistIds = wishlistIds.filter((id: string) => id !== productId);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { wishlist: JSON.stringify(wishlistIds) },
    });

    return NextResponse.json({ success: true, wishlistIds });
  } catch (error) {
    console.error("Wishlist update error:", error);
    return NextResponse.json(
      { error: `Failed to update wishlist: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
