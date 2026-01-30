import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

interface PageProps {
    searchParams: {
        orderId?: string;
        demo?: string;
    };
}

export default function OrderConfirmationPage({ searchParams }: PageProps) {
    const orderId = searchParams.orderId || "DEMO-ORDER";
    const isDemo = searchParams.demo === "true";

    return (
        <div className="container mx-auto px-4 py-24 text-center">
            <div className="max-w-lg mx-auto space-y-8">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-display font-bold">Order Confirmed!</h1>
                    <p className="text-muted-foreground text-lg">
                        Thank you for your purchase. Your order has been placed successfully.
                    </p>
                </div>

                <div className="bg-secondary/20 rounded-xl p-6 text-left space-y-4">
                    <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-primary" />
                        <span className="font-medium">Order ID:</span>
                        <span className="font-mono text-sm">{orderId}</span>
                    </div>

                    {isDemo && (
                        <p className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <strong>Demo Mode:</strong> This is a test order. No actual payment was processed.
                            Configure Razorpay keys in your environment to enable real payments.
                        </p>
                    )}

                    <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                        <p>✅ Order confirmation email sent</p>
                        <p>📦 Your order will be shipped within 24-48 hours</p>
                        <p>🚚 Free shipping on orders above ₹999</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link href="/track-order">
                        <Button variant="outline" size="lg">
                            Track Order
                        </Button>
                    </Link>
                    <Link href="/collections/all">
                        <Button size="lg" className="gap-2">
                            Continue Shopping
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
