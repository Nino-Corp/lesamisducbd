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

export default async function AccountPage({ searchParams }) {
    const session = await getServerSession();
    const resolvedSearchParams = await searchParams;
    const initialTab = resolvedSearchParams?.tab || 'profile';

    if (!session || !session.user) {
        redirect('/'); // Redirection forcée au cas où le middleware échoue
    }

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                <ArrowLeft size={20} /> Retour à la boutique
            </Link>

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
    );
}
