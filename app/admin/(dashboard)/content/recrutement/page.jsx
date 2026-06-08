'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LivePreview from '../../builder/LivePreview';
import { TEMPLATES, CATEGORIES } from '../../builder/builderConfig';
import { EDITORS } from '../../builder/builderEditors';
import SEOPanel from '../../builder/SEOPanel';

/* ── Section type metadata ────────────────────────── */
const LEGACY_META = {
    RecrutementText: { icon: '📝', label: 'Texte Recrutement' },
    RecrutementJobs:  { icon: '💼', label: 'Offres d\'emploi' },
    RecrutementContact:{ icon: '✉️', label: 'Contact Recrutement' },
    ContentHero:        { icon: '🖼️', label: 'En-tête (Hero)' },
    Header:             { icon: '🔝', label: 'En-tête (Header)' },
    Footer:             { icon: '🔻', label: 'Pied de page (Footer)' },
};

const SYSTEM_TYPES = new Set(['Header', 'Footer']);

function getEditor(type) {
    return EDITORS[type] || null;
}

function getMeta(type) {
    const legacy = LEGACY_META[type];
    if (legacy) return legacy;
    const tpl = TEMPLATES.find(t => t.type === type);
    if (tpl) return { icon: tpl.icon, label: tpl.label };
    return { icon: '🧩', label: type };
}

