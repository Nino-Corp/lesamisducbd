'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../Builder.module.css';

// ─── Reusable image uploader ─────────────────────────────────────────────────

function ImageUploader({ value, onChange, folder = 'pages' }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', folder);
            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            onChange(data.url);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            // reset so same file can be re-uploaded
            e.target.value = '';
        }
    };

    return (
        <div className={styles.uploaderWrapper}>
            {value ? (
                <div className={styles.uploaderPreview}>
                    <img src={value} alt="aperçu" className={styles.imgPreview} />
                    <button
                        type="button"
                        className={styles.uploaderRemoveBtn}
                        onClick={() => onChange('')}
                        aria-label="Supprimer l\'image"
                    >
                        ✕ Supprimer
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    className={styles.uploaderBtn}
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? '⏳ Upload en cours…' : '📁 Choisir une image'}
                </button>
            )}
            {error && <span className={styles.uploaderError}>{error}</span>}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
            />
        </div>
    );
}

// ─── Section definitions ────────────────────────────────────────────────────

const TEMPLATES = [
    {
        type: 'ContentHero',
        label: 'En-tête / Hero',
        icon: '🖼️',
        description: 'Grand titre avec image de fond',
        defaultProps: { title: 'Titre de la page', imageSrc: '' },
    },
    {
        type: 'RichText',
        label: 'Texte & Sous-texte',
        icon: '📝',
        description: 'Bloc titre + contenu HTML',
        defaultProps: { title: 'Titre de la section', content: '<p>Votre texte ici...</p>', centered: false },
    },
    {
        type: 'ImageBlock',
        label: 'Image',
        icon: '🖼',
        description: 'Image pleine largeur avec légende optionnelle',
        defaultProps: { src: '', alt: '', caption: '' },
    },
    {
        type: 'FAQ',
        label: 'FAQ',
        icon: '❓',
        description: 'Accordéon de questions / réponses',
        defaultProps: { title: 'Questions Fréquentes', items: [{ question: 'Ma question ?', answer: 'Ma réponse ici.' }] },
    },
    {
        type: 'Quote',
        label: 'Citation',
        icon: '💬',
        description: 'Citation mise en valeur avec auteur',
        defaultProps: { text: '"Le CBD doit être simple, accessible et de qualité."', author: 'Les Amis du CBD' },
    },
];

// ─── Per-section-type editor forms ──────────────────────────────────────────

function HeroEditor({ props, onChange }) {
    return (
        <div className={styles.editorFields}>
            <Field label="Titre principal">
                <textarea
                    className={styles.fieldTextarea}
                    value={props.title || ''}
                    onChange={e => onChange({ title: e.target.value })}
                    placeholder="Ex : Découvrez notre gamme CBD"
                    rows={3}
                />
                <span className={styles.fieldHint}>Supporte le HTML basique (&lt;strong&gt;, &lt;em&gt;…)</span>
            </Field>
            <Field label="Image de fond">
                <ImageUploader
                    value={props.imageSrc || ''}
                    onChange={url => onChange({ imageSrc: url })}
                    folder="pages/hero"
                />
            </Field>
        </div>
    );
}

function RichTextEditor({ props, onChange }) {
    return (
        <div className={styles.editorFields}>
            <Field label="Titre de section">
                <input
                    className={styles.fieldInput}
                    type="text"
                    value={props.title || ''}
                    onChange={e => onChange({ title: e.target.value })}
                    placeholder="Laissez vide pour masquer"
                />
            </Field>
            <Field label="Contenu (HTML)">
                <textarea
                    className={styles.fieldTextarea}
                    value={props.content || ''}
                    onChange={e => onChange({ content: e.target.value })}
                    rows={10}
                    placeholder="<p>Votre texte en HTML...</p>"
                />
                <span className={styles.fieldHint}>Vous pouvez utiliser &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;a href=""&gt;, etc.</span>
            </Field>
            <Field label="">
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={!!props.centered}
                        onChange={e => onChange({ centered: e.target.checked })}
                    />
                    Centrer le texte
                </label>
            </Field>
        </div>
    );
}

function ImageBlockEditor({ props, onChange }) {
    return (
        <div className={styles.editorFields}>
            <Field label="Image">
                <ImageUploader
                    value={props.src || ''}
                    onChange={url => onChange({ src: url })}
                    folder="pages/images"
                />
            </Field>
            <Field label="Texte alternatif (accessibilité)">
                <input
                    className={styles.fieldInput}
                    type="text"
                    value={props.alt || ''}
                    onChange={e => onChange({ alt: e.target.value })}
                    placeholder="Description de l'image"
                />
            </Field>
            <Field label="Légende (optionnelle)">
                <input
                    className={styles.fieldInput}
                    type="text"
                    value={props.caption || ''}
                    onChange={e => onChange({ caption: e.target.value })}
                    placeholder="Ex : Vue de notre exploitation en Ardèche"
                />
            </Field>
        </div>
    );
}

