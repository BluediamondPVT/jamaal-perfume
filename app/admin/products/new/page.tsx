"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        images: "",
        isFeatured: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    images: JSON.stringify([formData.images]),
                }),
            });

            if (res.ok) {
                router.push("/admin/products");
                router.refresh();
            } else {
                alert("Failed to create product");
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-display font-bold mb-8">Add New Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug *</Label>
                        <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="product-slug" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="categoryId">Category ID *</Label>
                    <Input id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} placeholder="Enter category UUID" required />
                    <p className="text-xs text-muted-foreground">Get category IDs from the database</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="images">Image URL *</Label>
                    <Input id="images" name="images" value={formData.images} onChange={handleChange} placeholder="https://images.unsplash.com/..." required />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isFeatured"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="h-4 w-4"
                    />
                    <Label htmlFor="isFeatured">Featured Product</Label>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Create Product
                    </Button>
                </div>
            </form>
        </div>
    );
}
