import { PrismaClient } from "@prisma/client";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function getCategory(id: string) {
    return await prisma.category.findUnique({
        where: { id },
    });
}

async function updateCategory(formData: FormData) {
    'use server'
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;

    await prisma.category.update({
        where: { id },
        data: {
            name,
            slug,
            description,
        },
    });

    revalidatePath('/admin/categories');
    redirect('/admin/categories');
}

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditCategoryPage(props: PageProps) {
    const { id } = await props.params;
    const category = await getCategory(id);

    if (!category) {
        notFound();
    }

    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/categories">
                    <Button type="button" variant="outline">
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-display font-bold">Edit Category</h1>
            </div>

            <form action={updateCategory} className="space-y-6 bg-white p-8 rounded-lg border">
                <input type="hidden" name="id" value={category.id} />

                <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={category.name}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                        id="slug"
                        name="slug"
                        defaultValue={category.slug}
                        placeholder="perfume-spray"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={category.description || ""}
                        rows={4}
                        placeholder="Category description..."
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <Link href="/admin/categories">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit">Update Category</Button>
                </div>
            </form>
        </div>
    );
}
