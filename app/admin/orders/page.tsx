import { PrismaClient } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

async function getOrders() {
    return await prisma.order.findMany({
        include: {
            items: {
                include: { product: true },
            },
            user: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    ON_THE_WAY: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div>
            <h1 className="text-3xl font-display font-bold mb-8">Orders</h1>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-secondary/30">
                        <tr>
                            <th className="text-left p-4 font-medium">Order ID</th>
                            <th className="text-left p-4 font-medium">Date</th>
                            <th className="text-left p-4 font-medium">Items</th>
                            <th className="text-left p-4 font-medium">Total</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            let address = { name: "Guest" };
                            try {
                                address = JSON.parse(order.address);
                            } catch { }

                            return (
                                <tr key={order.id} className="border-t hover:bg-secondary/10">
                                    <td className="p-4">
                                        <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">{order.items.length} items</td>
                                    <td className="p-4 font-medium">₹{Number(order.total).toLocaleString()}</td>
                                    <td className="p-4">
                                        <Badge className={statusColors[order.status] || ""}>
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Button size="icon" variant="ghost">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                    No orders yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
