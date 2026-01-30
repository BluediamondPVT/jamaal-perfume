import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    name: string
    price: number
    image: string
    quantity: number
    variant?: string
}

interface CartState {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string, variant?: string) => void
    updateQuantity: (id: string, quantity: number, variant?: string) => void
    clearCart: () => void
    total: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const currentItems = get().items
                const existingItem = currentItems.find(
                    (i) => i.id === item.id && i.variant === item.variant
                )

                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            i.id === item.id && i.variant === item.variant
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                    })
                } else {
                    set({ items: [...currentItems, item] })
                }
            },
            removeItem: (id, variant) => {
                set({
                    items: get().items.filter(
                        (i) => !(i.id === id && i.variant === variant)
                    ),
                })
            },
            updateQuantity: (id, quantity, variant) => {
                set({
                    items: get().items.map((i) =>
                        i.id === id && i.variant === variant ? { ...i, quantity } : i
                    ),
                })
            },
            clearCart: () => set({ items: [] }),
            total: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
            },
        }),
        {
            name: 'cart-storage',
        }
    )
)
