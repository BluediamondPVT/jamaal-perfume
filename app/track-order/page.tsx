"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Package } from "lucide-react";

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [orderStatus, setOrderStatus] = useState<null | {
        id: string;
        status: string;
        date: string;
    }>(null);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        // Demo tracking
        if (orderId) {
            setOrderStatus({
                id: orderId,
                status: "Processing",
                date: new Date().toLocaleDateString(),
            });
        }
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-display font-bold mb-4">Track Your Order</h1>
                    <p className="text-muted-foreground">
                        Enter your order ID to check the current status of your shipment.
                    </p>
                </div>

                <form onSubmit={handleTrack} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="orderId">Order ID</Label>
                        <div className="flex gap-2">
                            <Input
                                id="orderId"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="e.g., ORD-12345678"
                                className="flex-1"
                            />
                            <Button type="submit" className="gap-2">
                                <Search className="h-4 w-4" />
                                Track
                            </Button>
                        </div>
                    </div>
                </form>

                {orderStatus && (
                    <div className="mt-8 bg-secondary/20 rounded-xl p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-mono text-sm text-muted-foreground">{orderStatus.id}</p>
                                <p className="font-display font-bold text-xl">{orderStatus.status}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <div className="flex-1">
                                    <p className="font-medium">Order Placed</p>
                                    <p className="text-sm text-muted-foreground">{orderStatus.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <div className="flex-1">
                                    <p className="font-medium">Payment Confirmed</p>
                                    <p className="text-sm text-muted-foreground">{orderStatus.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                                <div className="flex-1">
                                    <p className="font-medium">Processing</p>
                                    <p className="text-sm text-muted-foreground">Your order is being prepared</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-gray-300" />
                                <div className="flex-1">
                                    <p className="font-medium text-muted-foreground">Shipped</p>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-gray-300" />
                                <div className="flex-1">
                                    <p className="font-medium text-muted-foreground">Delivered</p>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
