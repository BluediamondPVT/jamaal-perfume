import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

async function getUserOrders(clerkId: string) {
    const user = await prisma.user.findUnique({
        where: { clerkId },
    });

    if (!user) return [];

    return await prisma.order.findMany({
        where: { userId: user.id },
        include: {
            items: {
                include: { product: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

export default async function AccountPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const orders = await getUserOrders(userId);

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-display font-bold mb-8">My Account</h1>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-display font-bold mb-6">Order History</h2>

                    {orders.length === 0 ? (
                        <div className="text-center py-12 bg-secondary/20 rounded-xl">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                            <Link href="/collections/all" className="text-primary hover:underline mt-2 inline-block">
                                Start Shopping →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white border rounded-xl p-6">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                        <div>
                                            <p className="font-mono text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <Badge className={statusColors[order.status] || ""}>
                                            {order.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.product.name} × {item.quantity}</span>
                                                <span>₹{(Number(item.price) * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <span className="font-semibold">Total</span>
                                        <span className="font-bold text-lg">₹{Number(order.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
