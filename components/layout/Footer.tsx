import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-secondary/30 pt-16 pb-8 border-t">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-bold font-display">
                            JAMMAL<span className="text-primary">.</span>
                        </Link>
                        <p className="text-muted-foreground font-body text-sm leading-relaxed">
                            Experience the luxury of authentic Attars and premium perfumes.
                            Crafted with passion for the refined nose.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="font-display font-bold text-lg mb-4">Shop</h3>
                        <ul className="space-y-2 font-body text-sm text-muted-foreground">
                            <li><Link href="/collections/attar" className="hover:text-primary">Attar</Link></li>
                            <li><Link href="/collections/perfume-spray" className="hover:text-primary">Perfume Sprays</Link></li>
                            <li><Link href="/collections/bakhoor" className="hover:text-primary">Bakhoor</Link></li>
                            <li><Link href="/collections/gift-sets" className="hover:text-primary">Gift Sets</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-display font-bold text-lg mb-4">Support</h3>
                        <ul className="space-y-2 font-body text-sm text-muted-foreground">
                            <li><Link href="/track-order" className="hover:text-primary">Track Order</Link></li>
                            <li><Link href="/shipping-policy" className="hover:text-primary">Shipping Policy</Link></li>
                            <li><Link href="/returns" className="hover:text-primary">Returns & Exchanges</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-display font-bold text-lg mb-4">Newsletter</h3>
                        <p className="text-sm text-muted-foreground mb-4 font-body">
                            Subscribe to receive updates, access to exclusive deals, and more.
                        </p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <button className="h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-body">
                    <p>© {new Date().getFullYear()} Jammal Perfumes. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
