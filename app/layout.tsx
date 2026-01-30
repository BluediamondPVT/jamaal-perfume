import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "Jammal Perfumes | Luxury Attars & Premium Fragrances",
    template: "%s | Jammal Perfumes",
  },
  description: "Discover handcrafted luxury Attars, premium perfume sprays, and Bakhoor. Experience authentic Arabian fragrances made from the finest ingredients. Free shipping on orders above ₹999.",
  keywords: ["attar", "perfume", "luxury fragrance", "bakhoor", "oud", "arabian perfume", "natural perfume"],
  openGraph: {
    title: "Jammal Perfumes | Luxury Attars & Premium Fragrances",
    description: "Handcrafted luxury fragrances. Shop authentic Attars, premium sprays, and Bakhoor.",
    type: "website",
    locale: "en_IN",
  },
};

import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${outfit.variable} antialiased font-sans flex flex-col min-h-screen`}
        >
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
