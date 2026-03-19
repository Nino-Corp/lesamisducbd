
import { productService } from '@/lib/services/productService';
import { kv } from '@vercel/kv';
import ProductsClient from './ProductsClient';

import { SITE_URL } from '@/app/shared-metadata';

export const metadata = {
    title: 'Nos Fleurs CBD Premium | Les Amis du CBD',
    description: 'Découvrez notre sélection de fleurs de CBD françaises. Cultivées naturellement, sans ajout de terpènes chimiques. Livraison offerte.',
    alternates: {
        canonical: `${SITE_URL}/produits`,
    },
};

export const revalidate = 60; // ISR cache every minute

export default async function ProductsPage() {
    const [products, hiddenIds, globalContent, productOrder] = await Promise.all([
        productService.getProducts(),
        kv.get('hidden_products').catch(() => []),
        kv.get('global_content').catch(() => null),
        kv.get('product_order').catch(() => [])
    ]);

    const hidden = Array.isArray(hiddenIds) ? hiddenIds : [];
    let visibleProducts = hidden.length > 0
        ? products.filter(p => !hidden.includes(p.id))
        : products;

    if (Array.isArray(productOrder) && productOrder.length > 0) {
        visibleProducts.sort((a, b) => {
            const idxA = productOrder.indexOf(a.id);
            const idxB = productOrder.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return 0;
        });
    }

    return <ProductsClient initialProducts={visibleProducts} globalContent={globalContent} />;
}
