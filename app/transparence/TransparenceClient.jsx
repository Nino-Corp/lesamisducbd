'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from './Transparence.module.css';
import { X, Star, BadgeEuro, ShieldCheck, FileText } from 'lucide-react';
import useLockBodyScroll from '@/hooks/useLockBodyScroll';

const HEADER_PROPS = {
    logoText: "LES AMIS DU CBD",
    logoImage: "/images/logo.webp",
    menuItems: [
        { label: "PRODUITS", href: "/produits" },
        { label: "L'ESSENTIEL", href: "/essentiel" },
        { label: "CBD & USAGES", href: "/usages" },
        { label: "PROFESSIONNEL", href: "/professionnel" }
    ]
};

const FOOTER_PROPS = {
    columnLinks: [
        { label: "Livraison", href: "/livraison" },
        { label: "CGV", href: "/cgv" },
        { label: "Politique de confidentialité", href: "/privacy" },
        { label: "Transparence", href: "/transparence" },
        { label: "Professionnel", href: "/professionnel" }
    ],
    contactInfo: {
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

const DEFAULT_CONTENT = {
    hero: {
        title: "Transparence",
        subtitle: "La qualité sans compromis."
    },
    quote: {
        text: "Nous, Les Amis du CBD sommes de vrais passionnés du cannabis !\nOr nous étions extrêmement déçus de voir le marché français inondé par des produits de qualité médiocre, vendus bien souvent à des prix délirants !\nNous nous sommes donc mis au travail, et nous avons été surpris de voir ce qui était possible.",
        author: "Nelson - Les Amis du CBD"
    },
    section1: {
        title: "Meilleure qualité",
        col1: {
            title: "Culture 100 % naturelle",
            text: "Nos plantes sont cultivées en serre sur sol vivant :\n- Ni engrais chimiques, ni pesticides ou insecticides.\n- Sous la lumière naturelle du soleil.\n- Boostées seulement avec des engrais organiques type compost et guano de chauve-souris."
        },
        col2: {
            title: "< 0,3% de THC, sans lavage !",
            text: "Point essentiel pour la qualité finale, nos fleurs ont naturellement moins de 0,3% de THC.\nElles n'ont donc pas besoin de \"lavage\" avec des produits chimiques afin de baisser le taux de THC.\nAinsi, nous préservons la couleur, les arômes et les parfums originaux."
        }
    },
    section2: {
        title: "Moins cher",
        col1: {
            title: "Le naturel, c'est gratuit !",
            text: "Comme nos fleurs sont cultivées naturellement, nous économisons :\n- Pas d'engrais ou d'autres produits chimiques coûteux.\n- Pas de matériel hi-tech (ni système hydroponique, ni éclairage artificiel).\n- Pas de facture d'électricité.\n- Pas de \"lavage\" chimique pour baisser le taux de THC.\n- Donc pas besoin de parfumer artificiellement les plantes par la suite."
        },
        col2: {
            title: "Simplicité :",
            text: "Nous comptons sur la quantité et nous pratiquons des marges raisonnables.\nAvec Les Amis du CBD, vous n'avez pas 200 références.\nSeulement 4 variétés au top, disponibles en 4 ou 10 grammes !\nAinsi :\n- La gestion de vos stocks est plus facile.\n- Vos commandes sont rapides à faire,\n- Vous proposez un prix imbattable que cela soit vis-à-vis de vos concurrents locaux, comme de la concurrence en ligne !"
        }
    },
    certificats: [
        { src: '/images/transparence/ak47.png', alt: 'Analyse AK-47 CBD', label: 'AK-47 CBD = 7,5%' },
        { src: '/images/transparence/amnesia.png', alt: 'Analyse AMNÉSIA CBD', label: 'AMNÉSIA CBD = 7%' },
        { src: '/images/transparence/remedy.png', alt: 'Analyse REMEDY CBD', label: 'REMEDY CBD = 9%' },
        { src: '/images/transparence/superskunk.png', alt: 'Analyse SUPER SKUNK CBD', label: 'SUPER SKUNK CBD = 12%' },
        { src: '/images/transparence/gorillaglue.jpg', alt: 'Analyse GORILLA GLUE CBD', label: 'GORILLA GLUE CBD = 10%' },
    ]
};

// Mini Markdown parser for Columns: line starting with "-" or "*" becomes <li>, else <p>
function renderTextLines(textBlocks) {
    if (!textBlocks) return null;
    const lines = textBlocks.split('\n');
    let listItems = [];
    const elements = [];

    lines.forEach((line, idx) => {
        const t = line.trim();
        if (t.startsWith('-') || t.startsWith('*')) {
            listItems.push(<li key={`li-${idx}`}>{t.substring(1).trim()}</li>);
        } else {
            if (listItems.length > 0) {
                elements.push(<ul key={`ul-${idx}`}>{listItems}</ul>);
                listItems = [];
            }
            if (t.length > 0) {
                elements.push(<p key={`p-${idx}`}>{t}</p>);
            }
        }
    });

    if (listItems.length > 0) {
        elements.push(<ul key={`ul-end`}>{listItems}</ul>);
    }

    return <>{elements}</>;
}


export default function TransparenceClient({ globalContent, content }) {
    const [selectedImage, setSelectedImage] = useState(null);
    useLockBodyScroll(!!selectedImage);

    const footerProps = {
        ...FOOTER_PROPS,
        newsletter: { ...FOOTER_PROPS.newsletter, isVisible: globalContent?.visibility?.newsletter !== false },
        columnLinks: globalContent?.footerLinks || FOOTER_PROPS.columnLinks,
        contactInfo: globalContent?.contact || FOOTER_PROPS.contactInfo
    };

    const data = content || DEFAULT_CONTENT;

    return (
        <main className={styles.main}>
            <Header {...HEADER_PROPS} menuItems={globalContent?.headerLinks || HEADER_PROPS.menuItems} bannerVisible={globalContent?.visibility?.headerBanner !== false} />

            <div className={styles.container}>
                {/* Hero section */}
                {data.hero.isVisible !== false && (
                    <div className={styles.header}>
                        <h1 className={styles.title}>{data.hero.title}</h1>
                        <p className={styles.subtitle}>{data.hero.subtitle}</p>
                    </div>
                )}

                {/* Intro Section with Profile */}
                {data.quote.isVisible !== false && (
                    <section className={styles.introSection}>
                        <div className={styles.profileWrapper}>
                            <Image
                                src="/images/nelson.png"
                                alt="Nelson - Les Amis du CBD"
                                fill
                                className={styles.profileImage}
                            />
                        </div>
                        <div className={styles.quoteBlock}>
                            {data.quote.text.split('\n').map((line, i) => (
                                <p key={i} className={styles.quoteText} style={{ marginBottom: '1rem' }}>
                                    {line}
                                </p>
                            ))}
                            <p className={styles.quoteAuthor}>{data.quote.author}</p>
                        </div>
                    </section>
                )}

                {/* Section 1 */}
                {data.section1.isVisible !== false && (
                    <section className={styles.featureSection}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconCircle}><Star size={40} /></div>
                            <h2>{data.section1.title}</h2>
                        </div>
                        <div className={styles.columns}>
                            <div className={styles.column}>
                                <h3>{data.section1.col1.title}</h3>
                                {renderTextLines(data.section1.col1.text)}
                            </div>
                            <div className={styles.column}>
                                <h3>{data.section1.col2.title}</h3>
                                {renderTextLines(data.section1.col2.text)}
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 2 */}
                {data.section2.isVisible !== false && (
                    <section className={styles.featureSection}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconCircle}><BadgeEuro size={40} /></div>
                            <h2>{data.section2.title}</h2>
                        </div>
                        <div className={styles.columns}>
                            <div className={styles.column}>
                                <h3>{data.section2.col1.title}</h3>
                                {renderTextLines(data.section2.col1.text)}
                            </div>
                            <div className={styles.column}>
                                <h3>{data.section2.col2.title}</h3>
                                {renderTextLines(data.section2.col2.text)}
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 3: Sécurité / Certificats */}
                {data.certificatsVisible !== false && (
                    <section className={styles.featureSection}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconCircle}><ShieldCheck size={40} /></div>
                            <h2>Sécurité</h2>
                        </div>

                        <h3 className={styles.certifTitle}>Certificats d'analyses :</h3>

                        <div className={styles.galleryGrid}>
                            {data.certificats.filter(c => c.src).map((analyse, idx) => (
                                <div
                                    key={idx}
                                    className={styles.imageCard}
                                    onClick={() => setSelectedImage(analyse)}
                                >
                                    <div className={styles.imageWrapper}>
                                        {analyse.src.toLowerCase().endsWith('.pdf') ? (
                                            <iframe
                                                src={`${analyse.src}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                                title={analyse.alt || 'Certificat PDF'}
                                                className={styles.pdfThumbnail}
                                                tabIndex={-1}
                                            />
                                        ) : (
                                            <Image
                                                src={analyse.src}
                                                alt={analyse.alt || 'Certificat analyse'}
                                                fill
                                                className={styles.image}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.imageCaption}>
                                        {analyse.label}
                                    </div>
                                </div>
                            ))}
                            {data.certificats.filter(c => c.src).length === 0 && (
                                <p style={{ textAlign: 'center', width: '100%', padding: '2rem' }}>Aucun certificat publié.</p>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Lightbox / Modal for viewing full document */}
            {selectedImage && selectedImage.src && (
                <div className={styles.modalOverlay}>
                    <button
                        className={styles.modalClose}
                        onClick={() => setSelectedImage(null)}
                        aria-label="Fermer"
                    >
                        <X size={40} />
                    </button>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {selectedImage.src.toLowerCase().endsWith('.pdf') ? (
                            <iframe 
                                src={selectedImage.src} 
                                className={styles.modalIframe}
                                title={selectedImage.alt || 'Certificat PDF'}
                            />
                        ) : (
                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.alt || 'Certificat'}
                                fill
                                className={styles.modalImage}
                            />
                        )}
                    </div>
                </div>
            )}

            <Footer {...footerProps} />
        </main>
    );
}
