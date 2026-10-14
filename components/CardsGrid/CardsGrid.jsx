import styles from './CardsGrid.module.css';
import Image from 'next/image';
import { Leaf, Star, Shield, Heart, CheckCircle2, Zap, Globe, Truck, Award, Smile, Flame, Lock } from 'lucide-react';

const ICONS = {
    leaf: Leaf,
    star: Star,
    shield: Shield,
    heart: Heart,
    check: CheckCircle2,
    bolt: Zap,
    globe: Globe,
    truck: Truck,
    award: Award,
    smile: Smile,
    fire: Flame,
    lock: Lock
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
    backgroundColor = "#e3fff8",
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
                                backgroundColor: card.bgColor || '#e3fff8', 
                                color: card.textColor || 'inherit' 
                            }}
                        >
                            {card.imageSrc ? (
                                <div className={`${styles.cardImageWrapper} hover-zoom-wrapper`}>
                                    <Image src={card.imageSrc} alt={card.title || ''} width={80} height={80} style={{ objectFit: 'contain' }} />
                                </div>
                            ) : (() => {
                                const IconComp = ICONS[card.icon];
                                if (IconComp) {
                                    return (
                                        <div className={styles.cardIcon} style={{ display: 'flex', alignItems: 'center', color: card.textColor || '#1F4B40' }}>
                                            <IconComp size={36} />
                                        </div>
                                    );
                                }
                                return card.icon ? <span className={styles.cardIcon}>{card.icon}</span> : null;
                            })()}
                            <h3 className={styles.cardTitle} style={{ color: card.textColor || '#1F4B40' }}>{card.title}</h3>
                            {card.text && <div className={styles.cardText} style={{ color: card.textColor ? 'inherit' : '#555' }} dangerouslySetInnerHTML={{ __html: card.text }} />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
