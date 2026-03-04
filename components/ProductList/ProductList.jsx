'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { calculateGroupPrice } from '@/lib/utils/groupPricing';
import styles from './ProductList.module.css';

function ProductCardItem({ product, index, groupId }) {
    const [selectedVariant, setSelectedVariant] = useState(product.variations ? product.variations[0] : product);

    const currentRaw = selectedVariant.rawProduct || product.rawProduct;
    const groupPrice = currentRaw ? calculateGroupPrice(currentRaw, groupId) : null;

    const displayPrice = groupPrice?.suggestShowHT ? `${groupPrice.formattedPriceHT} HT` :
        (groupPrice?.hasDiscount ? groupPrice.formattedPrice : selectedVariant.formattedPrice || product.formattedPrice);

    // Show original strike-through if discounted
    const originalPriceHTML = (groupPrice?.hasDiscount)
        ? `<span style="text-decoration: line-through; color: #999; font-size: 0.8em; margin-right: 6px;">${selectedVariant.formattedPrice || product.formattedPrice}</span><span style="color: #d9534f; font-weight: bold;">${displayPrice}</span>`
        : displayPrice;

    // Calculate weight and per-gram price
    const searchString = `${selectedVariant.name || product.name || ''} ${currentRaw?.reference || ''}`.toLowerCase();
    const weightMatch = searchString.match(/(?:^|\s|-)(\d+(?:[.,]\d+)?)\s*g\b/);

    // Fallback to weight property from app/page.js grouping
    const exactGrams = selectedVariant.weight || (weightMatch ? parseFloat(weightMatch[1].replace(',', '.')) : null);
    let perGramText = null;

    if (exactGrams) {
        const priceToUse = groupPrice?.suggestShowHT ? groupPrice.priceHT : (groupPrice?.priceTTC || 0);
        if (priceToUse > 0) {
            const newPerGram = (priceToUse / exactGrams).toFixed(2).replace('.', ',');
            perGramText = `${newPerGram}€/g`;
        }
    }

    return (
        <div className={styles.card}>
            {product.tag && (
                <span
                    className={styles.badge}
                    style={product.badgeColor ? { backgroundColor: product.badgeColor } : {}}
                >
                    {product.tag}
                </span>
            )}

            <div className={styles.topInfo}>
                <div className={styles.subtitlePill}>{product.name}</div>
                <h3 className={styles.quoteTitle}>{product.quoteTitle}</h3>
            </div>

            <div className={styles.imageContainer}>
                <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    priority={index < 4}
                    unoptimized
                    className={styles.productImage}
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
            </div>

            {/* Price / Selection Display */}
            {!product.variations || product.variations.length === 0 ? (
                <div className={styles.pillsContainer}>
                    <span className={styles.pillLeft} dangerouslySetInnerHTML={{ __html: originalPriceHTML }}></span>
                    {exactGrams && (
                        <span className={styles.pillRight}>{exactGrams}G</span>
                    )}
                </div>
            ) : (
                <div className={styles.variationSelector}>
                    {product.variations.map(v => {
                        const vPriceInfos = calculateGroupPrice(v.rawProduct, groupId);
                        const vDisplayPrice = vPriceInfos.suggestShowHT ? `${vPriceInfos.formattedPriceHT} HT` : vPriceInfos.formattedPrice;

                        return (
                            <button
                                key={v.slug}
                                className={`${styles.variationBtn} ${selectedVariant.slug === v.slug ? styles.active : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedVariant(v);
                                }}
                            >
                                {v.weight}G = {vDisplayPrice}
                            </button>
                        );
                    })}
                </div>
            )}

            <Link href={`/produit/${selectedVariant.slug}`} className={styles.ctaLink}>
                <button className={styles.cta}>Découvrir cette variété</button>
            </Link>

            {perGramText && (
                <div className={styles.perGramList}>Le gramme à partir de {perGramText}</div>
            )}
        </div>
    );
}

export default function ProductList({ title, description, linkLabel, linkHref, products }) {
    const titleParts = title.split(' pour ');
    const { data: session } = useSession();
    const groupId = session?.user?.id_default_group || 3;

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                {/* Header: Title & Description (Outside Gradient) */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {titleParts[0]} <br /> pour {titleParts[1]}
                    </h2>
                    <div className={styles.descriptionWrapper}>
                        <p className={styles.description} dangerouslySetInnerHTML={{ __html: description }}></p>
                    </div>
                </div>

                {/* Product Grid Container (Green Gradient + Rounded) */}
                <div className={styles.productsContainer}>
                    <div className={styles.grid}>
                        {products.map((product, index) => (
                            <ProductCardItem
                                key={index}
                                product={product}
                                index={index}
                                groupId={groupId}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer: View All Link */}
                <div className={styles.footer}>
                    <Link href={linkHref} className={styles.viewAll}>
                        {linkLabel} <ArrowRight size={16} className={styles.arrowIcon} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
