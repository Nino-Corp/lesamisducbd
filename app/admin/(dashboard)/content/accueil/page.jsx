'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../[id]/Editor.module.css';
import ImageUpload from '@/components/Admin/ImageUpload';

const TABS = ['promo-marquee', 'hero-home', 'why-choose-us', 'quality-banner', 'faq-section', 'partners-section', 'interactive-map', 'partners-network', 'quote-section', 'join-us-section'];

const TAB_LABELS = {
    'promo-marquee': '📢 Bandeau',
    'hero-home': '🖼 Héro',
    'why-choose-us': '✅ Atouts',
    'quality-banner': '🏅 Qualité',
    'faq-section': '❓ FAQ',
    'partners-section': '💬 Témoignages',
    'interactive-map': '🗺️ Carte',
    'partners-network': '🤝 Réseau',
    'quote-section': '🖊 Citation',
    'join-us-section': '👋 Recrutement'
};

export default function AccueilContentPage() {
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('promo-marquee');
    const [sections, setSections] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/admin/content', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                if (data.sections) setSections(data.sections);
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
            await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sections })
            });
            alert('Modifications enregistrées sur la Page d\'Accueil !');
        } catch { alert('Erreur lors de la sauvegarde'); }
        finally { setSaving(false); }
    };

    const updateSection = (sectionId, field, value) => {
        setSections(prev => prev.map(s => {
            if (s.id === sectionId) {
                return { ...s, props: { ...s.props, [field]: value } };
            }
            return s;
        }));
    };

    const updateListItem = (sectionId, listField, index, itemField, value) => {
        setSections(prev => prev.map(s => {
            if (s.id === sectionId) {
                const newList = [...(s.props[listField] || [])];
                if (itemField) {
                    newList[index] = { ...newList[index], [itemField]: value };
                } else {
                    newList[index] = value;
                }
                return { ...s, props: { ...s.props, [listField]: newList } };
            }
            return s;
        }));
    };

    const addListItem = (sectionId, listField, emptyItem) => {
        setSections(prev => prev.map(s => {
            if (s.id === sectionId) {
                const newList = [...(s.props[listField] || []), emptyItem];
                return { ...s, props: { ...s.props, [listField]: newList } };
            }
            return s;
        }));
    };

    const removeListItem = (sectionId, listField, index) => {
        setSections(prev => prev.map(s => {
            if (s.id === sectionId) {
                const newList = [...(s.props[listField] || [])];
                newList.splice(index, 1);
                return { ...s, props: { ...s.props, [listField]: newList } };
            }
            return s;
        }));
    };

    if (!loaded) return <div style={{ padding: 20 }}>Chargement...</div>;

    const activeSection = sections.find(s => s.id === tab);

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link href="/admin/content" style={{ textDecoration: 'none', color: '#666' }}>← Retour</Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F4B40', margin: 0 }}>🏠 Page d'Accueil</h1>
            </div>

            {/* Tabs */}
            <div className={styles.adminTabsContainer}>
                {TABS.map(t => (
                    <button 
                        key={t} 
                        type="button" 
                        onClick={() => setTab(t)} 
                        className={`${styles.adminTab} ${tab === t ? styles.adminTabActive : ''}`}
                    >
                        {TAB_LABELS[t]}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className={styles.form} style={{ maxWidth: '100%' }}>

                {activeSection && (
                    <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #1F4B40' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                            <input
                                type="checkbox"
                                checked={activeSection.props.isVisible !== false}
                                onChange={(e) => updateSection(tab, 'isVisible', e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            Afficher cette section sur le site web
                        </label>
                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Décochez cette case pour masquer cette partie au public.</small>
                    </div>
                )}

                {/* --- MARQUEE --- */}
                {tab === 'promo-marquee' && activeSection && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Texte défilant</label>
                            <input required className={styles.input} value={activeSection.props.text || ''} onChange={e => updateSection(tab, 'text', e.target.value)} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Vitesse (px/s)</label>
                            <input required type="number" className={styles.input} value={activeSection.props.speed || 70} onChange={e => updateSection(tab, 'speed', e.target.value)} />
                        </div>
                    </>
                )}

                {/* --- HERO --- */}
                {tab === 'hero-home' && activeSection && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Image de fond</label>
                            <ImageUpload currentImage={activeSection.props.backgroundImage || ''} onImageChange={(url) => updateSection(tab, 'backgroundImage', url)} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Titre principal (HTML accepté)</label>
                            <input required className={styles.input} value={activeSection.props.title || ''} onChange={e => updateSection(tab, 'title', e.target.value)} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Description (HTML accepté)</label>
                            <textarea required className={styles.textarea} rows={3} value={activeSection.props.description || ''} onChange={e => updateSection(tab, 'description', e.target.value)} />
                        </div>
                        <div style={{display: 'flex', gap: 20}}>
                            <div className={styles.fieldGroup} style={{flex: 1}}>
                                <label>Bouton - Texte</label>
                                <input required className={styles.input} value={activeSection.props.ctaLabel || ''} onChange={e => updateSection(tab, 'ctaLabel', e.target.value)} />
                            </div>
                            <div className={styles.fieldGroup} style={{flex: 1}}>
                                <label>Bouton - Lien</label>
                                <input required className={styles.input} value={activeSection.props.ctaLink || ''} onChange={e => updateSection(tab, 'ctaLink', e.target.value)} />
                            </div>
                        </div>
                    </>
                )}

                {/* --- WHY CHOOSE US --- */}
                {tab === 'why-choose-us' && activeSection && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Titre de la section</label>
                            <input required className={styles.input} value={activeSection.props.title || ''} onChange={e => updateSection(tab, 'title', e.target.value)} />
                        </div>
                        <h3 className={styles.subTitle} style={{marginTop: 30}}>Arguments (6 max recommandés)</h3>
                        {(activeSection.props.features || []).map((feat, i) => (
                            <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 15, background: '#fafafa', marginBottom: 15 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <p style={{ fontWeight: 700, margin: 0 }}>Argument {i + 1}</p>
                                    <button type="button" onClick={() => removeListItem(tab, 'features', i)} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>Supprimer</button>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Titre</label>
                                    <input required className={styles.input} value={feat.title || ''} onChange={e => updateListItem(tab, 'features', i, 'title', e.target.value)} />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Description</label>
                                    <textarea required className={styles.textarea} rows={2} value={feat.description || ''} onChange={e => updateListItem(tab, 'features', i, 'description', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem(tab, 'features', { title: 'Nouvel argument', description: 'Texte...' })} style={{ background: '#f0f0f0', border: '1px dashed #ccc', padding: '10px 15px', borderRadius: 6, cursor: 'pointer', width: '100%', fontWeight: 'bold', color: '#555' }}>
                            + Ajouter un argument
                        </button>
                    </>
                )}

                {/* --- QUALITY BANNER --- */}
                {tab === 'quality-banner' && activeSection && (
                     <>
                        <div className={styles.fieldGroup}>
                            <label>Titre principal</label>
                            <input required className={styles.input} value={activeSection.props.title || ''} onChange={e => updateSection(tab, 'title', e.target.value)} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Sous-titre / Slogan</label>
                            <input required className={styles.input} value={activeSection.props.subtitle || ''} onChange={e => updateSection(tab, 'subtitle', e.target.value)} />
                        </div>
                    </>
                )}

                {/* --- FAQ --- */}
                {tab === 'faq-section' && activeSection && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Titre de section</label>
                            <input required className={styles.input} value={activeSection.props.title || ''} onChange={e => updateSection(tab, 'title', e.target.value)} />
                        </div>
                        <h3 className={styles.subTitle} style={{marginTop: 30}}>Questions</h3>
                        {(activeSection.props.items || []).map((item, i) => (
                            <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 15, background: '#fafafa', marginBottom: 15 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <p style={{ fontWeight: 700, margin: 0 }}>Question {i + 1}</p>
                                    <button type="button" onClick={() => removeListItem(tab, 'items', i)} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>Supprimer</button>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Question</label>
                                    <input required className={styles.input} value={item.question || ''} onChange={e => updateListItem(tab, 'items', i, 'question', e.target.value)} />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Réponse (HTML accepté)</label>
                                    <textarea required className={styles.textarea} rows={4} value={item.answer || ''} onChange={e => updateListItem(tab, 'items', i, 'answer', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem(tab, 'items', { question: 'Nouvelle question ?', answer: 'Réponse...' })} style={{ background: '#f0f0f0', border: '1px dashed #ccc', padding: '10px 15px', borderRadius: 6, cursor: 'pointer', width: '100%', fontWeight: 'bold', color: '#555' }}>
                            + Ajouter une question
                        </button>
                    </>
                )}

                {/* --- PARTNERS --- */}
                {tab === 'partners-section' && activeSection && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Titre (Ex: "+ de 300")</label>
                            <input required className={styles.input} value={activeSection.props.title || ''} onChange={e => updateSection(tab, 'title', e.target.value)} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Sous-titre (HTML supporté)</label>
                            <textarea required className={styles.textarea} rows={2} value={activeSection.props.subtitle || ''} onChange={e => updateSection(tab, 'subtitle', e.target.value)} />
                        </div>
                        <h3 className={styles.subTitle} style={{marginTop: 30}}>Témoignages</h3>
                        {(activeSection.props.partners || []).map((p, i) => (
                            <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 15, background: '#fafafa', marginBottom: 15 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <p style={{ fontWeight: 700, margin: 0 }}>Témoignage {i + 1}</p>
                                    <button type="button" onClick={() => removeListItem(tab, 'partners', i)} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>Supprimer</button>
                                </div>
                                <div style={{display: 'flex', gap: 20}}>
                                    <div className={styles.fieldGroup} style={{flex: 1}}>
                                        <label>Boutique</label>
                                        <input required className={styles.input} value={p.name || ''} onChange={e => updateListItem(tab, 'partners', i, 'name', e.target.value)} />
                                    </div>
                                    <div className={styles.fieldGroup} style={{flex: 1}}>
                                        <label>Gérant</label>
                                        <input required className={styles.input} value={p.role || ''} onChange={e => updateListItem(tab, 'partners', i, 'role', e.target.value)} />
                                    </div>
                                </div>
                                <div className={styles.fieldGroup} style={{marginTop: 10}}>
                                    <label>Citation (HTML supporté)</label>
                                    <textarea required className={styles.textarea} rows={3} value={p.quote || ''} onChange={e => updateListItem(tab, 'partners', i, 'quote', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem(tab, 'partners', { name: 'Nom', role: 'Rôle', quote: 'Citation...' })} style={{ background: '#f0f0f0', border: '1px dashed #ccc', padding: '10px 15px', borderRadius: 6, cursor: 'pointer', width: '100%', fontWeight: 'bold', color: '#555' }}>
                            + Ajouter un témoignage
                        </button>
                    </>
                )}

                {/* --- INTERACTIVE MAP --- */}
                {tab === 'interactive-map' && activeSection && (
                     <>
                        <div className={styles.fieldGroup}>
                            <label>Titre de la carte</label>
                            <input required className={styles.input} value={activeSection.props.title || ''} onChange={e => updateSection(tab, 'title', e.target.value)} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Texte descriptif</label>
                            <textarea required className={styles.textarea} rows={4} value={activeSection.props.description || ''} onChange={e => updateSection(tab, 'description', e.target.value)} />
                        </div>
                    </>
                )}

                {/* --- PARTNERS NETWORK --- */}
                {tab === 'partners-network' && activeSection && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label>Titre</label>
                            <input required className={styles.input} value={activeSection.props.title || ''} onChange={e => updateSection(tab, 'title', e.target.value)} />
                        </div>
                        <h3 className={styles.subTitle} style={{marginTop: 30}}>Logos Partenaires</h3>
                        {(activeSection.props.partners || []).map((p, i) => (
                            <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 15, background: '#fafafa', marginBottom: 15, display: 'flex', gap: 20, alignItems: 'center' }}>
                                <div style={{flex: 1}}>
                                    <label>Image Logo</label>
                                    <ImageUpload currentImage={p.image || ''} onImageChange={(url) => updateListItem(tab, 'partners', i, 'image', url)} />
                                </div>
                                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 10}}>
                                    <div className={styles.fieldGroup} style={{marginBottom: 0}}>
                                        <label>Nom (Alt Text)</label>
                                        <input required className={styles.input} value={p.name || ''} onChange={e => updateListItem(tab, 'partners', i, 'name', e.target.value)} />
                                    </div>
                                    <button type="button" onClick={() => removeListItem(tab, 'partners', i)} style={{ alignSelf: 'flex-start', background: '#ffebee', color: '#c62828', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>Supprimer logo</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem(tab, 'partners', { name: 'Nouveau', image: '' })} style={{ background: '#f0f0f0', border: '1px dashed #ccc', padding: '10px 15px', borderRadius: 6, cursor: 'pointer', width: '100%', fontWeight: 'bold', color: '#555' }}>
                            + Ajouter un logo
                        </button>
                    </>
                )}

                {/* --- QUOTE --- */}
                {tab === 'quote-section' && activeSection && (
                     <>
                        <div className={styles.fieldGroup}>
                            <label>Texte de la citation (HTML accepté)</label>
                            <textarea required className={styles.textarea} rows={4} value={activeSection.props.text || ''} onChange={e => updateSection(tab, 'text', e.target.value)} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Auteur</label>
                            <input required className={styles.input} value={activeSection.props.author || ''} onChange={e => updateSection(tab, 'author', e.target.value)} />
                        </div>
                    </>
                )}

                {/* --- JOIN US --- */}
                {tab === 'join-us-section' && activeSection && (
                     <>
                        <div className={styles.fieldGroup}>
                            <label>Titre</label>
                            <input required className={styles.input} value={activeSection.props.title || ''} onChange={e => updateSection(tab, 'title', e.target.value)} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Texte principal</label>
                            <textarea required className={styles.textarea} rows={4} value={activeSection.props.text || ''} onChange={e => updateSection(tab, 'text', e.target.value)} />
                        </div>
                        <div style={{display: 'flex', gap: 20}}>
                            <div className={styles.fieldGroup} style={{flex: 1}}>
                                <label>Bouton - Texte</label>
                                <input required className={styles.input} value={activeSection.props.buttonLabel || ''} onChange={e => updateSection(tab, 'buttonLabel', e.target.value)} />
                            </div>
                            <div className={styles.fieldGroup} style={{flex: 1}}>
                                <label>Bouton - Lien</label>
                                <input required className={styles.input} value={activeSection.props.buttonLink || ''} onChange={e => updateSection(tab, 'buttonLink', e.target.value)} />
                            </div>
                        </div>
                    </>
                )}


                <button type="submit" className={styles.saveBtn} disabled={saving} style={{ marginTop: 40, width: '100%' }}>
                    {saving ? 'Sauvegarde...' : 'Sauvegarder la page d\'accueil entière'}
                </button>
            </form>
        </div>
    );
}
