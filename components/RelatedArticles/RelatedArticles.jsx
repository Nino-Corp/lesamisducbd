import Link from 'next/link';
import Image from 'next/image';
import styles from './RelatedArticles.module.css';

export default function RelatedArticles({ 
    title = 'Articles similaires', 
    articles = [],
    titleAlign = 'left',
    titleColor = '#1F4B40',
    backgroundColor = '#e3fff8',
    cardStyle = 'border',
    showImage = true,
    showExcerpt = true,
    showCategory = true,
    columns = 3
}) {
    if (!articles || articles.length === 0) return null;
    return (
        <section className={styles.wrapper} style={{ backgroundColor }}>
            <div className={styles.container}>
                <h2 className={styles.title} style={{ textAlign: titleAlign, color: titleColor }}>{title}</h2>
                <div className={styles.grid} style={{ '--grid-cols': columns }}>
                    {articles.map((article, i) => (
                        <Link key={i} href={article.href || '#'} className={`${styles.card} ${styles[cardStyle] || styles.border}`}>
                            {showImage && article.image && (
                                <div className={styles.imgWrapper}>
                                    <img src={article.image} alt={article.title || ''} className={styles.img} />
                                </div>
                            )}
                            <div className={styles.cardBody}>
                                {showCategory && article.category && <span className={styles.category}>{article.category}</span>}
                                <h3 className={styles.cardTitle}>{article.title}</h3>
                                {showExcerpt && article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
                                <span className={styles.readMore}>Lire l'article →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
