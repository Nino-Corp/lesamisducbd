import Image from 'next/image';
import Link from 'next/link';
import styles from './ImageCardsGrid.module.css';
import { Leaf, Star, Shield, Heart, CheckCircle2, Zap, Globe, Truck, Award, Smile, Flame, Lock, Users, Sprout, FlaskConical } from 'lucide-react';

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
    lock: Lock,
    users: Users,
    sprout: Sprout,
    flask: FlaskConical
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
    backgroundColor = "transparent",
    cardBgColor = "#e3fff8"
}) {
    return (
        <section className={styles.section} style={{ backgroundColor }}>
            <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)` }}>
                {cards.map((card, i) => (
                    <div key={i} className={styles.card} style={{ backgroundColor: cardBgColor }}>
                        {card.heroImage && (
                            <div className={`${styles.imageContainer} hover-zoom-wrapper`}>
                                <Image 
                                    src={card.heroImage} 
                                    alt={card.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        )}
                        <div className={styles.content}>
                            {card.icon && card.icon !== 'none' && (
                                <div className={styles.iconWrapper}>
                                    {(() => {
                                        const IconComp = ICONS[card.icon];
                                        if (IconComp) {
                                            return <IconComp size={24} color="#1F4B40" />;
                                        }
                                        return <span className={styles.icon}>{card.icon}</span>;
                                    })()}
                                </div>
                            )}
                            <h3 className={styles.title}>{card.title}</h3>
                            <div className={styles.description} dangerouslySetInnerHTML={{ __html: card.description }}></div>
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
