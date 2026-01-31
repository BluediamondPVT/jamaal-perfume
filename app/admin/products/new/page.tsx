"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    categoryId: "",
    images: [] as File[],
    isFeatured: false,
    isBestSeller: false,
  });

  // 🔥 CALCULATE DISCOUNTED PRICE
  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const discount = parseFloat(formData.discount) || 0;
    if (price && discount > 0) {
      return (price - (price * discount) / 100).toFixed(2);
    }
    return price.toFixed(2);
  };

  // 🔥 FETCH CATEGORIES ON LOAD
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Categories load error:", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 🔥 IMAGE UPLOAD HANDLER
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, images: files });

    if (files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 🔥 FormData for file upload
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("slug", formData.slug);
    submitData.append("description", formData.description);
    submitData.append("price", formData.price);
    submitData.append("discount", formData.discount);
    submitData.append("stock", formData.stock);
    submitData.append("categoryId", formData.categoryId);
    submitData.append("isFeatured", formData.isFeatured.toString());
    submitData.append("isBestSeller", formData.isBestSeller.toString());

    // 🔥 Add images
    formData.images.forEach((image) => {
      submitData.append("images", image);
    });

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: submitData, // No Content-Type - browser sets multipart
      });

      if (res.ok) {
        toast.success('Product created successfully! 🎉');
        router.push("/admin/products");
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to create product');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          Back
        </Button>
        <h1 className="text-3xl font-display font-bold">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NAME + SLUG */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="product-slug"
              required
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        {/* PRICE + DISCOUNT + STOCK */}
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">Original Price (₹) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="1000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Discount % (Optional)</Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.discount}
              onChange={handleChange}
              placeholder="10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountedPrice">Final Price (₹)</Label>
            <Input
              id="discountedPrice"
              type="number"
              step="0.01"
              value={calculateDiscountedPrice()}
              disabled
              className="bg-green-50 border-green-300"
            />
            <p className="text-xs text-green-600 font-medium">Auto-calculated</p>
          </div>
        </div>

        {/* STOCK */}
        <div className="space-y-2">
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            placeholder="100"
            required
          />
        </div>

        {/* 🔥 CATEGORY DROPDOWN */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, categoryId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 🔥 IMAGE UPLOAD */}
        <div className="space-y-2">
          <Label htmlFor="images">Product Images *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
            <input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            PNG, JPG up to 5MB. Multiple images supported.
          </p>
        </div>

        {/* FEATURED + BEST SELLER */}
        <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData({ ...formData, isFeatured: e.target.checked })
              }
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="isFeatured" className="cursor-pointer">
              Mark as Featured Product
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isBestSeller"
              name="isBestSeller"
              checked={formData.isBestSeller}
              onChange={(e) =>
                setFormData({ ...formData, isBestSeller: e.target.checked })
              }
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="isBestSeller" className="cursor-pointer">
              Mark as Best Seller
            </Label>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
