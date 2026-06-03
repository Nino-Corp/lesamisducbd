
'use client';

import { useCart } from '@/context/CartContext';
import styles from './CartDrawer.module.css';
import { useEffect, useState } from 'react';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useLockBodyScroll from '@/hooks/useLockBodyScroll';
import LoginModal from '../LoginModal/LoginModal';

export default function CartDrawer() {
    const { cart, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart, cartTotalHT, cartTotalTTC } = useCart();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState(0);
    const [upsellProducts, setUpsellProducts] = useState([]);
    const { data: session } = useSession();
    // Use String comparison to handle both number and string types from session
    const isPro = String(session?.user?.id_default_group) === "4";

    const router = useRouter();

    // Fetch upsell products
    useEffect(() => {
        if (isCartOpen && cart.length > 0 && upsellProducts.length === 0) {
            fetch('/api/products')
                .then(res => res.json())
                .then(data => {
                    const cartSlugs = cart.map(item => item.slug);
                    const recommendations = data.filter(p => !cartSlugs.includes(p.slug)).slice(0, 2);
                    setUpsellProducts(recommendations);
                })
                .catch(err => console.error('Failed to fetch upsell products:', err));
        }
    }, [isCartOpen, cart]);

    // Lock scroll when cart is open
    useLockBodyScroll(isCartOpen);

    // Reset checkout state if drawer closes or if user returns via "Back" button (BFCache)
    useEffect(() => {
        if (!isCartOpen) {
            setIsCheckingOut(false);
            setCheckoutStep(0);
        }
    }, [isCartOpen]);

    useEffect(() => {
        const handlePageShow = (event) => {
            if (event.persisted) {
                // If the page is restored from cache (Back button)
                setIsCheckingOut(false);
                setCheckoutStep(0);
                setIsCartOpen(false); // Close the cart entirely
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, [setIsCartOpen]);

    if (!isCartOpen) return null;

    const handleCheckout = async () => {
        if (!session) {
            setIsLoginOpen(true);
            return;
        }

        setIsCheckingOut(true);
        setCheckoutStep(0);

        // Cycle through steps for the UI animation
        const stepInterval = setInterval(() => {
            setCheckoutStep((prev) => (prev < 2 ? prev + 1 : prev));
        }, 1500);

        try {
            const res = await fetch('/api/checkout/prestashop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart, user: session?.user })
            });
            const data = await res.json();

            if (res.ok && data.success && data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                clearInterval(stepInterval);
                setIsCheckingOut(false);
                setCheckoutStep(0);
                alert(`Erreur de redirection vers le paiement: ${data.error || 'Inconnue'}`);
            }
        } catch (error) {
            clearInterval(stepInterval);
            setIsCheckingOut(false);
            setCheckoutStep(0);
            console.error('Checkout redirect error:', error);
            alert("Erreur réseau lors de la préparation du paiement.");
        }
    };

    const checkoutStepsText = [
        "Connexion sécurisée en cours...",
        "Préparation de votre commande...",
        "Redirection vers la passerelle de paiement..."
    ];

    return (
        <div className={styles.overlay} onClick={() => setIsCartOpen(false)}>
            <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h2>Mon Panier</h2>
                        {cart.length > 0 && (
                            <button onClick={clearCart} className={styles.clearBtn} title="Vider le panier">
                                Vider le panier
                            </button>
                        )}
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className={styles.closeBtn} aria-label="Fermer le panier">
                        ✕
                    </button>
                </div>

                <div className={styles.items}>
                    {cart.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <p>Votre panier est vide.</p>
                            <Link href="/produits" passHref>
                                <button onClick={() => setIsCartOpen(false)} className={styles.shopBtn}>
                                    Découvrir nos produits
                                </button>
                            </Link>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={`${item.id}-${JSON.stringify(item.variant)}`} className={styles.item}>
                                <div className={styles.imageConfig}>
                                    {item.image && (
                                        <div className={styles.imgWrapper}>
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.itemDetails}>
                                    <h3>{item.name}</h3>
                                    {item.variant && <span className={styles.variant}>{item.variant.label || item.variant.name}</span>}
                                    <div className={styles.price}>
                                        {isPro ? (
                                            <>
                                                {(item.priceHT || item.price).toFixed(2)}€ HT
                                                <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '6px' }}>
                                                    ({(item.priceTTC || item.price).toFixed(2)}€ TTC)
                                                </span>
                                            </>
                                        ) : (
                                            `${(item.priceTTC || item.price).toFixed(2)}€`
                                        )}
                                    </div>

                                    <div className={styles.controls}>
                                        <div className={styles.qtyControl}>
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)} aria-label="Diminuer la quantité">-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)} aria-label="Augmenter la quantité">+</button>
                                        </div>
                                        <button onClick={() => removeItem(item.id, item.variant)} className={styles.removeBtn}>
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {/* Upsell / Cross-Selling Section */}
                    {cart.length > 0 && upsellProducts.length > 0 && (
                        <div className={styles.upsellSection}>
                            <h4 className={styles.upsellTitle}>Vous aimerez aussi...</h4>
                            <div className={styles.upsellList}>
                                {upsellProducts.map(product => (
                                    <div key={product.id} className={styles.upsellItem}>
                                        {product.image && (
                                            <div className={styles.upsellImageWrapper}>
                                                <Image src={product.image} alt={product.name} fill style={{ objectFit: 'contain' }} />
                                            </div>
                                        )}
                                        <div className={styles.upsellInfo}>
                                            <Link href={`/produits/${product.slug}`} className={styles.upsellName} onClick={() => setIsCartOpen(false)}>
                                                {product.name}
                                            </Link>
                                            <div className={styles.upsellPrice}>{isPro ? product.priceHT : product.priceTTC}€</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className={styles.footer}>
                        {isPro ? (
                            <div className={styles.totalRowPro}>
                                <div className={styles.totalLine}>
                                    <span>Total HT</span>
                                    <span>{cartTotalHT.toFixed(2)}€</span>
                                </div>
                                <div className={styles.totalLine} style={{ opacity: 0.8, fontSize: '0.9em' }}>
                                    <span>Total TTC</span>
                                    <span>{cartTotalTTC.toFixed(2)}€</span>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.totalRow}>
                                <span>Total</span>
                                <span className={styles.totalAmount}>{cartTotalTTC.toFixed(2)}€</span>
                            </div>
                        )}
                        <p className={styles.shippingNote}>
                            Livraison <span style={{ color: '#10B981', fontWeight: 'bold' }}>offerte</span>
                        </p>
                        <button
                            onClick={handleCheckout}
                            className={styles.checkoutBtn}
                            disabled={isCheckingOut}
                        >
                            <span className={styles.buttonContent}>
                                Procéder au paiement
                                <ArrowRight size={20} className={styles.buttonIcon} />
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Fullscreen Checkout Loading Overlay */}
            {isCheckingOut && (
                <div className={styles.fullscreenOverlay}>
                    <div className={styles.loaderBox}>
                        <div className={styles.pulseRing}></div>
                        <ShieldCheck className={styles.shieldIcon} size={48} />
                        <h2 className={styles.loaderTitle}>Préparation Sécurisée</h2>
                        <div className={styles.stepContainer}>
                            <p className={styles.loaderStepText}>{checkoutStepsText[checkoutStep]}</p>
                            <Loader2 className={styles.spinner} size={18} />
                        </div>
                    </div>
                </div>
            )}

            {/* Login Modal Overlay */}
            {!session && <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} fromCheckout={true} />}
        </div>
    );
}
