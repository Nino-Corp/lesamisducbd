import { SITE_URL } from './shared-metadata';
import { productService } from '@/lib/services/productService';

export default async function sitemap() {
    // Fetch all products from PrestaShop
    const products = await productService.getProducts();

    const staticRoutes = [
        '',
        '/professionnels',
        '/essentiel',
        '/usages',
        '/recrutement',
        '/qui-sommes-nous',
        '/produits',
        '/transparence'
    ].map((route) => {
        if (route === '/professionnels') {
            return {
                url: `${SITE_URL}/professionnels`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            };
        }
        return {
            url: `${SITE_URL}${route}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: route === '' ? 1 : 0.8,
        };
    });

    const productRoutes = products.map((product) => ({
        url: `${SITE_URL}/produit/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
}
