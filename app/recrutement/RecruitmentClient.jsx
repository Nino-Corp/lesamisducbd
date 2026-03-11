'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import RecruitmentModal from '@/components/RecruitmentModal/RecruitmentModal';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import ContentHero from '@/components/ContentHero/ContentHero';

const DEFAULT_CONTENT = {
    hero: {
        title: "Intégrer l'équipe ?",
    },
    content: {
        title: "Rejoindre l'équipe\nLes Amis du CBD",
        text: "Les Amis du CBD, c'est avant tout une aventure humaine.\nUne équipe qui avance ensemble, avec des valeurs simples : transparence, exigence et proximité.\nNous ne recrutons pas en permanence, mais nous sommes toujours curieux de découvrir de nouveaux profils. Que vous veniez du terrain, du commerce, de la communication ou d'un tout autre horizon, les candidatures spontanées sont les bienvenues.\nSi vous partagez notre vision d'un CBD accessible, responsable et bien fait, n'hésitez pas à nous écrire.\nParfois, les meilleures collaborations commencent sans offre précise."
    },
    jobs: [],
    contactCard: {
        title: "Envie d'en\nsavoir plus ?",
        text: "Un CV, une lettre de motivation ou simplement l'envie d'échanger ?\nContactez-nous, on vous répond avec plaisir."
    }
};

export default function RecruitmentClient({ globalContent, content }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const headerProps = {
        bannerVisible: globalContent?.visibility?.headerBanner !== false,

        logoText: "LES AMIS DU CBD",
        logoImage: "/images/logo.webp",
        menuItems: [
            { label: "PRODUITS", href: "/produits" },
            { label: "L'ESSENTIEL", href: "/essentiel" },
            { label: "CBD & USAGES", href: "/usages" },
            { label: "BURALISTE", href: "/professionnel" }
        ]
    };

    const footerProps = {
        columnLinks: globalContent?.footerLinks || [
            { label: "Livraison", href: "/livraison" },
            { label: "CGV", href: "/cgv" },
            { label: "Politique de confidentialité", href: "/privacy" },
            { label: "Transparence", href: "/transparence" },
            { label: "Buraliste", href: "/professionnel" }
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

    const data = content || DEFAULT_CONTENT;

    // Helper for rendering multi-line string into <p> or <li>
    const renderText = (textStr) => {
        if (!textStr) return null;
        const lines = textStr.split('\n');
        let listItems = [];
        const elements = [];

        lines.forEach((line, idx) => {
            const t = line.trim();
            if (t.startsWith('-') || t.startsWith('*')) {
                listItems.push(<li key={`li-${idx}`}>{t.substring(1).trim()}</li>);
            } else {
                if (listItems.length > 0) {
                    elements.push(<ul key={`ul-${idx}`} className={styles.jobList}>{listItems}</ul>);
                    listItems = [];
                }
                if (t.length > 0) {
                    elements.push(<p key={`p-${idx}`} className={styles.textBlock}>{t}</p>);
                }
            }
        });

        if (listItems.length > 0) {
            elements.push(<ul key={`ul-end`} className={styles.jobList}>{listItems}</ul>);
        }

        return <>{elements}</>;
    };

    return (
        <div className={styles.pageWrapper}>
            <Header {...headerProps} />

            <main>
                {/* HERO */}
                {data.hero.isVisible !== false && (
                    <ContentHero
                        imageSrc={data.hero.imageSrc || "/images/recrutement/handshake.webp"}
                        imageAlt="Rejoindre l'équipe"
                    >
                        <h1 className={styles.pageTitle}>{data.hero.title}</h1>
                    </ContentHero>
                )}

                {/* TEXT CONTENT */}
                {data.content.isVisible !== false && (
                    <ScrollReveal animation="fade-up">
                        <section className={styles.contentSection}>
                            <h2 className={styles.mainTitle}>
                                {data.content.title.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i < data.content.title.split('\n').length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </h2>

                            {renderText(data.content.text)}

                        </section>
                    </ScrollReveal>
                )}

                {/* JOBS SECTION (Dynamic) */}
                {data.jobs && data.jobs.length > 0 && (
                    <ScrollReveal animation="fade-up" delay={100}>
                        <section className={styles.jobsSection}>
                            <h2 className={styles.jobsTitle}>Offres en cours</h2>
                            <div className={styles.jobsGrid}>
                                {data.jobs.map((job, idx) => (
                                    <div key={idx} className={styles.jobCard}>
                                        <div className={styles.jobCardHeader}>
                                            <h3 className={styles.jobTitle}>{job.title}</h3>
                                            <span className={styles.jobBadge}>{job.type}</span>
                                        </div>
                                        <p className={styles.jobLocation}>📍 {job.location}</p>
                                        <div className={styles.jobDescription}>
                                            {renderText(job.description)}
                                        </div>
                                        <button onClick={() => setIsModalOpen(true)} className={styles.applyBtn}>
                                            Postuler
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </ScrollReveal>
                )}

                {/* CONTACT CARD */}
                {data.contactCard.isVisible !== false && (
                    <ScrollReveal animation="fade-up" delay={200}>
                        <section className={styles.contactCardSection}>
                            <div className={styles.contactCard}>
                                <h3 className={styles.cardTitle}>
                                    {data.contactCard.title.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < data.contactCard.title.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </h3>
                                <p className={styles.cardText}>
                                    {data.contactCard.text.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < data.contactCard.text.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </p>
                                <button onClick={() => setIsModalOpen(true)} className={styles.contactButton}>
                                    Contactez-nous !
                                </button>
                            </div>
                        </section>
                    </ScrollReveal>
                )}

                {isModalOpen && <RecruitmentModal onClose={() => setIsModalOpen(false)} />}
            </main>

            <Footer {...footerProps} />
        </div>
    );
}
