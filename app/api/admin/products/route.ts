import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Upload image to Supabase Storage
async function uploadImageToSupabase(file: File): Promise<string> {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase not configured');
      throw new Error('Supabase storage not configured');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const fileBuffer = await file.arrayBuffer();
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
      });

    if (error) {
      console.error('❌ Supabase upload error:', error.message);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Return the public URL
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// POST - Create new product
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can create products" },
        { status: 403 }
      );
    }

    // 🔥 MULTIPART FORM DATA (Images + Text)
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const discount = parseFloat(formData.get('discount') as string) || 0;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const categoryIdValue = formData.get('categoryId') as string;
    const isFeatured = formData.get('isFeatured') === 'true';
    const isBestSeller = formData.get('isBestSeller') === 'true';

    // Validate required fields
    if (!name || !slug || !price) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, price" },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    // 🔥 IMAGE UPLOAD HANDLING - Supabase
    const imageFiles = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        try {
          const uploadedUrl = await uploadImageToSupabase(file);
          imageUrls.push(uploadedUrl);
          console.log('✅ Image uploaded:', uploadedUrl);
        } catch (uploadError) {
          console.error('Failed to upload individual image:', uploadError);
          return NextResponse.json(
            { error: `Image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
            { status: 500 }
          );
        }
      }
    }

    // Build data object - only include categoryId if it has a value
    const productData: any = {
      name,
      slug,
      description,
      price,
      discount,
      stock,
      images: JSON.stringify(imageUrls), // Store as JSON array
      isFeatured,
      isBestSeller,
    };

    // Only add categoryId if it's not empty
    if (categoryIdValue) {
      productData.categoryId = categoryIdValue;
    }

    const product = await prisma.product.create({
      data: productData,
      include: { category: true },
    });

    console.log('✅ NEW PRODUCT CREATED:', name);
    return NextResponse.json({ 
      product, 
      message: "Product created successfully",
      imageCount: imageUrls.length 
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// GET - Fetch all products with analytics
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Categories fetch for dropdown
    if (req.nextUrl.searchParams.has('categories')) {
      const categories = await prisma.category.findMany({
        select: { id: true, name: true }
      });
      return NextResponse.json(categories);
    }

    // Products fetch with analytics
    const products = await prisma.product.findMany({
      include: {
        category: true,
        orderItems: {
          select: { quantity: true, price: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const productsWithAnalytics = products.map((product) => {
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const { orderItems, ...productData } = product;

      return {
        ...productData,
        analytics: {
          totalSold,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
        },
      };
    });

    return NextResponse.json(productsWithAnalytics);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}