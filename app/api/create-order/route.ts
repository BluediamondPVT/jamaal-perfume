import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        const body = await req.json();
        const { amount, items, address } = body;

        // Save order to database
        const order = await prisma.order.create({
            data: {
                userId: userId || null,
                total: amount / 100, // Convert from paise to rupees
                status: "PENDING",
                address: JSON.stringify(address),
                items: {
                    create: items.map((item: any) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
        });

        // If Razorpay keys are configured, create actual order
        const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

        if (razorpayKeyId && razorpayKeySecret) {
            const Razorpay = require("razorpay");
            const razorpay = new Razorpay({
                key_id: razorpayKeyId,
                key_secret: razorpayKeySecret,
            });

            const razorpayOrder = await razorpay.orders.create({
                amount: amount,
                currency: "INR",
                receipt: order.id,
            });

            // Update order with Razorpay order ID
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "PROCESSING" },
            });

            return NextResponse.json({
                orderId: razorpayOrder.id,
                dbOrderId: order.id,
            });
        }

        // Demo mode - no Razorpay keys
        return NextResponse.json({
            orderId: null,
            dbOrderId: order.id,
            demo: true,
        });
    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}
