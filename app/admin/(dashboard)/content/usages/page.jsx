'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../[id]/Editor.module.css';
import ImageUpload from '@/components/Admin/ImageUpload';

const DEFAULTS = {
    hero: {
        title: "Le CBD ?"
    },
    intro: {
        title: "CBD : usages courants,\nlimites et bonnes pratiques.",
        text: "Le CBD est utilisé par de nombreuses personnes dans la vie quotidienne.\nCette page présente 5 usages fréquents, avec leurs limites et bonnes pratiques.\nLe CBD n'est pas un médicament et ne remplace jamais un avis médical."
    },
    carousel: {
        title: "Usages du CBD\nau quotidien :",
        items: [
            {
                title: "Détente et relaxation",
                description: "Le CBD est souvent consommé pour favoriser un état de calme et de détente, surtout dans les périodes de stress ponctuel.\n\nIl peut être intégré à vos routines de relaxation, méditation ou moments cocooning.",
                image: "/images/usages/detente.webp"
            },
            {
                title: "Sommeil et routines nocturnes",
                description: "Certaines personnes intègrent le CBD à leur rituel du coucher. Il ne s'agit pas d'un somnifère, mais d'un complément qui peut aider à préparer un sommeil plus serein.\n\nUne bonne hygiène de sommeil reste essentielle : horaires réguliers, environnement calme et réduction des écrans.",
                image: "/images/usages/sommeil.webp"
            },
            {
                title: "Concentration et focus",
                description: "Le CBD peut accompagner certains moments de concentration, que ce soit pour le travail, les études ou les projets créatifs.\n\nIl s'agit d'un usage complémentaire, qui vise à favoriser un état calme et attentif sans stimuler artificiellement.",
                image: "/images/usages/cosmetique.webp"
            },
            {
                title: "Récupération physique",
                description: "Le CBD est parfois utilisé après l'effort pour soutenir la récupération naturelle.\n\nIl peut s'intégrer à une routine de récupération incluant repos, hydratation et étirements, mais il ne remplace pas les fondamentaux de la récupération physique.",
                image: "/images/usages/sport.webp"
            },
            {
                title: "Bien-être au quotidien",
                description: "Le CBD peut être intégré à des petites routines de bien-être au quotidien : pauses relaxantes, moments personnels ou rituels simples.\n\nL'important reste la régularité, l'écoute de soi et le respect des dosages conseillés.",
                image: "/images/usages/cuisine.webp"
            }
        ]
    },
    warning: {
        title: "Le CBD :\nn'est pas un médicament, ne guérit aucune maladie, ne remplace pas un traitement médical.\nEn cas de doute, de traitement en cours ou de condition particulière, consultez un professionnel de santé.",
        responsibleTitle: "Pour une utilisation responsable :\nproduits analysés en laboratoire, origine claire, taux de THC conforme, information transparente"
    },
    essential: {
        title: "L'essentiel sur les usages du CBD :",
        items: [
            "Le CBD s'inscrit dans une démarche de bien-être",
            "Les usages varient selon les individus",
            "Il ne s'agit jamais d'un traitement médical",
            "La qualité et la transparence sont essentielles"
        ]
    },
    quote: {
        text: "\"Découvrir le CBD en toute responsabilité.<br/>Explorez nos produits.<br/>Lire nos guides pédagogiques.\"",
        author: "Nelson — Les Amis du CBD"
    },
    joinUs: {
        title: "Nous rejoindre",
        buttonLabel: "Venez par ici",
        buttonLink: "/recrutement",
        text: "Aucun poste ouvert pour le moment ? Les candidatures spontanées sont toujours les bienvenues."
    }
};

