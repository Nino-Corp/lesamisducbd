import { SITE_URL } from './shared-metadata';
import { productService } from '@/lib/services/productService';
import { kv } from '@vercel/kv';

export const revalidate = 3600; // Revalidate sitemap every hour

const ARTICLE_TYPES = ['Article', 'BlogPosting'];

export default async function sitemap() {
    // Fetch products and builder pages in parallel
    const [products, builderPages] = await Promise.all([
        productService.getProducts().catch(() => []),
        kv.get('builder_pages').catch(() => ({})),
    ]);

    const staticRoutes = [
        { url: `${SITE_URL}`, priority: 1.0, changeFrequency: 'weekly' },
        { url: `${SITE_URL}/produits`, priority: 0.9, changeFrequency: 'weekly' },
        { url: `${SITE_URL}/blog`, priority: 0.9, changeFrequency: 'daily' },
        { url: `${SITE_URL}/essentiel`, priority: 0.8, changeFrequency: 'monthly' },
        { url: `${SITE_URL}/usages`, priority: 0.8, changeFrequency: 'monthly' },
        { url: `${SITE_URL}/professionnel`, priority: 0.7, changeFrequency: 'monthly' },
        { url: `${SITE_URL}/qui-sommes-nous`, priority: 0.6, changeFrequency: 'monthly' },
        { url: `${SITE_URL}/transparence`, priority: 0.6, changeFrequency: 'monthly' },
        { url: `${SITE_URL}/recrutement`, priority: 0.5, changeFrequency: 'monthly' },
    ].map(r => ({ ...r, lastModified: new Date() }));

    const productRoutes = products.map((product) => ({
        url: `${SITE_URL}/produit/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Builder pages: only published, not noindex
    const builderRoutes = Object.values(builderPages || {})
        .filter(page => {
            const status = page.status || 'published';
            if (status === 'draft') return false;
            if (status === 'scheduled' && page.scheduledAt && new Date(page.scheduledAt) > new Date()) return false;
            if (page.seo?.noindex) return false;
            return true;
        })
        .map(page => {
            const isArticle = ARTICLE_TYPES.includes(page.seo?.pageType);
            return {
                url: `${SITE_URL}/p/${page.slug}`,
                lastModified: new Date(page.seo?.publishedAt || page.updatedAt || new Date()),
                changeFrequency: isArticle ? 'monthly' : 'weekly',
                priority: isArticle ? 0.9 : 0.7,
            };
        });

    return [...staticRoutes, ...productRoutes, ...builderRoutes];
}
