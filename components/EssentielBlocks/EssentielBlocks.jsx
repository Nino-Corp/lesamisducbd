'use client';

import React from 'react';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import UsagesCarousel from '@/components/UsagesCarousel/UsagesCarousel';
import styles from '@/app/essentiel/page.module.css';

export function EssentielIntro({ items }) {
    if (!items || !items.length) return null;
    return (
        <ScrollReveal animation="fade-up">
            <section className={styles.introSection}>
                {items.map((para, i) => (
                    <div key={i} className={styles.introText} dangerouslySetInnerHTML={{ __html: para }} />
                ))}
            </section>
        </ScrollReveal>
    );
}

export function EssentielCarousel({ title, intro, items }) {
    if (!items || !items.length) return null;
    return (
        <ScrollReveal animation="fade-up" delay={200}>
            <section className={styles.carouselSection}>
                {title && <h2 className={styles.sectionTitle} dangerouslySetInnerHTML={{ __html: title }} />}
                {intro && <div className={styles.sectionIntro} dangerouslySetInnerHTML={{ __html: intro || '' }} />}
                <UsagesCarousel items={items} />
            </section>
        </ScrollReveal>
    );
}

export function EssentielPoints({ items }) {
    if (!items || !items.length) return null;
    return (
        <ScrollReveal animation="scale-up" duration={800}>
            <section className={styles.essentialSection}>
                <div className={styles.essentialBox}>
                    <h3 className={styles.essentialTitle}>L'essentiel à retenir<br />sur le CBD :</h3>
                    <ul className={styles.essentialList}>
                        {items.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                </div>
            </section>
        </ScrollReveal>
    );
}
