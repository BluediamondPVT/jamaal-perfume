import Link from "next/link";
import Image from "next/image";

const categories = [
    {
        name: "Luxury Attars",
        slug: "attar",
        image: "https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop",
        size: "large"
    },
    {
        name: "Perfume Sprays",
        slug: "perfume-spray",
        image: "https://images.unsplash.com/photo-1523293188086-b43e5456334d?q=80&w=800&auto=format&fit=crop",
        size: "small"
    },
    {
        name: "Bakhoor",
        slug: "bakhoor",
        image: "https://images.unsplash.com/photo-1519702755255-a28cb7e40620?q=80&w=800&auto=format&fit=crop",
        size: "small"
    },
];

export function CategoryGrid() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">Discover Our Collections</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
                    {categories.map((cat, idx) => (
                        <Link
                            key={cat.slug}
                            href={`/collections/${cat.slug}`}
                            className={`group relative overflow-hidden rounded-md ${idx === 0 ? 'md:col-span-2' : ''}`}
                        >
                            <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <h3 className="text-3xl font-display font-bold mb-2">{cat.name}</h3>
                                <span className="text-sm font-body uppercase tracking-wider underline decoration-transparent group-hover:decoration-white underline-offset-4 transition-all">
                                    View Collection
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
