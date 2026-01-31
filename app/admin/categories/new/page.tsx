import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function createCategory(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;

    await prisma.category.create({
        data: {
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
            description,
        }
    });

    revalidatePath('/admin/categories');
}

export default function NewCategoryPage() {
    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/admin/categories">
                    <Button variant="ghost" size="icon" className="cursor-pointer">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-display font-bold">New Category</h1>
            </div>

            <form action={createCategory} className="space-y-6 bg-white p-8 rounded-xl border shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" name="name" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Slug (Optional)</Label>
                    <Input id="slug" name="slug" placeholder="Auto-generated from name" />
                    <p className="text-xs text-muted-foreground">Leave empty for auto-generation</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" rows={4} />
                </div>

                <div className="flex gap-4 pt-4">
                    <Link href="/admin/categories">
                        <Button type="button" variant="outline" className="cursor-pointer">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" className="cursor-pointer bg-blue-600 hover:bg-blue-700">
                        Create Category
                    </Button>
                </div>
            </form>
        </div>
    );
}
