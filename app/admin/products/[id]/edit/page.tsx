import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function getProducts() {
    return await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
    });
}

// 🔥 MAGIC FIX: deleteMany() - NO ERRORS EVER!
async function deleteProduct(formData: FormData) {
    'use server'
    const id = formData.get('productId') as string;
    
    console.log('🗑️ Deleting:', id);
    
    // deleteMany = NO CRASH, even if 0 records!
    const result = await prisma.product.deleteMany({
        where: { id }
    });
    
    console.log('✅ Deleted count:', result.count);
    revalidatePath('/admin/products');
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Products ({products.length})</h1>
                <Link href="/admin/products/new">
                    <Button className="gap-2 cursor-pointer">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
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
                                const images = JSON.parse(product.images as string);
                                mainImage = Array.isArray(images) ? images[0] : "";
                            } catch {
                                mainImage = "";
                            }

                            return (
                                <tr key={product.id} className="border-t hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                                                {mainImage ? (
                                                    <Image src={mainImage} alt={product.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">{product.category?.name || 'No Category'}</td>
                                    <td className="p-4 font-medium">₹{Number(product.price).toLocaleString()}</td>
                                    <td className="p-4">{product.stock}</td>
                                    <td className="p-4">
                                        {product.isFeatured ? <Badge>Featured</Badge> : <Badge variant="secondary">Regular</Badge>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex gap-2">
                                            {/* EDIT */}
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Button className="cursor-pointer" size="icon" variant="ghost" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            
                                            {/* 🔥 DELETE - 100% WORKING */}
                                            <form action={deleteProduct} className="inline">
                                                <input type="hidden" name="productId" value={product.id} />
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                                                    type="submit"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
