import RelatedArticles from '@/components/RelatedArticles/RelatedArticles';
import { kv } from '@vercel/kv';

export default async function LatestArticlesBlock({ 
    title = "Nos derniers articles", 
    count = 3, 
    category = '',
    titleAlign = 'left',
    titleColor = '#1F4B40',
    backgroundColor = '#e3fff8',
    cardStyle = 'border',
    showImage = true,
    showExcerpt = true,
    showCategory = true,
    columns = 3
}) {
    try {
        const pages = (await kv.get('builder_pages')) || {};
        let articles = Object.values(pages)
            .filter(p => {
                const isPublished = !p.status || p.status === 'published';
                return ['Article', 'BlogPosting', 'LandingPage'].includes(p.seo?.pageType) && isPublished;
            });
        
        if (category) {
            articles = articles.filter(p => p.seo?.category === category);
        }

        const formattedArticles = articles
            .sort((a, b) => {
                const dateA = a.seo?.publishedAt || a.updatedAt;
                const dateB = b.seo?.publishedAt || b.updatedAt;
                return new Date(dateB) - new Date(dateA);
            })
            .slice(0, count)
            .map(a => ({
                title: a.title,
                href: `/p/${a.slug}`,
                excerpt: a.seo?.excerpt || '',
                category: a.seo?.category || '',
                image: a.seo?.featuredImage || a.seo?.ogImage || '/images/og-image.jpg'
            }));

        if (formattedArticles.length === 0) {
            return (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', color: '#64748b', margin: '20px auto', maxWidth: '800px' }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Bloc "Derniers Articles" (Invisible en production)</p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        {category 
                            ? `Aucun article publié trouvé pour la catégorie "${category}".` 
                            : "Aucun article publié n'a été trouvé sur le blog."}
                    </p>
                </div>
            );
        }

        return <RelatedArticles 
            title={title} 
            articles={formattedArticles} 
            titleAlign={titleAlign}
            titleColor={titleColor}
            backgroundColor={backgroundColor}
            cardStyle={cardStyle}
            showImage={showImage}
            showExcerpt={showExcerpt}
            showCategory={showCategory}
            columns={columns}
        />;
    } catch (e) {
        console.error("LatestArticlesBlock error:", e);
        return (
            <div style={{ padding: '40px', textAlign: 'center', background: '#fef2f2', border: '1px dashed #f87171', borderRadius: '12px', color: '#dc2626', margin: '20px auto', maxWidth: '800px' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Erreur de chargement des articles</p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Vérifiez les connexions à la base de données.</p>
            </div>
        );
    }
}
