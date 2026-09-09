import Image from 'next/image';
import Link from 'next/link';
import styles from './ImageCardsGrid.module.css';

const ICONS = {
    leaf: '🌿', star: '⭐', shield: '🛡️', heart: '❤️',
    check: '✅', bolt: '⚡', globe: '🌍', truck: '🚚',
    award: '🏆', smile: '😊', fire: '🔥', lock: '🔒',
    users: '👥', sprout: '🌱', flask: '🧪'
};

export default function ImageCardsGrid({
    columns = 3,
    cards = [
        {
            heroImage: '/images/placeholder.jpg',
            icon: 'users',
            title: 'Notre histoire',
            description: 'Une bande de potes, l\'Ardèche et une passion qui ne date pas d\'hier.',
            linkText: 'Découvrir notre histoire',
            linkUrl: '/notre-histoire'
        }
    ],
    backgroundColor = "transparent"
}) {
    return (
        <section className={styles.section} style={{ backgroundColor }}>
            <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)` }}>
                {cards.map((card, i) => (
                    <div key={i} className={styles.card}>
                        <div className={styles.imageContainer}>
                            <Image 
                                src={card.heroImage || '/images/placeholder.jpg'} 
                                alt={card.title}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div className={styles.content}>
                            <div className={styles.iconWrapper}>
                                {card.icon && <span className={styles.icon}>{ICONS[card.icon] || card.icon}</span>}
                            </div>
                            <h3 className={styles.title}>{card.title}</h3>
                            <p className={styles.description} dangerouslySetInnerHTML={{ __html: card.description }}></p>
                            {card.linkText && (
                                <Link href={card.linkUrl || '#'} className={styles.link}>
                                    {card.linkText} <span className={styles.arrow}>→</span>
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
