import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding data...')

    // Create Categories
    const categoriesData = [
        { name: 'Attar', slug: 'attar', description: 'Concentrated perfume oil, alcohol-free.' },
        { name: 'Perfume Spray', slug: 'perfume-spray', description: 'Luxury eau de parfum sprays.' },
        { name: 'Bakhoor', slug: 'bakhoor', description: 'Traditional incense for home fragrance.' },
        { name: 'Gift Sets', slug: 'gift-sets', description: 'Perfect gifts for your loved ones.' },
    ]

    for (const cat of categoriesData) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        })
    }

    // Fetch created categories to link products
    const attarCat = await prisma.category.findUnique({ where: { slug: 'attar' } })
    const sprayCat = await prisma.category.findUnique({ where: { slug: 'perfume-spray' } })
    const bakhoorCat = await prisma.category.findUnique({ where: { slug: 'bakhoor' } })

    if (!attarCat || !sprayCat || !bakhoorCat) {
        throw new Error('Categories not found')
    }

    // Products Data
    const products = [
        {
            name: 'Royal Oudh',
            slug: 'royal-oudh',
            description: 'A majestic blend of pure Agarwood oil with hints of spice and leather. Long-lasting and intense.',
            price: 1499.00,
            stock: 50,
            categoryId: attarCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop']),
            isFeatured: true,
            variants: JSON.stringify({ sizes: ['6ml', '12ml'] }),
        },
        {
            name: 'Rose Musk',
            slug: 'rose-musk',
            description: 'Velvety rose petals infused with soft white musk. Elegant and timeless.',
            price: 899.00,
            stock: 100,
            categoryId: attarCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop']),
            isFeatured: true,
            variants: JSON.stringify({ sizes: ['6ml', '12ml'] }),
        },
        {
            name: 'Misk Rijali',
            slug: 'misk-rijali',
            description: 'A fresh, masculine musk suitable for daily wear. Notes of citrus and wood.',
            price: 599.00,
            stock: 80,
            categoryId: attarCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop']),
            isFeatured: false,
        },
        {
            name: 'Amber Gold',
            slug: 'amber-gold',
            description: 'Warm, resinous amber with sweet vanilla undertones. Comforting and rich.',
            price: 1200.00,
            stock: 30,
            categoryId: attarCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=800&auto=format&fit=crop']),
            isFeatured: true,
        },
        {
            name: 'Jasmine Sambac',
            slug: 'jasmine-sambac',
            description: 'Pure, heady jasmine scent that captures the essence of blooming flowers.',
            price: 750.00,
            stock: 60,
            categoryId: attarCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1616949755610-8c9ad0b11d5d?q=80&w=800&auto=format&fit=crop']),
            isFeatured: false,
        },
        // Sprays
        {
            name: 'Midnight Oud EDP',
            slug: 'midnight-oud-edp',
            description: 'A premium spray perfume with dark floral notes and a woody base.',
            price: 2499.00,
            stock: 40,
            categoryId: sprayCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1523293188086-b43e5456334d?q=80&w=800&auto=format&fit=crop']),
            isFeatured: true,
            variants: JSON.stringify({ sizes: ['50ml', '100ml'] }),
        },
        {
            name: 'Ocean Breeze',
            slug: 'ocean-breeze',
            description: 'Crisp aquatic notes inspired by the sea. Refreshing and invigorating.',
            price: 1800.00,
            stock: 75,
            categoryId: sprayCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=800&auto=format&fit=crop']),
            isFeatured: false,
        },
        {
            name: 'Velvet Santal',
            slug: 'velvet-santal',
            description: 'Creamy sandalwood with a touch of cardamom. Sophisticated and smooth.',
            price: 2100.00,
            stock: 45,
            categoryId: sprayCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1512777576244-b846ac3d816f?q=80&w=800&auto=format&fit=crop']),
            isFeatured: true,
        },
        {
            name: 'Citrus Burst',
            slug: 'citrus-burst',
            description: 'Zesty lemon and bergamot blend. Perfect for summer days.',
            price: 1650.00,
            stock: 90,
            categoryId: sprayCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1585848524874-8aa47b663b4f?q=80&w=800&auto=format&fit=crop']),
            isFeatured: false,
        },
        {
            name: 'Dark Vanilla',
            slug: 'dark-vanilla',
            description: 'Smoky vanilla bean with hints of tobacco and cocoa.',
            price: 2200.00,
            stock: 35,
            categoryId: sprayCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1563170351-be82bc888aa4?q=80&w=800&auto=format&fit=crop']),
            isFeatured: false,
        },
        // Bakhoor
        {
            name: 'Bakhoor Al-Emirates',
            slug: 'bakhoor-al-emirates',
            description: 'Traditional wood chips soaked in perfumed oil. Creates a luxurious ambiance.',
            price: 450.00,
            stock: 150,
            categoryId: bakhoorCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1519702755255-a28cb7e40620?q=80&w=800&auto=format&fit=crop']),
            isFeatured: false,
        },
        {
            name: 'Oudh Muattar',
            slug: 'oudh-muattar',
            description: 'High-quality Agarwood shavings infused with rose and saffron.',
            price: 1200.00,
            stock: 60,
            categoryId: bakhoorCat.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop']),
            isFeatured: true,
        },
    ]

    for (const p of products) {
        await prisma.product.upsert({
            where: { slug: p.slug },
            update: {},
            create: p,
        })
    }

    console.log('Seeding completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
