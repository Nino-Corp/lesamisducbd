'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './CheckoutClient.module.css';
import { MapPin, Package, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutClient({ user }) {
    const { cart, cartTotal } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirmOrder = async () => {
        setIsProcessing(true);

        try {
            const res = await fetch('/api/checkout/prestashop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart, user })
            });

            const data = await res.json();

            if (res.ok && data.success && data.redirectUrl) {
                // Redirect to PrestaShop sas.php
                window.location.href = data.redirectUrl;
            } else {
                alert(`Erreur : ${data.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert("Erreur de connexion au serveur.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className={styles.emptyState}>
                <Package size={64} className={styles.emptyIcon} />
                <h2>Votre panier est vide</h2>
                <p>Ajoutez des produits pour finaliser votre commande.</p>
                <Link href="/" className={styles.linkBtn}>Retour à la boutique</Link>
            </div>
        );
    }

    return (
        <div className={styles.checkoutGrid}>

            {/* Colonne de Gauche : Adresses (Maintenant gérées par PrestaShop) */}
            <div className={styles.leftCol}>
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Paiement sécurisé via PrestaShop</h2>
                    <p style={{ marginTop: '1rem', lineHeight: '1.6', color: '#4B5563' }}>
                        Pour garantir la sécurité de vos transactions et de vos données personnelles,
                        la finalisation de votre commande s'effectue sur notre espace de paiement sécurisé.
                    </p>
                    <p style={{ marginTop: '1rem', lineHeight: '1.6', color: '#4B5563' }}>
                        Vous pourrez y saisir ou sélectionner votre adresse de livraison et choisir votre mode d'expédition.
                    </p>
                </div>
            </div>

            {/* Colonne de Droite : Résumé du Panier */}
            <div className={styles.rightCol}>
                <div className={styles.summaryCard}>
                    <h2 className={styles.summaryTitle}>Résumé de la commande</h2>

                    <div className={styles.summaryItems}>
                        {cart.map((item) => (
                            <div key={`${item.id}-${item.variant?.id}`} className={styles.summaryItem}>
                                <div className={styles.itemImgWrapper}>
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div className={styles.placeholderImg}><Package size={20} /></div>
                                    )}
                                </div>
                                <div className={styles.itemDetails}>
                                    <span className={styles.itemName}>{item.name} {item.variant && `- ${item.variant.name}`}</span>
                                    <span className={styles.itemQty}>Qté: {item.quantity}</span>
                                </div>
                                <div className={styles.itemPrice}>
                                    {(item.price * item.quantity).toFixed(2)}€
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.totals}>
                        <div className={styles.totalRow}>
                            <span>Sous-total</span>
                            <span>{cartTotal.toFixed(2)}€</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Livraison</span>
                            <span style={{ color: '#10B981', fontWeight: 'bold' }}>Offerts</span>
                        </div>
                        <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                            <span>Total (TTC)</span>
                            <span>{cartTotal.toFixed(2)}€</span>
                        </div>
                    </div>

                    <button
                        className={styles.confirmBtn}
                        onClick={handleConfirmOrder}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <><Loader2 size={18} className="animate-spin" /> Préparation du paiement...</>
                        ) : (
                            <>Continuer vers le paiement <ArrowRight size={18} /></>
                        )}
                    </button>

                    <p className={styles.secureText} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} /> Paiement 100% Sécurisé via PrestaShop
                    </p>
                </div>
            </div>

        </div>
    );
}
