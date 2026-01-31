'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount?: number;
  stock: number;
  images: string;
  categoryId: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  variants?: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    categoryId: '',
    isFeatured: false,
    isBestSeller: false,
    images: '',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Fetch categories and product
  useEffect(() => {
    if (!productId) {
      console.warn('⚠️ Product ID not available yet');
      return;
    }
    
    const fetchData = async () => {
      try {
        console.log('🔍 Fetching product with ID:', productId);
        
        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) {
          console.warn('⚠️ Failed to fetch categories');
        } else {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        // Fetch product
        console.log(`📡 Making request to /api/admin/products/${productId}`);
        const productRes = await fetch(`/api/admin/products/${productId}`);
        console.log('📡 Product API Response:', productRes.status, productRes.statusText);
        
        if (!productRes.ok) {
          const errorText = await productRes.text();
          console.error('❌ API Error Response (Status ' + productRes.status + '):', errorText);
          
          let errorMessage = 'Product not found';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = errorText || 'Product not found';
          }
          
          throw new Error(errorMessage);
        }
        
        const productData = await productRes.json();
        console.log('✅ Product fetched:', productData);
        
        // Parse existing images for preview
        let images: string[] = [];
        try {
          images = JSON.parse(productData.images);
          if (!Array.isArray(images)) {
            images = productData.images.split(',');
          }
        } catch {
          images = (productData.images || '').split(',');
        }

        setProduct(productData);
        // Store existing image URLs as preview
        setImagePreviewUrls(images.filter(img => img.trim()));
        setFormData({
          name: productData.name || '',
          slug: productData.slug || '',
          description: productData.description || '',
          price: String(productData.price || ''),
          discount: String(productData.discount || 0),
          stock: String(productData.stock || 0),
          categoryId: productData.categoryId || '',
          isFeatured: productData.isFeatured || false,
          isBestSeller: productData.isBestSeller || false,
          images: images.join(','),
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    
    // Create preview URLs for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviewUrls((prev) => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    
    // If removing a new file (not existing image)
    if (index >= (imagePreviewUrls.length - imageFiles.length)) {
      const fileIndex = index - (imagePreviewUrls.length - imageFiles.length);
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const calculateFinalPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const discount = parseFloat(formData.discount) || 0;
    return price - (price * discount) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Product slug is required');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.price) {
      toast.error('Price is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('slug', formData.slug);
      submitFormData.append('description', formData.description);
      submitFormData.append('price', formData.price);
      submitFormData.append('discount', formData.discount);
      submitFormData.append('stock', formData.stock);
      submitFormData.append('categoryId', formData.categoryId);
      submitFormData.append('isFeatured', String(formData.isFeatured));
      submitFormData.append('isBestSeller', String(formData.isBestSeller));
      
      // Add existing image preview URLs (non-data URLs)
      const existingImages = imagePreviewUrls.filter(u => !u.startsWith('data:'));
      if (existingImages.length > 0) {
        submitFormData.append('existingImages', JSON.stringify(existingImages));
      }
      
      // Add new image files
      imageFiles.forEach((file) => {
        submitFormData.append('images', file);
      });

      const uploadToast = toast.loading('Uploading product...', {
        description: imageFiles.length > 0 ? `Uploading ${imageFiles.length} image(s)...` : 'Saving changes...'
      });

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        body: submitFormData,
      });

      toast.dismiss(uploadToast);

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update product');
        throw new Error(errorData.error || 'Failed to update product');
      }

      toast.success('Product updated successfully! 🎉');
      router.push('/admin/products');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Product not found'}</p>
          <Link href="/admin/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold">Edit Product</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Premium Oud Attar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Slug *
                  </label>
                  <Input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="e.g., premium-oud-attar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Product description..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold mb-4">Pricing & Stock</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price (₹) *
                    </label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Discount (%)
                    </label>
                    <Input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {formData.discount && parseFloat(formData.discount) > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      Final Price: <span className="font-bold">₹{calculateFinalPrice().toLocaleString()}</span>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stock
                  </label>
                  <Input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold mb-4">Product Images</h2>
              <div className="space-y-4">
                {/* Image Preview Grid */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                          <img
                            src={url}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* File Upload Input */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors">
                  <label className="cursor-pointer block">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Click to upload images
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB each
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold mb-4">Category</h3>
              <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold mb-4">Status</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleCheckboxChange}
                    className="rounded"
                  />
                  <span className="text-sm">Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={formData.isBestSeller}
                    onChange={handleCheckboxChange}
                    className="rounded"
                  />
                  <span className="text-sm">Best Seller</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border p-6 space-y-2">
              <Button
                type="submit"
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Link href="/admin/products" className="block">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
