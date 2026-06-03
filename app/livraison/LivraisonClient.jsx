'use client';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { renderMarkdown } from '@/lib/utils/markdownRenderer';
import styles from './Livraison.module.css';
import { MonitorCheck, PackageSearch, Truck, Home } from 'lucide-react';

const HEADER_PROPS = {
    logoText: "LES AMIS DU CBD",
    logoImage: "/images/logo.webp",
    menuItems: [
        { label: "PRODUITS", href: "/produits" },
        { label: "L'ESSENTIEL", href: "/essentiel" },
        { label: "CBD & USAGES", href: "/usages" },
        { label: "BURALISTE", href: "/professionnel" }
    ]
};

const FOOTER_PROPS = {
    columnLinks: [
        { label: "Livraison", href: "/livraison" },
        { label: "CGV", href: "/cgv" },
        { label: "Politique de confidentialité", href: "/privacy" },
        { label: "Transparence", href: "/transparence" },
        { label: "Buraliste", href: "/professionnel" }
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

export default function LivraisonClient({ globalContent, content }) {
    const footerProps = {
        ...FOOTER_PROPS,
        newsletter: { ...FOOTER_PROPS.newsletter, isVisible: globalContent?.visibility?.newsletter !== false },
        columnLinks: globalContent?.footerLinks || FOOTER_PROPS.columnLinks,
        contactInfo: globalContent?.contact || FOOTER_PROPS.contactInfo
    };

    const heroTitle = content?.hero?.title || "Notre processus de livraison";
    const heroSubtitle = content?.hero?.subtitle || "Simple, rapide et discret.";

    return (
        <main className={styles.main}>
            <Header {...HEADER_PROPS} menuItems={globalContent?.headerLinks || HEADER_PROPS.menuItems} bannerVisible={globalContent?.visibility?.headerBanner !== false} />

            <div className={styles.pageContainer}>
                {/* Hero / Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>{heroTitle}</h1>
                    <p className={styles.subtitle}>{heroSubtitle}</p>
                </div>

                {/* 4-Step Schema */}
                <section className={styles.schemaSection}>
                    <div className={styles.stepsGrid}>
                        {/* Step 1 */}
                        <div className={styles.stepCard}>
                            <div className={styles.iconContainer}>
                                <div className={styles.stepNumber}>1</div>
                                <MonitorCheck size={48} className={styles.icon} />
                            </div>
                            <div className={styles.stepHeader}>1. Commande</div>
                            <p className={styles.stepText}>
                                Je valide ma commande, et je reçois <strong>un mail de confirmation avec</strong> mes coordonnées.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className={styles.stepCard}>
                            <div className={styles.iconContainer}>
                                <div className={styles.stepNumber}>2</div>
                                <PackageSearch size={48} className={styles.icon} />
                            </div>
                            <div className={styles.stepHeader}>2. Préparation</div>
                            <p className={styles.stepText}>
                                Si j'ai commandé <strong>avant midi</strong>, ma commande est préparée et <strong>expédiée le jour même</strong>.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className={styles.stepCard}>
                            <div className={styles.iconContainer}>
                                <div className={styles.stepNumber}>3</div>
                                <Truck size={48} className={styles.icon} />
                            </div>
                            <div className={styles.stepHeader}>3. Expédition</div>
                            <p className={styles.stepText}>
                                Mon colis est remis aux services postaux et je reçois <strong>un lien de suivi de colis</strong>.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className={styles.stepCard}>
                            <div className={styles.iconContainer}>
                                <div className={styles.stepNumber}>4</div>
                                <Home size={48} className={styles.icon} />
                            </div>
                            <div className={styles.stepHeader}>4. Livraison</div>
                            <p className={styles.stepText}>
                                En moyenne, <strong>48h</strong> plus tard, le livreur m'apporte mon colis <strong>chez moi ou en point relais</strong>.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Additional Information Section */}
                <section className={styles.infoSection}>
                    {content && content.markdown ? renderMarkdown(content.markdown) : (
                        <>
                            <h2 className={styles.infoTitle}>Expédition de votre colis</h2>
                            <div className={styles.infoContent}>
                                <p>
                                    Pour les commandes passées avant 12h, le colis est expédié le jour même.
                                    Cependant, notez que les délais de préparation peuvent être allongés lors de fortes affluences de commande ou de situation exceptionnelle.
                                </p>
                                <p>
                                    Quel que soit le mode de livraison choisi, nous vous envoyons un lien pour suivre votre colis en ligne.
                                </p>
                                <p>
                                    L'envoi est <strong>très discret</strong>, le sachet est opaque et le colis n'a pas d'information permettant de savoir ce qu'il y a dedans.
                                </p>
                            </div>
                        </>
                    )}
                </section>
            </div>

            <Footer {...footerProps} />
        </main>
    );
}
