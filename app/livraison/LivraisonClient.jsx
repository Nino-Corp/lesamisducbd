'use client';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageBuilder from '@/components/PageBuilder';
import { renderMarkdown } from '@/lib/utils/markdownRenderer';
import styles from './Livraison.module.css';

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

    const builderSections = content?.sections || [
        { id: 'hero', type: 'ContentHero', props: { title: content?.hero?.title || "Notre processus de livraison", subtitle: content?.hero?.subtitle || "Simple, rapide et discret." } },
        { id: 'deliverysteps', type: 'DeliverySteps', props: {} },
        { id: 'content', type: 'RichText', props: { content: content?.markdown ? renderMarkdown(content.markdown) : "<h2 style=\"text-align: center; margin-bottom: 24px;\">Expédition de votre colis</h2><p>Pour les commandes passées avant 12h, le colis est expédié le jour même. Cependant, notez que les délais de préparation peuvent être allongés lors de fortes affluences de commande ou de situation exceptionnelle.</p><p>Quel que soit le mode de livraison choisi, nous vous envoyons un lien pour suivre votre colis en ligne.</p><p>L'envoi est <strong>très discret</strong>, le sachet est opaque et le colis n'a pas d'information permettant de savoir ce qu'il y a dedans.</p>" } }
    ];

    return (
        <main className={styles.main}>
            <Header {...HEADER_PROPS} menuItems={globalContent?.headerLinks || HEADER_PROPS.menuItems} bannerVisible={globalContent?.visibility?.headerBanner !== false} />

            <div className={styles.pageContainer}>
                {builderSections.map((section, index) => {
                    if (section.props?.isVisible === false) return null;

                    if (section.type === 'ContentHero') {
                        return (
                            <div key={section.id} className={styles.header} style={{ marginTop: index > 0 ? '60px' : 0 }}>
                                <h1 className={styles.title}>{section.props?.title || "Notre processus de livraison"}</h1>
                                <p className={styles.subtitle}>{section.props?.subtitle || ""}</p>
                            </div>
                        );
                    }

                    if (section.type === 'RichText') {
                        return (
                            <section key={section.id} className={styles.infoSection} style={{ marginTop: index > 0 ? '40px' : 0 }}>
                                <div className={styles.richTextWrapper} dangerouslySetInnerHTML={{ __html: (section.props?.content || "").replace(/&nbsp;/g, ' ') }} />
                            </section>
                        );
                    }

                    return (
                        <div key={section.id} style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: index > 0 ? '40px' : 0 }}>
                            <PageBuilder sections={[section]} />
                        </div>
                    );
                })}
            </div>

            <Footer {...footerProps} />
        </main>
    );
}
