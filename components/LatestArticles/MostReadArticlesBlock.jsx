import RelatedArticles from '@/components/RelatedArticles/RelatedArticles';
import { kv } from '@vercel/kv';
import styles from './ArticlesPlaceholder.module.css';

export default async function MostReadArticlesBlock({ 
    title = "Les plus lus du moment", 
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

        if (articles.length === 0) {
            if (process.env.NODE_ENV !== 'production') {
                return (
                    <div className={styles.box}>
                        <p className={styles.heading}>Bloc "Les plus lus" (Invisible en production)</p>
                        <p className={styles.text}>
                            {category 
                                ? `Aucun article publié trouvé pour la catégorie "${category}".` 
                                : "Aucun article publié n'a été trouvé sur le blog."}
                        </p>
                    </div>
                );
            }
            return null;
        }

        // Fetch views for all matching articles
        const viewKeys = articles.map(a => `builder_views:${a.slug}`);
        const viewsData = viewKeys.length > 0 ? await kv.mget(...viewKeys) : [];

        // Assign views and sort
        const sortedArticles = articles
            .map((a, i) => ({ ...a, views: parseInt(viewsData[i]) || 0 }))
            .sort((a, b) => b.views - a.views)
            .slice(0, count);

        const formattedArticles = sortedArticles.map(a => ({
            title: a.title,
            href: `/p/${a.slug}`,
            excerpt: a.seo?.excerpt,
            category: a.seo?.category,
            image: a.seo?.featuredImage || a.seo?.ogImage || '/images/og-image.jpg'
        }));

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
        console.error("MostReadArticlesBlock error:", e);
        if (process.env.NODE_ENV !== 'production') {
            return (
                <div className={`${styles.box} ${styles.error}`}>
                    <p className={styles.heading}>Erreur de chargement des articles</p>
                    <p className={styles.text}>Vérifiez les connexions à la base de données.</p>
                </div>
            );
        }
        return null;
    }
}
