
import Link from 'next/link';
import styles from './AdminLayout.module.css';
import LogoutButton from './LogoutButton';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }) {
    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>CBD Admin</div>
                <nav className={styles.nav}>
                    <Link href="/admin/content" className={styles.link}>Contenu Site</Link>
                    <Link href="/admin/builder" className={styles.link}>Page Builder</Link>
                    <Link href="/admin/products" className={styles.link}>Produits</Link>
                    <Link href="/admin/partners" className={styles.link}>Professionnels</Link>
                    <Link href="/" className={styles.link}>Voir le site</Link>
                    <LogoutButton />
                </nav>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
