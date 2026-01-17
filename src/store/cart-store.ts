import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '@/types';

export interface CartItem extends Product {
    cartItemId: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    setOpen: (open: boolean) => void;
    getCartTotal: () => number;
    getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (product, quantity = 1, selectedSize, selectedColor) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(
                    (item) =>
                        item.id === product.id &&
                        item.selectedSize === selectedSize &&
                        item.selectedColor === selectedColor
                );

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.cartItemId === existingItem.cartItemId
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                        isOpen: true,
                    });
                } else {
                    set({
                        items: [
                            ...currentItems,
                            {
                                ...product,
                                cartItemId: uuidv4(),
                                quantity,
                                selectedSize,
                                selectedColor,
                            },
                        ],
                        isOpen: true,
                    });
                }
            },
            removeItem: (cartItemId) => {
                set({
                    items: get().items.filter((item) => item.cartItemId !== cartItemId),
                });
            },
            updateQuantity: (cartItemId, quantity) => {
                set({
                    items: get().items.map((item) =>
                        item.cartItemId === cartItemId ? { ...item, quantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            toggleCart: () => set({ isOpen: !get().isOpen }),
            setOpen: (open) => set({ isOpen: open }),
            getCartTotal: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },
            getCartCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
