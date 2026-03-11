'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../[id]/Editor.module.css';
import ImageUpload from '@/components/Admin/ImageUpload';

const DEFAULTS = {
    hero: {
        title: "L'Essentiel"
    },
    intro: [
        "Nous sommes une bande d'amis d'enfance, passionnés par le CBD et convaincus qu'il doit être simple, accessible et de qualité.",
        "Chez Les Amis du CBD, aucune étiquette compliquée, ni de noms artificiels, nous on utilise un vocabulaire du quotidien.",
        "Notre aventure, c'est avant tout une histoire d'amis, de partage et de sincérité, avec nos partenaires et nos clients."
    ],
    legalItems: [
        { title: "Le CBD est-il légal en France ?", description: "Oui, le CBD est légal en France, à condition de respecter un cadre réglementaire strict.\nPour être autorisé à la vente et à la consommation, un produit à base de CBD doit impérativement :\n• contenir un taux de THC inférieur ou égal à 0,3 %\n• être issu de variétés de Cannabis sativa L. autorisées", image: "/images/about/legal.webp" },
        { title: "Pourquoi les analyses en laboratoire sont essentielles ?", description: "Les analyses de laboratoire ne sont pas un argument marketing.\nElles sont une garantie.\nChaque analyse permet de vérifier le taux réel de THC et la conformité légale du produit.", image: "/images/about/analysis.webp" },
        { title: "CBD et THC : deux molécules, deux effets très différents :", description: "Le CBD n'est pas psychotrope et est autorisé à la vente.\nLe THC est psychotrope et strictement réglementé.", image: "/images/about/molecules.webp" }
    ],
    cultureItems: [
        { title: "Culture naturelle : ce que cela change vraiment :", description: "Une culture naturelle permet de préserver les arômes d'origine et d'éviter les résidus chimiques.", image: "/images/about/culture_1.webp" },
        { title: "Le \"lavage\" du CBD : une pratique méconnue.", description: "Cette pratique peut altérer les arômes, modifier la couleur et appauvrir le profil naturel de la fleur.", image: "/images/about/culture_2.webp" },
        { title: "CBD pas cher : ce que cela veut vraiment dire.", description: "Une production simple, naturelle et maîtrisée permet de proposer un CBD accessible, sans sacrifier la qualité.", image: "/images/about/culture_3.webp" }
    ],
    essentialPoints: [
        "Le CBD est légal en France sous conditions strictes.",
        "Le CBD ne doit jamais être confondu avec des produits stupéfiants.",
        "La culture influence directement la qualité.",
        "La transparence est le meilleur indicateur de confiance."
    ],
    quote: {
        text: '"Comprendre avant d\'acheter.<br/>Explorer nos articles pédagogiques.<br/>Découvrir nos produits en toute confiance."',
        author: "Nelson — Les Amis du CBD"
    }
};

