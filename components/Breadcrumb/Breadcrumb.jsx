import Link from 'next/link';
import styles from './Breadcrumb.module.css';

export default function Breadcrumb({ items = [] }) {
    if (!items || items.length === 0) return null;
    return (
        <nav aria-label="Fil d'Ariane" className={styles.wrapper}>
            <ol className={styles.list} itemScope itemType="https://schema.org/BreadcrumbList">
                {items.map((item, i) => (
                    <li
                        key={i}
                        className={styles.item}
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        {i < items.length - 1 ? (
                            <>
                                <Link href={item.href} className={styles.link} itemProp="item">
                                    <span itemProp="name">{item.label}</span>
                                </Link>
                                <span className={styles.sep} aria-hidden="true">›</span>
                            </>
                        ) : (
                            <span className={styles.current} itemProp="name">{item.label}</span>
                        )}
                        <meta itemProp="position" content={String(i + 1)} />
                    </li>
                ))}
            </ol>
        </nav>
    );
}
