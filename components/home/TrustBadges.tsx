import { Truck, ShieldCheck, Heart, Star } from "lucide-react";

const features = [
    {
        icon: Truck,
        title: "Free Shipping",
        description: "On all orders above ₹999",
    },
    {
        icon: ShieldCheck,
        title: "Authentic Products",
        description: "100% genuine & certified",
    },
    {
        icon: Heart,
        title: "Cruelty Free",
        description: "No animal testing involved",
    },
    {
        icon: Star,
        title: "Premium Quality",
        description: "Finest ingredients used",
    },
];

export function TrustBadges() {
    return (
        <section className="py-12 border-t border-b bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center space-y-3">
                            <div className="p-3 bg-secondary/30 rounded-full">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-lg">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground font-body">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
