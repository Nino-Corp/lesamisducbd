'use client';

import { useSession } from 'next-auth/react';
import { ProductCardItem } from '../ProductList/ProductList';
import styles from './FeaturedProducts.module.css';

export default function FeaturedProductsClient({ title, subtitle, products, columns = 4 }) {
    const { data: session } = useSession();
    const groupId = session?.user?.id_default_group || 3;

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                {title && <h2 className={styles.title}>{title}</h2>}
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

                <div 
                    className={styles.grid}
                    style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${columns === 2 ? '300px' : '220px'}, 1fr))` }}
                >
                    {products.map((product, index) => (
                        <ProductCardItem
                            key={product.slug || index}
                            product={product}
                            index={index}
                            groupId={groupId}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
