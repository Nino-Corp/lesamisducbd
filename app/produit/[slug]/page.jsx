

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

    const [products, globalContent, overrides] = await Promise.all([
        productService.getProducts(),
        kv.get('global_content').catch(() => null),
        kv.get('product_overrides').catch(() => null)
    ]);

    // Verify slug matching using explicit slug field
    const product = products.find(p => p.slug === slug);

    if (!product) {
        notFound();
    }

    // Extract base name by stripping trailing weight (e.g. "Super Skunk 4g" -> "Super Skunk")
    const baseName = (product.name || '').replace(/\s*\d+(?:[.,]\d+)?\s*g\s*$/i, '').trim();

    // Apply admin overrides (description, descriptionShort) on top of PrestaShop data
    const productWithOverrides = overrides?.[product.id]
        ? { ...product, ...overrides[product.id] }
        : { ...product };

    // Find all products that share this base name to form the list of weight variations
    const variations = products
        .filter(p => {
            const pBase = (p.name || '').replace(/\s*\d+(?:[.,]\d+)?\s*g\s*$/i, '').trim();
            return pBase.toLowerCase() === baseName.toLowerCase();
        })
        .map(p => {
            const m = (p.name || '').match(/(\d+(?:[.,]\d+)?)\s*g/i);
            const weight = m ? parseFloat(m[1].replace(',', '.')) : 0;
            const varOverrides = overrides?.[p.id] ? overrides[p.id] : {};
            return {
                ...p,
                ...varOverrides,
                weight,
                label: weight > 0 ? `${weight}g` : p.name
            };
        })
        .sort((a, b) => {
            if (a.weight && b.weight) return a.weight - b.weight;
            return (a.priceTTC || 0) - (b.priceTTC || 0);
        });

    if (variations.length > 1) {
        productWithOverrides.variations = variations;
    }

    // Pass related products (exclude variations of the same strain)
    const relatedProducts = products
        .filter(p => {
            const pBase = (p.name || '').replace(/\s*\d+(?:[.,]\d+)?\s*g\s*$/i, '').trim();
            return pBase.toLowerCase() !== baseName.toLowerCase();
        })
        .slice(0, 4);

    return <ProductDetailsClient product={productWithOverrides} relatedProducts={relatedProducts} globalContent={globalContent} />;
}
