import styles from './IconSummary.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function IconSummary({ items = [], backgroundColor = 'transparent' }) {
    if (!items || items.length === 0) return null;

    return (
        <section className={styles.section} style={{ backgroundColor }}>
            <div className={styles.container}>
                {items.map((item, i) => (
                    <Link href={item.link || '#'} key={i} className={styles.item}>
                        <div className={styles.iconWrapper}>
                            {item.imageSrc ? (
                                <Image src={item.imageSrc} alt={item.title || 'icon'} fill style={{ objectFit: 'contain' }} />
                            ) : (
                                <span className={styles.emoji}>{item.emoji || '✨'}</span>
                            )}
                        </div>
                        {item.title && <span className={styles.title}>{item.title}</span>}
                    </Link>
                ))}
            </div>
        </section>
    );
}
