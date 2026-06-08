'use client';

import React from 'react';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import ContentHero from '@/components/ContentHero/ContentHero';
import styles from '@/app/professionnel/page.module.css';

/* ProHero: ContentHero banner with badge + a text block below */
export function ProHero({ imageSrc, imagePosition, imageAlt, badgeText, title, text }) {
    return (
        <>
            <ContentHero
                imageSrc={imageSrc || "/images/professionnel/header-illustration.webp"}
                imageAlt={imageAlt || "Partenariat Professionnel"}
                imagePosition={imagePosition || "center 40%"}
            >
                <h2 className={styles.newBadge}>{badgeText || "Nous rejoindre ?"}</h2>
            </ContentHero>

            <div className={styles.heroTextContent}>
                <h1 className={styles.heroTitle}>{title}</h1>
                <div
                    className={styles.heroText}
                    dangerouslySetInnerHTML={{ __html: (text || '').replace(/\n/g, '<br />') }}
                />
            </div>
        </>
    );
}

/* ProSteps: the 3-column steps grid */
export function ProSteps({ title, steps }) {
    if (!steps || !steps.length) return null;
    return (
        <ScrollReveal animation="fade-up" delay={200}>
            <section className={styles.stepsSection}>
                <div className={styles.stepsContainer}>
                    <h2 className={styles.stepsTitle}>{title || "Comment devenir partenaire Les Amis du CBD ?"}</h2>
                    <div className={styles.stepsGrid}>
                        {steps.map((step, i) => (
                            <div key={i} className={styles.stepCard} style={{ alignItems: 'center', textAlign: 'center' }}>
                                <div className={styles.stepHeader}>{step.title}</div>
                                <div
                                    className={styles.stepText}
                                    dangerouslySetInnerHTML={{ __html: (step.text || '').replace(/\n/g, '<br />') }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </ScrollReveal>
    );
}
