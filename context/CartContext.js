
'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from '@/context/ToastContext';
import { useSession } from 'next-auth/react';
import { calculateGroupPrice } from '@/lib/utils/groupPricing';
import isEqual from 'lodash.isequal'; // Added import for useSession

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const { showToast } = useToast();
    const { data: session, status } = useSession();
    const hasInitializedSession = useRef(false);
    // Use loose equality or cast to String to be robust against PrestaShop's string IDs
    const isPro = String(session?.user?.id_default_group) === "4";

    // Helper to normalize variant for comparison
    const getVariantKey = (variant) => {
        if (!variant) return 'null';
        return JSON.stringify(variant);
    };

    // Helper to merge duplicates
    const consolidateCart = (items) => {
        const uniqueItems = [];
        items.forEach(item => {
            const itemId = item.id || item.slug || item.name;
            const variantKey = getVariantKey(item.variant);

            const existingIndex = uniqueItems.findIndex(u => {
                const uId = u.id || u.slug || u.name;
                const uVariantKey = getVariantKey(u.variant);
                return uId === itemId && uVariantKey === variantKey;
            });

            if (existingIndex > -1) {
                uniqueItems[existingIndex].quantity += item.quantity;
            } else {
                uniqueItems.push({
                    ...item,
                    id: itemId,
                    variant: item.variant || null
                });
            }
        });
        return uniqueItems;
    };

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCart(consolidateCart(parsedCart));
            } catch (e) {
                console.error('Failed to parse cart from local storage:', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage whenever cart changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    // Recalculate prices on Session Change (Login/Logout)
    useEffect(() => {
        if (!isLoaded || cart.length === 0) return;

        const groupId = session?.user?.id_default_group || 3;

        let hasChanges = false;
        const updatedCart = cart.map(item => {
            // We need the raw product data to recalculate accurately.
            // Items added *before* this fix might not have rawProduct attached in localStorage,
            // but we can pass the whole item to calculateGroupPrice as a fallback since it has priceTTC/priceHT.
            const rawSource = item.rawProduct || item;
            const newPriceInfo = calculateGroupPrice(rawSource, groupId);

            // Check if prices need updating
            const newDisplayPrice = newPriceInfo.suggestShowHT ? newPriceInfo.priceHT : newPriceInfo.priceTTC;
            const currentDisplayPrice = item.suggestShowHT ? item.priceHT : item.priceTTC;

            if (
                item.priceHT !== newPriceInfo.priceHT ||
                item.priceTTC !== newPriceInfo.priceTTC ||
                item.suggestShowHT !== newPriceInfo.suggestShowHT
            ) {
                hasChanges = true;
                return {
                    ...item,
                    price: newDisplayPrice,
                    priceHT: newPriceInfo.priceHT,
                    priceTTC: newPriceInfo.priceTTC,
                    suggestShowHT: newPriceInfo.suggestShowHT,
                    hasDiscount: newPriceInfo.hasDiscount
                };
            }
            return item;
        });

        if (hasChanges && !isEqual(cart, updatedCart)) {
            setCart(updatedCart);
            // Only show toast if the session was already initialized (i.e. real mid-session change)
            if (hasInitializedSession.current) {
                showToast("Panier mis à jour avec vos tarifs", "success");
            }
        }

        // Mark session as initialized once it's no longer "loading"
        if (status !== "loading") {
            hasInitializedSession.current = true;
        }
    }, [session?.user?.id_default_group, isLoaded, status]);

    // Add Item to Cart
    const addItem = (product, quantity = 1, variant = null) => {
        setCart((prevCart) => {
            const productId = product.id || product.slug || product.name;
            const variantKey = getVariantKey(variant);

            const existingItemIndex = prevCart.findIndex((item) => {
                const itemId = item.id || item.slug || item.name;
                const itemVariantKey = getVariantKey(item.variant);
                return itemId === productId && itemVariantKey === variantKey;
            });

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + quantity
                };
                return newCart;
            } else {
                // New item
                return [...prevCart, {
                    ...product, // Keep all product props including image, price, etc.
                    rawProduct: product.rawProduct || product, // Save the raw source for future recalculations
                    id: productId, // Ensure stable ID
                    quantity,
                    variant: variant || null
                }];
            }
        });
        // setIsCartOpen(true); // Auto-open cart on add - REPLACED BY TOAST
        showToast(`${quantity}x ${product.name} ajouté !`, 'success', 3000, {
            label: 'Voir',
            onClick: () => setIsCartOpen(true)
        });
    };

    // Remove Item
    const removeItem = (id, variant = null) => {
        setCart((prevCart) =>
            prevCart.filter(
                (item) => !(item.id === id && JSON.stringify(item.variant) === JSON.stringify(variant))
            )
        );
        showToast('Produit retiré du panier', 'success');
    };

    // Update Quantity
    const updateQuantity = (id, quantity, variant = null) => {
        if (quantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id && JSON.stringify(item.variant) === JSON.stringify(variant)
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    // Clear Cart
    const clearCart = () => {
        setCart([]);
        showToast('Le panier a été vidé', 'success');
    };

    // Calculate Totals
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const cartTotalHT = cart.reduce((acc, item) => {
        const unitHT = item.priceHT ?? (item.suggestShowHT ? item.price : item.price / 1.055);
        return acc + (unitHT * item.quantity);
    }, 0);

    const cartTotalTTC = cart.reduce((acc, item) => {
        const unitTTC = item.priceTTC ?? (!item.suggestShowHT ? item.price : item.price * 1.055);
        return acc + (unitTTC * item.quantity);
    }, 0);

    const cartTotal = cartTotalTTC; // Default legacy total remains TTC

    return (
        <CartContext.Provider value={{
            cart,
            isCartOpen,
            setIsCartOpen,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            cartTotalHT,
            cartTotalTTC
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
