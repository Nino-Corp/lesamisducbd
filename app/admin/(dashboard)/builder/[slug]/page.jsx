'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../Builder.module.css';
import { TEMPLATES, CATEGORIES } from '../builderConfig';
import { EDITORS } from '../builderEditors';
import LivePreview from '../LivePreview';

export default function PageEditor() {
    const { slug } = useParams();
    const router = useRouter();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [showPreview, setShowPreview] = useState(true);
    const [showSEOModal, setShowSEOModal] = useState(false);
    const [dragOver, setDragOver] = useState(null);
    const [dragging, setDragging] = useState(null);

    useEffect(() => { if (slug) fetchPage(); }, [slug]);

    const fetchPage = async () => {
        try {
            const res = await fetch(`/api/admin/builder?slug=${slug}`);
            if (!res.ok) throw new Error('Failed');
            setPage(await res.json());
        } catch {
            router.push('/admin/builder');
        } finally {
            setLoading(false);
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/builder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(page) });
            if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
        } finally { setSaving(false); }
    };

    const addSection = (template) => {
        const newSection = { id: `${template.type.toLowerCase()}-${Date.now()}`, type: template.type, props: { ...template.defaultProps } };
        const next = [...(page.sections || []), newSection];
        setPage({ ...page, sections: next });
        setActiveSection(next.length - 1);
        setShowTemplateModal(false);
    };

    const removeSection = (index) => {
        if (!confirm('Supprimer cette section ?')) return;
        const next = page.sections.filter((_, i) => i !== index);
        setPage({ ...page, sections: next });
        if (activeSection === index) setActiveSection(null);
        else if (activeSection > index) setActiveSection(activeSection - 1);
    };

    const duplicateSection = (index) => {
        const orig = page.sections[index];
        const copy = { ...orig, id: `${orig.type.toLowerCase()}-${Date.now()}`, props: { ...orig.props } };
        const next = [...page.sections];
        next.splice(index + 1, 0, copy);
        setPage({ ...page, sections: next });
        setActiveSection(index + 1);
    };

    const moveSection = (index, dir) => {
        const next = [...page.sections];
        const target = index + dir;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        setPage({ ...page, sections: next });
        setActiveSection(target);
    };

    const toggleVisibility = (index) => {
        const next = page.sections.map((s, i) =>
            i === index ? { ...s, props: { ...s.props, isVisible: s.props?.isVisible === false ? true : false } } : s
        );
        setPage({ ...page, sections: next });
    };

    const updateProps = (index, newProps) => {
        const next = page.sections.map((s, i) => i === index ? { ...s, props: { ...s.props, ...newProps } } : s);
        setPage({ ...page, sections: next });
    };

    // Drag & drop (native HTML5, no dnd-kit needed)
    const onDragStart = (e, index) => { setDragging(index); e.dataTransfer.effectAllowed = 'move'; };
    const onDragOver = (e, index) => { e.preventDefault(); setDragOver(index); };
    const onDrop = (e, index) => {
        e.preventDefault();
        if (dragging === null || dragging === index) { setDragOver(null); setDragging(null); return; }
        const next = [...page.sections];
        const [moved] = next.splice(dragging, 1);
        next.splice(index, 0, moved);
        setPage({ ...page, sections: next });
        setActiveSection(index);
        setDragOver(null);
        setDragging(null);
    };

    // Reorder from LivePreview canvas
    const handleReorder = (fromIndex, toIndex) => {
        const next = [...page.sections];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        setPage({ ...page, sections: next });
        setActiveSection(toIndex);
    };

    if (loading) return <div className={styles.container}><div className={styles.loadingState}>Chargement…</div></div>;

    const currentSection = activeSection !== null ? page.sections[activeSection] : null;
    const EditorComponent = currentSection ? EDITORS[currentSection.type] : null;
    const filteredTemplates = activeCategory === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === activeCategory);

    return (
        <div className={styles.container}>
            {/* Top Bar */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/admin/builder" className={styles.backLink}>← Retour</Link>
                    <div>
                        <h1 className={styles.title}>Éditeur : {page.title}</h1>
                        <code className={styles.pageSlug}>/p/{page.slug}</code>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button
                        onClick={() => setShowSEOModal(true)}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #1F4B40', background: 'white', color: '#1F4B40', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        ⚙️ SEO
                    </button>
                    <a href={`https://www.lesamisducbd.fr/p/${page.slug}`} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '8px 16px', borderRadius: '8px', background: '#f3f4f6', color: '#1F2937', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                        🔗 Voir en ligne
                    </a>
                    <button
                        className={`${styles.saveButton} ${saved ? styles.saveSuccess : ''}`}
                        onClick={save} disabled={saving}
                    >
                        {saving ? 'Enregistrement…' : saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
                    </button>
                </div>
            </div>

            {/* Main layout */}
            <div className={styles.editorLayout}>

                {/* Col 1 — Left Sidebar (List OR Editor) */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
                    {activeSection === null ? (
                        /* SECTION LIST */
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F4B40' }}>Sections de la page <span style={{ background: '#e5e7eb', borderRadius: '99px', padding: '2px 8px', fontSize: '0.78rem' }}>{page.sections?.length || 0}</span></span>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                                {(!page.sections || page.sections.length === 0) && (
                                    <div style={{ textAlign: 'center', padding: '40px 16px', color: '#aaa', fontSize: '0.85rem' }}>
                                        <p>Aucune section.</p>
                                        <p>Cliquez sur "+ Ajouter" ci-dessous.</p>
                                    </div>
                                )}
                                {page.sections?.map((section, index) => {
                                    const tpl = TEMPLATES.find(t => t.type === section.type);
                                    const isActive = activeSection === index;
                                    const isHidden = section.props?.isVisible === false;
                                    const isDragTarget = dragOver === index;

                                    return (
                                        <div
                                            key={section.id || index}
                                            draggable
                                            onDragStart={e => onDragStart(e, index)}
                                            onDragOver={e => onDragOver(e, index)}
                                            onDrop={e => onDrop(e, index)}
                                            onDragLeave={() => setDragOver(null)}
                                            onClick={() => setActiveSection(index)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '12px', borderRadius: '10px', marginBottom: '6px',
                                                cursor: 'pointer',
                                                background: isActive ? '#1F4B40' : '#f9fdf9',
                                                color: isActive ? 'white' : '#333',
                                                border: isDragTarget ? '2px dashed #00FF94' : isActive ? '1px solid #1F4B40' : '1px solid #e5e7eb',
                                                opacity: isHidden ? 0.6 : 1,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <span style={{ cursor: 'grab', opacity: 0.5, fontSize: '1rem', flexShrink: 0 }}>⠿</span>
                                            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{tpl?.icon || '🧩'}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tpl?.label || section.type}</div>
                                                <div style={{ fontSize: '0.72rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {section.props?.title || section.props?.text || section.props?.src || 'Cliquez pour éditer'}
                                                </div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); toggleVisibility(index); }} title={isHidden ? 'Afficher' : 'Masquer'}
                                                style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: isActive ? '#fff' : '#666' }}>
                                                {isHidden ? '👁' : '🙈'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
                                <button onClick={() => setShowTemplateModal(true)}
                                    style={{ width: '100%', padding: '14px', background: '#00FF94', color: '#1F4B40', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(0,255,148,0.2)' }}>
                                    + Ajouter un bloc
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* EDITOR PANEL */
                        currentSection && EditorComponent ? (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px', background: '#fafafa' }}>
                                    <button onClick={() => setActiveSection(null)} style={{ background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', padding: '6px 12px', color: '#333', fontWeight: 600 }}>← Retour</button>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{TEMPLATES.find(t => t.type === currentSection.type)?.icon}</span>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1F4B40' }}>{TEMPLATES.find(t => t.type === currentSection.type)?.label}</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                                    <EditorComponent
                                        props={currentSection.props}
                                        onChange={(newProps) => updateProps(activeSection, newProps)}
                                    />
                                    {/* Advanced Options */}
                                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #ccc' }}>
                                        <h3 style={{ fontSize: '0.9rem', color: '#1F4B40', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>⚙️</span> Options Avancées
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Marge Haut</label>
                                                    <select 
                                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                                                        value={currentSection.props?.paddingTop || 'medium'}
                                                        onChange={e => updateProps(activeSection, { paddingTop: e.target.value })}
                                                    >
                                                        <option value="none">Aucune</option>
                                                        <option value="small">Petite</option>
                                                        <option value="medium">Moyenne</option>
                                                        <option value="large">Grande</option>
                                                        <option value="xl">Très grande</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Marge Bas</label>
                                                    <select 
                                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                                                        value={currentSection.props?.paddingBottom || 'medium'}
                                                        onChange={e => updateProps(activeSection, { paddingBottom: e.target.value })}
                                                    >
                                                        <option value="none">Aucune</option>
                                                        <option value="small">Petite</option>
                                                        <option value="medium">Moyenne</option>
                                                        <option value="large">Grande</option>
                                                        <option value="xl">Très grande</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                    <input type="checkbox" checked={!!currentSection.props?.hideMobile} onChange={e => updateProps(activeSection, { hideMobile: e.target.checked })} />
                                                    Masquer (Mobile)
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                    <input type="checkbox" checked={!!currentSection.props?.hideDesktop} onChange={e => updateProps(activeSection, { hideDesktop: e.target.checked })} />
                                                    Masquer (PC)
                                                </label>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>ID d'ancre (Optionnel)</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="ex: contact" 
                                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                                                    value={currentSection.props?.sectionId || ''}
                                                    onChange={e => updateProps(activeSection, { sectionId: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    )}
                </div>

                {/* Col 2 — Live preview Canvas */}
                <div style={{ overflow: 'hidden', background: '#e5e7eb', position: 'relative', borderRadius: '16px', border: '1px solid #ddd', height: '100%' }}>
                    <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 14px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600, zIndex: 20, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✨ CANVAS INTERACTIF</span>
                    </div>
                    <LivePreview
                        sections={page.sections || []}
                        activeIndex={activeSection}
                        onSelect={setActiveSection}
                        onMove={moveSection}
                        onDuplicate={duplicateSection}
                        onDelete={removeSection}
                        onUpdateProps={(index, props) => updateProps(index, props)}
                        onReorder={handleReorder}
                    />
                </div>
            </div>

            {/* Template picker modal */}
            {showTemplateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={() => setShowTemplateModal(false)}>
                    <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '720px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1F4B40' }}>Ajouter un bloc</h2>
                            <button onClick={() => setShowTemplateModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' }}>✕</button>
                        </div>

                        {/* Category tabs */}
                        <div style={{ display: 'flex', gap: '8px', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
                            <button onClick={() => setActiveCategory('all')}
                                style={{ padding: '6px 16px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', background: activeCategory === 'all' ? '#1F4B40' : '#f3f4f6', color: activeCategory === 'all' ? '#00FF94' : '#555', whiteSpace: 'nowrap' }}>
                                Tous
                            </button>
                            {CATEGORIES.map(cat => (
                                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                    style={{ padding: '6px 16px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', background: activeCategory === cat.id ? '#1F4B40' : '#f3f4f6', color: activeCategory === cat.id ? '#00FF94' : '#555', whiteSpace: 'nowrap' }}>
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                            {filteredTemplates.map(t => (
                                <button key={t.type} onClick={() => addSection(t)}
                                    style={{ padding: '20px 16px', borderRadius: '16px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.border = '1.5px solid #1F4B40'; e.currentTarget.style.background = '#f0fdf4'; }}
                                    onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid #e5e7eb'; e.currentTarget.style.background = '#fff'; }}>
                                    <span style={{ fontSize: '2rem' }}>{t.icon}</span>
                                    <strong style={{ fontSize: '0.88rem', color: '#1F4B40' }}>{t.label}</strong>
                                    <span style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.4 }}>{t.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SEO Modal */}
            {showSEOModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={() => setShowSEOModal(false)}>
                    <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1F4B40' }}>⚙️ Paramètres SEO</h2>
                            <button onClick={() => setShowSEOModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' }}>✕</button>
                        </div>

                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Meta Title</label>
                                <input 
                                    type="text" 
                                    value={page.seo?.metaTitle || ''} 
                                    onChange={e => setPage({ ...page, seo: { ...page.seo, metaTitle: e.target.value } })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                                    placeholder={`${page.title} - Les Amis du CBD`}
                                />
                                <div style={{ fontSize: '0.75rem', color: (page.seo?.metaTitle?.length || 0) > 60 ? '#ef4444' : '#6b7280', marginTop: '4px' }}>
                                    {page.seo?.metaTitle?.length || 0} / 60 caractères (recommandé)
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Meta Description</label>
                                <textarea 
                                    value={page.seo?.metaDescription || ''} 
                                    onChange={e => setPage({ ...page, seo: { ...page.seo, metaDescription: e.target.value } })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', minHeight: '80px', resize: 'vertical' }}
                                    placeholder={`Découvrez notre page ${page.title} dédiée au CBD premium.`}
                                />
                                <div style={{ fontSize: '0.75rem', color: (page.seo?.metaDescription?.length || 0) > 160 ? '#ef4444' : '#6b7280', marginTop: '4px' }}>
                                    {page.seo?.metaDescription?.length || 0} / 160 caractères (recommandé)
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>URL Canonique (optionnel)</label>
                                <input 
                                    type="text" 
                                    value={page.seo?.canonicalUrl || ''} 
                                    onChange={e => setPage({ ...page, seo: { ...page.seo, canonicalUrl: e.target.value } })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                                    placeholder={`/p/${page.slug}`}
                                />
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', marginTop: '8px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={!!page.seo?.noindex} 
                                    onChange={e => setPage({ ...page, seo: { ...page.seo, noindex: e.target.checked } })}
                                    style={{ width: '16px', height: '16px' }}
                                />
                                Ne pas indexer cette page (noindex)
                            </label>

                            <button onClick={() => setShowSEOModal(false)}
                                style={{ width: '100%', padding: '12px', background: '#1F4B40', color: '#00FF94', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', marginTop: '12px' }}>
                                Valider
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
