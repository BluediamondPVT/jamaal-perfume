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
    const categoryIdValue = formData.get("categoryId") as string;
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

    // Validate required fields
    if (!name || !slug || !price) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, price" },
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

    // Build update data - only include categoryId if it has a value
    const updateData: any = {
      name,
      slug,
      description,
      price,
      discount,
      stock,
      isFeatured,
      isBestSeller,
      images: JSON.stringify(imageUrls),
    };

    // Only add categoryId if it's not empty
    if (categoryIdValue) {
      updateData.categoryId = categoryIdValue;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: { category: true },
    });

    console.log('✅ Product updated:', product.name);
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

    // Fetch product to get images before deletion
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.product.delete({
      where: { id: productId },
    });

    // Optional: Delete images from Supabase
    // Note: You can implement this if needed
    // const imageUrls = JSON.parse(product.images);
    // for (const imageUrl of imageUrls) {
    //   // Extract file path from URL and delete
    // }

    console.log('✅ Product deleted:', product.name);
    return NextResponse.json({ 
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { error: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}