
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from './ProductDetails.module.css';
import { ArrowLeft, Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { calculateGroupPrice } from '@/lib/utils/groupPricing';
import { SITE_URL } from '@/app/shared-metadata';
import ProductSchema from '@/components/JsonLd/ProductSchema';

const HEADER_PROPS = {
    logoText: "LES AMIS DU CBD",
    logoImage: "/images/logo.webp",
    menuItems: [
        { label: "PRODUITS", href: "/produits" },
        { label: "L'ESSENTIEL", href: "/essentiel" },
        { label: "CBD & USAGES", href: "/usages" },
        { label: "PROFESSIONNEL", href: "/professionnel" }
    ]
};

const FOOTER_PROPS = {
    columnLinks: [
        { label: "Livraison", href: "/livraison" },
        { label: "CGV", href: "/cgv" },
        { label: "Politique de confidentialité", href: "/privacy" },
        { label: "Transparence", href: "/transparence" },
        { label: "Professionnel", href: "/professionnel" }
    ],
    contactInfo: {
        title: "Les Amis du CBD France",
        address: "25 rue principale 07120 Chauzon (FR)",
        phone: "06 71 82 42 87",
        email: "lesamisducbd@gmail.com"
    },
    newsletter: {
        placeholder: "Votre adresse e-mail",
        disclaimer: "Vous pouvez vous désinscrire à tout moment."
    },
    copyright: "©2024 - Les Amis du CBD"
};

export default function ProductDetailsClient({ product, relatedProducts, globalContent }) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);

    const { data: session } = useSession();
    const groupId = session?.user?.id_default_group || 3;
    const groupPrice = calculateGroupPrice(product, groupId);

    const footerProps = {
        ...FOOTER_PROPS,
        newsletter: { ...FOOTER_PROPS.newsletter, isVisible: globalContent?.visibility?.newsletter !== false },
        columnLinks: globalContent?.footerLinks || FOOTER_PROPS.columnLinks,
        contactInfo: globalContent?.contact || FOOTER_PROPS.contactInfo
    };

    const handleAddToCart = () => {
        const pHT = groupPrice?.priceHT || product.priceHT || product.price || 0;
        const pTTC = groupPrice?.priceTTC || product.priceTTC || 0;

        // Pass the appropriate display price as 'price' for backwards compatibility,
        // but also include explicit priceHT and priceTTC for dual display.
        const displayPrice = groupPrice?.suggestShowHT ? pHT : pTTC;

        addItem({
            ...product,
            rawProduct: product, // Explicitly pass the raw product for future recalculations (e.g., login)
            price: displayPrice,
            priceHT: pHT,
            priceTTC: pTTC
        }, quantity);
    };

    const productUrl = `${SITE_URL}/produit/${product.slug}`;

    return (
        <main className={styles.main}>
            <ProductSchema product={product} productUrl={productUrl} />
            <Header {...HEADER_PROPS} bannerVisible={globalContent?.visibility?.headerBanner !== false} />

            <div className={styles.container}>
                <Link href="/produits" className={styles.backLink}>
                    <ArrowLeft size={20} /> Retour aux produits
                </Link>

                <div className={styles.productGrid}>
                    {/* Gallery Section */}
                    <div className={styles.gallery}>
                        <div className={styles.mainImageWrapper}>
                            <Image
                                src={product.image || '/images/placeholder.webp'}
                                alt={product.name}
                                fill
                                className={styles.mainImage}
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className={styles.details}>
                        <div className={styles.headerInfo}>
                            {product.tag && <span className={styles.tag}>{product.tag}</span>}
                            <h1 className={styles.title}>{product.name}</h1>
                        </div>

                        <div className={styles.priceSection}>
                            <div className={styles.priceMainRow}>
                                <span className={styles.price}>
                                    {groupPrice?.hasDiscount ? (
                                        <>
                                            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.6em', marginRight: '8px' }}>
                                                {product.formattedPrice}
                                            </span>
                                            <span style={{ color: '#d9534f' }}>
                                                {groupPrice.suggestShowHT ? groupPrice.formattedPriceHT : groupPrice.formattedPrice}
                                            </span>
                                        </>
                                    ) : (
                                        groupPrice.suggestShowHT ? groupPrice.formattedPriceHT : (product.formattedPrice || `${product.priceHT || product.priceTTC || 5} €`)
                                    )}
                                </span>
                                <span className={styles.taxLabel}>
                                    {groupPrice.suggestShowHT ? 'HT' : 'TTC'}
                                </span>
                            </div>

                            {(() => {
                                let perGramText = null;
                                const priceToUse = groupPrice.suggestShowHT ? groupPrice.priceHT : (groupPrice?.priceTTC || product.priceTTC || 0);

                                if (priceToUse > 0) {
                                    const searchString = `${product.name || ''} ${product.reference || ''}`.toLowerCase();
                                    const weightMatch = searchString.match(/(?:^|\s|-)(\d+(?:[.,]\d+)?)\s*g\b/);

                                    if (weightMatch) {
                                        const exactGrams = parseFloat(weightMatch[1].replace(',', '.'));
                                        if (exactGrams > 0) {
                                            const newPerGram = (priceToUse / exactGrams).toFixed(2).replace('.', ',');
                                            perGramText = `${newPerGram}€/g ${groupPrice.suggestShowHT ? 'HT' : ''}`;
                                        }
                                    }
                                }

                                if (!perGramText) return null;
                                return <div className={styles.perGramInfo}>{perGramText}</div>;
                            })()}
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.quantityControl}>
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                            <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                                Ajouter au panier
                            </button>
                        </div>

                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: product.description || product.descriptionShort || "<p>Une variété d'exception sélectionnée pour ses arômes intenses et ses effets relaxants. Cultivée dans le respect de l'environnement. Qualité premium.</p>" }}
                        />

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <div className={styles.iconBox}><Truck size={20} /></div>
                                <div>
                                    <strong>Livraison Rapide</strong>
                                    <p>Expédié sous 24h</p>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <div className={styles.iconBox}><ShieldCheck size={20} /></div>
                                <div>
                                    <strong>Paiement Sécurisé</strong>
                                    <p>CB, Visa, Mastercard</p>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <div className={styles.iconBox}><Heart size={20} /></div>
                                <div>
                                    <strong>Qualité Premium</strong>
                                    <p>100% Naturel, &lt;0.3% THC</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <section className={styles.relatedSection}>
                    <h2>Vous aimerez aussi</h2>
                    <div className={styles.relatedGrid}>
                        {relatedProducts.map(p => {
                            const relatedGroupPrice = calculateGroupPrice(p, groupId);

                            // Extract weight and per gram price
                            const searchString = `${p.name || ''} ${p.reference || ''}`.toLowerCase();
                            const weightMatch = searchString.match(/(?:^|\s|-)(\d+(?:[.,]\d+)?)\s*g\b/);
                            let exactGrams = null;
                            let perGramText = null;

                            const currentPrice = relatedGroupPrice.suggestShowHT ? relatedGroupPrice.priceHT : (relatedGroupPrice?.priceTTC || p.priceTTC || 0);

                            if (weightMatch) {
                                exactGrams = parseFloat(weightMatch[1].replace(',', '.'));
                                if (exactGrams > 0 && currentPrice > 0) {
                                    const newPerGram = (currentPrice / exactGrams).toFixed(2).replace('.', ',');
                                    perGramText = `${newPerGram}€/g`;
                                }
                            }

                            return (
                                <Link key={p.name} href={`/produit/${p.slug}`} className={styles.relatedCard}>
                                    <div className={styles.relatedImageWrapper}>
                                        <Image src={p.image || '/images/placeholder.webp'} alt={p.name} fill className={styles.relatedImage} sizes="(max-width: 768px) 50vw, 25vw" />
                                    </div>
                                    <div className={styles.relatedInfo}>
                                        <h3>{p.name}</h3>
                                        <div className={styles.relatedPriceRow}>
                                            <span className={styles.relatedPrice}>
                                                {relatedGroupPrice?.hasDiscount ? (
                                                    <>
                                                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8em', marginRight: '6px' }}>
                                                            {p.formattedPrice}
                                                        </span>
                                                        <span style={{ color: '#d9534f' }}>
                                                            {relatedGroupPrice.suggestShowHT ? relatedGroupPrice.formattedPriceHT : relatedGroupPrice.formattedPrice}
                                                        </span>
                                                    </>
                                                ) : (
                                                    relatedGroupPrice.suggestShowHT ? relatedGroupPrice.formattedPriceHT : (p.formattedPrice || `${p.priceHT || p.priceTTC || 5} €`)
                                                )}
                                            </span>
                                            <span className={styles.relatedTaxLabel}>
                                                {relatedGroupPrice.suggestShowHT ? 'HT' : 'TTC'}
                                            </span>
                                        </div>
                                        {perGramText && (
                                            <div className={styles.relatedPerGram}>{perGramText}</div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>

            <Footer {...footerProps} />
        </main>
    );
}
