import { PrismaClient } from "@prisma/client";
import { ProductDetails } from "@/components/product/ProductDetails";
import { notFound } from "next/navigation";
import { ProductCarousel } from "@/components/home/ProductCarousel";

const prisma = new PrismaClient();

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

async function getProduct(slug: string) {
    return await prisma.product.findUnique({
        where: { slug },
        include: { category: true }
    });
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
    return await prisma.product.findMany({
        where: {
            categoryId,
            NOT: { id: currentProductId }
        },
        include: { category: true },
        take: 4
    });
}

export default async function ProductPage(props: PageProps) {
    const { slug } = await props.params;
    const product = await getProduct(slug);

    if (!product) return notFound();

    const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="mb-20">
                <ProductDetails product={{
                    ...product,
                    price: Number(product.price)
                }} />
            </div>

            {relatedProducts.length > 0 && (
                <div className="border-t pt-16">
                    <ProductCarousel
                        title="You May Also Like"
                        products={relatedProducts.map(p => ({
                            ...p,
                            price: Number(p.price)
                        }))}
                    />
                </div>
            )}
        </div>
    );
}
