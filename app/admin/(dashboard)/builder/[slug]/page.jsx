'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../Builder.module.css';
import { TEMPLATES, CATEGORIES } from '../builderConfig';
import { EDITORS } from '../builderEditors';
import LivePreview from '../LivePreview';
import SEOPanel from '../SEOPanel';

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
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pageHistory, setPageHistory] = useState([]);
    const [savedBlocks, setSavedBlocks] = useState([]);
    const [templateTab, setTemplateTab] = useState('models'); // models | blocks
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [dragOver, setDragOver] = useState(null);
    const [dragging, setDragging] = useState(null);
    const originalSlugRef = useRef(null); // Track original slug to handle renames
    const initialLoadRef = useRef(true); // Track initial load for auto-save
    const autoSaveTimerRef = useRef(null); // Track auto-save timer

    useEffect(() => { if (slug) fetchPage(); }, [slug]);

    const fetchPage = async () => {
        try {
            const res = await fetch(`/api/admin/builder?slug=${slug}`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setPage(data);
            originalSlugRef.current = data.slug; // Memorize original slug
            
            // Fetch saved blocks
            const blocksRes = await fetch(`/api/admin/builder?action=blocks`);
            if (blocksRes.ok) {
                setSavedBlocks(await blocksRes.json());
            }
        } catch {
            router.push('/admin/builder');
        } finally {
            setLoading(false);
        }
    };

    const save = async (overrideStatus, pageStateToSave = null) => {
        setSaving(true);
        try {
            const stateToSave = pageStateToSave || page;
            const payload = { ...stateToSave, originalSlug: originalSlugRef.current, status: overrideStatus || stateToSave.status || 'draft' };
            const res = await fetch('/api/admin/builder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
                originalSlugRef.current = stateToSave.slug;
                if (overrideStatus && !pageStateToSave) setPage(prev => ({ ...prev, status: overrideStatus }));
            }
        } finally { setSaving(false); }
    };

    // Auto-save logic
    useEffect(() => {
        if (!page) return;
        if (initialLoadRef.current) {
            initialLoadRef.current = false;
            return;
        }

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        
        autoSaveTimerRef.current = setTimeout(() => {
            save(null, page);
        }, 3000);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [page]);

    const duplicate = async () => {
        const newSlug = `${page.slug}-copie-${Date.now().toString(36)}`;
        const newTitle = `${page.title} (copie)`;
        const res = await fetch('/api/admin/builder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'duplicate', originalSlug: page.slug, slug: newSlug, title: newTitle })
        });
        if (res.ok) {
            window.open(`/admin/builder/${newSlug}`, '_blank');
        }
    };

    const loadHistory = async () => {
        try {
            const res = await fetch(`/api/admin/builder?slug=${page.slug}&action=history`);
            if (res.ok) setPageHistory(await res.json());
        } catch (e) { /* silent */ }
        setShowHistoryModal(true);
    };

    const restoreVersion = (snapshot) => {
        if (!confirm('Restaurer cette version ? Les modifications non sauvegardées seront perdues.')) return;
        setPage(prev => ({ ...prev, sections: snapshot.sections, seo: snapshot.seo || prev.seo, title: snapshot.title || prev.title }));
        setShowHistoryModal(false);
    };

    const handleSaveBlock = async (section) => {
        const blockName = prompt('Nom de ce bloc sauvegardé ?', section.type);
        if (!blockName) return;
        const newBlock = { ...section, id: crypto.randomUUID(), savedName: blockName, savedAt: new Date().toISOString() };
        try {
            const res = await fetch('/api/admin/builder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save_block', block: newBlock })
            });
            if (res.ok) {
                const data = await res.json();
                setSavedBlocks(data.blocks);
                alert('Bloc sauvegardé !');
            }
        } catch (e) {
            console.error('Save block error', e);
        }
    };

    const deleteSavedBlock = async (blockId) => {
        if (!confirm('Supprimer ce bloc sauvegardé ?')) return;
        try {
            await fetch(`/api/admin/builder?action=delete_block&blockId=${blockId}`, { method: 'DELETE' });
            setSavedBlocks(prev => prev.filter(b => b.id !== blockId));
        } catch (e) {
            console.error('Delete block error', e);
        }
    };

    const pushToHistory = () => {
        if (!page?.sections) return;
        setUndoStack(prev => [...prev, JSON.stringify(page.sections)].slice(-30));
        setRedoStack([]);
    };

    const undo = () => {
        if (undoStack.length === 0) return;
        const previousSections = JSON.parse(undoStack[undoStack.length - 1]);
        setRedoStack(prev => [...prev, JSON.stringify(page.sections)]);
        setUndoStack(prev => prev.slice(0, -1));
        setPage(prev => ({ ...prev, sections: previousSections }));
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const nextSections = JSON.parse(redoStack[redoStack.length - 1]);
        setUndoStack(prev => [...prev, JSON.stringify(page.sections)]);
        setRedoStack(prev => prev.slice(0, -1));
        setPage(prev => ({ ...prev, sections: nextSections }));
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeTag = document.activeElement?.tagName?.toLowerCase();
            const isInput = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable;
            
            if (!isInput && (e.ctrlKey || e.metaKey)) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) redo();
                    else undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undoStack, redoStack, page]);

    const addSection = (template) => {
        pushToHistory();
        const newSection = { id: `${template.type.toLowerCase()}-${Date.now()}`, type: template.type, props: { ...template.defaultProps } };
        const next = [...(page.sections || []), newSection];
        setPage({ ...page, sections: next });
        setActiveSection(next.length - 1);
        setShowTemplateModal(false);
    };

    const removeSection = (index) => {
        if (!confirm('Supprimer cette section ?')) return;
        pushToHistory();
        const next = page.sections.filter((_, i) => i !== index);
        setPage({ ...page, sections: next });
        if (activeSection === index) setActiveSection(null);
        else if (activeSection > index) setActiveSection(activeSection - 1);
    };

    const duplicateSection = (index) => {
        pushToHistory();
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
        pushToHistory();
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
        pushToHistory();
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
        pushToHistory();
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
        <div 
            className={styles.builderContainer} 
            style={isFullscreen ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#e5e7eb', margin: 0, padding: 0 } : {}}
        >
            {/* Header */}
            {!isFullscreen && (
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <Link href="/admin/builder" className={styles.backLink}>← Retour</Link>
                        <div>
                            <h1 className={styles.title}>Éditeur : {page.title}</h1>
                            <code className={styles.pageSlug}>/p/{page.slug}</code>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        {/* Status badge */}
                        {(() => {
                            const s = page.status || 'draft';
                            const cfg = {
                                draft:     { label: '📝 Brouillon',  bg: '#f3f4f6', color: '#374151' },
                                published: { label: '✅ Publié',      bg: '#f0fdf4', color: '#166534' },
                                scheduled: { label: '🕐 Planifié',   bg: '#fffbeb', color: '#92400e' },
                            }[s] || { label: s, bg: '#f3f4f6', color: '#374151' };
                            return (
                                <span style={{ padding: '6px 12px', borderRadius: '8px', background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.8rem', border: `1px solid ${cfg.color}30` }}>
                                    {cfg.label}
                                </span>
                            );
                        })()}
                        <button
                            onClick={() => setShowSEOModal(true)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #1F4B40', background: 'white', color: '#1F4B40', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            ⚙️ SEO
                        </button>
                        <button onClick={loadHistory}
                            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                            title="Historique des versions">
                            🕐
                        </button>
                        <button onClick={duplicate}
                            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                            title="Dupliquer la page">
                            📋
                        </button>
                        <a href={`/p/${page.slug}?preview=true`} target="_blank" rel="noopener noreferrer"
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                            title="Voir l'aperçu privé">
                            👁 Aperçu
                        </a>
                        <a href={`https://www.lesamisducbd.fr/p/${page.slug}`} target="_blank" rel="noopener noreferrer"
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#f3f4f6', color: '#1F2937', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                            🔗 Voir
                        </a>
                        {(page.status === 'published') ? (
                            <button onClick={() => save('draft')} disabled={saving}
                                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d97706', background: '#fffbeb', color: '#92400e', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                                Dépublier
                            </button>
                        ) : (
                            <button onClick={() => save('published')} disabled={saving}
                                className={styles.saveButton}
                                style={{ background: '#166534', borderColor: '#166534' }}>
                                🚀 Publier
                            </button>
                        )}
                        <button
                            className={`${styles.saveButton} ${saved ? styles.saveSuccess : ''}`}
                            onClick={() => save()} disabled={saving}
                            style={{ minWidth: '180px', display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap' }}
                        >
                            {saving ? 'Enregistrement…' : saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
                        </button>
                    </div>
                </div>
            )}

            {/* Main layout */}
            <div className={styles.editorLayout} style={{ 
                height: isFullscreen ? '100vh' : 'calc(100vh - 80px)',
                gridTemplateColumns: isFullscreen ? '1fr' : '400px 1fr',
                gap: isFullscreen ? '0' : '24px'
            }}>

                {/* Col 1 — Left Sidebar (List OR Editor) */}
                {!isFullscreen && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
                        {activeSection === null ? (
                            /* SECTION LIST */
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F4B40' }}>Sections de la page <span style={{ background: '#e5e7eb', borderRadius: '99px', padding: '2px 8px', fontSize: '0.78rem' }}>{page.sections?.length || 0}</span></span>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                                    {/* H1 Warning */}
                                    {(() => {
                                        const h1Count = page.sections?.filter(s => s.type === 'ContentHero').length || 0;
                                        if (h1Count === 0) return (
                                            <div style={{ margin: '4px 0 8px', padding: '10px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.75rem', color: '#92400e', display: 'flex', gap: '6px' }}>
                                                ⚠️ <span>Pas de <strong>H1</strong> — ajoutez un bloc Hero.</span>
                                            </div>
                                        );
                                        if (h1Count > 1) return (
                                            <div style={{ margin: '4px 0 8px', padding: '10px 12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.75rem', color: '#991b1b', display: 'flex', gap: '6px' }}>
                                                🚨 <span><strong>{h1Count} H1</strong> détectés — conservez-en un seul.</span>
                                            </div>
                                        );
                                        return null;
                                    })()}
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
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button onClick={(e) => { e.stopPropagation(); toggleVisibility(index); }} title={isHidden ? 'Afficher' : 'Masquer'}
                                                        style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: isActive ? '#fff' : '#666' }}>
                                                        {isHidden ? '👁' : '🙈'}
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); removeSection(index); }} title="Supprimer"
                                                        style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: isActive ? '#fecaca' : '#ef4444' }}>
                                                        🗑️
                                                    </button>
                                                </div>
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
                                            
                                            <div style={{ marginTop: '16px', borderTop: '1px dashed #e5e7eb', paddingTop: '16px' }}>
                                                <button onClick={() => handleSaveBlock(currentSection)}
                                                    style={{ width: '100%', padding: '8px', background: '#f9fafb', color: '#1F4B40', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    💾 Sauvegarder dans 'Mes Blocs'
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null
                        )}
                    </div>
                )}

                {/* Col 2 — Live preview Canvas */}
                <div style={{ overflow: 'hidden', background: '#e5e7eb', position: 'relative', borderRadius: isFullscreen ? '0' : '16px', border: isFullscreen ? 'none' : '1px solid #ddd', height: '100%', flex: 1 }}>
                    {!isFullscreen && (
                        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 14px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600, zIndex: 20, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>✨ CANVAS INTERACTIF</span>
                        </div>
                    )}
                    <LivePreview
                        sections={page.sections || []}
                        activeIndex={activeSection}
                        onSelect={setActiveSection}
                        onMove={moveSection}
                        onDuplicate={duplicateSection}
                        onDelete={removeSection}
                        onUpdateProps={(index, props) => updateProps(index, props)}
                        onReorder={handleReorder}
                        isFullscreen={isFullscreen}
                        setIsFullscreen={setIsFullscreen}
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

                        {/* Template tabs switcher */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                            <button onClick={() => setTemplateTab('models')} style={{ flex: 1, padding: '12px', background: templateTab === 'models' ? '#fff' : '#f9fafb', border: 'none', borderBottom: templateTab === 'models' ? '2px solid #1F4B40' : '2px solid transparent', fontWeight: templateTab === 'models' ? 700 : 500, cursor: 'pointer', fontSize: '0.95rem' }}>
                                🧱 Modèles Standards
                            </button>
                            <button onClick={() => setTemplateTab('blocks')} style={{ flex: 1, padding: '12px', background: templateTab === 'blocks' ? '#fff' : '#f9fafb', border: 'none', borderBottom: templateTab === 'blocks' ? '2px solid #1F4B40' : '2px solid transparent', fontWeight: templateTab === 'blocks' ? 700 : 500, cursor: 'pointer', fontSize: '0.95rem' }}>
                                💾 Mes Blocs Sauvegardés ({savedBlocks.length})
                            </button>
                        </div>

                        {templateTab === 'models' ? (
                            <>
                                {/* Category tabs */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                                    <button onClick={() => setActiveCategory('all')}
                                        style={{ flexShrink: 0, padding: '6px 16px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', background: activeCategory === 'all' ? '#1F4B40' : '#f3f4f6', color: activeCategory === 'all' ? '#00FF94' : '#555', whiteSpace: 'nowrap' }}>
                                        Tous
                                    </button>
                                    {CATEGORIES.map(cat => (
                                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                            style={{ flexShrink: 0, padding: '6px 16px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', background: activeCategory === cat.id ? '#1F4B40' : '#f3f4f6', color: activeCategory === cat.id ? '#00FF94' : '#555', whiteSpace: 'nowrap' }}>
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
                            </>
                        ) : (
                            <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                {savedBlocks.length === 0 ? (
                                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999', padding: '40px 0' }}>Aucun bloc sauvegardé pour le moment.</p>
                                ) : (
                                    savedBlocks.map(block => (
                                        <div key={block.id} style={{ position: 'relative', padding: '20px 16px', borderRadius: '16px', border: '1.5px solid #e5e7eb', background: '#fff', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <button onClick={() => deleteSavedBlock(block.id)} title="Supprimer" style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>✕</button>
                                            <span style={{ fontSize: '2rem' }}>{TEMPLATES.find(t => t.type === block.type)?.icon || '🧩'}</span>
                                            <strong style={{ fontSize: '0.88rem', color: '#1F4B40' }}>{block.savedName || block.type}</strong>
                                            <span style={{ fontSize: '0.7rem', color: '#aaa' }}>{new Date(block.savedAt).toLocaleDateString('fr-FR')}</span>
                                            <button onClick={() => addSection(block)} style={{ marginTop: '8px', width: '100%', padding: '6px', background: '#00FF94', color: '#1F4B40', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
                                                Injecter
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SEO Panel */}
            {showSEOModal && (
                <SEOPanel
                    page={page}
                    sections={page.sections || []}
                    onUpdate={(patch) => setPage(prev => ({ ...prev, ...patch, seo: { ...prev.seo, ...patch.seo } }))}
                    onClose={() => setShowSEOModal(false)}
                />
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={() => setShowHistoryModal(false)}>
                    <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1F4B40' }}>🕐 Historique des versions</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#9ca3af' }}>Les 10 dernières sauvegardes sont conservées</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                            {pageHistory.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>Aucune version précédente.<br />L'historique se remplit à chaque sauvegarde.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {pageHistory.map((snapshot, i) => (
                                        <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{snapshot.title || page.title}</div>
                                                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
                                                    {new Date(snapshot.savedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    {' · '}{snapshot.sections?.length || 0} section{snapshot.sections?.length !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                            <button onClick={() => restoreVersion(snapshot)}
                                                style={{ padding: '7px 14px', borderRadius: '8px', background: '#1F4B40', color: '#00FF94', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                Restaurer
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Scheduled publish panel (shown when status=scheduled) */}
            {page.status === 'scheduled' && (
                <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>🕐 Publication planifiée :</span>
                    <input type="datetime-local"
                        value={page.scheduledAt ? page.scheduledAt.slice(0, 16) : ''}
                        onChange={e => setPage(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        style={{ border: '1px solid #fde68a', borderRadius: '8px', padding: '6px 10px', fontSize: '0.85rem', background: '#fff', color: '#92400e' }}
                    />
                    <button onClick={() => save('scheduled')}
                        style={{ padding: '7px 14px', borderRadius: '8px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
                        Confirmer
                    </button>
                </div>
            )}
        </div>
    );
}
