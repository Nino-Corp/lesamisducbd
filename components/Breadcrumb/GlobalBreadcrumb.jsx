'use client';
import { usePathname } from 'next/navigation';
import Breadcrumb from './Breadcrumb';

const routeNames = {
    'produits': 'Produits',
    'usages': 'Par Usages',
    'essentiel': 'L\'Essentiel',
    'blog': 'Blog',
    'contact': 'Contact',
    'account': 'Mon Compte',
    'checkout': 'Commande',
    'transparence': 'Transparence',
    'professionnel': 'Espace Pro',
    'recrutement': 'Nous Rejoindre',
    'cgv': 'CGV',
    'privacy': 'Confidentialité',
    'livraison': 'Livraison et Retours',
    'produit': 'Produits'
};

export default function GlobalBreadcrumb() {
    const pathname = usePathname();
    if (!pathname || pathname === '/' || pathname.startsWith('/admin') || pathname.startsWith('/produit/')) {
        return null;
    }

    const segments = pathname.split('/').filter(Boolean);
    const items = [{ label: 'Accueil', href: '/' }];

    let buildPath = '';
    segments.forEach((segment, index) => {
        buildPath += `/${segment}`;
        
        let label;
        let href = buildPath;
        
        // Correct the URL for the /produits listing page
        if (segment === 'produit' && index === 0) {
            label = 'Produits';
            href = '/produits';
        } else {
            label = routeNames[segment] || segment.replace(/-/g, ' ');
            label = label.charAt(0).toUpperCase() + label.slice(1);
        }

        items.push({
            label,
            href
        });
    });

    return (
        <div style={{
            position: 'absolute',
            top: '90px', 
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: 'var(--container-width)',
            margin: '0 auto',
            padding: '0', // Align with the very edge of the header's green pill
            zIndex: 50,
        }}>
            <Breadcrumb items={items} />
        </div>
    );
}
