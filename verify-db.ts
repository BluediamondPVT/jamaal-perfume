import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const products = await prisma.product.findMany({
        include: { category: true }
    })

    if (products.length === 0) {
        console.log('No products found.')
    } else {
        console.log(`Found ${products.length} products:`)
        products.slice(0, 5).forEach(p => {
            console.log(`- ${p.name} (${p.category.name}): ₹${p.price}`)
        })
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
