'use client';

/**
 * SEOPanel — Panneau SEO complet pour le Page Builder
 * 
 * Fonctionnalités :
 * - Meta Title avec compteur et indicateur couleur
 * - Meta Description avec compteur
 * - Preview SERP temps réel (Google-like)
 * - Image Open Graph avec upload
 * - Slug modifiable
 * - Type de page (Webpage / Article / BlogPosting / Landing)
 * - Métadonnées article (auteur, date, catégorie, tags, extrait)
 * - noindex toggle
 */

import { useState } from 'react';
import { ImageUploader } from './builderEditors';

// --- SERP Preview ---
function SerpPreview({ title, description, slug }) {
    const displayTitle = title || 'Titre de la page — Les Amis du CBD';
    const displayDesc = description || 'Découvrez notre page dédiée au CBD premium.';
    const displayUrl = `lesamisducbd.fr › p › ${slug || 'ma-page'}`;

    const titleTooLong = displayTitle.length > 60;
    const titleTooShort = displayTitle.length < 30 && displayTitle.length > 0;
    const descTooLong = displayDesc.length > 160;

    const truncate = (str, max) => str.length > max ? str.slice(0, max) + '…' : str;

    return (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📊 Aperçu dans Google
            </p>

            {/* Desktop preview */}
            <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px' }}>
                <div style={{ fontSize: '0.72rem', color: '#1a0dab', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '18px', height: '18px', background: '#f5f5f5', borderRadius: '50%', flexShrink: 0 }} />
                    <span style={{ color: '#202124', fontSize: '0.78rem' }}>Les Amis du CBD</span>
                    <span style={{ color: '#70757a', fontSize: '0.78rem' }}>› {displayUrl}</span>
                </div>
                <div style={{
                    fontSize: '1.1rem', color: '#1a0dab', fontWeight: 400, lineHeight: 1.3,
                    marginBottom: '4px', textDecoration: 'underline',
                    color: titleTooLong ? '#ef4444' : '#1a0dab'
                }}>
                    {truncate(displayTitle, 60)}
                </div>
                <div style={{ fontSize: '0.83rem', color: '#4d5156', lineHeight: 1.58, maxWidth: '540px' }}>
                    {truncate(displayDesc, 160)}
                </div>
            </div>

            {/* Warnings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
                {titleTooLong && <div style={{ fontSize: '0.72rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠️ Titre trop long — sera tronqué dans Google</div>}
                {titleTooShort && <div style={{ fontSize: '0.72rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>⚡ Titre trop court — vise 30-60 caractères</div>}
                {descTooLong && <div style={{ fontSize: '0.72rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠️ Description trop longue — sera tronquée</div>}
                {!titleTooLong && !titleTooShort && displayTitle.length > 0 && <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Titre dans la plage idéale</div>}
            </div>
        </div>
    );
}

// --- Score SEO ---
function SeoScore({ seo, sections = [] }) {
    const checks = [
        { label: 'Meta Title renseigné', ok: !!(seo?.metaTitle?.length > 0) },
        { label: 'Meta Title ≤ 60 cars', ok: !!(seo?.metaTitle && seo.metaTitle.length <= 60) },
        { label: 'Meta Description renseignée', ok: !!(seo?.metaDescription?.length > 0) },
        { label: 'Meta Description ≤ 160 cars', ok: !!(seo?.metaDescription && seo.metaDescription.length <= 160) },
        { label: 'Image Open Graph', ok: !!(seo?.ogImage?.length > 0) },
        { label: 'Type de page défini', ok: !!(seo?.pageType && seo.pageType !== 'WebPage') },
        { label: 'Un seul H1 dans la page', ok: sections.filter(s => s.type === 'ContentHero').length === 1 },
    ];

    const score = Math.round((checks.filter(c => c.ok).length / checks.length) * 100);
    const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div style={{ background: '#f9fdfb', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151' }}>Score SEO on-page</span>
                <div style={{ background: color, color: '#fff', borderRadius: '99px', padding: '3px 12px', fontWeight: 800, fontSize: '0.85rem' }}>{score}/100</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {checks.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: c.ok ? '#374151' : '#9ca3af' }}>
                        <span>{c.ok ? '✅' : '⬜'}</span>
                        <span style={{ textDecoration: c.ok ? 'none' : 'line-through' }}>{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Field helper ---
function Field({ label, hint, children }) {
    return (
        <div style={{ marginBottom: '16px' }}>
            {label && <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginBottom: '6px' }}>{label}</label>}
            {children}
            {hint && <span style={{ display: 'block', fontSize: '0.73rem', color: '#9ca3af', marginTop: '4px' }}>{hint}</span>}
        </div>
    );
}

const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '0.88rem', fontFamily: 'inherit', boxSizing: 'border-box' };
const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '80px' };
const selectStyle = { ...inputStyle, background: '#fff' };

// --- CharCounter ---
function CharCounter({ value = '', max, ideal }) {
    const len = value.length;
    const color = len > max ? '#ef4444' : (ideal && len < ideal) ? '#f59e0b' : '#10b981';
    return (
        <span style={{ fontSize: '0.72rem', color, display: 'block', marginTop: '3px', textAlign: 'right' }}>
            {len} / {max} car. {ideal && len < ideal && len > 0 ? `(idéal : ${ideal}+)` : ''}
        </span>
    );
}

// --- Main component ---
export default function SEOPanel({ page, sections = [], onUpdate, onClose }) {
    const seo = page.seo || {};
    const [activeTab, setActiveTab] = useState('serp');

    const update = (patch) => onUpdate({ seo: { ...seo, ...patch } });
    const updatePage = (patch) => onUpdate(patch); // Direct page-level updates (slug, status, scheduledAt)

    const isArticle = seo.pageType === 'Article' || seo.pageType === 'BlogPosting';

    const tabs = [
        { id: 'serp', label: '🔍 Google' },
        { id: 'og', label: '📱 Réseaux' },
        ...(isArticle ? [{ id: 'article', label: '📝 Article' }] : []),
        { id: 'advanced', label: '⚙️ Avancé' },
    ];

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={onClose}
        >
            <div
                style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1F4B40' }}>Paramètres SEO</h2>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>/p/{page.slug}</p>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)}
                                style={{ padding: '8px 16px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', background: activeTab === t.id ? '#fff' : 'transparent', color: activeTab === t.id ? '#1F4B40' : '#6b7280', borderBottom: activeTab === t.id ? '2px solid #1F4B40' : '2px solid transparent', transition: 'all 0.15s' }}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                    {/* ── TAB: GOOGLE / SERP ── */}
                    {activeTab === 'serp' && (
                        <>
                            <SeoScore seo={seo} sections={sections} />
                            <SerpPreview title={seo.metaTitle} description={seo.metaDescription} slug={page.slug} />

                            <Field label="Type de page" hint="Définit le schema JSON-LD injecté automatiquement">
                                <select style={selectStyle} value={seo.pageType || 'WebPage'} onChange={e => update({ pageType: e.target.value })}>
                                    <option value="WebPage">Page web générale</option>
                                    <option value="Article">Article</option>
                                    <option value="BlogPosting">Article de blog</option>
                                    <option value="LandingPage">Landing Page (SEA)</option>
                                    <option value="FAQPage">Page FAQ</option>
                                </select>
                            </Field>

                            <Field label="Slug (URL)">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>/p/</span>
                                    <input
                                        style={inputStyle}
                                        value={page.slug || ''}
                                        onChange={e => updatePage({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') })}
                                        placeholder="mon-article"
                                    />
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '4px', display: 'block' }}>⚠️ Modifier l'URL peut casser des liens existants</span>
                            </Field>

                            <Field label="Meta Title">
                                <input style={inputStyle} value={seo.metaTitle || ''} onChange={e => update({ metaTitle: e.target.value })} placeholder={`${page.title} — Les Amis du CBD`} />
                                <CharCounter value={seo.metaTitle} max={60} ideal={30} />
                            </Field>

                            <Field label="Meta Description">
                                <textarea style={textareaStyle} value={seo.metaDescription || ''} onChange={e => update({ metaDescription: e.target.value })} placeholder="Décrivez le contenu de cette page en 1-2 phrases…" />
                                <CharCounter value={seo.metaDescription} max={160} ideal={100} />
                            </Field>

                            <Field label="Mot-clé principal (Focus Keyword)" hint="Sera utilisé pour calculer le score SEO">
                                <input style={inputStyle} value={seo.focusKeyword || ''} onChange={e => update({ focusKeyword: e.target.value })} placeholder="ex: CBD fleur pas cher" />
                            </Field>
                        </>
                    )}

                    {/* ── TAB: OPEN GRAPH / RÉSEAUX SOCIAUX ── */}
                    {activeTab === 'og' && (
                        <>
                            <div style={{ background: '#f0f9ff', borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '0.82rem', color: '#0369a1' }}>
                                ℹ️ Ces infos s'affichent quand quelqu'un partage la page sur Facebook, WhatsApp, LinkedIn ou Twitter/X.
                            </div>

                            <Field label="Image Open Graph" hint="Recommandé : 1200×630px, format JPG/PNG, moins de 1 MB">
                                <ImageUploader value={seo.ogImage || ''} onChange={url => update({ ogImage: url })} folder="pages/og" />
                            </Field>

                            <Field label="Titre OG (optionnel)" hint="Si vide, utilise le Meta Title">
                                <input style={inputStyle} value={seo.ogTitle || ''} onChange={e => update({ ogTitle: e.target.value })} placeholder={seo.metaTitle || page.title} />
                            </Field>

                            <Field label="Description OG (optionnel)" hint="Si vide, utilise la Meta Description">
                                <textarea style={textareaStyle} value={seo.ogDescription || ''} onChange={e => update({ ogDescription: e.target.value })} placeholder={seo.metaDescription || 'Description pour les réseaux sociaux…'} rows={3} />
                            </Field>

                            {/* Preview card */}
                            {seo.ogImage && (
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginTop: '8px' }}>
                                    <img src={seo.ogImage} alt="OG preview" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                                    <div style={{ padding: '12px 16px', background: '#f3f4f6' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '2px' }}>LESAMISDUCBD.FR</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{seo.ogTitle || seo.metaTitle || page.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>{seo.ogDescription || seo.metaDescription || ''}</div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── TAB: ARTICLE ── */}
                    {activeTab === 'article' && isArticle && (
                        <>
                            <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '0.82rem', color: '#166534' }}>
                                📝 Ces champs enrichissent le schema JSON-LD <strong>BlogPosting / Article</strong> injecté automatiquement dans la page.
                            </div>

                            <Field label="Extrait / Introduction" hint="Affiché dans les listings d'articles et utilisé comme description SEO de secours">
                                <textarea style={{ ...textareaStyle, minHeight: '100px' }} value={seo.excerpt || ''} onChange={e => update({ excerpt: e.target.value })} placeholder="Courte description de l'article…" />
                            </Field>

                            <Field label="Image à la une" hint="Affiché dans les listings d'articles">
                                <ImageUploader value={seo.featuredImage || ''} onChange={url => update({ featuredImage: url })} folder="pages/articles" />
                            </Field>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <Field label="Auteur">
                                    <input style={inputStyle} value={seo.author || ''} onChange={e => update({ author: e.target.value })} placeholder="Nom de l'auteur" />
                                </Field>
                                <Field label="Date de publication">
                                    <input type="date" style={inputStyle} value={seo.publishedAt ? seo.publishedAt.slice(0, 10) : ''} onChange={e => update({ publishedAt: e.target.value })} />
                                </Field>
                            </div>

                            <Field label="Catégorie">
                                <input style={inputStyle} value={seo.category || ''} onChange={e => update({ category: e.target.value })} placeholder="ex: Guide CBD, Législation, Bien-être…" />
                            </Field>

                            <Field label="Tags" hint="Séparés par des virgules">
                                <input style={inputStyle} value={seo.tags || ''} onChange={e => update({ tags: e.target.value })} placeholder="ex: fleur cbd, bien-être, stress" />
                            </Field>
                        </>
                    )}

                    {/* ── TAB: AVANCÉ ── */}
                    {activeTab === 'advanced' && (
                        <>
                            {/* Publication status */}
                            <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut de publication</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    {[['draft','📝 Brouillon','#6b7280'], ['published','✅ Publié','#166534'], ['scheduled','🕐 Planifié','#d97706']].map(([val, lbl, clr]) => (
                                        <button key={val} type="button"
                                            onClick={() => updatePage({ status: val })}
                                            style={{ padding: '10px', borderRadius: '10px', border: `2px solid ${(page.status || 'draft') === val ? clr : '#e5e7eb'}`, background: (page.status || 'draft') === val ? clr + '15' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', color: (page.status || 'draft') === val ? clr : '#6b7280', transition: 'all 0.15s' }}>
                                            {lbl}
                                        </button>
                                    ))}
                                </div>
                                {(page.status === 'scheduled') && (
                                    <Field label="Date de publication" hint="La page sera automatiquement publiée à cette date">
                                        <input type="datetime-local" style={inputStyle}
                                            value={page.scheduledAt ? page.scheduledAt.slice(0, 16) : ''}
                                            onChange={e => updatePage({ scheduledAt: e.target.value })} />
                                    </Field>
                                )}
                            </div>
                            <Field label="URL Canonique" hint="Laissez vide pour utiliser l'URL par défaut (/p/slug)">
                                <input style={inputStyle} value={seo.canonicalUrl || ''} onChange={e => update({ canonicalUrl: e.target.value })} placeholder={`/p/${page.slug}`} />
                            </Field>

                            <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '16px', border: '1px solid #fecaca', marginBottom: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!seo.noindex}
                                        onChange={e => update({ noindex: e.target.checked })}
                                        style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#ef4444' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#991b1b' }}>Ne pas indexer (noindex)</div>
                                        <div style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '2px' }}>Google n'indexera pas cette page. Indispensable pour les landing pages SEA en test A/B.</div>
                                    </div>
                                </label>
                            </div>

                            {seo.pageType === 'LandingPage' && (
                                <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '16px', border: '1px solid #fde68a', marginBottom: '16px' }}>
                                    <Field label="Paramètre UTM de référence" hint="Pour retrouver facilement cette page dans GA4">
                                        <input style={inputStyle} value={seo.utmCampaign || ''} onChange={e => update({ utmCampaign: e.target.value })} placeholder="ex: spring-promo-cbd" />
                                    </Field>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!seo.hideHeaderFooter}
                                            onChange={e => update({ hideHeaderFooter: e.target.checked })}
                                            style={{ accentColor: '#1F4B40' }}
                                        />
                                        Masquer Header & Footer (mode landing SEA)
                                    </label>
                                </div>
                            )}

                            <Field label="Script de suivi personnalisé" hint="Google Ads, Meta Pixel, etc. Inséré dans le <head> de cette page uniquement">
                                <textarea style={{ ...textareaStyle, fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '100px' }}
                                    value={seo.customScript || ''} onChange={e => update({ customScript: e.target.value })}
                                    placeholder={'<!-- Coller votre snippet ici -->'} />
                            </Field>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px' }}>
                    <button onClick={onClose}
                        style={{ flex: 1, padding: '12px', background: '#1F4B40', color: '#00FF94', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                        ✓ Valider et fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
