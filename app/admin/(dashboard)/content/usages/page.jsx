'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import WysiwygEditor from '../../builder/WysiwygEditor';
import LivePreview from '../../builder/LivePreview';
import ImageUpload from '@/components/Admin/ImageUpload';
import { TEMPLATES, CATEGORIES } from '../../builder/builderConfig';
import { EDITORS } from '../../builder/builderEditors';
import SEOPanel from '../../builder/SEOPanel';

/* ── Section type metadata ────────────────────────── */
const LEGACY_META = {
    UsagesIntro:        { icon: '📝', label: 'Texte Intro' },
    UsagesCarouselBlock:{ icon: '🎠', label: 'Carrousel Usages' },
    UsagesWarning:      { icon: '⚠️', label: 'Avertissement' },
    UsagesEssentialBox: { icon: '📦', label: 'Encart Essentiel' },
    ContentHero:        { icon: '🖼', label: 'Héro principal' },
    Quote:              { icon: '✍️', label: 'Citation' },
    JoinUs:             { icon: '👋', label: 'Recrutement' },
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
export default function UsagesContentPage() {
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
        fetch('/api/admin/content/usages', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                if (!data.sections || data.sections.length === 0) {
                    const visibility = data.visibility || {};
                    const usagesItems = data.carousel?.items || [
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
                    ];

                    data.sections = [
                        { id: 'hero', type: 'ContentHero', props: {
                            imageSrc: data?.hero?.imageSrc || "/images/usages/hero.webp",
                            imagePosition: "center 35%",
                            title: data?.hero?.title || "Le CBD ?"
                        }, isVisible: visibility.intro !== false },
                        { id: 'intro', type: 'UsagesIntro', props: {
                            title: data?.intro?.title || "CBD : usages courants,\nlimites et bonnes pratiques.",
                            text: data?.intro?.text || "Le CBD est utilisé par de nombreuses personnes dans la vie quotidienne.\nCette page présente 5 usages fréquents, avec leurs limites et bonnes pratiques.\nLe CBD n'est pas un médicament et ne remplace jamais un avis médical."
                        }, isVisible: visibility.intro !== false },
                        { id: 'carousel', type: 'UsagesCarouselBlock', props: {
                            title: data?.carousel?.title || "Usages du CBD\nau quotidien :",
                            items: usagesItems
                        }, isVisible: visibility.carousel !== false },
                        { id: 'warning', type: 'UsagesWarning', props: {
                            title: data?.warning?.title || "Le CBD :\nn'est pas un médicament, ne guérit aucune maladie, ne remplace pas un traitement médical.\nEn cas de doute, de traitement en cours ou de condition particulière, consultez un professionnel de santé.",
                            responsibleTitle: data?.warning?.responsibleTitle || "Pour une utilisation responsable :\nproduits analysés en laboratoire, origine claire, taux de THC conforme, information transparente"
                        }, isVisible: visibility.warning !== false },
                        { id: 'essential', type: 'UsagesEssentialBox', props: {
                            title: data?.essential?.title || "L'essentiel sur les usages du CBD :",
                            items: data?.essential?.items || [
                                "Le CBD s'inscrit dans une démarche de bien-être",
                                "Les usages varient selon les individus",
                                "Il ne s'agit jamais d'un traitement médical",
                                "La qualité et la transparence sont essentielles"
                            ]
                        }, isVisible: visibility.essential !== false },
                        { id: 'quote', type: 'Quote', props: {
                            text: data?.quote?.text || "\"Découvrir le CBD en toute responsabilité.<br/>Explorez nos produits.<br/>Lire nos guides pédagogiques.\"",
                            author: data?.quote?.author || "Nelson — Les Amis du CBD"
                        }, isVisible: visibility.quote !== false },
                        { id: 'joinus', type: 'JoinUs', props: {
                            title: data?.joinUs?.title || "Nous rejoindre",
                            buttonLabel: data?.joinUs?.buttonLabel || "Venez par ici",
                            buttonLink: data?.joinUs?.buttonLink || "/recrutement",
                            text: data?.joinUs?.text || "Aucun poste ouvert pour le moment ? Les candidatures spontanées sont toujours les bienvenues."
                        }, isVisible: visibility.joinUs !== false }
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
            await fetch('/api/admin/content/usages', {
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
                            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>💨 CBD & Usages</h1>
                            <code style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/usages</code>
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

                        <a href="/usages" target="_blank" rel="noopener noreferrer" style={{
                            padding: '8px 16px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1',
                            textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                        }}>👁 Aperçu</a>

                        <a href="https://www.lesamisducbd.fr/usages" target="_blank" rel="noopener noreferrer" style={{
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
                                                        {section.props?.title || section.props?.text || section.type}
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
                    page={{ slug: '', title: 'CBD & Usages', seo: meta.seo || {}, status: 'published' }}
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
