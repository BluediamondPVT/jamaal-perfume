import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings } from "lucide-react";

const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
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

    // In production, check if user has ADMIN role from database
    // For now, we allow any authenticated user to access admin

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-secondary/30 border-r hidden md:block">
                <div className="p-6 border-b">
                    <Link href="/admin" className="font-display font-bold text-xl">
                        Admin Panel
                    </Link>
                </div>
                <nav className="p-4 space-y-2">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <link.icon className="h-5 w-5" />
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 bg-background">
                {children}
            </main>
        </div>
    );
}
