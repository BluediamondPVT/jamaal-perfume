import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { TrustBadges } from "@/components/home/TrustBadges";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: { isFeatured: true },
    include: { category: true },
    take: 8,
  });
}

async function getBestSellerProducts() {
  return await prisma.product.findMany({
    where: { isBestSeller: true },
    include: { category: true },
    take: 8,
  });
}

async function getNewArrivals() {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
    take: 8,
  });
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const bestSellerProducts = await getBestSellerProducts();
  const newArrivals = await getNewArrivals();

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <TrustBadges />
      <CategoryGrid />

      {bestSellerProducts.length > 0 && (
        <ProductCarousel
          title="Best Sellers"
          products={bestSellerProducts.map(p => ({
            ...p,
            price: Number(p.price),
            discount: p.discount || 0
          }))}
        />
      )}

      {featuredProducts.length > 0 && (
        <ProductCarousel
          title="Featured Products"
          products={featuredProducts.map(p => ({
            ...p,
            price: Number(p.price),
            discount: p.discount || 0
          }))}
        />
      )}

      <ProductCarousel
        title="New Arrivals"
        products={newArrivals.map(p => ({
          ...p,
          price: Number(p.price),
          discount: p.discount || 0
        }))}
      />
    </div>
  );
}
