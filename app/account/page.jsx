import styles from './Account.module.css';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AccountTabs from './AccountTabs';

export const metadata = {
    title: 'Mon Compte | Les Amis du CBD',
    description: 'Gérez vos informations personnelles et adresses.',
};

import Header from '@/components/Header/Header';

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

export default async function AccountPage({ searchParams }) {
    const session = await getServerSession();
    const resolvedSearchParams = await searchParams;
    const initialTab = resolvedSearchParams?.tab || 'profile';

    if (!session || !session.user) {
        redirect('/'); // Redirection forcée au cas où le middleware échoue
    }

    return (
        <main>
            <Header {...HEADER_PROPS} />
            <div className={styles.backLinkWrapper}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={20} /> Retour à la boutique
                </Link>
            </div>
            <div className={styles.container}>

            <div className={styles.header}>
                <h1 className={styles.title}>Mon Compte</h1>
                <p className={styles.subtitle}>
                    Bienvenue, <span className={styles.highlight}>{session.user.name}</span>
                </p>
                {session.user.role === 'buraliste' && (
                    <span className={styles.roleBadge}>
                        Compte Professionnel
                    </span>
                )}
            </div>

            <div className={styles.content}>
                <AccountTabs userSession={session.user} initialTab={initialTab} />
            </div>
        </div>
        </main>
    );
}
