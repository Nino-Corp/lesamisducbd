'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Editor.module.css';

const DEFAULTS = {
    contact: {
        title: "Les Amis du CBD France",
        address: "25 rue principale 07120 Chauzon (FR)",
        phone: "06 71 82 42 87",
        email: "lesamisducbd@gmail.com"
    },
    footerLinks: [
        { label: "Livraison", href: "/livraison" },
        { label: "CGV", href: "/cgv" },
        { label: "Politique de confidentialité", href: "/privacy" },
        { label: "Transparence", href: "/transparence" },
        { label: "Buraliste", href: "/professionnel" }
    ],
    headerLinks: [
        { label: "PRODUITS", href: "/produits" },
        { label: "L'ESSENTIEL", href: "/essentiel" },
        { label: "CBD & USAGES", href: "/usages" },
        { label: "PROFESSIONNEL", href: "/professionnel" }
    ]
};

export default function GlobalContentPage() {
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('contact');

    const [contact, setContact] = useState(DEFAULTS.contact);
    const [footerLinks, setFooterLinks] = useState(DEFAULTS.footerLinks);
    const [headerLinks, setHeaderLinks] = useState(DEFAULTS.headerLinks);
    const [visibility, setVisibility] = useState({
        headerBanner: true,
        newsletter: true
    });

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/admin/content/global', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                if (data.contact) setContact(data.contact);
                if (data.footerLinks) setFooterLinks(data.footerLinks);
                if (data.headerLinks) setHeaderLinks(data.headerLinks);
                if (data.visibility) setVisibility(prev => ({ ...prev, ...data.visibility }));
                setLoaded(true);
            }).catch(err => {
                if (err.name !== 'AbortError') setLoaded(true);
            });
        return () => controller.abort();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch('/api/admin/content/global', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact, footerLinks, headerLinks, visibility })
            });
            alert('Modifications enregistrées !');
        } catch { alert('Erreur lors de la sauvegarde'); }
        finally { setSaving(false); }
    };

    const updateLink = (index, field, value) => {
        setFooterLinks(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const updateHeaderLink = (index, field, value) => {
        setHeaderLinks(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const addLink = () => setFooterLinks(prev => [...prev, { label: '', href: '/' }]);
    const removeLink = (index) => setFooterLinks(prev => prev.filter((_, i) => i !== index));

    const addHeaderLink = () => setHeaderLinks(prev => [...prev, { label: '', href: '/' }]);
    const removeHeaderLink = (index) => setHeaderLinks(prev => prev.filter((_, i) => i !== index));

    if (!loaded) return <div style={{ padding: 20 }}>Chargement...</div>;

    const TABS = [
        { id: 'contact', label: '📞 Informations de contact' },
        { id: 'visibility', label: '👁️ Visibilité' }
    ];

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link href="/admin/builder" style={{ textDecoration: 'none', color: '#666' }}>← Retour</Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F4B40', margin: 0 }}>🌍 Éléments Globaux</h1>
            </div>

            {/* Tabs */}
            <div className={styles.adminTabsContainer}>
                {TABS.map(t => (
                    <button 
                        key={t.id} 
                        type="button" 
                        onClick={() => setTab(t.id)} 
                        className={`${styles.adminTab} ${tab === t.id ? styles.adminTabActive : ''}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className={styles.form} style={{ maxWidth: '100%' }}>

                {/* Contact */}
                {tab === 'contact' && (
                    <>
                        {[
                            { key: 'title', label: "Nom de l'entreprise" },
                            { key: 'address', label: 'Adresse' },
                            { key: 'phone', label: 'Téléphone' },
                            { key: 'email', label: 'Email' }
                        ].map(({ key, label }) => (
                            <div key={key} className={styles.fieldGroup}>
                                <label>{label}</label>
                                <input
                                    className={styles.input}
                                    value={contact[key]}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setContact(prev => ({ ...prev, [key]: value }));
                                    }}
                                />
                            </div>
                        ))}
                    </>
                )}
                {/* Visibilité */}
                {tab === 'visibility' && (
                    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #1F4B40' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1F4B40' }}>Paramètres de Visibilité Globale</h3>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                                <input
                                    type="checkbox"
                                    checked={visibility.headerBanner !== false}
                                    onChange={(e) => setVisibility(prev => ({ ...prev, headerBanner: e.target.checked }))}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Afficher le bandeau d'annonce (Header Banner)
                            </label>
                            <small style={{ display: 'block', marginTop: '5px', color: '#666', marginLeft: '28px' }}>Si activé, affiche un bandeau promotionnel tout en haut du site.</small>
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                                <input
                                    type="checkbox"
                                    checked={visibility.newsletter !== false}
                                    onChange={(e) => setVisibility(prev => ({ ...prev, newsletter: e.target.checked }))}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Afficher le formulaire de Newsletter (Footer)
                            </label>
                            <small style={{ display: 'block', marginTop: '5px', color: '#666', marginLeft: '28px' }}>Si activé, affiche l'encart d'inscription à la newsletter dans le pied de page.</small>
                        </div>
                    </div>
                )}

                <button type="submit" className={styles.saveBtn} disabled={saving}>
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
            </form>
        </div>
    );
}
