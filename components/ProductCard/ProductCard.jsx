'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard.module.css';
import { Tag, Sparkles } from 'lucide-react';
import { trackCTA } from '@/utils/analytics';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useLoyaltyRatio } from '@/hooks/useLoyaltyRatio';

/**
 * ProductCard — affiche un produit issu de l'API PrestaShop.
 * 
 * Props attendues (depuis mapPrestaProduct) :
 *  - id, name, slug, formattedPrice (ex: "18,96 €"), image, descriptionShort (HTML), onSale
 */
export default function ProductCard({ product }) {
    const { data: session } = useSession();
    const isPro = String(session?.user?.id_default_group) === "4";
    const ratio = useLoyaltyRatio();

    // Calcul du grammage & Prix au gramme
    const searchString = `${product.name || ''} ${product.reference || ''}`.toLowerCase();
    const weightMatch = searchString.match(/(?:^|\s|-)(\d+(?:[.,]\d+)?)\s*g\b/);
    let exactGrams = null;
    let perGramText = null;

    if (weightMatch) {
        exactGrams = parseFloat(weightMatch[1].replace(',', '.'));
        if (exactGrams > 0 && product.priceTTC > 0) {
            const newPerGram = (product.priceTTC / exactGrams).toFixed(2).replace('.', ',');
            perGramText = `${newPerGram}€/g TTC`;
        }
    }

    // Points de fidélité pour ce produit
    const loyaltyPoints = ratio > 0 ? Math.floor(product.priceTTC / ratio) : 0;

    return (
        <Link href={`/produit/${product.slug}`} style={{ textDecoration: 'none' }} onClick={() => trackCTA(`product_click_${product.slug}`)}>
            <motion.div
                className={styles.card}
                whileHover={{ y: -8, scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                {/* Badge Promo */}
                {product.onSale && (
                    <span className={styles.badge}>
                        <Tag size={11} /> Promo
                    </span>
                )}

                {/* Image Produit */}
                <motion.div
                    className={styles.imageWrapper}
                    layoutId={`product-image-${product.id}`}
                >
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        unoptimized // Image vient d'un serveur externe PrestaShop
                    />
                </div>

                {/* Infos */}
                <div className={styles.info}>
                    <h3 className={styles.name}>{product.name}</h3>

                    {/* Description courte (peut contenir du HTML) */}
                    {product.descriptionShort && (
                        <div
                            className={styles.desc}
                            dangerouslySetInnerHTML={{ __html: product.descriptionShort }}
                        />
                    )}

                    <div className={styles.footer}>
                        <div className={styles.priceBlock}>
                            <span className={styles.price}>
                                {product.suggestShowHT ? `${product.formattedPriceHT} HT` : product.formattedPrice}
                            </span>
                            {perGramText && (
                                <span className={styles.perGram}>
                                    dès {perGramText.replace(' TTC', '')}
                                </span>
                            )}
                        </div>
                        <button className={styles.cta}>Voir</button>
                    </div>

                    {/* Badge fidélité */}
                    {!isPro && loyaltyPoints > 0 && (
                        <div className={styles.loyaltyBadge}>
                            <Sparkles size={12} />
                            <span>+{loyaltyPoints} pts fidélité</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}