/* ── Main Component ──────────────────────────────── */
export default function RecrutementContentPage() {
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [sections, setSections] = useState([]);
    const [meta, setMeta] = useState({ title: '', description: '' });
    const [activeSection, setActiveSection] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSEOModal, setShowSEOModal] = useState(false);
    const [addCategory, setAddCategory] = useState('all');
    const [dragOver, setDragOver] = useState(null);
    const [dragging, setDragging] = useState(null);
    const initialLoadRef = useRef(true);
    const autoSaveTimerRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/admin/content/recrutement', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                if (!data.sections || data.sections.length === 0) {
                    const visibility = data.visibility || {};

                    data.sections = [
                        { id: 'hero', type: 'ContentHero', props: {
                            title: data?.hero?.title || "Intégrer l'équipe ?",
                            imageSrc: data?.hero?.imageSrc || "/images/recrutement/handshake.webp",
                        }, isVisible: visibility.hero !== false },
                        
                        { id: 'content', type: 'RecrutementText', props: {
                            title: data?.content?.title || "Rejoindre l'équipe\nLes Amis du CBD",
                            text: data?.content?.text || "Les Amis du CBD, c'est avant tout une aventure humaine.\nUne équipe qui avance ensemble, avec des valeurs simples : transparence, exigence et proximité.\nNous ne recrutons pas en permanence, mais nous sommes toujours curieux de découvrir de nouveaux profils. Que vous veniez du terrain, du commerce, de la communication ou d'un tout autre horizon, les candidatures spontanées sont les bienvenues.\nSi vous partagez notre vision d'un CBD accessible, responsable et bien fait, n'hésitez pas à nous écrire.\nParfois, les meilleures collaborations commencent sans offre précise."
                        }, isVisible: visibility.content !== false },
                        
                        { id: 'jobs', type: 'RecrutementJobs', props: {
                            title: "Offres en cours",
                            jobs: data?.jobs || []
                        }, isVisible: visibility.jobs !== false },

                        { id: 'contact', type: 'RecrutementContact', props: {
                            title: data?.contactCard?.title || "Envie d'en\nsavoir plus ?",
                            text: data?.contactCard?.text || "Un CV, une lettre de motivation ou simplement l'envie d'échanger ?\nContactez-nous, on vous répond avec plaisir."
                        }, isVisible: visibility.contactCard !== false }
                    ];
                }
                if (data.sections) setSections(data.sections);
                if (data.meta) setMeta(data.meta);
                setLoaded(true);
            }).catch(err => {
                if (err.name !== 'AbortError') setLoaded(true);
            });
        return () => controller.abort();
    }, []);

    /* Auto-save 3s after any change */
    useEffect(() => {
        if (!loaded) return;
        if (initialLoadRef.current) { initialLoadRef.current = false; return; }
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => { save(); }, 3000);
        return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
    }, [sections, meta]);

    const save = async () => {
        setSaving(true);
        try {
            await fetch('/api/admin/content/recrutement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sections, meta })
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch { alert('Erreur lors de la sauvegarde'); }
        finally { setSaving(false); }
    };

    /* ── Section manipulation ─────────────────────── */
    const updateProps = (index, newProps) => {
        setSections(prev => prev.map((s, i) => i === index ? { ...s, props: { ...s.props, ...newProps } } : s));
    };

    const removeSection = (index) => {
        if (!confirm('Supprimer cette section ?')) return;
        setSections(prev => prev.filter((_, i) => i !== index));
        if (activeSection === index) setActiveSection(null);
        else if (activeSection > index) setActiveSection(activeSection - 1);
    };

    const moveSection = (index, dir) => {
        const target = index + dir;
        if (target < 0 || target >= sections.length) return;
        setSections(prev => {
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
        if (activeSection === index) setActiveSection(target);
    };

    const duplicateSection = (index) => {
        const orig = sections[index];
        const copy = { ...orig, id: `${orig.type.toLowerCase()}-${Date.now()}`, props: { ...orig.props } };
        setSections(prev => {
            const next = [...prev];
            next.splice(index + 1, 0, copy);
            return next;
        });
        setActiveSection(index + 1);
    };

    const toggleVisibility = (index) => {
        setSections(prev => prev.map((s, i) =>
            i === index ? { ...s, props: { ...s.props, isVisible: s.props?.isVisible === false ? true : false } } : s
        ));
    };

    const addSection = (template) => {
        const newSection = { id: `${template.type.toLowerCase()}-${Date.now()}`, type: template.type, props: { ...template.defaultProps } };
        setSections(prev => [...prev, newSection]);
        setActiveSection(sections.length);
        setShowAddModal(false);
    };

    /* Drag & drop */
    const onDragStart = (e, index) => { setDragging(index); e.dataTransfer.effectAllowed = 'move'; };
    const onDragOver = (e, index) => { e.preventDefault(); setDragOver(index); };
    const onDrop = (e, index) => {
        e.preventDefault();
        if (dragging === null || dragging === index) { setDragOver(null); setDragging(null); return; }
        setSections(prev => {
            const next = [...prev];
            const [moved] = next.splice(dragging, 1);
            next.splice(index, 0, moved);
            return next;
        });
        setActiveSection(index);
        setDragOver(null); setDragging(null);
    };

    const handleReorder = (fromIndex, toIndex) => {
        setSections(prev => {
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
        setActiveSection(toIndex);
    };

    if (!loaded) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '12px', color: '#64748b' }}>
            <div style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#1F4B40', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Chargement…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    const previewSections = sections.filter(s => !SYSTEM_TYPES.has(s.type));
    const editableSections = sections.map((s, i) => ({ ...s, _origIndex: i })).filter(s => !SYSTEM_TYPES.has(s.type));

    const currentSection = activeSection !== null ? sections[activeSection] : null;
    const CurrentEditor = currentSection ? getEditor(currentSection.type) : null;
    const currentMeta = currentSection ? getMeta(currentSection.type) : null;

    const filteredTemplates = addCategory === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === addCategory);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9', overflow: 'hidden' }}>
            {/* ── TOP HEADER ────────────────────────────── */}
            {!isFullscreen && (
                <header style={{
                    padding: '10px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href="/admin/content" style={{
                            color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
                            padding: '7px 14px', borderRadius: '8px', border: '1px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}>← Retour</Link>
                        <div>
                            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>💼 Recrutement</h1>
                            <code style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/recrutement</code>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                            padding: '6px 12px', borderRadius: '8px',
                            background: '#f0fdf4', color: '#166534', fontWeight: 700, fontSize: '0.8rem',
                            border: '1px solid #16653430',
                        }}>✅ Publié</span>

                        <button onClick={() => setShowSEOModal(true)} style={{
                            padding: '8px 16px', borderRadius: '8px', border: '1px solid #1F4B40',
                            background: 'white', color: '#1F4B40', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                        }}>⚙️ SEO</button>

                        <a href="/recrutement" target="_blank" rel="noopener noreferrer" style={{
                            padding: '8px 16px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1',
                            textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                        }}>👁 Aperçu</a>

                        <a href="https://www.lesamisducbd.fr/recrutement" target="_blank" rel="noopener noreferrer" style={{
                            padding: '8px 16px', borderRadius: '8px', background: '#f3f4f6', color: '#1F2937',
                            textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                        }}>🔗 Voir</a>

                        <button onClick={save} disabled={saving} style={{
                            padding: '8px 20px', borderRadius: '10px', border: 'none',
                            background: saved ? '#10b981' : '#1F4B40', color: '#fff',
                            fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'wait' : 'pointer',
                            transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(31,75,64,0.25)',
                            minWidth: '140px', display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap',
                        }}>
                            {saved ? '✓ Sauvegardé !' : saving ? 'Enregistrement…' : 'Sauvegarder'}
                        </button>
                    </div>
                </header>
            )}

            {/* ── MAIN SPLIT LAYOUT ──────────────────────── */}
            <div style={{
                flex: 1, display: 'grid',
                gridTemplateColumns: isFullscreen ? '1fr' : '380px 1fr',
                overflow: 'hidden',
            }}>
                {/* ── LEFT PANEL ─────────────────────────── */}
                {!isFullscreen && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', height: '100%',
                        background: '#fff', borderRight: '1px solid #e2e8f0', overflow: 'hidden',
                    }}>
                        {activeSection === null ? (
                            /* ═══ SECTION LIST VIEW ═══ */
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{
                                    padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F4B40' }}>
                                        Sections <span style={{ background: '#f1f5f9', borderRadius: '99px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>{editableSections.length}</span>
                                    </span>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                                    {editableSections.map((section) => {
                                        const origIdx = section._origIndex;
                                        const meta = getMeta(section.type);
                                        const isHidden = section.props?.isVisible === false;
                                        const isDragTarget = dragOver === origIdx;

                                        return (
                                            <div
                                                key={section.id || origIdx}
                                                draggable
                                                onDragStart={e => onDragStart(e, origIdx)}
                                                onDragOver={e => onDragOver(e, origIdx)}
                                                onDrop={e => onDrop(e, origIdx)}
                                                onDragLeave={() => setDragOver(null)}
                                                onClick={() => setActiveSection(origIdx)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    padding: '12px', borderRadius: '10px', marginBottom: '4px',
                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                    background: isDragTarget ? '#f0fdf4' : '#f8fafc',
                                                    border: isDragTarget ? '2px dashed #00FF94' : '1px solid #f1f5f9',
                                                    opacity: isHidden ? 0.5 : 1,
                                                }}
                                                onMouseEnter={e => { if (!isDragTarget) e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                                onMouseLeave={e => { if (!isDragTarget) e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                                            >
                                                <span style={{ cursor: 'grab', opacity: 0.4, fontSize: '0.9rem', flexShrink: 0 }}>⠿</span>
                                                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{meta.icon}</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {meta.label}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {section.props?.title || section.props?.subtitle || section.type}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                                    <button onClick={e => { e.stopPropagation(); toggleVisibility(origIdx); }} title={isHidden ? 'Afficher' : 'Masquer'}
                                                        style={{ padding: '4px 6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#94a3b8' }}>
                                                        {isHidden ? '👁' : '🙈'}
                                                    </button>
                                                    <button onClick={e => { e.stopPropagation(); removeSection(origIdx); }} title="Supprimer"
                                                        style={{ padding: '4px 6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#ef4444' }}>
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ padding: '14px', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
                                    <button onClick={() => setShowAddModal(true)} style={{
                                        width: '100%', padding: '12px', background: '#00FF94', color: '#1F4B40',
                                        border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer',
                                        fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                        transition: 'transform 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >+ Ajouter un bloc</button>
                                </div>
                            </div>
                        ) : (
                            /* ═══ EDITOR VIEW ═══ */
                            currentSection && CurrentEditor ? (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{
                                        padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
                                        display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
                                    }}>
                                        <button onClick={() => setActiveSection(null)} style={{
                                            padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                            background: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#64748b',
                                        }}>← Liste</button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                            <span style={{ fontSize: '1.1rem' }}>{currentMeta?.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{currentMeta?.label}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={() => moveSection(activeSection, -1)} disabled={activeSection === 0}
                                                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: activeSection === 0 ? '#cbd5e1' : '#475569' }} title="Monter">▲</button>
                                            <button onClick={() => moveSection(activeSection, 1)} disabled={activeSection === sections.length - 1}
                                                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: activeSection === sections.length - 1 ? '#cbd5e1' : '#475569' }} title="Descendre">▼</button>
                                            <button onClick={() => duplicateSection(activeSection)}
                                                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#475569' }} title="Dupliquer">📋</button>
                                            <button onClick={() => removeSection(activeSection)}
                                                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', fontSize: '0.8rem', color: '#ef4444' }} title="Supprimer">🗑</button>
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '10px 20px', borderBottom: '1px solid #f1f5f9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
                                    }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>Visibilité</span>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <div style={{
                                                width: '36px', height: '20px', borderRadius: '10px',
                                                background: currentSection.props?.isVisible !== false ? '#10b981' : '#cbd5e1',
                                                position: 'relative', transition: 'background 0.3s',
                                            }}>
                                                <div style={{
                                                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                                                    position: 'absolute', top: '2px',
                                                    left: currentSection.props?.isVisible !== false ? '18px' : '2px',
                                                    transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                                }} />
                                            </div>
                                            <input type="checkbox" checked={currentSection.props?.isVisible !== false}
                                                onChange={e => updateProps(activeSection, { isVisible: e.target.checked })}
                                                style={{ display: 'none' }} />
                                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: currentSection.props?.isVisible !== false ? '#10b981' : '#94a3b8' }}>
                                                {currentSection.props?.isVisible !== false ? 'Visible' : 'Masqué'}
                                            </span>
                                        </label>
                                    </div>

                                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                                        <CurrentEditor
                                            props={currentSection.props || {}}
                                            onChange={(newProps) => updateProps(activeSection, newProps)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#94a3b8' }}>
                                    <button onClick={() => setActiveSection(null)} style={{
                                        padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                        background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#64748b',
                                    }}>← Retour à la liste</button>
                                    <p style={{ fontSize: '0.85rem' }}>Cet éditeur n'est pas disponible pour ce type de bloc.</p>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* ── RIGHT: Live Preview ─────────────────── */}
                <div style={{ position: 'relative', overflow: 'hidden', background: '#e5e7eb' }}>
                    <LivePreview
                        sections={previewSections}
                        activeIndex={activeSection !== null ? previewSections.findIndex(s => s.id === sections[activeSection]?.id) : null}
                        onSelect={(idx) => {
                            const realIdx = sections.findIndex(s => s.id === previewSections[idx]?.id);
                            if (realIdx !== -1) setActiveSection(realIdx);
                        }}
                        onMove={(idx, dir) => {
                            const realIdx = sections.findIndex(s => s.id === previewSections[idx]?.id);
                            if (realIdx !== -1) moveSection(realIdx, dir);
                        }}
                        onDuplicate={(idx) => {
                            const realIdx = sections.findIndex(s => s.id === previewSections[idx]?.id);
                            if (realIdx !== -1) duplicateSection(realIdx);
                        }}
                        onUpdateProps={(idx, newProps) => {
                            const realIdx = sections.findIndex(s => s.id === previewSections[idx]?.id);
                            if (realIdx !== -1) updateProps(realIdx, newProps);
                        }}
                        onReorder={(from, to) => {
                            const realFrom = sections.findIndex(s => s.id === previewSections[from]?.id);
                            const realTo = sections.findIndex(s => s.id === previewSections[to]?.id);
                            if (realFrom !== -1 && realTo !== -1) handleReorder(realFrom, realTo);
                        }}
                        isFullscreen={isFullscreen}
                        setIsFullscreen={setIsFullscreen}
                    />
                </div>
            </div>

            {/* ── ADD BLOCK MODAL ─────────────────────────── */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setShowAddModal(false)}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
                    <div style={{
                        position: 'relative', background: '#fff', borderRadius: '20px', width: '640px', maxHeight: '80vh',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Ajouter un bloc</h2>
                            <button onClick={() => setShowAddModal(false)} style={{
                                width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                background: '#fff', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>✕</button>
                        </div>
                        <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button onClick={() => setAddCategory('all')} style={{
                                padding: '5px 12px', borderRadius: '8px', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                background: addCategory === 'all' ? '#1F4B40' : '#f1f5f9', color: addCategory === 'all' ? '#fff' : '#475569',
                            }}>Tous</button>
                            {CATEGORIES.map(cat => (
                                <button key={cat.id} onClick={() => setAddCategory(cat.id)} style={{
                                    padding: '5px 12px', borderRadius: '8px', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                    background: addCategory === cat.id ? '#1F4B40' : '#f1f5f9', color: addCategory === cat.id ? '#fff' : '#475569',
                                }}>{cat.label}</button>
                            ))}
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {filteredTemplates.map(tpl => (
                                <button key={tpl.type} onClick={() => addSection(tpl)} style={{
                                    padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                    background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1F4B40'; e.currentTarget.style.background = '#f0fdf4'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
                                >
                                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{tpl.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{tpl.label}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{tpl.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── SEO MODAL ──────────────────────────────── */}
            {showSEOModal && (
                <SEOPanel
                    page={{ slug: '', title: 'Recrutement', seo: meta.seo || {}, status: 'published' }}
                    sections={previewSections}
                    onUpdate={(patch) => {
                        if (patch.seo) setMeta(prev => ({ ...prev, seo: { ...(prev.seo || {}), ...patch.seo } }));
                    }}
                    onClose={() => setShowSEOModal(false)}
                />
            )}
        </div>
    );
}