function FAQEditor({ props, onChange }) {
    const items = props.items || [];

    const updateItem = (i, field, value) => {
        const next = items.map((item, idx) => idx === i ? { ...item, [field]: value } : item);
        onChange({ items: next });
    };

    const addItem = () => onChange({ items: [...items, { question: 'Nouvelle question ?', answer: 'Réponse ici.' }] });

    const removeItem = (i) => onChange({ items: items.filter((_, idx) => idx !== i) });

    return (
        <div className={styles.editorFields}>
            <Field label="Titre de la FAQ">
                <input
                    className={styles.fieldInput}
                    type="text"
                    value={props.title || ''}
                    onChange={e => onChange({ title: e.target.value })}
                    placeholder="Questions Fréquentes"
                />
            </Field>

            <div className={styles.faqList}>
                {items.map((item, i) => (
                    <div key={i} className={styles.faqItem}>
                        <div className={styles.faqItemHeader}>
                            <span className={styles.faqItemNum}>Q{i + 1}</span>
                            <button className={styles.faqRemoveBtn} onClick={() => removeItem(i)} aria-label="Supprimer">✕</button>
                        </div>
                        <Field label="Question">
                            <input
                                className={styles.fieldInput}
                                type="text"
                                value={item.question}
                                onChange={e => updateItem(i, 'question', e.target.value)}
                            />
                        </Field>
                        <Field label="Réponse">
                            <textarea
                                className={styles.fieldTextarea}
                                value={item.answer}
                                rows={3}
                                onChange={e => updateItem(i, 'answer', e.target.value)}
                            />
                        </Field>
                    </div>
                ))}
            </div>

            <button className={styles.addItemBtn} onClick={addItem}>
                + Ajouter une question
            </button>
        </div>
    );
}

function QuoteEditor({ props, onChange }) {
    return (
        <div className={styles.editorFields}>
            <Field label="Citation">
                <textarea
                    className={styles.fieldTextarea}
                    value={props.text || ''}
                    onChange={e => onChange({ text: e.target.value })}
                    rows={4}
                    placeholder='"Le CBD doit être simple et de qualité."'
                />
            </Field>
            <Field label="Auteur">
                <input
                    className={styles.fieldInput}
                    type="text"
                    value={props.author || ''}
                    onChange={e => onChange({ author: e.target.value })}
                    placeholder="Nelson — Les Amis du CBD"
                />
            </Field>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className={styles.field}>
            {label && <label className={styles.fieldLabel}>{label}</label>}
            {children}
        </div>
    );
}

const EDITORS = {
    ContentHero: HeroEditor,
    RichText: RichTextEditor,
    ImageBlock: ImageBlockEditor,
    FAQ: FAQEditor,
    Quote: QuoteEditor,
};

// ─── Main Page Editor ────────────────────────────────────────────────────────