export default function UsagesContentPage() {
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('intro');

    const [hero, setHero] = useState(DEFAULTS.hero);
    const [intro, setIntro] = useState(DEFAULTS.intro);
    const [carousel, setCarousel] = useState(DEFAULTS.carousel);
    const [warning, setWarning] = useState(DEFAULTS.warning);
    const [essential, setEssential] = useState(DEFAULTS.essential);
    const [quote, setQuote] = useState(DEFAULTS.quote);
    const [joinUs, setJoinUs] = useState(DEFAULTS.joinUs);

    const [visibility, setVisibility] = useState({
        intro: true,
        carousel: true,
        warning: true,
        essential: true,
        quote: true,
        joinUs: true
    });

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/admin/content/usages', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                if (data.hero) setHero(data.hero);
                if (data.intro) setIntro(data.intro);
                if (data.carousel) setCarousel(data.carousel);
                if (data.warning) setWarning(data.warning);
                if (data.essential) setEssential(data.essential);
                if (data.quote) setQuote(data.quote);
                if (data.joinUs) setJoinUs(data.joinUs);
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
            await fetch('/api/admin/content/usages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hero, intro, carousel, warning, essential, quote, joinUs, visibility })
            });
            alert('Modifications enregistrées !');
        } catch { alert('Erreur lors de la sauvegarde'); }
        finally { setSaving(false); }
    };

    const updateCarouselItem = (index, field, value) => {
        setCarousel(prev => {
            const nextItems = [...prev.items];
            nextItems[index] = { ...nextItems[index], [field]: value };
            return { ...prev, items: nextItems };
        });
    };

    const updateEssentialItem = (index, value) => {
        setEssential(prev => {
            const nextItems = [...prev.items];
            nextItems[index] = value;
            return { ...prev, items: nextItems };
        });
    };

    const TABS = [
        { id: 'intro', label: '🏷 Introduction' },
        { id: 'carousel', label: '🎠 Carrousel Usages' },
        { id: 'warning', label: '⚠️ L\'Essentiel & Avertissements' },
        { id: 'quote', label: '💬 Citation & Nous rejoindre' }
    ];

    if (!loaded) return <div style={{ padding: 20 }}>Chargement...</div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link href="/admin/content" style={{ textDecoration: 'none', color: '#666' }}>← Retour</Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F4B40', margin: 0 }}>💨 CBD & Usages</h1>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '2px solid #eee', paddingBottom: 0, overflowX: 'auto', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
                {TABS.map(t => (
                    <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{
                        background: 'none', border: 'none', borderBottom: tab === t.id ? '3px solid #1F4B40' : '3px solid transparent',
                        padding: '6px 14px', fontWeight: 700, color: tab === t.id ? '#1F4B40' : '#888',
                        cursor: 'pointer', fontSize: '0.85rem', marginBottom: -2
                    }}>{t.label}</button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className={styles.form} style={{ maxWidth: '100%' }}>

                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #1F4B40' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <input
                            type="checkbox"
                            checked={visibility[tab] !== false}
                            onChange={(e) => setVisibility(prev => ({ ...prev, [tab]: e.target.checked }))}
                            style={{ width: '18px', height: '18px' }}
                        />
                        Afficher ce bloc sur le site web
                    </label>
                    <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Décochez cette case pour masquer cette partie au public.</small>

                    {tab === 'warning' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                            <input
                                type="checkbox"
                                checked={visibility.essential !== false}
                                onChange={(e) => setVisibility(prev => ({ ...prev, essential: e.target.checked }))}
                                style={{ width: '18px', height: '18px' }}
                            />
                            Afficher le panneau "L'essentiel sur les usages"
                        </label>
                    )}

                    {tab === 'quote' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                            <input
                                type="checkbox"
                                checked={visibility.joinUs !== false}
                                onChange={(e) => setVisibility(prev => ({ ...prev, joinUs: e.target.checked }))}
                                style={{ width: '18px', height: '18px' }}
                            />
                            Afficher le bloc "Nous rejoindre"
                        </label>
                    )}
                </div>

                {/* Intro */}
                {tab === 'intro' && (
                    <>
                        <h2 style={{ fontSize: '1rem', color: '#1F4B40', borderBottom: '1px solid #ddd', paddingBottom: 5 }}>Bloc Hero</h2>
                        <div className={styles.fieldGroup}>
                            <label>Image de fond</label>
                            <ImageUpload
                                currentImage={hero?.imageSrc || ''}
                                onImageChange={(url) => setHero(h => ({ ...h, imageSrc: url }))}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Titre H1 principal</label>
                            <input className={styles.input} value={hero.title} onChange={e => setHero(h => ({ ...h, title: e.target.value }))} />
                        </div>
                        <h2 style={{ fontSize: '1rem', color: '#1F4B40', borderBottom: '1px solid #ddd', paddingBottom: 5, marginTop: 20 }}>Message d'Introduction</h2>
                        <div className={styles.fieldGroup}>
                            <label>Titre H2</label>
                            <textarea className={styles.textarea} value={intro.title} rows={2} onChange={e => setIntro(i => ({ ...i, title: e.target.value }))} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Corps du texte (les retours à la ligne seront respectés)</label>
                            <textarea className={styles.textarea} value={intro.text} rows={4} onChange={e => setIntro(i => ({ ...i, text: e.target.value }))} />
                        </div>
                    </>
                )}

                {/* Carousel */}
                {tab === 'carousel' && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Titre de section Carrousel H2</label>
                            <textarea className={styles.textarea} value={carousel.title} rows={2} onChange={e => setCarousel(c => ({ ...c, title: e.target.value }))} />
                        </div>

                        {carousel.items.map((item, i) => (
                            <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 15, background: '#fafafa', marginTop: 15 }}>
                                <p style={{ fontWeight: 700, color: '#888', fontSize: '0.8rem', margin: '0 0 10px', textTransform: 'uppercase' }}>Usage {i + 1}</p>
                                <div className={styles.fieldGroup}>
                                    <label>Titre de l'usage</label>
                                    <input className={styles.input} value={item.title} onChange={e => updateCarouselItem(i, 'title', e.target.value)} />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Description</label>
                                    <textarea className={styles.textarea} value={item.description} rows={3} onChange={e => updateCarouselItem(i, 'description', e.target.value)} />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Lien de l'image</label>
                                    <input className={styles.input} value={item.image} onChange={e => updateCarouselItem(i, 'image', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Warning & Essential */}
                {tab === 'warning' && (
                    <>
                        <h2 style={{ fontSize: '1rem', color: '#1F4B40', borderBottom: '1px solid #ddd', paddingBottom: 5 }}>Bloc Avertissement (Police imposante)</h2>
                        <div className={styles.fieldGroup}>
                            <label>Texte de prévention principal</label>
                            <textarea className={styles.textarea} value={warning.title} rows={4} onChange={e => setWarning(w => ({ ...w, title: e.target.value }))} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Sous-titre de prévention</label>
                            <textarea className={styles.textarea} value={warning.responsibleTitle} rows={3} onChange={e => setWarning(w => ({ ...w, responsibleTitle: e.target.value }))} />
                        </div>

                        <h2 style={{ fontSize: '1rem', color: '#1F4B40', borderBottom: '1px solid #ddd', paddingBottom: 5, marginTop: 20 }}>Panneau "L'essentiel" (Fond gris clair)</h2>
                        <div className={styles.fieldGroup}>
                            <label>Titre du panneau</label>
                            <input className={styles.input} value={essential.title} onChange={e => setEssential(e => ({ ...e, title: e.target.value }))} />
                        </div>
                        {essential.items.map((item, i) => (
                            <div className={styles.fieldGroup} key={i}>
                                <label>Point-clé {i + 1}</label>
                                <input className={styles.input} value={item} onChange={e => updateEssentialItem(i, e.target.value)} />
                            </div>
                        ))}
                    </>
                )}

                {/* Quote & JoinUs */}
                {tab === 'quote' && (
                    <>
                        <h2 style={{ fontSize: '1rem', color: '#1F4B40', borderBottom: '1px solid #ddd', paddingBottom: 5 }}>Citation pleine largeur</h2>
                        <div className={styles.fieldGroup}>
                            <label>Texte de la citation (Utilisez &lt;br/&gt; pour les sauts de ligne)</label>
                            <textarea className={styles.textarea} value={quote.text} rows={3} onChange={e => setQuote(q => ({ ...q, text: e.target.value }))} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Auteur / Signature</label>
                            <input className={styles.input} value={quote.author} onChange={e => setQuote(q => ({ ...q, author: e.target.value }))} />
                        </div>

                        <h2 style={{ fontSize: '1rem', color: '#1F4B40', borderBottom: '1px solid #ddd', paddingBottom: 5, marginTop: 20 }}>Call to action : Recrutement</h2>
                        <div className={styles.fieldGroup}>
                            <label>Titre H2</label>
                            <input className={styles.input} value={joinUs.title} onChange={e => setJoinUs(j => ({ ...j, title: e.target.value }))} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Texte descriptif</label>
                            <textarea className={styles.textarea} value={joinUs.text} rows={2} onChange={e => setJoinUs(j => ({ ...j, text: e.target.value }))} />
                        </div>
                        <div style={{ display: 'flex', gap: 15 }}>
                            <div className={styles.fieldGroup} style={{ flex: 1 }}>
                                <label>Texte du Bouton</label>
                                <input className={styles.input} value={joinUs.buttonLabel} onChange={e => setJoinUs(j => ({ ...j, buttonLabel: e.target.value }))} />
                            </div>
                            <div className={styles.fieldGroup} style={{ flex: 1 }}>
                                <label>Lien de destination du Bouton</label>
                                <input className={styles.input} value={joinUs.buttonLink} onChange={e => setJoinUs(j => ({ ...j, buttonLink: e.target.value }))} />
                            </div>
                        </div>
                    </>
                )}

                <button type="submit" className={styles.saveBtn} disabled={saving}>
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
            </form>
        </div>
    );
}
