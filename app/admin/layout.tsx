import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    Users, 
    Settings, 
    Tag 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "**Categories**", href: "/admin/categories", icon: Tag },     // 🔥 NEW!
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    // ✅ ADMIN ROLE CHECK - Verify user is admin before rendering dashboard
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* 🔥 SIDEBAR - Enhanced */}
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r shadow-lg hidden md:block">
                <div className="p-8 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Link href="/admin" className="font-display font-bold text-2xl flex items-center gap-2">
                        🛍️ Admin Panel
                    </Link>
                    <p className="text-blue-100 text-sm mt-1">Manage your store</p>
                </div>
                
                <nav className="p-6 space-y-1">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                                flex items-center gap-4 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md hover:scale-[1.02]
                                border border-transparent hover:border-blue-200
                            `}
                        >
                            <link.icon className="h-5 w-5 flex-shrink-0" />
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* 🔥 MOBILE SIDEBAR BUTTON */}
            <div className="md:hidden p-4 border-b bg-white shadow-sm">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    ☰ Menu
                </Button>
            </div>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
