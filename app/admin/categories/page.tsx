import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function getCategories() {
    return await prisma.category.findMany({
        orderBy: { createdAt: "desc" }
    });
}

async function deleteCategory(formData: FormData) {
    'use server'
    const id = formData.get('categoryId') as string;
    await prisma.category.deleteMany({ where: { id } });
    revalidatePath('/admin/categories');
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold">Categories ({categories.length})</h1>
                <Link href="/admin/categories/new">
                    <Button className="gap-2 cursor-pointer">
                        <Plus className="h-4 w-4" />
                        New Category
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-4 font-medium">Name</th>
                            <th className="text-left p-4 font-medium">Slug</th>
                            <th className="text-left p-4 font-medium">Description</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-medium">{category.name}</td>
                                <td className="p-4">{category.slug}</td>
                                <td className="p-4 text-gray-700">
                                    <div className="line-clamp-2 text-sm">
                                        {category.description || <span className="text-gray-400">No description</span>}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <Link href={`/admin/categories/${category.id}`}>
                                            <Button size="icon" variant="ghost" className="cursor-pointer hover:bg-blue-50">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <form action={deleteCategory} className="inline">
                                            <input type="hidden" name="categoryId" value={category.id} />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-500 hover:bg-red-50 cursor-pointer"
                                                type="submit"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
