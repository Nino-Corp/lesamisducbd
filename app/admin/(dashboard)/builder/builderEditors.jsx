'use client';

// All per-block editor forms for the Page Builder
import WysiwygEditor from './WysiwygEditor';

function Field({ label, hint, children }) {
    return (
        <div style={{ marginBottom: '16px' }}>
            {label && <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>}
            {children}
            {hint && <span style={{ display: 'block', fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>{hint}</span>}
        </div>
    );
}

const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' };
const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '80px' };
const selectStyle = { ...inputStyle, background: '#fff' };

export function ImageUploader({ value, onChange, folder = 'pages' }) {
    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', folder);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) onChange(data.url);
        e.target.value = '';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {value && <img src={value} alt="aperçu" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />}
            <div style={{ display: 'flex', gap: '8px' }}>
                <label style={{ flex: 1, padding: '8px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '0.85rem', border: '1px dashed #ddd' }}>
                    📁 {value ? 'Changer l\'image' : 'Choisir une image'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                </label>
                {value && <button type="button" onClick={() => onChange('')} style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>}
            </div>
        </div>
    );
}

export function HeroEditor({ props, onChange }) {
    return <>
        <Field label="Titre principal" hint="Supporte <strong>, <em>...">
            <textarea style={textareaStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} rows={3} />
        </Field>
        <Field label="Image de fond">
            <ImageUploader value={props.imageSrc || ''} onChange={url => onChange({ imageSrc: url })} folder="pages/hero" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Alignement du texte">
                <select style={selectStyle} value={props.textAlign || 'center'} onChange={e => onChange({ textAlign: e.target.value })}>
                    <option value="left">Gauche</option>
                    <option value="center">Centré</option>
                    <option value="right">Droite</option>
                </select>
            </Field>
            <Field label={`Opacité du fond sombre — ${props.overlayOpacity ?? 50}%`}>
                <input
                    type="range" min={0} max={100} step={5}
                    value={props.overlayOpacity ?? 50}
                    onChange={e => onChange({ overlayOpacity: +e.target.value })}
                    style={{ width: '100%', accentColor: '#1F4B40', cursor: 'pointer' }}
                />
            </Field>
        </div>
    </>;
}

export function TwoColumnsEditor({ props, onChange }) {
    return <>
        <Field label="Titre"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <Field label="Texte (HTML)" hint="Saisissez votre contenu">
            <WysiwygEditor value={props.text || ''} onChange={val => onChange({ text: val })} />
        </Field>
        <Field label="Image">
            <ImageUploader value={props.imageSrc || ''} onChange={url => onChange({ imageSrc: url })} folder="pages" />
        </Field>
        <Field label="Position de l'image">
            <select style={selectStyle} value={props.imagePosition || 'right'} onChange={e => onChange({ imagePosition: e.target.value })}>
                <option value="right">Droite</option>
                <option value="left">Gauche</option>
            </select>
        </Field>
        <Field label={`Taille de l'image — ${props.imageWidth || 50}%`}>
            <input
                type="range"
                min={20} max={80} step={1}
                value={props.imageWidth || 50}
                onChange={e => onChange({ imageWidth: +e.target.value })}
                style={{ width: '100%', accentColor: '#1F4B40', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#aaa', marginTop: '2px' }}>
                <span>20% (petite)</span>
                <span>50% (égale)</span>
                <span>80% (grande)</span>
            </div>
        </Field>
        <Field label="Texte du bouton (optionnel)"><input style={inputStyle} value={props.buttonText || ''} onChange={e => onChange({ buttonText: e.target.value })} placeholder="Ex: En savoir plus" /></Field>
        <Field label="Lien du bouton"><input style={inputStyle} value={props.buttonLink || ''} onChange={e => onChange({ buttonLink: e.target.value })} placeholder="/page" /></Field>
    </>;
}

export function RichTextEditor({ props, onChange }) {
    return <>
        <Field label="Titre de section"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} placeholder="Laisser vide pour masquer" /></Field>
        <Field label="Contenu (HTML)">
            <WysiwygEditor value={props.content || ''} onChange={val => onChange({ content: val })} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Alignement du texte">
                <select style={selectStyle} value={props.textAlign || 'left'} onChange={e => onChange({ textAlign: e.target.value })}>
                    <option value="left">Gauche</option>
                    <option value="center">Centré</option>
                    <option value="right">Droite</option>
                </select>
            </Field>
            <Field label="Largeur max. (px)">
                <input type="number" style={inputStyle} value={props.maxWidth || 800} onChange={e => onChange({ maxWidth: +e.target.value })} />
            </Field>
        </div>
    </>;
}

export function CardsGridEditor({ props, onChange }) {
    const cards = props.cards || [];
    const ICONS = ['leaf', 'star', 'shield', 'heart', 'check', 'bolt', 'globe', 'truck', 'award', 'smile', 'fire', 'lock'];
    const ICON_LABELS = { leaf: '🌿', star: '⭐', shield: '🛡️', heart: '❤️', check: '✅', bolt: '⚡', globe: '🌍', truck: '🚚', award: '🏆', smile: '😊', fire: '🔥', lock: '🔒' };

    const updateCard = (i, field, val) => onChange({ cards: cards.map((c, idx) => idx === i ? { ...c, [field]: val } : c) });
    const addCard = () => onChange({ cards: [...cards, { icon: 'star', title: 'Nouvelle carte', text: 'Description.' }] });
    const removeCard = i => onChange({ cards: cards.filter((_, idx) => idx !== i) });

    return <>
        <Field label="Titre de section"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <Field label="Sous-titre"><input style={inputStyle} value={props.subtitle || ''} onChange={e => onChange({ subtitle: e.target.value })} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Field label="Colonnes">
                <select style={selectStyle} value={props.columns || 3} onChange={e => onChange({ columns: +e.target.value })}>
                    {[2, 3, 4].map(n => <option key={n} value={n}>{n} colonnes</option>)}
                </select>
            </Field>
            <Field label="Style">
                <select style={selectStyle} value={props.cardStyle || 'shadow'} onChange={e => onChange({ cardStyle: e.target.value })}>
                    <option value="shadow">Ombre</option>
                    <option value="border">Bordure</option>
                </select>
            </Field>
            <Field label="Alignement En-tête">
                <select style={selectStyle} value={props.headerAlign || 'center'} onChange={e => onChange({ headerAlign: e.target.value })}>
                    <option value="left">Gauche</option>
                    <option value="center">Centré</option>
                    <option value="right">Droite</option>
                </select>
            </Field>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            {cards.map((card, i) => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '14px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '0.85rem' }}>Carte {i + 1}</strong>
                        <button type="button" onClick={() => removeCard(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                    </div>
                    <Field label="Icône">
                        <select style={selectStyle} value={card.icon || 'star'} onChange={e => updateCard(i, 'icon', e.target.value)}>
                            {ICONS.map(k => <option key={k} value={k}>{ICON_LABELS[k]} {k}</option>)}
                        </select>
                    </Field>
                    <Field label="Titre"><input style={inputStyle} value={card.title || ''} onChange={e => updateCard(i, 'title', e.target.value)} /></Field>
                    <Field label="Texte"><textarea style={textareaStyle} value={card.text || ''} onChange={e => updateCard(i, 'text', e.target.value)} rows={2} /></Field>
                </div>
            ))}
        </div>
        <button type="button" onClick={addCard} style={{ marginTop: '8px', width: '100%', padding: '10px', background: '#f0fdf4', color: '#1F4B40', border: '1px dashed #1F4B40', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter une carte</button>
    </>;
}

export function StatsBannerEditor({ props, onChange }) {
    const stats = props.stats || [];
    const updateStat = (i, field, val) => onChange({ stats: stats.map((s, idx) => idx === i ? { ...s, [field]: val } : s) });
    const addStat = () => onChange({ stats: [...stats, { value: '—', label: 'Libellé' }] });
    const removeStat = i => onChange({ stats: stats.filter((_, idx) => idx !== i) });

    return <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
            {stats.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                    <Field label={i === 0 ? "Valeur" : ""}><input style={inputStyle} value={s.value || ''} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="100%" /></Field>
                    <Field label={i === 0 ? "Libellé" : ""}><input style={inputStyle} value={s.label || ''} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Naturel" /></Field>
                    <button type="button" onClick={() => removeStat(i)} style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px' }}>✕</button>
                </div>
            ))}
        </div>
        <button type="button" onClick={addStat} style={{ width: '100%', padding: '10px', background: '#f0fdf4', color: '#1F4B40', border: '1px dashed #1F4B40', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter un chiffre</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <Field label="Fond"><input type="color" value={props.backgroundColor || '#1F4B40'} onChange={e => onChange({ backgroundColor: e.target.value })} style={{ width: '100%', height: '38px', border: 'none', padding: 0, borderRadius: '8px', cursor: 'pointer' }} /></Field>
            <Field label="Accent"><input type="color" value={props.accentColor || '#00FF94'} onChange={e => onChange({ accentColor: e.target.value })} style={{ width: '100%', height: '38px', border: 'none', padding: 0, borderRadius: '8px', cursor: 'pointer' }} /></Field>
        </div>
    </>;
}

export function CTABlockEditor({ props, onChange }) {
    return <>
        <Field label="Titre"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <Field label="Sous-titre"><input style={inputStyle} value={props.subtitle || ''} onChange={e => onChange({ subtitle: e.target.value })} /></Field>
        <Field label="Bouton principal — Texte"><input style={inputStyle} value={props.buttonText || ''} onChange={e => onChange({ buttonText: e.target.value })} /></Field>
        <Field label="Bouton principal — Lien"><input style={inputStyle} value={props.buttonLink || ''} onChange={e => onChange({ buttonLink: e.target.value })} placeholder="/produits" /></Field>
        <Field label="Bouton secondaire — Texte (optionnel)"><input style={inputStyle} value={props.buttonSecondaryText || ''} onChange={e => onChange({ buttonSecondaryText: e.target.value })} /></Field>
        <Field label="Bouton secondaire — Lien"><input style={inputStyle} value={props.buttonSecondaryLink || ''} onChange={e => onChange({ buttonSecondaryLink: e.target.value })} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '4px' }}>
            <Field label="Fond"><input type="color" value={props.backgroundColor || '#1F4B40'} onChange={e => onChange({ backgroundColor: e.target.value })} style={{ width: '100%', height: '38px', border: 'none', padding: 0, borderRadius: '8px', cursor: 'pointer' }} /></Field>
            <Field label="Accent"><input type="color" value={props.accentColor || '#00FF94'} onChange={e => onChange({ accentColor: e.target.value })} style={{ width: '100%', height: '38px', border: 'none', padding: 0, borderRadius: '8px', cursor: 'pointer' }} /></Field>
            <Field label="Alignement">
                <select style={selectStyle} value={props.alignment || 'center'} onChange={e => onChange({ alignment: e.target.value })}>
                    <option value="left">Gauche</option>
                    <option value="center">Centré</option>
                    <option value="right">Droite</option>
                </select>
            </Field>
        </div>
    </>;
}

export function QuoteEditor({ props, onChange }) {
    return <>
        <Field label="Citation"><textarea style={textareaStyle} value={props.text || ''} onChange={e => onChange({ text: e.target.value })} rows={4} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <Field label="Auteur"><input style={inputStyle} value={props.author || ''} onChange={e => onChange({ author: e.target.value })} placeholder="Nelson — Les Amis du CBD" /></Field>
            <Field label="Alignement">
                <select style={selectStyle} value={props.textAlign || 'center'} onChange={e => onChange({ textAlign: e.target.value })}>
                    <option value="left">Gauche</option>
                    <option value="center">Centré</option>
                    <option value="right">Droite</option>
                </select>
            </Field>
        </div>
    </>;
}

export function ImageBlockEditor({ props, onChange }) {
    return <>
        <Field label="Image"><ImageUploader value={props.src || ''} onChange={url => onChange({ src: url })} folder="pages/images" /></Field>
        <Field label="Texte alternatif"><input style={inputStyle} value={props.alt || ''} onChange={e => onChange({ alt: e.target.value })} /></Field>
        <Field label="Légende (optionnelle)"><input style={inputStyle} value={props.caption || ''} onChange={e => onChange({ caption: e.target.value })} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label={`Largeur — ${props.imageWidth || 100}%`}>
                <input
                    type="range" min={20} max={100} step={5}
                    value={props.imageWidth || 100}
                    onChange={e => onChange({ imageWidth: +e.target.value })}
                    style={{ width: '100%', accentColor: '#1F4B40', cursor: 'pointer' }}
                />
            </Field>
            <Field label="Alignement">
                <select style={selectStyle} value={props.imageAlign || 'center'} onChange={e => onChange({ imageAlign: e.target.value })}>
                    <option value="left">Gauche</option>
                    <option value="center">Centré</option>
                    <option value="right">Droite</option>
                </select>
            </Field>
        </div>
    </>;
}

export function VideoEmbedEditor({ props, onChange }) {
    return <>
        <Field label="URL YouTube ou Vimeo" hint="Ex: https://www.youtube.com/watch?v=...">
            <input style={inputStyle} value={props.url || ''} onChange={e => onChange({ url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
        </Field>
        <Field label="Titre (optionnel)"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <Field label="Légende (optionnel)"><input style={inputStyle} value={props.caption || ''} onChange={e => onChange({ caption: e.target.value })} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label={`Largeur vidéo — ${props.videoWidth || 100}%`}>
                <input
                    type="range" min={20} max={100} step={5}
                    value={props.videoWidth || 100}
                    onChange={e => onChange({ videoWidth: +e.target.value })}
                    style={{ width: '100%', accentColor: '#1F4B40', cursor: 'pointer' }}
                />
            </Field>
            <Field label="Alignement">
                <select style={selectStyle} value={props.videoAlign || 'center'} onChange={e => onChange({ videoAlign: e.target.value })}>
                    <option value="left">Gauche</option>
                    <option value="center">Centré</option>
                    <option value="right">Droite</option>
                </select>
            </Field>
        </div>
        <Field label="Couleur de fond"><input type="color" value={props.backgroundColor || '#000000'} onChange={e => onChange({ backgroundColor: e.target.value })} style={{ width: '100%', height: '38px', border: 'none', padding: 0, borderRadius: '8px', cursor: 'pointer' }} /></Field>
    </>;
}

export function FAQEditor({ props, onChange }) {
    const items = props.items || [];
    const updateItem = (i, field, val) => onChange({ items: items.map((item, idx) => idx === i ? { ...item, [field]: val } : item) });
    const addItem = () => onChange({ items: [...items, { question: 'Nouvelle question ?', answer: 'Réponse ici.' }] });
    const removeItem = i => onChange({ items: items.filter((_, idx) => idx !== i) });

    return <>
        <Field label="Titre de la FAQ"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {items.map((item, i) => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '14px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '0.85rem' }}>Q{i + 1}</strong>
                        <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                    </div>
                    <Field label="Question"><input style={inputStyle} value={item.question} onChange={e => updateItem(i, 'question', e.target.value)} /></Field>
                    <Field label="Réponse"><textarea style={textareaStyle} value={item.answer} rows={3} onChange={e => updateItem(i, 'answer', e.target.value)} /></Field>
                </div>
            ))}
        </div>
        <button type="button" onClick={addItem} style={{ marginTop: '8px', width: '100%', padding: '10px', background: '#f0fdf4', color: '#1F4B40', border: '1px dashed #1F4B40', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter une question</button>
    </>;
}

export function DividerEditor({ props, onChange }) {
    return <>
        <Field label="Style">
            <select style={selectStyle} value={props.style || 'line'} onChange={e => onChange({ style: e.target.value })}>
                <option value="line">Ligne</option>
                <option value="dots">Points</option>
                <option value="none">Espace blanc</option>
            </select>
        </Field>
        <Field label="Espacement">
            <select style={selectStyle} value={props.spacing || 'medium'} onChange={e => onChange({ spacing: e.target.value })}>
                <option value="small">Petit</option>
                <option value="medium">Moyen</option>
                <option value="large">Grand</option>
            </select>
        </Field>
        {props.style !== 'none' && (
            <Field label="Couleur"><input type="color" value={props.color || '#e5e7eb'} onChange={e => onChange({ color: e.target.value })} style={{ width: '100%', height: '38px', border: 'none', padding: 0, borderRadius: '8px', cursor: 'pointer' }} /></Field>
        )}
    </>;
}

export function AuthorCardEditor({ props, onChange }) {
    return <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Nom"><input style={inputStyle} value={props.name || ''} onChange={e => onChange({ name: e.target.value })} placeholder="Prénom Nom" /></Field>
            <Field label="Rôle / Titre"><input style={inputStyle} value={props.role || ''} onChange={e => onChange({ role: e.target.value })} placeholder="Rédacteur CBD" /></Field>
        </div>
        <Field label="Bio"><textarea style={textareaStyle} value={props.bio || ''} onChange={e => onChange({ bio: e.target.value })} rows={3} /></Field>
        <Field label="Photo de profil"><ImageUploader value={props.imageSrc || ''} onChange={url => onChange({ imageSrc: url })} folder="pages/authors" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Field label="Twitter / X" hint="URL complète"><input style={inputStyle} value={props.twitter || ''} onChange={e => onChange({ twitter: e.target.value })} placeholder="https://x.com/..." /></Field>
            <Field label="LinkedIn" hint="URL complète"><input style={inputStyle} value={props.linkedin || ''} onChange={e => onChange({ linkedin: e.target.value })} placeholder="https://linkedin.com/..." /></Field>
            <Field label="Site web"><input style={inputStyle} value={props.website || ''} onChange={e => onChange({ website: e.target.value })} placeholder="https://..." /></Field>
        </div>
    </>;
}

export function CalloutBoxEditor({ props, onChange }) {
    return <>
        <Field label="Type d'encadré">
            <select style={selectStyle} value={props.type || 'tip'} onChange={e => onChange({ type: e.target.value })}>
                <option value="note">ℹ️ Note</option>
                <option value="tip">💡 Conseil</option>
                <option value="warning">⚠️ Attention</option>
                <option value="danger">🚨 Important</option>
                <option value="quote">💬 À retenir</option>
            </select>
        </Field>
        <Field label="Émoji personnalisé (optionnel)" hint="Laissez vide pour utiliser l'émoji par défaut">
            <input style={inputStyle} value={props.emoji || ''} onChange={e => onChange({ emoji: e.target.value })} placeholder="ex: 🌿" maxLength={4} />
        </Field>
        <Field label="Titre"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} placeholder="Bon à savoir" /></Field>
        <Field label="Contenu (HTML)">
            <WysiwygEditor value={props.content || ''} onChange={val => onChange({ content: val })} />
        </Field>
    </>;
}

export function RelatedArticlesEditor({ props, onChange }) {
    const articles = props.articles || [];
    const updateArticle = (i, field, val) => onChange({ articles: articles.map((a, idx) => idx === i ? { ...a, [field]: val } : a) });
    const addArticle = () => onChange({ articles: [...articles, { title: 'Titre', href: '/p/', excerpt: '', category: '', image: '' }] });
    const removeArticle = i => onChange({ articles: articles.filter((_, idx) => idx !== i) });

    return <>
        <Field label="Titre de la section"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {articles.map((article, i) => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '14px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '0.85rem' }}>Article {i + 1}</strong>
                        <button type="button" onClick={() => removeArticle(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                    </div>
                    <Field label="Titre"><input style={inputStyle} value={article.title || ''} onChange={e => updateArticle(i, 'title', e.target.value)} /></Field>
                    <Field label="URL" hint="ex: /p/mon-article"><input style={inputStyle} value={article.href || ''} onChange={e => updateArticle(i, 'href', e.target.value)} placeholder="/p/" /></Field>
                    <Field label="Catégorie (optionnel)"><input style={inputStyle} value={article.category || ''} onChange={e => updateArticle(i, 'category', e.target.value)} placeholder="CBD, Bien-être..." /></Field>
                    <Field label="Extrait"><textarea style={textareaStyle} value={article.excerpt || ''} onChange={e => updateArticle(i, 'excerpt', e.target.value)} rows={2} /></Field>
                    <Field label="Image"><ImageUploader value={article.image || ''} onChange={url => updateArticle(i, 'image', url)} folder="pages/articles" /></Field>
                </div>
            ))}
        </div>
        <button type="button" onClick={addArticle} style={{ marginTop: '8px', width: '100%', padding: '10px', background: '#f0fdf4', color: '#1F4B40', border: '1px dashed #1F4B40', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter un article</button>
    </>;
}

export function TableOfContentsEditor({ props, onChange }) {
    const items = props.items || [];
    const updateItem = (i, field, val) => onChange({ items: items.map((item, idx) => idx === i ? { ...item, [field]: val } : item) });
    const addItem = () => onChange({ items: [...items, { text: 'Nouveau titre', anchor: 'section', level: 2 }] });
    const removeItem = i => onChange({ items: items.filter((_, idx) => idx !== i) });

    return <>
        <Field label="Titre du sommaire"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '8px', alignItems: 'center' }}>
                    <input style={inputStyle} value={item.text || ''} onChange={e => updateItem(i, 'text', e.target.value)} placeholder="Titre de section" />
                    <input style={inputStyle} value={item.anchor || ''} onChange={e => updateItem(i, 'anchor', e.target.value.replace(/\s+/g, '-').toLowerCase())} placeholder="ancre (sans #)" />
                    <select style={{ ...selectStyle, width: 'auto' }} value={item.level || 2} onChange={e => updateItem(i, 'level', +e.target.value)}>
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                    </select>
                    <button type="button" onClick={() => removeItem(i)} style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                </div>
            ))}
        </div>
        <button type="button" onClick={addItem} style={{ marginTop: '8px', width: '100%', padding: '10px', background: '#f0fdf4', color: '#1F4B40', border: '1px dashed #1F4B40', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter une entrée</button>
    </>;
}

export function FeaturedProductsEditor({ props, onChange }) {
    return <>
        <Field label="Titre de section (optionnel)"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} placeholder="Notre Sélection" /></Field>
        <Field label="Sous-titre (optionnel)"><input style={inputStyle} value={props.subtitle || ''} onChange={e => onChange({ subtitle: e.target.value })} placeholder="Découvrez nos meilleurs produits" /></Field>
        <Field label="Références SKU" hint="Séparez les références par des virgules. Ex: FLEUR-GOR-01, HUILE-10-01">
            <input style={inputStyle} value={props.skus || ''} onChange={e => onChange({ skus: e.target.value })} placeholder="SKU-1, SKU-2" />
        </Field>
        <Field label="Colonnes (Desktop)">
            <select style={selectStyle} value={props.columns || 4} onChange={e => onChange({ columns: +e.target.value })}>
                <option value={2}>2 colonnes (grandes cartes)</option>
                <option value={3}>3 colonnes</option>
                <option value={4}>4 colonnes (petites cartes)</option>
            </select>
        </Field>
    </>;
}

export function MarqueeEditor({ props, onChange }) {
    return <>
        <Field label="Texte défilant"><input style={inputStyle} value={props.text || ''} onChange={e => onChange({ text: e.target.value })} placeholder="OFFRE SPÉCIALE..." /></Field>
        <Field label="Vitesse (secondes)"><input type="number" style={inputStyle} value={props.speed || 20} onChange={e => onChange({ speed: +e.target.value })} /></Field>
    </>;
}

export function OfferComparatorEditor() {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>Ce bloc est interactif et n'a pas de paramètres configurables.</div>;
}

export function PartnersNetworkEditor({ props, onChange }) {
    const partners = props.partners || [];
    const updatePartner = (i, field, val) => onChange({ partners: partners.map((p, idx) => idx === i ? { ...p, [field]: val } : p) });
    const addPartner = () => onChange({ partners: [...partners, { image: '', name: 'Nouveau partenaire' }] });
    const removePartner = i => onChange({ partners: partners.filter((_, idx) => idx !== i) });

    return <>
        <Field label="Titre de section"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {partners.map((partner, i) => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '14px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '0.85rem' }}>Logo {i + 1}</strong>
                        <button type="button" onClick={() => removePartner(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                    </div>
                    <Field label="Nom"><input style={inputStyle} value={partner.name || ''} onChange={e => updatePartner(i, 'name', e.target.value)} /></Field>
                    <Field label="Image"><ImageUploader value={partner.image || ''} onChange={url => updatePartner(i, 'image', url)} folder="pages/partners" /></Field>
                </div>
            ))}
        </div>
        <button type="button" onClick={addPartner} style={{ marginTop: '8px', width: '100%', padding: '10px', background: '#f0fdf4', color: '#1F4B40', border: '1px dashed #1F4B40', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter un logo</button>
    </>;
}

export function QualityBannerEditor({ props, onChange }) {
    return <>
        <Field label="Titre"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <Field label="Sous-titre"><input style={inputStyle} value={props.subtitle || ''} onChange={e => onChange({ subtitle: e.target.value })} /></Field>
    </>;
}

export function WhyChooseUsEditor({ props, onChange }) {
    const features = props.features || [];
    const updateFeature = (i, field, val) => onChange({ features: features.map((f, idx) => idx === i ? { ...f, [field]: val } : f) });
    const addFeature = () => onChange({ features: [...features, { title: 'Nouvel avantage', description: 'Description...' }] });
    const removeFeature = i => onChange({ features: features.filter((_, idx) => idx !== i) });

    return <>
        <Field label="Titre Principal"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <Field label="Image"><ImageUploader value={props.imageSrc || ''} onChange={url => onChange({ imageSrc: url })} folder="pages/why" /></Field>
        <Field label="Texte Alternatif Image"><input style={inputStyle} value={props.imageAlt || ''} onChange={e => onChange({ imageAlt: e.target.value })} /></Field>
        <Field label="Inverser la disposition (Image à droite)">
            <input type="checkbox" checked={!!props.isReversed} onChange={e => onChange({ isReversed: e.target.checked })} />
        </Field>
        <Field label="Label du bouton"><input style={inputStyle} value={props.ctaLabel || ''} onChange={e => onChange({ ctaLabel: e.target.value })} /></Field>
        <Field label="Lien du bouton"><input style={inputStyle} value={props.ctaLink || ''} onChange={e => onChange({ ctaLink: e.target.value })} /></Field>

        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginTop: '16px', marginBottom: '8px' }}>AVANTAGES</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {features.map((feature, i) => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '14px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '0.85rem' }}>Avantage {i + 1}</strong>
                        <button type="button" onClick={() => removeFeature(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                    </div>
                    <Field label="Titre"><input style={inputStyle} value={feature.title || ''} onChange={e => updateFeature(i, 'title', e.target.value)} /></Field>
                    <Field label="Description"><textarea style={textareaStyle} value={feature.description || ''} onChange={e => updateFeature(i, 'description', e.target.value)} rows={2} /></Field>
                </div>
            ))}
        </div>
        <button type="button" onClick={addFeature} style={{ marginTop: '8px', width: '100%', padding: '10px', background: '#f0fdf4', color: '#1F4B40', border: '1px dashed #1F4B40', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter un avantage</button>
    </>;
}

export function CodeEmbedEditor({ props, onChange }) {
    return <>
        <Field label="Code HTML / Iframe" hint="Attention, ce code sera exécuté tel quel sur la page finale. Ne collez que du code de confiance.">
            <textarea style={{ ...textareaStyle, fontFamily: 'monospace', fontSize: '0.85rem' }} value={props.code || ''} onChange={e => onChange({ code: e.target.value })} rows={10} placeholder="<iframe>...</iframe> ou <script>...</script>" />
        </Field>
    </>;
}

export function NewsletterBlockEditor({ props, onChange }) {
    return <>
        <Field label="Titre"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <Field label="Description"><textarea style={textareaStyle} value={props.description || ''} onChange={e => onChange({ description: e.target.value })} rows={3} /></Field>
        <Field label="Texte du bouton"><input style={inputStyle} value={props.buttonText || ''} onChange={e => onChange({ buttonText: e.target.value })} /></Field>
        <Field label="Placeholder E-mail"><input style={inputStyle} value={props.placeholder || ''} onChange={e => onChange({ placeholder: e.target.value })} /></Field>
    </>;
}

export function ContactFormBlockEditor({ props, onChange }) {
    return <>
        <Field label="Titre"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <Field label="Description"><textarea style={textareaStyle} value={props.description || ''} onChange={e => onChange({ description: e.target.value })} rows={3} /></Field>
        <Field label="Texte du bouton"><input style={inputStyle} value={props.buttonText || ''} onChange={e => onChange({ buttonText: e.target.value })} /></Field>
    </>;
}

export function EssentielIntroEditor({ props, onChange }) {
    const items = props.items || [];
    const updateItem = (i, val) => onChange({ items: items.map((p, idx) => idx === i ? val : p) });
    const addItem = () => onChange({ items: [...items, 'Nouveau paragraphe...'] });
    const removeItem = (i) => onChange({ items: items.filter((_, idx) => idx !== i) });

    return <>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px' }}>Paragraphes d'introduction :</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <textarea style={textareaStyle} value={p} onChange={e => updateItem(i, e.target.value)} rows={3} />
                    <button type="button" onClick={() => removeItem(i)} style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
                </div>
            ))}
        </div>
        <button type="button" onClick={addItem} style={{ marginTop: '8px', width: '100%', padding: '10px', background: '#f0fdf4', color: '#1F4B40', border: '1px dashed #1F4B40', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter un paragraphe</button>
    </>;
}

export function EssentielCarouselEditor({ props, onChange }) {
    const items = props.items || [];
    const updateItem = (i, field, val) => onChange({ items: items.map((p, idx) => idx === i ? { ...p, [field]: val } : p) });
    const addItem = () => onChange({ items: [...items, { title: 'Nouveau point', description: 'Description...', image: '' }] });
    const removeItem = (i) => onChange({ items: items.filter((_, idx) => idx !== i) });

    return <>
        <Field label="Titre de section" hint="Optionnel"><input style={inputStyle} value={props.title || ''} onChange={e => onChange({ title: e.target.value })} /></Field>
        <Field label="Introduction" hint="Optionnel"><textarea style={textareaStyle} value={props.intro || ''} onChange={e => onChange({ intro: e.target.value })} rows={2} /></Field>
        
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px', marginTop: '16px' }}>Éléments du carrousel :</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item, i) => (
                <div key={i} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', position: 'relative' }}>
                    <button type="button" onClick={() => removeItem(i)} style={{ position: 'absolute', top: '12px', right: '12px', padding: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                    <Field label={`Titre ${i+1}`}><input style={inputStyle} value={item.title || ''} onChange={e => updateItem(i, 'title', e.target.value)} /></Field>
                    <Field label="Description"><textarea style={textareaStyle} value={item.description || ''} onChange={e => updateItem(i, 'description', e.target.value)} rows={3} /></Field>
                    <Field label="Image">
                        <ImageUploader value={item.image || ''} onChange={url => updateItem(i, 'image', url)} folder="pages/essentiel" />
                    </Field>
                </div>
            ))}
        </div>
        <button type="button" onClick={addItem} style={{ marginTop: '12px', width: '100%', padding: '10px', background: '#f0fdf4', color: '#1F4B40', border: '1px dashed #1F4B40', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter un élément</button>
    </>;
}

export function EssentielPointsEditor({ props, onChange }) {
    const items = props.items || [];
    const updateItem = (i, val) => onChange({ items: items.map((p, idx) => idx === i ? val : p) });
    const addItem = () => onChange({ items: [...items, 'Nouveau point...'] });
    const removeItem = (i) => onChange({ items: items.filter((_, idx) => idx !== i) });

    return <>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px' }}>Points essentiels à retenir :</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input style={inputStyle} value={p} onChange={e => updateItem(i, e.target.value)} />
                    <button type="button" onClick={() => removeItem(i)} style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
                </div>
            ))}
        </div>
        <button type="button" onClick={addItem} style={{ marginTop: '8px', width: '100%', padding: '10px', background: '#f0fdf4', color: '#1F4B40', border: '1px dashed #1F4B40', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter un point</button>
    </>;
}

export const EDITORS = {
    ContentHero: HeroEditor,
    TwoColumns: TwoColumnsEditor,
    RichText: RichTextEditor,
    CardsGrid: CardsGridEditor,
    StatsBanner: StatsBannerEditor,
    CTABlock: CTABlockEditor,
    Quote: QuoteEditor,
    ImageBlock: ImageBlockEditor,
    VideoEmbed: VideoEmbedEditor,
    FAQ: FAQEditor,
    Divider: DividerEditor,
    AuthorCard: AuthorCardEditor,
    CalloutBox: CalloutBoxEditor,
    RelatedArticles: RelatedArticlesEditor,
    TableOfContents: TableOfContentsEditor,
    FeaturedProducts: FeaturedProductsEditor,
    Marquee: MarqueeEditor,
    OfferComparator: OfferComparatorEditor,
    PartnersNetwork: PartnersNetworkEditor,
    QualityBanner: QualityBannerEditor,
    WhyChooseUs: WhyChooseUsEditor,
    CodeEmbed: CodeEmbedEditor,
    NewsletterBlock: NewsletterBlockEditor,
    ContactFormBlock: ContactFormBlockEditor,
    EssentielIntro: EssentielIntroEditor,
    EssentielCarousel: EssentielCarouselEditor,
    EssentielPoints: EssentielPointsEditor,
};
