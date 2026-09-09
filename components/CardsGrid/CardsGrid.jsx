import styles from './CardsGrid.module.css';
import Image from 'next/image';

const ICONS = {
    leaf: '🌿', star: '⭐', shield: '🛡️', heart: '❤️',
    check: '✅', bolt: '⚡', globe: '🌍', truck: '🚚',
    award: '🏆', smile: '😊', fire: '🔥', lock: '🔒'
};

export default function CardsGrid({
    title = "",
    subtitle = "",
    columns = 3,
    cards = [
        { icon: 'leaf', title: 'Titre de la carte', text: 'Description courte.' },
        { icon: 'star', title: 'Deuxième carte', text: 'Description courte.' },
        { icon: 'shield', title: 'Troisième carte', text: 'Description courte.' },
    ],
    backgroundColor = "#f8f9fa",
    cardStyle = "shadow",
    headingTag = "h2",
    titleFontFamily = "inherit",
    ...props
}) {
    const Tag = headingTag;
    return (
        <section className={styles.section}>
            <div className={styles.bubble} style={{ backgroundColor }}>
                {(title || subtitle) && (
                    <div className={styles.header} style={{ textAlign: props.headerAlign || 'center' }}>
                        {title && <Tag className={styles.title} style={{ fontFamily: titleFontFamily }}>{title}</Tag>}
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>
                )}
                <div
                    className={styles.grid}
                    style={{ gridTemplateColumns: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))` }}
                >
                    {cards.map((card, i) => (
                        <div 
                            key={i} 
                            className={`${styles.card} ${cardStyle === 'border' ? styles.cardBorder : styles.cardShadow}`}
                            style={{ 
                                backgroundColor: card.bgColor || '#fff', 
                                color: card.textColor || 'inherit' 
                            }}
                        >
                            {card.imageSrc ? (
                                <div className={styles.cardImageWrapper}>
                                    <Image src={card.imageSrc} alt={card.title || ''} width={80} height={80} style={{ objectFit: 'contain' }} />
                                </div>
                            ) : (
                                card.icon && <span className={styles.cardIcon}>{ICONS[card.icon] || card.icon}</span>
                            )}
                            <h3 className={styles.cardTitle} style={{ color: card.textColor || '#1F4B40' }}>{card.title}</h3>
                            {card.text && <div className={styles.cardText} style={{ color: card.textColor ? 'inherit' : '#555' }} dangerouslySetInnerHTML={{ __html: card.text }} />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
