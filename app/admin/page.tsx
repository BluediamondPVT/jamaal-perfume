import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, Users } from "lucide-react";

const prisma = new PrismaClient();

async function getStats() {
    const [productsCount, ordersCount, totalRevenue] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.aggregate({
            _sum: { total: true },
        }),
    ]);

    return {
        products: productsCount,
        orders: ordersCount,
        revenue: totalRevenue._sum.total || 0,
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    const cards = [
        {
            title: "Total Products",
            value: stats.products.toString(),
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            title: "Total Orders",
            value: stats.orders.toString(),
            icon: ShoppingCart,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: "Revenue",
            value: `₹${stats.revenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-yellow-600",
            bg: "bg-yellow-100",
        },
        {
            title: "Customers",
            value: "0",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-100",
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-display font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${card.bg}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{card.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">No orders yet.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <a href="/admin/products/new" className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                            + Add New Product
                        </a>
                        <a href="/admin/orders" className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                            View All Orders
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
