'use client';

import Link from 'next/link';
import styles from './ContentDashboard.module.css';
import { 
    Home, Sparkles, Store, Wind, Microscope, 
    Briefcase, Globe, FileText, Truck, Lock 
} from 'lucide-react';

const PAGES = [
    {
        id: 'accueil',
        label: 'Page d\'Accueil',
        Icon: Home,
        description: 'Bandeau, Héro, Arguments, FAQ, Témoignages, Logos, Citation',
        count: 7,
        href: '/admin/content/accueil'
    },
    {
        id: 'essentiel',
        label: 'L\'Essentiel',
        Icon: Sparkles,
        description: 'Intro, Carrousels Légalité & Culture, Points clés, Citation',
        count: 5,
        href: '/admin/content/essentiel'
    },
    {
        id: 'professionnel',
        label: 'Professionnel',
        Icon: Store,
        description: 'Hero, Arguments partenariat, Étapes pour devenir partenaire',
        count: 4,
        href: '/admin/content/professionnel'
    },
    {
        id: 'usages',
        label: 'CBD & Usages',
        Icon: Wind,
        description: 'Hero, Guides d\'usage, Citation',
        count: 3,
        href: '/admin/content/usages'
    },
    {
        id: 'transparence',
        label: 'Transparence',
        Icon: Microscope,
        description: 'Héro, Manifesto, Arguments de qualité, Analyses labo',
        count: 4,
        href: '/admin/content/transparence'
    },
    {
        id: 'recrutement',
        label: 'Recrutement',
        Icon: Briefcase,
        description: 'Texte d\'introduction, Offres d\'emploi, Contact',
        count: 3,
        href: '/admin/content/recrutement'
    },
    {
        id: 'global',
        label: 'Éléments Globaux',
        Icon: Globe,
        description: 'Informations de contact de la boutique, Bannière, Newsletter',
        count: 2,
        href: '/admin/content/global'
    },
    {
        id: 'cgv',
        label: 'CGV',
        Icon: FileText,
        description: 'Conditions Générales de Vente (Texte de loi complet)',
        count: 'Texte',
        href: '/admin/content/legal/cgv'
    },
    {
        id: 'livraison',
        label: 'Livraison',
        Icon: Truck,
        description: 'Délais, Tarifs et Méthodes d\'expédition',
        count: 'Texte',
        href: '/admin/content/legal/livraison'
    },
    {
        id: 'privacy',
        label: 'Confidentialité',
        Icon: Lock,
        description: 'Politique de confidentialité et RGPD',
        count: 'Texte',
        href: '/admin/content/legal/privacy'
    }
];

export default function ContentDashboard() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Gestion du Contenu</h1>
                <p className={styles.subtitle}>Modifiez le contenu de chaque page du site en temps réel, sans aucun déploiement.</p>
            </div>

            <div className={styles.pagesGrid}>
                {PAGES.map(page => {
                    const PageIcon = page.Icon;
                    return (
                        <Link key={page.id} href={page.href} className={styles.pageCard}>
                            <div className={styles.pageCardIcon}>
                                <PageIcon size={24} color="#1F4B40" />
                            </div>
                            <div className={styles.pageCardContent}>
                                <h2 className={styles.pageCardTitle}>{page.label}</h2>
                                <p className={styles.pageCardDesc}>{page.description}</p>
                            </div>
                            <div className={styles.pageCardFooter}>
                                <span className={styles.sectionCount}>{page.count} section{page.count > 1 ? 's' : ''}</span>
                                <span className={styles.editArrow}>Modifier →</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
