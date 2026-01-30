import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!razorpayKeySecret) {
            // Demo mode
            return NextResponse.json({ success: true, demo: true });
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac("sha256", razorpayKeySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Payment verified - update order status in production
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        );
    }
}
