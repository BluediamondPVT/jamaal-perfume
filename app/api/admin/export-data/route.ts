import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can export data" },
        { status: 403 }
      );
    }

    // Fetch all data
    const [products, categories, orders, orderItems, customers, reviews] = await Promise.all([
      prisma.product.findMany(),
      prisma.category.findMany(),
      prisma.order.findMany({
        include: {
          items: true,
          user: true,
        },
      }),
      prisma.orderItem.findMany(),
      prisma.user.findMany({
        where: { role: "USER" },
        include: { orders: true },
      }),
      prisma.review.findMany(),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      statistics: {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalOrders: orders.length,
        totalOrderItems: orderItems.length,
        totalCustomers: customers.length,
        totalReviews: reviews.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      },
      data: {
        products,
        categories,
        orders,
        customers,
        reviews,
      },
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="jammal-perfume-data-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: `Failed to export data: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
