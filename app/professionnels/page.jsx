import StoreLocator from '@/components/StoreLocator/StoreLocator';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Professionnel - Les Amis du CBD',
    description: 'Devenez partenaire Les Amis du CBD et trouvez nos points de vente sur notre carte interactive.',
};

export default function BuralistesPage() {
    return (
        <main className={styles.main}>
            <Link href="/" className={styles.logo}>
                <Image src="/images/logo.webp" alt="Les Amis du CBD" width={160} height={50} style={{ objectFit: 'contain' }} />
            </Link>
            <Link href="/" className={styles.backButton}>
                <ArrowLeft size={20} />
                Retour à l'accueil
            </Link>
            <StoreLocator subtitle={false} />
        </main>
    );
}
