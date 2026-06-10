'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';
import { trackCTA } from '@/utils/analytics';

export default function Hero({ backgroundImage, title, description, ctaLabel, ctaLink, centered = false }) {
    return (
        <section className={styles.heroWrapper}>
            {backgroundImage && (
                <Image
                    src={backgroundImage}
                    alt={title || "Hero Image"}
                    fill
                    priority
                    quality={90}
                    className={styles.heroImage}
                    sizes="(max-width: 768px) 100vw, 100vw"
                />
            )}
            <div className={`${styles.glassCard} ${centered ? styles.centeredCard : ''}`}>
                <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: title }}></h1>
                <p className={styles.description} dangerouslySetInnerHTML={{ __html: description }}></p>
                <Link href={ctaLink || '/produits'} className={styles.ctaLink} onClick={() => trackCTA('home_hero_discover')}>
                    <button className={styles.cta}>{ctaLabel}</button>
                </Link>
            </div>
        </section>
    );
}
