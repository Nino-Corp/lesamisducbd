'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Layout, Menu, Link as LinkIcon, AlignLeft } from 'lucide-react';
import styles from './Navigation.module.css';

const DEFAULTS = {
    headerLinks: [
        { label: "PRODUITS", href: "/produits" },
        { label: "L'ESSENTIEL", href: "/essentiel" },
        { label: "CBD & USAGES", href: "/usages" },
        { label: "PROFESSIONNEL", href: "/professionnel" }
    ],
    footerLinks: [
        { label: "Livraison", href: "/livraison" },
        { label: "CGV", href: "/cgv" },
        { label: "Politique de confidentialité", href: "/privacy" },
        { label: "Transparence", href: "/transparence" },
        { label: "Buraliste", href: "/professionnel" }
    ]
};

export default function NavigationPage() {
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('header');

    const [globalData, setGlobalData] = useState({});
    const [headerLinks, setHeaderLinks] = useState(DEFAULTS.headerLinks);
    const [footerLinks, setFooterLinks] = useState(DEFAULTS.footerLinks);

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/admin/content/global', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                setGlobalData(data);
                if (data.headerLinks) setHeaderLinks(data.headerLinks);
                if (data.footerLinks) setFooterLinks(data.footerLinks);
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
                body: JSON.stringify({ ...globalData, headerLinks, footerLinks })
            });
            alert('Modifications enregistrées avec succès !');
        } catch { 
            alert('Erreur lors de la sauvegarde'); 
        } finally { 
            setSaving(false); 
        }
    };

    const updateLink = (type, index, field, value) => {
        const setter = type === 'header' ? setHeaderLinks : setFooterLinks;
        setter(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const addLink = (type) => {
        const setter = type === 'header' ? setHeaderLinks : setFooterLinks;
        setter(prev => [...prev, { label: '', href: '/' }]);
    };

    const removeLink = (type, index) => {
        const setter = type === 'header' ? setHeaderLinks : setFooterLinks;
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const moveLink = (type, index, direction) => {
        const setter = type === 'header' ? setHeaderLinks : setFooterLinks;
        setter(prev => {
            const next = [...prev];
            if (direction === 'up' && index > 0) {
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
            } else if (direction === 'down' && index < next.length - 1) {
                [next[index + 1], next[index]] = [next[index], next[index + 1]];
            }
            return next;
        });
    };

    if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Chargement de l'interface...</div>;

    const currentLinks = tab === 'header' ? headerLinks : footerLinks;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <LinkIcon size={28} />
                        Gestion de la Navigation
                    </h1>
                    <p className={styles.subtitle}>
                        Organisez et modifiez les liens globaux de votre site en temps réel.
                    </p>
                </div>
                <button onClick={handleSubmit} disabled={saving} className={styles.saveButton}>
                    <Save size={18} />
                    {saving ? 'Enregistrement...' : 'Publier les changements'}
                </button>
            </header>

            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <button 
                        className={`${styles.tabBtn} ${tab === 'header' ? styles.tabBtnActive : ''}`}
                        onClick={() => setTab('header')}
                    >
                        <Menu size={20} />
                        Barre du haut (Menu)
                    </button>
                    <button 
                        className={`${styles.tabBtn} ${tab === 'footer' ? styles.tabBtnActive : ''}`}
                        onClick={() => setTab('footer')}
                    >
                        <Layout size={20} />
                        Pied de page (Footer)
                    </button>
                </aside>

                <main className={styles.content}>
                    <h2 className={styles.sectionTitle}>
                        {tab === 'header' ? 'Liens du Menu Principal' : 'Liens du Pied de Page'}
                    </h2>
                    <p className={styles.sectionDesc}>
                        {tab === 'header' 
                            ? "Définissez les liens les plus importants qui seront toujours visibles en haut de votre site."
                            : "Ces liens apparaissent en bas de page. Parfait pour les pages légales ou secondaires."}
                    </p>

                    <div className={styles.linksList}>
                        {currentLinks.map((link, i) => (
                            <div key={i} className={styles.linkCard}>
                                <div className={styles.cardControls}>
                                    <button 
                                        type="button" 
                                        onClick={() => moveLink(tab, i, 'up')}
                                        className={styles.iconBtn}
                                        disabled={i === 0}
                                        style={{ opacity: i === 0 ? 0.3 : 1, cursor: i === 0 ? 'default' : 'pointer' }}
                                        title="Monter"
                                    >
                                        <ArrowUp size={18} />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => moveLink(tab, i, 'down')}
                                        className={styles.iconBtn}
                                        disabled={i === currentLinks.length - 1}
                                        style={{ opacity: i === currentLinks.length - 1 ? 0.3 : 1, cursor: i === currentLinks.length - 1 ? 'default' : 'pointer' }}
                                        title="Descendre"
                                    >
                                        <ArrowDown size={18} />
                                    </button>
                                </div>

                                <div className={styles.inputs}>
                                    <div className={styles.inputWrapper}>
                                        <label className={styles.inputLabel}>
                                            <AlignLeft size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                            Texte du lien
                                        </label>
                                        <input
                                            className={styles.inputField}
                                            placeholder="Ex: PRODUITS"
                                            value={link.label}
                                            onChange={e => updateLink(tab, i, 'label', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label className={styles.inputLabel}>
                                            <LinkIcon size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                            URL de destination
                                        </label>
                                        <input
                                            className={styles.inputField}
                                            placeholder="Ex: /produits ou https://..."
                                            value={link.href}
                                            onChange={e => updateLink(tab, i, 'href', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => removeLink(tab, i)}
                                    className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                    title="Supprimer ce lien"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button 
                        type="button" 
                        onClick={() => addLink(tab)}
                        className={styles.addBtn}
                    >
                        <Plus size={20} />
                        Ajouter un nouveau lien
                    </button>
                </main>
            </div>
        </div>
    );
}
