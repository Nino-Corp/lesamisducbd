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
                        onClick={() => setShowPreview(v => !v)}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: showPreview ? '#1F4B40' : '#f3f4f6', color: showPreview ? '#00FF94' : '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        {showPreview ? '🙈 Masquer preview' : '👁 Afficher preview'}
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
            <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '280px 360px 1fr' : '280px 1fr', gap: '0', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>

                {/* Col 1 — Section list */}
                <div style={{ borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fafafa' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F4B40' }}>Sections <span style={{ background: '#e5e7eb', borderRadius: '99px', padding: '2px 8px', fontSize: '0.78rem' }}>{page.sections?.length || 0}</span></span>
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
                                        padding: '10px 12px', borderRadius: '10px', marginBottom: '4px',
                                        cursor: 'pointer',
                                        background: isActive ? '#1F4B40' : 'white',
                                        color: isActive ? 'white' : '#333',
                                        border: isDragTarget ? '2px dashed #00FF94' : '1px solid #e5e7eb',
                                        opacity: isHidden ? 0.5 : 1,
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span style={{ cursor: 'grab', opacity: 0.5, fontSize: '1rem', flexShrink: 0 }}>⠿</span>
                                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{tpl?.icon || '🧩'}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tpl?.label || section.type}</div>
                                        <div style={{ fontSize: '0.72rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {section.props?.title || section.props?.text || section.props?.src || '—'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                        <button onClick={() => toggleVisibility(index)} title={isHidden ? 'Afficher' : 'Masquer'}
                                            style={{ padding: '3px 5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: 0.7 }}>
                                            {isHidden ? '👁' : '🙈'}
                                        </button>
                                        <button onClick={() => duplicateSection(index)} title="Dupliquer"
                                            style={{ padding: '3px 5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: 0.7 }}>
                                            📋
                                        </button>
                                        <button onClick={() => moveSection(index, -1)} disabled={index === 0} title="Monter"
                                            style={{ padding: '3px 5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: index === 0 ? 0.25 : 0.7 }}>
                                            ▲
                                        </button>
                                        <button onClick={() => moveSection(index, 1)} disabled={index === page.sections.length - 1} title="Descendre"
                                            style={{ padding: '3px 5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: index === page.sections.length - 1 ? 0.25 : 0.7 }}>
                                            ▼
                                        </button>
                                        <button onClick={() => removeSection(index)} title="Supprimer"
                                            style={{ padding: '3px 5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#dc2626', opacity: 0.8 }}>
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb' }}>
                        <button onClick={() => setShowTemplateModal(true)}
                            style={{ width: '100%', padding: '12px', background: '#1F4B40', color: '#00FF94', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                            + Ajouter un bloc
                        </button>
                    </div>
                </div>

                {/* Col 2 — Editor panel */}
                <div style={{ borderRight: showPreview ? '1px solid #e5e7eb' : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {currentSection && EditorComponent ? (
                        <>
                            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px', background: '#fafafa' }}>
                                <span style={{ fontSize: '1.5rem' }}>{TEMPLATES.find(t => t.type === currentSection.type)?.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F4B40' }}>{TEMPLATES.find(t => t.type === currentSection.type)?.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{TEMPLATES.find(t => t.type === currentSection.type)?.description}</div>
                                </div>
                                <button onClick={() => setActiveSection(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#999' }}>✕</button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                                <EditorComponent
                                    props={currentSection.props}
                                    onChange={(newProps) => updateProps(activeSection, newProps)}
                                />
                                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #ccc' }}>
                                    <h3 style={{ fontSize: '0.9rem', color: '#1F4B40', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>⚙️</span> Options Avancées (SEO & Layout)
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
                                                Masquer sur Mobile
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={!!currentSection.props?.hideDesktop} onChange={e => updateProps(activeSection, { hideDesktop: e.target.checked })} />
                                                Masquer sur Desktop
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
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#bbb', gap: '12px', textAlign: 'center', padding: '20px' }}>
                            <span style={{ fontSize: '2.5rem' }}>←</span>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Sélectionnez une section<br />dans la liste pour la modifier</p>
                        </div>
                    )}
                </div>

                {/* Col 3 — Live preview */}
                {showPreview && (
                    <div style={{ overflow: 'hidden', background: '#e5e7eb', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 14px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600, zIndex: 20, pointerEvents: 'none' }}>
                            PREVIEW — 75%
                        </div>
                        <LivePreview
                            sections={page.sections || []}
                            activeIndex={activeSection}
                            onSelect={setActiveSection}
                        />
                    </div>
                )}
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
        </div>
    );
}
