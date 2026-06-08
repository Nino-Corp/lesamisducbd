'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import styles from './page.module.css';

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageBuilder from '@/components/PageBuilder';
import ContactModal from '@/components/ContactModal/ContactModal';

export default function ProfessionnelClient({ content, globalContent }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isContactOpen, setIsContactOpen] = useState(false);

    useEffect(() => {
        if (searchParams.get('action') === 'contact') {
            setIsContactOpen(true);
            const cleanUrl = pathname || '/professionnel';
            window.history.replaceState({}, '', cleanUrl);
        }
    }, [searchParams, pathname]);

    const headerProps = {
        bannerVisible: globalContent?.visibility?.headerBanner !== false,
        logoText: "LES AMIS DU CBD",
        logoImage: "/images/logo.webp",
        menuItems: globalContent?.headerLinks || [
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

    const sections = content.sections || [];

    return (
        <div className={styles.pageWrapper}>
            <Header {...headerProps} />
            <main>
                <PageBuilder sections={sections} />
            </main>
            <Footer {...footerProps} />

            <ContactModal 
                isOpen={isContactOpen} 
                onClose={() => setIsContactOpen(false)} 
            />
        </div>
    );
}
