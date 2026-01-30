"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="w-24 h-24 mx-auto bg-secondary/30 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h1 className="text-3xl font-display font-bold">Your cart is empty</h1>
                    <p className="text-muted-foreground">
                        Looks like you haven't added anything to your cart yet.
                    </p>
                    <Link href="/collections/all">
                        <Button size="lg" className="mt-4">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const cartTotal = total();

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-display font-bold mb-12">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item) => (
                        <div key={`${item.id}-${item.variant}`} className="flex gap-6 p-4 bg-secondary/10 rounded-lg">
                            <div className="relative w-24 h-32 flex-shrink-0 rounded-md overflow-hidden bg-white">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="font-display font-semibold text-lg">{item.name}</h3>
                                    {item.variant && (
                                        <p className="text-sm text-muted-foreground">Size: {item.variant}</p>
                                    )}
                                    <p className="font-medium mt-1">₹{item.price.toLocaleString()}</p>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center border border-input rounded-md">
                                        <button
                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.variant)}
                                            className="p-2 hover:bg-secondary transition-colors"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                                            className="p-2 hover:bg-secondary transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.id, item.variant)}
                                        className="text-destructive hover:text-destructive/80 transition-colors p-2"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="text-right font-semibold">
                                ₹{(item.price * item.quantity).toLocaleString()}
                            </div>
                        </div>
                    ))}

                    <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
                        Clear Cart
                    </Button>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-secondary/20 rounded-xl p-6 sticky top-24">
                        <h2 className="text-xl font-display font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span>{cartTotal >= 999 ? "Free" : "₹99"}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>₹{(cartTotal + (cartTotal >= 999 ? 0 : 99)).toLocaleString()}</span>
                            </div>
                        </div>

                        {cartTotal < 999 && (
                            <p className="text-sm text-muted-foreground mb-4">
                                Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping!
                            </p>
                        )}

                        <Link href="/checkout">
                            <Button size="lg" className="w-full gap-2">
                                Proceed to Checkout
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>

                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Secure checkout powered by Razorpay
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
