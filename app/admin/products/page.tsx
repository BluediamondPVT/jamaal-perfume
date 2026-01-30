import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const prisma = new PrismaClient();

async function getProducts() {
    return await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
    });
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold">Products</h1>
                <Link href="/admin/products/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-secondary/30">
                        <tr>
                            <th className="text-left p-4 font-medium">Product</th>
                            <th className="text-left p-4 font-medium">Category</th>
                            <th className="text-left p-4 font-medium">Price</th>
                            <th className="text-left p-4 font-medium">Stock</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            let mainImage = "";
                            try {
                                const images = JSON.parse(product.images);
                                mainImage = images[0];
                            } catch {
                                mainImage = "";
                            }

                            return (
                                <tr key={product.id} className="border-t hover:bg-secondary/10">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-secondary/20">
                                                {mainImage && (
                                                    <Image src={mainImage} alt={product.name} fill className="object-cover" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{product.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-muted-foreground">{product.category.name}</td>
                                    <td className="p-4">₹{Number(product.price).toLocaleString()}</td>
                                    <td className="p-4">{product.stock}</td>
                                    <td className="p-4">
                                        {product.isFeatured ? (
                                            <Badge>Featured</Badge>
                                        ) : (
                                            <Badge variant="secondary">Regular</Badge>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Button size="icon" variant="ghost">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button size="icon" variant="ghost" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                    No products found. Add your first product!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
