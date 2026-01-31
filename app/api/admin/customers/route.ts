import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all customers with their order count and total spent
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
        { error: "Only admins can access customers" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    // Get customers with order details
    const customers = await prisma.user.findMany({
      where: {
        ...searchFilter,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Calculate total count
    const totalCustomers = await prisma.user.count({
      where: searchFilter,
    });

    // Format response with order stats
    const customersWithStats = customers.map((customer) => ({
      ...customer,
      orderCount: customer.orders.length,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
      lastOrderDate: customer.orders.length > 0 ? customer.orders[0].createdAt : null,
    }));

    return NextResponse.json({
      customers: customersWithStats,
      pagination: {
        total: totalCustomers,
        page,
        limit,
        pages: Math.ceil(totalCustomers / limit),
      },
    });
  } catch (error) {
    console.error("Customer fetch error:", error);
    return NextResponse.json(
      { error: `Failed to fetch customers: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
