"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import { Loader2, ShieldCheck } from "lucide-react";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useUser();
    const { items, total, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.fullName || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    const cartTotal = total();
    const shipping = cartTotal >= 999 ? 0 : 99;
    const grandTotal = cartTotal + shipping;

    if (items.length === 0) {
        router.push("/cart");
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        // Validate form
        if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            const res = await loadRazorpay();
            if (!res) {
                alert("Razorpay SDK failed to load");
                setLoading(false);
                return;
            }

            // Create order via API
            const orderResponse = await fetch("/api/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: grandTotal * 100, // Razorpay expects amount in paise
                    items: items,
                    address: formData,
                }),
            });

            const orderData = await orderResponse.json();

            if (!orderData.orderId) {
                // Fallback for demo mode without actual Razorpay keys
                alert("Demo Mode: Order placed successfully!");
                clearCart();
                router.push("/order-confirmation?demo=true");
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_demo",
                amount: grandTotal * 100,
                currency: "INR",
                name: "Jammal Perfumes",
                description: "Luxury Fragrance Order",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    // Verify payment
                    const verifyRes = await fetch("/api/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });

                    if (verifyRes.ok) {
                        clearCart();
                        router.push(`/order-confirmation?orderId=${response.razorpay_order_id}`);
                    } else {
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: {
                    color: "#000000",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Payment error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-display font-bold mb-12">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Shipping Form */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-xl font-display font-bold mb-6">Shipping Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address *</Label>
                                <Textarea id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Street address, apartment, etc." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input id="state" name="state" value={formData.state} onChange={handleChange} placeholder="Maharashtra" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pincode">PIN Code *</Label>
                                <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="400001" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-secondary/20 rounded-xl p-6 sticky top-24">
                        <h2 className="text-xl font-display font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                            {items.map((item) => (
                                <div key={`${item.id}-${item.variant}`} className="flex justify-between gap-4 text-sm">
                                    <span className="truncate">
                                        {item.name} {item.variant && `(${item.variant})`} × {item.quantity}
                                    </span>
                                    <span className="font-medium whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-3">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full mt-6 gap-2"
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4" />
                                    Pay ₹{grandTotal.toLocaleString()}
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Your payment is secured with 256-bit SSL encryption
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
