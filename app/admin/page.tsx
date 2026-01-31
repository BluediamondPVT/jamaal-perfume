import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, Users, Tag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

async function getStats() {
    const [productsCount, ordersCount, totalRevenue, categoriesCount] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.aggregate({
            _sum: { total: true },
        }),
        prisma.category.count(),
    ]);

    return {
        products: productsCount,
        orders: ordersCount,
        revenue: totalRevenue._sum?.total || 0,
        categories: categoriesCount,
    };
}

async function getRecentCategories() {
    return await prisma.category.findMany({
        select: { id: true, name: true, slug: true, products: { select: { id: true } } },
        take: 5,
        orderBy: { createdAt: "desc" }
    });
}

export default async function AdminDashboard() {
    const stats = await getStats();
    const recentCategories = await getRecentCategories();

    const cards = [
        {
            title: "Total Products",
            value: stats.products.toString(),
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-100",
            href: "/admin/products"
        },
        {
            title: "Total Orders",
            value: stats.orders.toString(),
            icon: ShoppingCart,
            color: "text-green-600",
            bg: "bg-green-100",
            href: "/admin/orders"
        },
        {
            title: "Total Revenue",
            value: `₹${stats.revenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-yellow-600",
            bg: "bg-yellow-100",
            href: "/admin/orders"
        },
        {
            title: "Categories",
            value: stats.categories.toString(),
            icon: Tag,
            color: "text-purple-600",
            bg: "bg-purple-100",
            href: "/admin/categories"
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            </div>

            {/* 🔥 STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card) => (
                    <Link key={card.title} href={card.href}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer border-0 bg-gradient-to-br hover:scale-[1.02]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${card.bg}`}>
                                    <card.icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* 🔥 RECENT CATEGORIES */}
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Recent Categories ({recentCategories.length})</CardTitle>
                        <Link href="/admin/categories/new">
                            <Button className="cursor-pointer">+ New Category</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentCategories.length > 0 ? (
                            recentCategories.map((category) => (
                                <Link 
                                    key={category.id} 
                                    href={`/admin/categories/${category.id}`}
                                    className="block p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">{category.name}</h3>
                                            <p className="text-sm text-muted-foreground">{category.slug}</p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {category.products.length} products
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                No categories yet. <Link href="/admin/categories/new" className="text-blue-600 hover:underline">Create one!</Link>
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 🔥 QUICK ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">No recent orders. Check Orders page for details.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/admin/products/new" className="block p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all cursor-pointer">
                            ➕ Add New Product
                        </Link>
                        <Link href="/admin/categories/new" className="block p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all cursor-pointer">
                            🏷️ Add New Category
                        </Link>
                        <Link href="/admin/orders" className="block p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-all cursor-pointer">
                            📦 View Orders
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