export default function EssentielContentPage() {
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('intro');
    const [hero, setHero] = useState(DEFAULTS.hero);
    const [intro, setIntro] = useState(DEFAULTS.intro);
    const [legalItems, setLegalItems] = useState(DEFAULTS.legalItems);
    const [cultureItems, setCultureItems] = useState(DEFAULTS.cultureItems);
    const [essentialPoints, setEssentialPoints] = useState(DEFAULTS.essentialPoints);
    const [quote, setQuote] = useState(DEFAULTS.quote);

    const [visibility, setVisibility] = useState({
        hero: true,
        intro: true,
        legalItems: true,
        cultureItems: true,
        essentialPoints: true,
        quote: true
    });

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/admin/content/essentiel', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                if (data.hero) setHero(data.hero);
                if (data.intro) setIntro(data.intro);
                if (data.legalItems) setLegalItems(data.legalItems);
                if (data.cultureItems) setCultureItems(data.cultureItems);
                if (data.essentialPoints) setEssentialPoints(data.essentialPoints);
                if (data.quote) setQuote(data.quote);
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
            await fetch('/api/admin/content/essentiel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hero, intro, legalItems, cultureItems, essentialPoints, quote, visibility })
            });
            alert('Modifications enregistrées !');
        } catch { alert('Erreur lors de la sauvegarde'); }
        finally { setSaving(false); }
    };

    const updateList = (setter, index, field, value) => {
        setter(prev => {
            const next = [...prev];
            if (field) {
                next[index] = { ...next[index], [field]: value };
            } else {
                next[index] = value;
            }
            return next;
        });
    };

    const TABS = ['hero', 'intro', 'legalItems', 'cultureItems', 'essentialPoints', 'quote'];
    const TAB_LABELS = { hero: '🏷 Hero', intro: '📝 Intro', legalItems: '⚖️ Légalité', cultureItems: '🌱 Culture', essentialPoints: '✅ Points clés', quote: '🖊 Citation' };

    if (!loaded) return <div style={{ padding: 20 }}>Chargement...</div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link href="/admin/content" style={{ textDecoration: 'none', color: '#666' }}>← Retour</Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F4B40', margin: 0 }}>🌿 Qui sommes-nous ?</h1>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '2px solid #eee', paddingBottom: 0, overflowX: 'auto', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
                {TABS.map(t => (
                    <button key={t} type="button" onClick={() => setTab(t)} style={{
                        background: 'none', border: 'none', borderBottom: tab === t ? '3px solid #1F4B40' : '3px solid transparent',
                        padding: '6px 14px', fontWeight: 700, color: tab === t ? '#1F4B40' : '#888',
                        cursor: 'pointer', fontSize: '0.85rem', marginBottom: -2
                    }}>{TAB_LABELS[t]}</button>
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
                        Afficher {TAB_LABELS[tab]} sur le site web
                    </label>
                    <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Décochez cette case pour masquer cette partie au public.</small>
                </div>

                {/* Hero */}
                {tab === 'hero' && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Image de fond</label>
                            <ImageUpload
                                currentImage={hero?.imageSrc || ''}
                                onImageChange={(url) => setHero(h => ({ ...h, imageSrc: url }))}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Titre H1 (affiché sur l'image en haut de page)</label>
                            <input className={styles.input} value={hero?.title || ''} onChange={e => setHero(h => ({ ...h, title: e.target.value }))} />
                        </div>
                    </>
                )}

                {/* Intro */}
                {tab === 'intro' && intro.map((para, i) => (
                    <div key={i} className={styles.fieldGroup}>
                        <label>Paragraphe {i + 1}</label>
                        <textarea
                            className={styles.textarea}
                            value={para}
                            rows={3}
                            onChange={e => updateList(setIntro, i, null, e.target.value)}
                        />
                    </div>
                ))}

                {/* Carousel items */}
                {(tab === 'legalItems' || tab === 'cultureItems') && (tab === 'legalItems' ? legalItems : cultureItems).map((item, i) => {
                    const setter = tab === 'legalItems' ? setLegalItems : setCultureItems;
                    return (
                        <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 15, background: '#fafafa' }}>
                            <p style={{ fontWeight: 700, color: '#888', fontSize: '0.8rem', margin: '0 0 10px', textTransform: 'uppercase' }}>Carte {i + 1}</p>
                            <div className={styles.fieldGroup}>
                                <label>Titre</label>
                                <input className={styles.input} value={item.title} onChange={e => updateList(setter, i, 'title', e.target.value)} />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Description</label>
                                <textarea className={styles.textarea} value={item.description} rows={4} onChange={e => updateList(setter, i, 'description', e.target.value)} />
                            </div>
                        </div>
                    );
                })}

                {/* Essential points */}
                {tab === 'essentialPoints' && essentialPoints.map((pt, i) => (
                    <div key={i} className={styles.fieldGroup}>
                        <label>Point {i + 1}</label>
                        <input className={styles.input} value={pt} onChange={e => updateList(setEssentialPoints, i, null, e.target.value)} />
                    </div>
                ))}

                {/* Quote */}
                {tab === 'quote' && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Texte (HTML accepté — &lt;br/&gt; pour les sauts de ligne)</label>
                            <textarea className={styles.textarea} value={quote.text} rows={4} onChange={e => setQuote(q => ({ ...q, text: e.target.value }))} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Auteur</label>
                            <input className={styles.input} value={quote.author} onChange={e => setQuote(q => ({ ...q, author: e.target.value }))} />
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
