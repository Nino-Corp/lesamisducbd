import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard.module.css';
import { Tag } from 'lucide-react';

/**
 * ProductCard — affiche un produit issu de l'API PrestaShop.
 * 
 * Props attendues (depuis mapPrestaProduct) :
 *  - id, name, slug, formattedPrice (ex: "18,96 €"), image, descriptionShort (HTML), onSale
 */
export default function ProductCard({ product }) {
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

    return (
        <Link href={`/produit/${product.slug}`} className={styles.card}>
            {/* Badge Promo */}
            {product.onSale && (
                <span className={styles.badge}>
                    <Tag size={11} /> Promo
                </span>
            )}

            {/* Image Produit */}
            <div className={styles.imageWrapper}>
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
            </div>
        </Link>
    );
}
