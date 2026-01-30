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

async function getNewArrivals() {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
    take: 8,
  });
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const newArrivals = await getNewArrivals();

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <TrustBadges />
      <CategoryGrid />

      <ProductCarousel
        title="Best Sellers"
        products={featuredProducts.map(p => ({
          ...p,
          price: Number(p.price) // Ensure price is number for serialization if needed, though SQLite float is mostly number
        }))}
      />

      <ProductCarousel
        title="New Arrivals"
        products={newArrivals.map(p => ({
          ...p,
          price: Number(p.price)
        }))}
      />
    </div>
  );
}
