'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

// Importing existing components
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import WhyChooseUs from '@/components/WhyChooseUs/WhyChooseUs';
import OfferComparator from '@/components/OfferComparator/OfferComparator';

// Icons
import { ArrowRight, CheckCircle, TrendingUp, Truck } from 'lucide-react';

import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import ContentHero from '@/components/ContentHero/ContentHero';

export default function BuralisteClient({ content, globalContent }) {

    const headerProps = {
        bannerVisible: globalContent?.visibility?.headerBanner !== false,

        logoText: "LES AMIS DU CBD",
        logoImage: "/images/logo.webp",
        menuItems: [
            { label: "PRODUITS", href: "/produits" },
            { label: "L'ESSENTIEL", href: "/essentiel" },
            { label: "CBD & USAGES", href: "/usages" },
            { label: "PROFESSIONNEL", href: "/buraliste" }
        ]
    };

    const footerProps = {
        columnLinks: globalContent?.footerLinks || [
            { label: "Livraison", href: "/livraison" },
            { label: "CGV", href: "/cgv" },
            { label: "Politique de confidentialité", href: "/privacy" },
            { label: "Transparence", href: "/transparence" },
            { label: "Professionnel", href: "/buraliste" }
        ],
        contactInfo: globalContent?.contact || {
            title: "Les Amis du CBD France",
            address: "25 rue principale 07120 Chauzon (FR)",
            phone: "06 71 82 42 87",
            email: "lesamisducbd@gmail.com"
        },
        newsletter: {
            placeholder: "Votre adresse e-mail",
            disclaimer: "Vous pouvez vous désinscrire à tout moment."
        },
        copyright: "©2024 - Les Amis du CBD"
    };

    const whyChooseUsFeatures1 = content.features1;
    const whyChooseUsFeatures2 = content.features2;
    const visibility = content.visibility || {};


    return (
        <div className={styles.pageWrapper}>
            {/* HEADER */}
            <Header {...headerProps} />

            <main>
                {/* HERO SECTION */}
                {visibility.hero !== false && (
                    <>
                        <ContentHero
                            imageSrc="/images/buraliste/header-illustration.webp"
                            imageAlt="Partenariat Professionnel"
                            imagePosition="center 40%"
                        >
                            <h2 className={styles.newBadge}>Nous rejoindre ?</h2>
                        </ContentHero>

                        {/* Text below the hero image banner */}
                        <div className={styles.heroTextContent}>
                            <h1 className={styles.heroTitle}>{content.hero.title}</h1>
                            <div className={styles.heroText}
                                dangerouslySetInnerHTML={{ __html: content.hero.text.replace(/\n/g, '<br />') }}
                            />
                        </div>
                    </>
                )}

                {/* CALCULATOR SECTION */}
                {visibility.calculator !== false && (
                    <ScrollReveal animation="fade-up">
                        <section className={styles.calculatorSection}>
                            <div className={styles.calculatorContainer}>
                                <OfferComparator />
                            </div>
                        </section>
                    </ScrollReveal>
                )}

                {/* WHY CHOOSE US - Section 1 (Scientist) */}
                {visibility.features1 !== false && (
                    <ScrollReveal animation="fade-up" delay={200}>
                        <WhyChooseUs
                            title="Pourquoi choisir Les Amis du CBD pour votre Boutique ?"
                            features={whyChooseUsFeatures1}
                            ctaLabel=""
                            imageSrc="/images/whychooseus/Scientist.webp"
                            imageAlt="Expert Professionnel"
                        />
                    </ScrollReveal>
                )}

                {/* WHY CHOOSE US - Section 2 (Woman, Reversed) */}
                {visibility.features2 !== false && (
                    <ScrollReveal animation="fade-up" delay={200}>
                        <WhyChooseUs
                            title=""
                            features={whyChooseUsFeatures2}
                            ctaLabel=""
                            imageSrc="/images/whychooseus/Woman.webp"
                            imageAlt="Partenaire satisfaite"
                            isReversed={true}
                        />
                    </ScrollReveal>
                )}

                {/* STEPS SECTION */}
                {visibility.steps !== false && (
                    <ScrollReveal animation="fade-up" delay={200}>
                        <section className={styles.stepsSection}>
                            <div className={styles.stepsContainer}>
                                <h2 className={styles.stepsTitle}>Comment devenir partenaire Les Amis du CBD ?</h2>
                                <div className={styles.stepsGrid}>
                                    {content.steps.map((step, i) => (
                                        <div key={i} className={styles.stepCard} style={{ alignItems: 'center', textAlign: 'center' }}>
                                            <div className={styles.stepHeader}>{step.title}</div>
                                            <div className={styles.stepText}
                                                dangerouslySetInnerHTML={{ __html: step.text.replace(/\n/g, '<br />') }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </ScrollReveal>
                )}

            </main>

            {/* FOOTER */}
            <Footer {...footerProps} />
        </div>
    );
}
