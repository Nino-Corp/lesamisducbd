import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import styles from './Breadcrumb.module.css';

export default function Breadcrumb({ items = [] }) {
    if (!items || items.length === 0) return null;
    return (
        <nav aria-label="Fil d'Ariane" className={styles.wrapper}>
            <ol className={styles.list} itemScope itemType="https://schema.org/BreadcrumbList">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;
                    const isFirst = i === 0;

                    return (
                        <li
                            key={i}
                            className={`${styles.item} ${isLast ? styles.itemActive : ''}`}
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                        >
                            {!isLast ? (
                                <>
                                    <Link href={item.href} className={styles.link} itemProp="item">
                                        {isFirst && <Home size={14} className={styles.homeIcon} />}
                                        <span itemProp="name">{item.label}</span>
                                    </Link>
                                    <ChevronRight size={14} className={styles.sep} aria-hidden="true" />
                                </>
                            ) : (
                                <div className={styles.currentWrapper}>
                                    <span className={styles.current} itemProp="name">
                                        {item.label}
                                    </span>
                                </div>
                            )}
                            <meta itemProp="position" content={String(i + 1)} />
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
