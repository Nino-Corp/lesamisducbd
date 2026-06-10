'use client';

import React from 'react';
import UsagesCarousel from '@/components/UsagesCarousel/UsagesCarousel';
import styles from './UsagesBlocks.module.css';

export function UsagesIntro({ title, text }) {
    if (!title && !text) return null;
    return (
        <section className={styles.introSection}>
            {title && <h2 className={styles.introTitle} dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br />') }} />}
            {text && <div className={styles.introText} dangerouslySetInnerHTML={{ __html: text }} />}
        </section>
    );
}

export function UsagesCarouselBlock({ title, items }) {
    return (
        <section className={styles.carouselSection}>
            {title && <h2 className={styles.carouselTitle} dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br />') }} />}
            <UsagesCarousel items={items || []} />
        </section>
    );
}

export function UsagesWarning({ title, responsibleTitle }) {
    return (
        <section className={styles.warningSection}>
            {title && (
                <h2 className={styles.warningTitle}>
                    <span dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br />') }} />
                </h2>
            )}
            {responsibleTitle && (
                <div className={styles.responsibleSection}>
                    <h3 className={styles.responsibleTitle} dangerouslySetInnerHTML={{ __html: responsibleTitle.replace(/\n/g, '<br />') }} />
                </div>
            )}
        </section>
    );
}

export function UsagesEssentialBox({ title, items }) {
    if (!items || !items.length) return null;
    return (
        <section className={styles.essentialSection}>
            <div className={styles.essentialBox}>
                {title && <h3 className={styles.essentialTitle}>{title}</h3>}
                <ul className={styles.essentialList}>
                    {items.map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ul>
            </div>
        </section>
    );
}
