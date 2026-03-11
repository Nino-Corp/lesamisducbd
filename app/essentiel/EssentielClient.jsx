'use client';

import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Quote from '@/components/Quote/Quote';
import JoinUs from '@/components/JoinUs/JoinUs';
import ContentHero from '@/components/ContentHero/ContentHero';
import UsagesCarousel from '@/components/UsagesCarousel/UsagesCarousel';

import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';

export default function EssentielClient({ content, globalContent }) {
    const headerProps = {
        bannerVisible: globalContent?.visibility?.headerBanner !== false,

        logoText: "LES AMIS DU CBD",
        logoImage: "/images/logo.webp",
        menuItems: [
            { label: "PRODUITS", href: "/produits" },
            { label: "L'ESSENTIEL", href: "/essentiel" },
            { label: "CBD & USAGES", href: "/usages" },
            { label: "PROFESSIONNEL", href: "/professionnel" }
        ]
    };

    const footerProps = {
        columnLinks: globalContent?.footerLinks || [
            { label: "Livraison", href: "/livraison" },
            { label: "CGV", href: "/cgv" },
            { label: "Politique de confidentialité", href: "/privacy" },
            { label: "Transparence", href: "/transparence" },
            { label: "Professionnel", href: "/professionnel" }
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

    const legalItems = content.legalItems;
    const cultureItems = content.cultureItems;
    const visibility = content.visibility || {};

    return (
        <div className={styles.pageWrapper}>
            <Header {...headerProps} />
            <main>
                {/* HERO */}
                {visibility.hero !== false && (
                    <ContentHero
                        imageSrc={content?.hero?.imageSrc || "/images/about/team.webp"}
                        imagePosition="center 35%"
                        imageAlt="L'équipe Les Amis du CBD"
                    >
                        <h1 className={styles.pageTitle}>{content?.hero?.title || "L'Essentiel"}</h1>
                    </ContentHero>
                )}

                {/* INTRO TEXT */}
                {visibility.intro !== false && (
                    <ScrollReveal animation="fade-up">
                        <section className={styles.introSection}>
                            {content.intro.map((para, i) => (
                                <p key={i} className={styles.introText}>{para}</p>
                            ))}
                        </section>
                    </ScrollReveal>
                )}

                {/* CAROUSEL 1: TRANSPARENCE */}
                {visibility.legalItems !== false && (
                    <ScrollReveal animation="fade-up" delay={200}>
                        <section className={styles.carouselSection}>
                            <h2 className={styles.sectionTitle}>
                                CBD : transparence,<br />légalité et ce qu'il faut<br />vraiment savoir.
                            </h2>
                            <p className={styles.sectionIntro}>
                                Le CBD est partout. Mais entre informations approximatives, promesses exagérées et discours flous, il devient difficile de s'y retrouver.
                                Cette page a un seul objectif : vous donner des informations claires, vérifiées et conformes à la réglementation française, pour consommer le CBD sans confusion.
                            </p>
                            <UsagesCarousel items={legalItems} />
                        </section>
                    </ScrollReveal>
                )}

                {/* CAROUSEL 2: CULTURE */}
                {visibility.cultureItems !== false && (
                    <ScrollReveal animation="fade-up" delay={200}>
                        <section className={styles.carouselSection}>
                            <h2 className={styles.sectionTitle}>
                                Culture naturelle : ce que cela change<br />vraiment.
                            </h2>
                            <p className={styles.sectionIntro}>
                                La manière dont est planté et cultivé influence directement sa qualité finale.
                                Une culture naturelle permet :
                            </p>
                            <UsagesCarousel items={cultureItems} />
                        </section>
                    </ScrollReveal>
                )}

                {/* ESSENTIAL BOX */}
                {visibility.essentialPoints !== false && (
                    <ScrollReveal animation="scale-up" duration={800}>
                        <section className={styles.essentialSection}>
                            <div className={styles.essentialBox}>
                                <h3 className={styles.essentialTitle}>L'essentiel à retenir<br />sur le CBD :</h3>
                                <ul className={styles.essentialList}>
                                    {content.essentialPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                                </ul>
                            </div>
                        </section>
                    </ScrollReveal>
                )}

                {/* FOOTER QUERY */}
                {visibility.quote !== false && (
                    <ScrollReveal animation="fade-up" delay={200}>
                        <Quote
                            text={content.quote.text}
                            author={content.quote.author}
                        />
                    </ScrollReveal>
                )}

                {/* JOIN US */}
                <ScrollReveal animation="fade-up" delay={300}>
                    <JoinUs
                        title="Nous rejoindre"
                        buttonLabel="Venez par ici"
                        buttonLink="/recrutement"
                        text="Tu penses avoir le profil pour rejoindre l'équipe ? On attend ta candidature !"
                    />
                </ScrollReveal>

            </main>

            <Footer {...footerProps} />
        </div >
    );
}
