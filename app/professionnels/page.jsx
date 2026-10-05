import StoreLocator from '@/components/StoreLocator/StoreLocator';
import styles from './page.module.css';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header/Header';

import { kv } from '@vercel/kv';

export const metadata = {
    title: 'Professionnels - Les Amis du CBD',
    description: 'Devenez partenaire Les Amis du CBD et trouvez nos points de vente sur notre carte interactive.',
};

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

export default async function BuralistesPage() {
    let globalContent = null;
    try {
        globalContent = await kv.get('global_content');
    } catch (e) {
        console.error('Error fetching global content for professionnels page:', e);
    }

    return (
        <main className={styles.main}>
            <Header {...HEADER_PROPS} menuItems={globalContent?.headerLinks || HEADER_PROPS.menuItems} />
            <div className={styles.backLinkWrapper}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={20} /> Retour à l'accueil
                </Link>
            </div>
            <StoreLocator subtitle={false} />
        </main>
    );
}
