import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1547887538-e6a2d699e196?q=80&w=2600&auto=format&fit=crop")', // Premium perfume background
                }}
            >
                <div className="absolute inset-0 bg-black/40" /> {/* Overlay */}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto space-y-6">
                <h2 className="text-sm md:text-base tracking-[0.2em] uppercase text-white/90 font-body animate-fade-in-up">
                    Luxury Fragrances
                </h2>
                <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight animate-fade-in-up delay-100">
                    Scents that Define <br /> Your Essence
                </h1>
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-body animate-fade-in-up delay-200">
                    Handcrafted Attars and Premium Perfumes made from the finest ingredients.
                </p>

                <div className="pt-8 animate-fade-in-up delay-300 gap-4 flex justify-center">
                    <Link href="/collections/attar">
                        <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-none px-8 h-12 text-sm uppercase tracking-widest font-semibold">
                            Shop Attars
                        </Button>
                    </Link>
                    <Link href="/collections/perfume-spray">
                        <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 hover:text-white rounded-none px-8 h-12 text-sm uppercase tracking-widest font-semibold">
                            Explore Sprays
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
