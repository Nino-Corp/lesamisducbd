

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

    const [products, globalContent, overrides, hiddenIds, categoryOverrides] = await Promise.all([
        productService.getProducts(),
        kv.get('global_content').catch(() => null),
        kv.get('product_overrides').catch(() => null),
        kv.get('hidden_products').catch(() => []),
        kv.get('category_overrides').catch(() => ({}))
    ]);

    const hidden = Array.isArray(hiddenIds) ? hiddenIds : [];
    const catOverrides = categoryOverrides || {};

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

    // Helper to determine product category
    const getProductCategory = (p) => {
        if (catOverrides[p.id]) return catOverrides[p.id];
        const nameNorm = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const tagNorm = (p.tag || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (['plv', 'flyer', 'tourniquet', 'presentoir', 'accessoire', 'goodies', 'feuille', 'briquet', 'grinder'].some(k => nameNorm.includes(k) || tagNorm.includes(k))) return 'autre';
        if (['resine', 'hash', 'filtre', 'pollen'].some(k => nameNorm.includes(k) || tagNorm.includes(k))) return 'resine';
        if (['pack', 'mystere', 'decouverte'].some(k => nameNorm.includes(k) || tagNorm.includes(k))) return 'pack';
        if (['fleur', 'trim', 'mix', 'skunk', 'amnesia', 'gorilla', 'remedy', 'cbd', 'kush', 'haze', 'gelato'].some(k => nameNorm.includes(k) || tagNorm.includes(k)) || p.category === 3) return 'fleur';
        if (/(?:^|\s|-)(\d+(?:[.,]\d+)?)\s*g\b/.test(nameNorm)) return 'fleur';
        return 'autre';
    };

    const currentCategory = getProductCategory(product);

    // Pass related products (same category, exclude variations of the same strain and hidden products)
    let relatedProducts = products
        .filter(p => !hidden.includes(p.id))
        .filter(p => {
            const pBase = (p.name || '').replace(/\s*\d+(?:[.,]\d+)?\s*g\s*$/i, '').trim();
            return pBase.toLowerCase() !== baseName.toLowerCase();
        })
        .filter(p => getProductCategory(p) === currentCategory);
        
    // Shuffle randomly to vary the recommendations
    relatedProducts = relatedProducts.sort(() => 0.5 - Math.random()).slice(0, 4);

    return <ProductDetailsClient product={productWithOverrides} relatedProducts={relatedProducts} globalContent={globalContent} />;
}