export default function PageEditor() {
    const { slug } = useParams();
    const router = useRouter();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [activeSection, setActiveSection] = useState(null); // index

    useEffect(() => {
        if (slug) fetchPage();
    }, [slug]);

    const fetchPage = async () => {
        try {
            const res = await fetch(`/api/admin/builder?slug=${slug}`);
            if (!res.ok) throw new Error('Failed to load page');
            const data = await res.json();
            setPage(data);
        } catch (error) {
            console.error('Error:', error);
            router.push('/admin/builder');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/builder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(page),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    const addSection = (template) => {
        const newSection = {
            id: `${template.type.toLowerCase()}-${Date.now()}`,
            type: template.type,
            props: { ...template.defaultProps },
        };
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

    const moveSection = (index, dir) => {
        const next = [...page.sections];
        const target = index + dir;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        setPage({ ...page, sections: next });
        setActiveSection(target);
    };

    const updateSectionProps = (index, newProps) => {
        const next = page.sections.map((s, i) =>
            i === index ? { ...s, props: { ...s.props, ...newProps } } : s
        );
        setPage({ ...page, sections: next });
    };

    if (loading) return (
        <div className={styles.container}>
            <div className={styles.loadingState}>Chargement de la page…</div>
        </div>
    );

    const currentSection = activeSection !== null ? page.sections[activeSection] : null;
    const EditorComponent = currentSection ? EDITORS[currentSection.type] : null;

    return (
        <div className={styles.container}>
            {/* ── Top bar ─────────────────────────────────────── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/admin/builder" className={styles.backLink}>← Retour</Link>
                    <div>
                        <h1 className={styles.title}>Éditeur : {page.title}</h1>
                        <code className={styles.pageSlug}>/p/{page.slug}</code>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <a
                        href={`https://www.lesamisducbd.fr/p/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.previewBtn}
                        style={{ background: '#F3F4F6', color: '#1F2937', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}
                    >
                        👁 Ouvrir la Landing Page officielle
                    </a>
                    <button
                        className={`${styles.saveButton} ${saved ? styles.saveSuccess : ''}`}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Enregistrement…' : saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
                    </button>
                </div>
            </div>

            {/* ── Two-column layout ────────────────────────────── */}
            <div className={styles.editorLayout}>

                {/* Left — section list */}
                <div className={styles.sectionList}>
                    <div className={styles.sectionListHeader}>
                        <span className={styles.sectionListTitle}>Sections</span>
                        <span className={styles.sectionCount}>{page.sections?.length || 0}</span>
                    </div>

                    {(!page.sections || page.sections.length === 0) && (
                        <div className={styles.emptyList}>
                            <span>Aucune section pour l'instant.</span>
                            <span className={styles.emptyHint}>Ajoutez un bloc ci-dessous ↓</span>
                        </div>
                    )}

                    {page.sections?.map((section, index) => {
                        const tpl = TEMPLATES.find(t => t.type === section.type);
                        const isActive = activeSection === index;
                        return (
                            <div
                                key={section.id || index}
                                className={`${styles.sectionRow} ${isActive ? styles.sectionRowActive : ''}`}
                                onClick={() => setActiveSection(index)}
                            >
                                <span className={styles.sectionIcon}>{tpl?.icon || '🧩'}</span>
                                <div className={styles.sectionRowInfo}>
                                    <strong className={styles.sectionRowType}>{tpl?.label || section.type}</strong>
                                    <span className={styles.sectionRowPreview}>
                                        {section.props.title || section.props.text || section.props.src || '—'}
                                    </span>
                                </div>
                                <div className={styles.sectionRowActions}>
                                    <button
                                        className={styles.moveBtn}
                                        onClick={e => { e.stopPropagation(); moveSection(index, -1); }}
                                        disabled={index === 0}
                                        aria-label="Monter"
                                    >▲</button>
                                    <button
                                        className={styles.moveBtn}
                                        onClick={e => { e.stopPropagation(); moveSection(index, 1); }}
                                        disabled={index === page.sections.length - 1}
                                        aria-label="Descendre"
                                    >▼</button>
                                    <button
                                        className={styles.deleteRowBtn}
                                        onClick={e => { e.stopPropagation(); removeSection(index); }}
                                        aria-label="Supprimer"
                                    >🗑</button>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        className={styles.addSectionBtn}
                        onClick={() => setShowTemplateModal(true)}
                    >
                        + Ajouter un bloc
                    </button>
                </div>

                {/* Right — section editor */}
                <div className={styles.sectionEditor}>
                    {currentSection && EditorComponent ? (
                        <>
                            <div className={styles.editorHeader}>
                                <div className={styles.editorHeaderLeft}>
                                    <span className={styles.editorIcon}>
                                        {TEMPLATES.find(t => t.type === currentSection.type)?.icon}
                                    </span>
                                    <div>
                                        <h2 className={styles.editorTitle}>
                                            {TEMPLATES.find(t => t.type === currentSection.type)?.label}
                                        </h2>
                                        <span className={styles.editorDesc}>
                                            {TEMPLATES.find(t => t.type === currentSection.type)?.description}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className={styles.editorCloseBtn}
                                    onClick={() => setActiveSection(null)}
                                    aria-label="Fermer"
                                >✕</button>
                            </div>
                            <div className={styles.editorBody}>
                                <EditorComponent
                                    props={currentSection.props}
                                    onChange={(newProps) => updateSectionProps(activeSection, newProps)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className={styles.editorEmpty}>
                            <span className={styles.editorEmptyIcon}>←</span>
                            <p>Sélectionnez une section à gauche pour la modifier</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Template picker modal ────────────────────────── */}
            {showTemplateModal && (
                <div className={styles.modalBackdrop} onClick={() => setShowTemplateModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Ajouter un bloc</h2>
                            <button
                                className={styles.modalClose}
                                onClick={() => setShowTemplateModal(false)}
                                aria-label="Fermer"
                            >✕</button>
                        </div>
                        <div className={styles.templateGrid}>
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.type}
                                    className={styles.templateCard}
                                    onClick={() => addSection(t)}
                                >
                                    <span className={styles.templateIcon}>{t.icon}</span>
                                    <strong className={styles.templateLabel}>{t.label}</strong>
                                    <span className={styles.templateDesc}>{t.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
