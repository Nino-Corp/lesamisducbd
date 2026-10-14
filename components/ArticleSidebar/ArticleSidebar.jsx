'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import styles from './ArticleSidebar.module.css';
import { Sprout } from 'lucide-react';

export default function ArticleSidebar({ categories = [], relatedArticles = [], containerNode = null }) {
    const [toc, setToc] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
    const listRef = useRef(null);

    useEffect(() => {
        // Extract H2s and H3s from the article content
        const root = containerNode || document;
        const headings = Array.from(root.querySelectorAll('.article-content h2, .article-content h3')).filter(h => {
            const text = (h.textContent || '').replace(/[\s\u200B-\u200D\uFEFF]/g, '');
            return text.length > 0;
        });

        const tocItems = headings.map((h, index) => {
            if (!h.id) h.id = `heading-${index}`;
            return {
                id: h.id,
                text: (h.innerText || h.textContent || '').trim(),
                level: h.tagName.toLowerCase() === 'h3' ? 3 : 2
            };
        });
        setToc(tocItems);

        // Setup Intersection Observer for active heading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        }, { rootMargin: '0px 0px -80% 0px' });

        headings.forEach(h => observer.observe(h));
        return () => observer.disconnect();
    }, [containerNode]);

    useEffect(() => {
        if (!activeId || !listRef.current) return;
        const activeLi = listRef.current.querySelector(`[data-id="${activeId}"]`);
        if (activeLi) {
            setIndicatorStyle({
                top: activeLi.offsetTop,
                height: activeLi.offsetHeight,
                opacity: 1
            });
        }
    }, [activeId, toc]);

    const suggestedArticles = (relatedArticles || []).slice(0, 2);

    return (
        <aside className={styles.sidebar}>
            {toc.length > 0 && (
                <div className={styles.widget}>
                    <h3 className={styles.widgetTitle}>Au programme !</h3>
                    <div className={styles.tocContainer}>
                        <div className={styles.sliderIndicator} style={indicatorStyle} />
                        <ul className={styles.tocList} ref={listRef}>
                            {toc.map(item => (
                                <li 
                                    key={item.id} 
                                    data-id={item.id} 
                                    className={`${activeId === item.id ? styles.activeToc : ''} ${item.level === 3 ? styles.tocH3 : ''}`}
                                >
                                    <a 
                                        href={`#${item.id}`} 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const rootDoc = containerNode ? (containerNode.ownerDocument || document) : document;
                                            rootDoc.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {suggestedArticles.length > 0 ? (
                <div className={styles.widget}>
                    <h3 className={styles.widgetTitle}>La suite, c'est par ici !</h3>
                    <div className={styles.relatedList}>
                        {suggestedArticles.map((article, i) => (
                            <Link 
                                key={article.slug || i} 
                                href={article.slug && article.slug !== '#' ? `/p/${article.slug}` : (article.slug === '#' ? '#' : '/blog')} 
                                className={styles.relatedCard}
                            >
                                {article.image ? (
                                    <div className={styles.relatedImgWrapper}>
                                        <img src={article.image} alt={article.title} className={styles.relatedImg} />
                                    </div>
                                ) : (
                                    <div className={styles.relatedImgPlaceholder}>
                                        <Sprout size={22} color="#1F4B40" />
                                    </div>
                                )}
                                <div className={styles.relatedContent}>
                                    {article.category && (
                                        <span className={styles.relatedCat}>{article.category}</span>
                                    )}
                                    <h4 className={styles.relatedTitle}>{article.title}</h4>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <Link href="/blog" className={styles.discoverBtn}>
                        <span>Encore plus à découvrir</span>
                        <span className={styles.discoverArrow}>→</span>
                    </Link>
                </div>
            ) : (
                <div className={styles.widget}>
                    <Link href="/blog" className={styles.discoverBtn}>
                        <span>Encore plus à découvrir</span>
                        <span className={styles.discoverArrow}>→</span>
                    </Link>
                </div>
            )}
        </aside>
    );
}
