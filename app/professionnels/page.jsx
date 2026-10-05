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
    let initialPartners = [];
    try {
        globalContent = await kv.get('global_content');
        initialPartners = await kv.get('partners_locations') || [];
    } catch (e) {
        console.error('Error fetching data for professionnels page:', e);
    }

    return (
        <main className={styles.main}>
            <Header {...HEADER_PROPS} menuItems={globalContent?.headerLinks || HEADER_PROPS.menuItems} />
            <div className={styles.backLinkWrapper}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={20} /> Retour à l'accueil
                </Link>
            </div>
            
            {/* Hidden list for SEO experts and crawlers to retrieve the partners easily */}
            <div style={{ display: 'none' }} aria-hidden="true">
                <h2>Nos boutiques partenaires</h2>
                <ul>
                    {initialPartners.map(p => (
                        <li key={p.id}>{p.name} - {p.address}, {p.zip} {p.city}</li>
                    ))}
                </ul>
            </div>

            <StoreLocator subtitle={false} initialPartners={initialPartners} />
        </main>
    );
}
