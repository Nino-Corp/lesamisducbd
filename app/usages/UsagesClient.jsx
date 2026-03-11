'use client';

import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import UsagesCarousel from '@/components/UsagesCarousel/UsagesCarousel';
import Quote from '@/components/Quote/Quote';
import JoinUs from '@/components/JoinUs/JoinUs';
import ContentHero from '@/components/ContentHero/ContentHero';

import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';

export default function UsagesClient({ globalContent, content }) {

    // --- Mocks ---
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

    const visibility = content?.visibility || {};
    const heroData = content?.hero || { title: "Le CBD ?" };
    const introData = content?.intro || { title: "CBD : usages courants,\nlimites et bonnes pratiques.", text: "Le CBD est utilisé par de nombreuses personnes dans la vie quotidienne.\nCette page présente 5 usages fréquents, avec leurs limites et bonnes pratiques.\nLe CBD n'est pas un médicament et ne remplace jamais un avis médical." };
    const carouselData = content?.carousel || { title: "Usages du CBD\nau quotidien :" };
    const warningData = content?.warning || { title: "Le CBD :\nn'est pas un médicament, ne guérit aucune maladie, ne remplace pas un traitement médical.\nEn cas de doute, de traitement en cours ou de condition particulière, consultez un professionnel de santé.", responsibleTitle: "Pour une utilisation responsable :\nproduits analysés en laboratoire, origine claire, taux de THC conforme, information transparente" };
    const essentialData = content?.essential || { title: "L'essentiel sur les usages du CBD :", items: ["Le CBD s'inscrit dans une démarche de bien-être", "Les usages varient selon les individus", "Il ne s'agit jamais d'un traitement médical", "La qualité et la transparence sont essentielles"] };
    const quoteData = content?.quote || { text: "\"Découvrir le CBD en toute responsabilité.<br/>Explorez nos produits.<br/>Lire nos guides pédagogiques.\"", author: "Nelson — Les Amis du CBD" };
    const joinUsData = content?.joinUs || { title: "Nous rejoindre", buttonLabel: "Venez par ici", buttonLink: "/recrutement", text: "Aucun poste ouvert pour le moment ? Les candidatures spontanées sont toujours les bienvenues." };

    const usagesItems = content?.carousel?.items || [
        {
            title: "Détente et relaxation",
            description: "Le CBD est souvent consommé pour favoriser un état de calme et de détente, surtout dans les périodes de stress ponctuel.\n\nIl peut être intégré à vos routines de relaxation, méditation ou moments cocooning.",
            image: "/images/usages/detente.webp"
        },
        {
            title: "Sommeil et routines nocturnes",
            description: "Certaines personnes intègrent le CBD à leur rituel du coucher. Il ne s'agit pas d'un somnifère, mais d'un complément qui peut aider à préparer un sommeil plus serein.\n\nUne bonne hygiène de sommeil reste essentielle : horaires réguliers, environnement calme et réduction des écrans.",
            image: "/images/usages/sommeil.webp"
        },
        {
            title: "Concentration et focus",
            description: "Le CBD peut accompagner certains moments de concentration, que ce soit pour le travail, les études ou les projets créatifs.\n\nIl s'agit d'un usage complémentaire, qui vise à favoriser un état calme et attentif sans stimuler artificiellement.",
            image: "/images/usages/cosmetique.webp"
        },
        {
            title: "Récupération physique",
            description: "Le CBD est parfois utilisé après l'effort pour soutenir la récupération naturelle.\n\nIl peut s'intégrer à une routine de récupération incluant repos, hydratation et étirements, mais il ne remplace pas les fondamentaux de la récupération physique.",
            image: "/images/usages/sport.webp"
        },
        {
            title: "Bien-être au quotidien",
            description: "Le CBD peut être intégré à des petites routines de bien-être au quotidien : pauses relaxantes, moments personnels ou rituels simples.\n\nL'important reste la régularité, l'écoute de soi et le respect des dosages conseillés.",
            image: "/images/usages/cuisine.webp"
        }
    ];

    return (
        <div className={styles.pageWrapper}>
            <Header {...headerProps} />

            <main>
                {/* HERO */}
                {visibility.intro !== false && (
                    <ContentHero
                        imageSrc={heroData.imageSrc || "/images/usages/hero.webp"}
                        imageAlt="Illustration CBD Questionnement"
                        imagePosition="center 35%"
                    >
                        <h1 className={styles.heroTitle}>{heroData.title}</h1>
                    </ContentHero>
                )}

                {/* INTRO */}
                {visibility.intro !== false && (
                    <ScrollReveal animation="fade-up">
                        <section className={styles.introSection}>
                            <h2 className={styles.introTitle} dangerouslySetInnerHTML={{ __html: introData.title.replace(/\n/g, '<br />') }} />
                            <p className={styles.introText} dangerouslySetInnerHTML={{ __html: introData.text.replace(/\n/g, '<br />') }} />
                        </section>
                    </ScrollReveal>
                )}

                {/* CAROUSEL */}
                {visibility.carousel !== false && (
                    <ScrollReveal animation="fade-up" delay={200}>
                        <section className={styles.carouselSection}>
                            <h2 className={styles.carouselTitle} dangerouslySetInnerHTML={{ __html: carouselData.title.replace(/\n/g, '<br />') }} />
                            <UsagesCarousel items={usagesItems} />
                        </section>
                    </ScrollReveal>
                )}

                {/* WARNING */}
                {visibility.warning !== false && (
                    <ScrollReveal animation="fade-up">
                        <section className={styles.warningSection}>
                            <h2 className={styles.warningTitle}>
                                <span dangerouslySetInnerHTML={{ __html: warningData.title.replace(/\n/g, '<br />') }} />
                            </h2>

                            <div className={styles.responsibleSection}>
                                <h3 className={styles.responsibleTitle} dangerouslySetInnerHTML={{ __html: warningData.responsibleTitle.replace(/\n/g, '<br />') }} />
                            </div>
                        </section>
                    </ScrollReveal>
                )}

                {/* ESSENTIAL BOX */}
                {visibility.essential !== false && (
                    <ScrollReveal animation="fade-up">
                        <section className={styles.essentialSection}>
                            <div className={styles.essentialBox}>
                                <h3 className={styles.essentialTitle}>{essentialData.title}</h3>
                                <ul className={styles.essentialList}>
                                    {essentialData.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    </ScrollReveal>
                )}

                {/* FOOTER QUERY */}
                {visibility.quote !== false && (
                    <ScrollReveal animation="fade-up">
                        <Quote
                            text={quoteData.text}
                            author={quoteData.author}
                        />
                    </ScrollReveal>
                )}

                {/* JOIN US */}
                {visibility.joinUs !== false && (
                    <ScrollReveal animation="fade-up">
                        <JoinUs
                            title={joinUsData.title}
                            buttonLabel={joinUsData.buttonLabel}
                            buttonLink={joinUsData.buttonLink}
                            text={joinUsData.text}
                        />
                    </ScrollReveal>
                )}

            </main>

            <Footer {...footerProps} />
        </div>
    );
}
