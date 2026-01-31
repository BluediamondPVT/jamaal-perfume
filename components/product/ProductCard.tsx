import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        discount?: number;
        images: string; // JSON String
        category: { name: string };
    };
}

export function ProductCard({ product }: ProductCardProps) {
    // Parse images
    let mainImage = "";
    try {
        const images = JSON.parse(product.images);
        mainImage = images[0];
    } catch (e) {
        mainImage = "https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop";
    }

    return (
        <Card className="border-none shadow-none bg-transparent group h-full">
            <CardContent className="p-0 h-full flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-secondary/10 mb-4">
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <Link href={`/product/${product.slug}`}>
                            <Button className="w-full bg-white text-black hover:bg-white/90 shadow-md">
                                Quick View
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-1 flex-grow">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {product.category?.name}
                    </p>
                    <Link href={`/product/${product.slug}`}>
                        <h3 className="font-display font-semibold text-lg leading-tight hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {product.discount && product.discount > 0 ? (
                            <>
                                <p className="font-body font-medium text-green-600">
                                    ₹{(product.price - (product.price * product.discount) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-sm line-through text-muted-foreground">
                                    ₹{product.price.toLocaleString()}
                                </p>
                            </>
                        ) : (
                            <p className="font-body font-medium">₹{product.price.toLocaleString()}</p>
                        )}
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-input hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
