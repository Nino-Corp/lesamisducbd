import Link from 'next/link';
import Image from 'next/image';
import styles from './RelatedArticles.module.css';

export default function RelatedArticles({ title = 'Articles similaires', articles = [] }) {
    if (!articles || articles.length === 0) return null;
    return (
        <section className={styles.wrapper}>
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.grid}>
                    {articles.map((article, i) => (
                        <Link key={i} href={article.href || '#'} className={styles.card}>
                            {article.image && (
                                <div className={styles.imgWrapper}>
                                    <img src={article.image} alt={article.title || ''} className={styles.img} />
                                </div>
                            )}
                            <div className={styles.cardBody}>
                                {article.category && <span className={styles.category}>{article.category}</span>}
                                <h3 className={styles.cardTitle}>{article.title}</h3>
                                {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
                                <span className={styles.readMore}>Lire l'article →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
