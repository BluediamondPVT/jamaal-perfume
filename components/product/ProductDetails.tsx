"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCartStore } from "@/store/cart-store";
import { Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import WishlistButton from "./WishlistButton";

interface ProductDetailsProps {
    product: {
        id: string;
        name: string;
        description: string;
        price: number;
        discount?: number;
        images: string; // JSON
        variants: string | null; // JSON
        stock: number;
    };
}

export function ProductDetails({ product }: ProductDetailsProps) {
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((state) => state.addItem);

    // Parse data
    const images = JSON.parse(product.images);
    const variants = product.variants ? JSON.parse(product.variants) : null;

    const [activeImage, setActiveImage] = useState(images[0]);
    const [selectedSize, setSelectedSize] = useState(variants?.sizes?.[0] || null);

    const handleAddToCart = () => {
        if (quantity > product.stock) {
            toast.error(`Only ${product.stock} items available in stock`);
            return;
        }
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: images[0],
            quantity: quantity,
            variant: selectedSize
        });
        toast.success(`${product.name} added to cart! 🛍️`, {
            description: `Quantity: ${quantity}`,
        });
    };

    const increment = () => setQuantity(q => q + 1);
    const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {/* Gallery */}
            <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary/10">
                    <Image
                        src={activeImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                {images.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {images.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={`relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? "border-primary" : "border-transparent"
                                    }`}
                            >
                                <Image src={img} alt={`View ${idx}`} fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                    {product.name}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        {product.discount && product.discount > 0 ? (
                            <>
                                <p className="text-2xl font-medium font-body text-green-600">
                                    ₹{(product.price - (product.price * product.discount) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-lg line-through text-muted-foreground">
                                    ₹{product.price.toLocaleString()}
                                </p>
                                <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                                    -{product.discount}%
                                </span>
                            </>
                        ) : (
                            <p className="text-2xl font-medium font-body">₹{product.price.toLocaleString()}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium text-muted-foreground mr-1">4.8</span>
                        <span className="text-sm text-muted-foreground">(12 Reviews)</span>
                    </div>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    {product.description}
                </p>

                {/* Variants */}
                {variants?.sizes && (
                    <div className="mb-8">
                        <label className="block text-sm font-semibold mb-3 uppercase tracking-wide">Size</label>
                        <div className="flex gap-3">
                            {variants.sizes.map((size: string) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-6 py-2 rounded-full border transition-all font-medium ${selectedSize === size
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-transparent text-foreground border-input hover:border-foreground"
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex items-center border border-input rounded-md w-max">
                        <button onClick={decrement} className="p-3 hover:text-primary transition-colors">
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <button onClick={increment} className="p-3 hover:text-primary transition-colors">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    <Button size="lg" className="flex-1 h-auto py-3 text-lg uppercase tracking-wide" onClick={handleAddToCart}>
                        Add to shopping bag
                    </Button>

                    <WishlistButton productId={product.id} />
                </div>

                {/* Accordion */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="details">
                        <AccordionTrigger className="font-display text-lg">Product Details</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                            Handcrafted with precision. Contains natural ingredients essential oils.
                            Free from harmful chemicals. Long-lasting fragrance projection.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="shipping">
                        <AccordionTrigger className="font-display text-lg">Shipping & Returns</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                            Free shipping on orders over ₹999. Orders usually ship within 24-48 hours.
                            Returns accepted within 7 days of delivery if sealed.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
