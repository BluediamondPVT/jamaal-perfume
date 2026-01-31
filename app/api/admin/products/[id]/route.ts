import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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
    // If file is too large or Supabase not configured, store as data URL
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('⚠️ Supabase not configured, storing image as data URL');
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return `data:${file.type};base64,${base64}`;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const fileBuffer = await file.arrayBuffer();
    
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
        });

      if (error) {
        console.warn('⚠️ Supabase storage unavailable, storing as data URL:', error.message);
        // Fallback: store as data URL if bucket doesn't exist
        const base64 = Buffer.from(fileBuffer).toString('base64');
        return `data:${file.type};base64,${base64}`;
      }

      // Return the public URL
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (storageError) {
      console.warn('⚠️ Supabase storage error, falling back to data URL');
      // Fallback: convert to data URL
      const base64 = Buffer.from(fileBuffer).toString('base64');
      return `data:${file.type};base64,${base64}`;
    }
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Failed to upload image');
  }
}

// GET single product
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both promise and direct object
    const resolvedParams = await Promise.resolve(params);
    const productId = typeof resolvedParams.id === 'string' ? resolvedParams.id : (await resolvedParams.id);
    
    console.log('📦 Fetching product:', productId);
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      console.log('❌ Product not found:', productId);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    console.log('✅ Product found:', product.name);
    return NextResponse.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: `Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// PATCH update product
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both promise and direct object
    const resolvedParams = await Promise.resolve(params);
    const productId = typeof resolvedParams.id === 'string' ? resolvedParams.id : (await resolvedParams.id);
    
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update products" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const discount = parseFloat(formData.get("discount") as string) || 0;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const categoryId = formData.get("categoryId") as string;
    const isFeatured = formData.get("isFeatured") === "true";
    const isBestSeller = formData.get("isBestSeller") === "true";
    const existingImagesStr = formData.get("existingImages") as string;

    // Parse existing images
    let imageUrls: string[] = [];
    if (existingImagesStr) {
      try {
        imageUrls = JSON.parse(existingImagesStr);
      } catch (e) {
        imageUrls = [];
      }
    }

    // Upload new images only if provided
    const imageFiles = formData.getAll("images") as File[];
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        try {
          const uploadedUrl = await uploadImageToSupabase(file);
          imageUrls.push(uploadedUrl);
        } catch (uploadError) {
          console.error('Failed to upload individual image:', uploadError);
          // Continue with other images instead of failing completely
          continue;
        }
      }
    }

    // Validate required fields
    if (!name || !slug || !categoryId || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug is unique (excluding current product)
    const existingSlug = await prisma.product.findFirst({
      where: {
        slug,
        NOT: { id: productId },
      },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        description,
        price,
        discount,
        stock,
        categoryId,
        isFeatured,
        isBestSeller,
        images: JSON.stringify(imageUrls),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both promise and direct object
    const resolvedParams = await Promise.resolve(params);
    const productId = typeof resolvedParams.id === 'string' ? resolvedParams.id : (await resolvedParams.id);
    
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete products" },
        { status: 403 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { error: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
