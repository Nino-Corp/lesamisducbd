'use client';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageBuilder from '@/components/PageBuilder';
import styles from './Transparence.module.css';

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

export default function TransparenceClient({ globalContent, content }) {

    const footerProps = {
        ...FOOTER_PROPS,
        newsletter: { ...FOOTER_PROPS.newsletter, isVisible: globalContent?.visibility?.newsletter !== false },
        columnLinks: globalContent?.footerLinks || FOOTER_PROPS.columnLinks,
        contactInfo: globalContent?.contact || FOOTER_PROPS.contactInfo
    };

    const headerProps = {
        ...HEADER_PROPS,
        menuItems: globalContent?.headerLinks || HEADER_PROPS.menuItems,
        bannerVisible: globalContent?.visibility?.headerBanner !== false
    };

    // If new sections format is available, use it directly.
    const sections = content?.sections || [];

    return (
        <main className={styles.main}>
            <Header {...headerProps} />
            
            <div className={styles.container}>
                <PageBuilder sections={sections} />
            </div>

            <Footer {...footerProps} />
        </main>
    );
}
