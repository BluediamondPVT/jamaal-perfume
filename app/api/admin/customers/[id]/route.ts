import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET single customer details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
        { error: "Only admins can access customer details" },
        { status: 403 }
      );
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params);
    const customerId = typeof resolvedParams.id === 'string' ? resolvedParams.id : (await resolvedParams.id);

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Customer detail fetch error:", error);
    return NextResponse.json(
      { error: `Failed to fetch customer: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
        { error: "Only admins can delete customers" },
        { status: 403 }
      );
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params);
    const customerId = typeof resolvedParams.id === 'string' ? resolvedParams.id : (await resolvedParams.id);

    // Delete customer (this will cascade delete their orders due to Prisma relations)
    await prisma.user.delete({
      where: { id: customerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Customer delete error:", error);
    return NextResponse.json(
      { error: `Failed to delete customer: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
