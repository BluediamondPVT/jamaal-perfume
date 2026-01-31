import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount?: number;
  images: string; // JSON string
  category: { name: string };
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

export function ProductCarousel({ title, products }: ProductCarouselProps) {
  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            {title}
          </h2>
          <Link
            href="/collections/all"
            className="text-sm font-body font-medium hover:text-primary underline-offset-4 hover:underline"
          >
            View All
          </Link>
        </div>

        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => {
              // Parse images (stored as JSON string in SQLite)
              const images = JSON.parse(product.images);
              const mainImage = images[0];

              return (
                <CarouselItem
                  key={product.id}
                  className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="p-1">
                    <Card className="border-none shadow-none bg-transparent group">
                      <CardContent className="p-0">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-white mb-4">
                          <Image
                            src={mainImage}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Quick Add Overlay */}
                          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <Link href={`/product/${product.slug}`} className="block">
                              <Button className="w-full cursor-pointer bg-white text-black hover:bg-white/90 shadow-md">
                                Quick View
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {product.category.name}
                          </p>
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="font-display font-semibold text-lg leading-tight hover:text-primary transition-colors line-clamp-1">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2">
                            {product.discount && product.discount > 0 ? (
                              <>
                                <p className="font-body font-medium text-green-600">
                                  ₹
                                  {(
                                    product.price -
                                    (product.price * product.discount) / 100
                                  ).toLocaleString("en-IN", {
                                    maximumFractionDigits: 0,
                                  })}
                                </p>
                                <p className="text-sm line-through text-muted-foreground">
                                  ₹{product.price.toLocaleString()}
                                </p>
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                  -{product.discount}%
                                </span>
                              </>
                            ) : (
                              <p className="font-body font-medium">
                                ₹{product.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
