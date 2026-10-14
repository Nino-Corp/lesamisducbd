import { safeKvGet } from '@/lib/kvCache';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from './blog.module.css';
import { Newspaper } from 'lucide-react';

export const revalidate = 60;

export const metadata = {
    title: 'Blog CBD — Guides, conseils et actualités | Les Amis du CBD',
    description: 'Retrouvez tous nos articles sur le CBD : guides pratiques, conseils bien-être, actualités législatives et fiches produits rédigées par nos experts.',
    alternates: { canonical: '/blog' },
    openGraph: {
        title: 'Blog CBD — Les Amis du CBD',
        description: 'Guides, conseils et actualités sur le CBD.',
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
    },
};

const ARTICLE_TYPES = ['Article', 'BlogPosting', 'LandingPage'];

async function getArticles() {
    try {
        const pages = await safeKvGet('builder_pages', {}) || {};
        return Object.values(pages)
            .filter(p => ARTICLE_TYPES.includes(p.seo?.pageType) && (!p.status || p.status === 'published'))
            .sort((a, b) => {
                const dateA = a.seo?.publishedAt || a.updatedAt;
                const dateB = b.seo?.publishedAt || b.updatedAt;
                return new Date(dateB) - new Date(dateA);
            });
    } catch (e) {
        console.error('Blog page error:', e);
        return [];
    }
}

export default async function BlogPage(props) {
    const searchParams = await props?.searchParams || {};
    const selectedCat = searchParams.cat || null;

    const [articles, globalConfig] = await Promise.all([
        getArticles(),
        safeKvGet('global_content', null),
    ]);

    const headerProps = {
        logoText: 'LES AMIS DU CBD',
        logoImage: '/images/logo.webp',
        menuItems: globalConfig?.headerLinks || [
            { label: 'PRODUITS', href: '/produits' },
            { label: "L'ESSENTIEL", href: '/essentiel' },
            { label: 'CBD & USAGES', href: '/usages' },
            { label: 'PROFESSIONNEL', href: '/professionnel' },
        ],
    };

    // Get unique categories (including default ones if available)
    const dynamicCats = articles.map(a => a.seo?.category).filter(Boolean);
    const categories = [...new Set(dynamicCats)].sort();

    const filteredArticles = selectedCat
        ? articles.filter(a => (a.seo?.category || '').toLowerCase() === selectedCat.toLowerCase())
        : articles;

    return (
        <>
            <Header {...headerProps} />
            <main>
                {/* Hero */}
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <span className={styles.heroBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Newspaper size={14} /> Notre Blog</span>
                        <h1 className={styles.heroTitle}>Guides & Actualités CBD</h1>
                        <p className={styles.heroSub}>
                            Conseils d'experts, fiches pratiques et actualités sur le CBD — pour tout comprendre simplement.
                        </p>
                    </div>
                </section>

                <div className={styles.pageBody}>
                    {/* Category pills */}
                    {categories.length > 0 && (
                        <div className={styles.categories}>
                            <span className={styles.catLabel}>Catégories :</span>
                            <Link 
                                href="/blog"
                                className={`${styles.catPill} ${!selectedCat ? styles.catPillActive : ''}`}
                            >
                                Tous les articles
                            </Link>
                            {categories.map(cat => (
                                <Link 
                                    key={cat} 
                                    href={`/blog?cat=${encodeURIComponent(cat)}`}
                                    className={`${styles.catPill} ${selectedCat?.toLowerCase() === cat.toLowerCase() ? styles.catPillActive : ''}`}
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    )}

                    {filteredArticles.length === 0 ? (
                        <div className={styles.empty}>
                            <p>{selectedCat ? `Aucun article trouvé dans la catégorie "${selectedCat}".` : 'Aucun article publié pour le moment.'}</p>
                            {selectedCat ? (
                                <Link href="/blog" className={styles.catPill} style={{ marginTop: '16px', display: 'inline-flex' }}>
                                    ← Voir tous les articles
                                </Link>
                            ) : (
                                <p>Revenez bientôt !</p>
                            )}
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {filteredArticles.map((article, i) => {
                                const seo = article.seo || {};
                                const image = seo.featuredImage || seo.ogImage || '/images/og-image.jpg';
                                const pubDate = seo.publishedAt
                                    ? new Date(seo.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : new Date(article.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

                                // Estimate reading time (approx. 200 words/min)
                                const wordCount = (seo.excerpt || '').split(' ').length + 100;
                                const readTime = Math.max(1, Math.round(wordCount / 200));

                                return (
                                    <article key={article.slug} className={`${styles.card} ${i === 0 && !selectedCat ? styles.cardFeatured : ''}`}>
                                        <Link href={`/p/${article.slug}`} className={styles.cardLink}>
                                            <div className={styles.cardImg}>
                                                <img src={image} alt={article.title} />
                                                {seo.category && <span className={styles.cardCategory}>{seo.category}</span>}
                                            </div>
                                            <div className={styles.cardBody}>
                                                <div className={styles.cardMeta}>
                                                    <time dateTime={seo.publishedAt || article.updatedAt}>{pubDate}</time>
                                                    <span>·</span>
                                                    <span>{readTime} min de lecture</span>
                                                    {seo.author && <><span>·</span><span>par {seo.author}</span></>}
                                                </div>
                                                <h2 className={styles.cardTitle}>{article.title}</h2>
                                                {seo.excerpt && <p className={styles.cardExcerpt}>{seo.excerpt}</p>}
                                                <span className={styles.readMore}>Lire l'article →</span>
                                            </div>
                                        </Link>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer
                columnLinks={globalConfig?.footerLinks || []}
                contactInfo={globalConfig?.contact || {}}
                newsletter={{ placeholder: 'Votre adresse e-mail', disclaimer: 'Vous pouvez vous désinscrire à tout moment.' }}
                copyright="©2024 - Les Amis du CBD"
            />
        </>
    );
}
