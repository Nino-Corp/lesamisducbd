

import { kv } from '@vercel/kv';
import { productService } from '@/lib/services/productService';
import ProductDetailsClient from './ProductDetailsClient';
import { notFound } from 'next/navigation';
import { stripHtml, truncateText } from '@/lib/utils/stringUtils';
import { SITE_URL } from '@/app/shared-metadata';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await productService.getProducts();
    const foundProduct = product.find(p => p.slug === slug);

    if (!foundProduct) {
        return {
            title: 'Produit introuvable | Les Amis du CBD',
        };
    }

    const cleanDescription = truncateText(stripHtml(foundProduct.description), 160) || `Découvrez ${foundProduct.name}, une fleur de CBD d'exception. Cultivée avec soin, arômes puissants.`;
    const productUrl = `${SITE_URL}/produit/${slug}`;

    return {
        title: `${foundProduct.name} - CBD Premium | Les Amis du CBD`,
        description: cleanDescription,
        alternates: {
            canonical: productUrl,
        },
        openGraph: {
            title: `${foundProduct.name} - CBD Premium | Les Amis du CBD`,
            description: cleanDescription,
            url: productUrl,
            images: [
                {
                    url: foundProduct.image || '/images/og-image.jpg',
                    width: 800,
                    height: 800,
                    alt: foundProduct.name,
                }
            ],
        },
    };
}

export const revalidate = 60;

export default async function ProductPage({ params }) {
    const { slug } = await params;

    const [products, globalContent] = await Promise.all([
        productService.getProducts(),
        kv.get('global_content').catch(() => null)
    ]);

    // Verify slug matching using explicit slug field
    const product = products.find(p => p.slug === slug);

    if (!product) {
        notFound();
    }

    // Pass related products (just first 3 others for now)
    const relatedProducts = products.filter(p => p.name !== product.name).slice(0, 3);

    return <ProductDetailsClient product={product} relatedProducts={relatedProducts} globalContent={globalContent} />;
}
