'use client';

import { useState, useEffect } from 'react';
import FeaturedProductsClient from './FeaturedProductsClient';

/**
 * Client-side wrapper for FeaturedProducts — used in the LivePreview (page builder).
 * The original FeaturedProducts is an async Server Component and cannot be rendered
 * inside a 'use client' tree. This component fetches products via the API route instead.
 */
function formatProductForCard(p) {
    return {
        name: p.name,
        slug: p.slug,
        image: p.image,
        quoteTitle: p.reference || '',
        tag: p.onSale ? 'Promo' : '',
        badgeColor: null,
        pillLeft: p.formattedPrice,
        pillRight: '',
        price: p.priceTTC,
        formattedPrice: p.formattedPrice,
        rawProduct: p
    };
}

export default function FeaturedProductsPreview({ title, subtitle, skus, columns }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        fetch('/api/products')
            .then(res => res.json())
            .then(allProducts => {
                if (cancelled) return;

                let filtered = [];
                if (skus) {
                    const skuList = skus.split(',').map(s => s.trim().toLowerCase());
                    filtered = allProducts.filter(p =>
                        p.reference && skuList.includes(p.reference.toLowerCase())
                    );
                } else {
                    filtered = allProducts.slice(0, columns || 4);
                }

                setProducts(filtered.map(formatProductForCard));
            })
            .catch(err => console.error('FeaturedProductsPreview fetch error:', err))
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [skus, columns]);

    if (loading) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                ⏳ Chargement des produits en vedette…
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                ⚠️ Aucun produit trouvé pour les références indiquées.
            </div>
        );
    }

    return (
        <FeaturedProductsClient
            title={title}
            subtitle={subtitle}
            columns={columns}
            products={products}
        />
    );
}
