
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
    const [products, hiddenIds, globalContent, productOrder, categoryOverrides, pageConfigData, productOverrides, productCategories] = await Promise.all([
        productService.getProducts(),
        kv.get('hidden_products').catch(() => []),
        kv.get('global_content').catch(() => null),
        kv.get('product_order').catch(() => []),
        kv.get('category_overrides').catch(() => ({})),
        kv.get('products_page_config').catch(() => null),
        kv.get('product_overrides').catch(() => ({})),
        kv.get('product_categories').catch(() => null)
    ]);

    const pageConfig = pageConfigData || {
        carousel: [
            { id: 1, title: "L'Essentiel du CBD", subtitle: "Découvrez notre sélection rigoureuse, pensée pour votre bien-être au quotidien.", image: "/images/hero.webp", buttonText: "Notre histoire", buttonLink: "/essentiel" },
            { id: 2, title: "La Qualité Premium", subtitle: "Des fleurs et résines exceptionnelles, cultivées avec passion pour des arômes uniques.", image: "/images/carousel_nature_cbd.png", buttonText: "Voir nos fleurs", buttonLink: "/produits?cat=fleur" },
            { id: 3, title: "Bien-être & Sérénité", subtitle: "Des conseils experts pour intégrer nos produits à votre routine détente.", image: "/images/carousel_wellness_cbd.png", buttonText: "Nos conseils", buttonLink: "/usages" }
        ],
        premiumBadge: { enabled: true, text: "Qualité Premium" }
    };

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

    // Analytics: increment view counter
    try {
    if (process.env.NODE_ENV !== 'development') {
        await kv.incr(`builder_views:produits`);
    }
    } catch (e) {
        console.error('Failed to increment view counter', e);
    }

    return <ProductsClient initialProducts={visibleProducts} globalContent={globalContent} categoryOverrides={categoryOverrides || {}} pageConfig={pageConfig} productOverrides={productOverrides || {}} productCategories={productCategories} />;
}
