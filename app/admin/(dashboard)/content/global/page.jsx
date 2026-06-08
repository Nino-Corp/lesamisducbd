'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LivePreview from '../../builder/LivePreview';

const DEFAULTS = {
    contact: {
        title: "Les Amis du CBD France",
        address: "25 rue principale 07120 Chauzon (FR)",
        phone: "06 71 82 42 87",
        email: "lesamisducbd@gmail.com"
    },
    footerLinks: [
        { label: "Livraison", href: "/livraison" },
        { label: "CGV", href: "/cgv" },
        { label: "Politique de confidentialité", href: "/privacy" },
        { label: "Transparence", href: "/transparence" },
        { label: "Buraliste", href: "/professionnel" }
    ],
    headerLinks: [
        { label: "PRODUITS", href: "/produits" },
        { label: "L'ESSENTIEL", href: "/essentiel" },
        { label: "CBD & USAGES", href: "/usages" },
        { label: "PROFESSIONNEL", href: "/professionnel" }
    ]
};

const SECTIONS_META = [
    { id: 'header', label: 'En-tête (Header)', icon: '🔝' },
    { id: 'footer', label: 'Pied de page (Footer)', icon: '🔻' },
    { id: 'contact', label: 'Contact', icon: '📞' }
];

const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#1e293b',
    background: '#fff', outline: 'none', transition: 'border 0.2s',
    fontFamily: 'inherit'
};

const Field = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
        {children}
    </div>
);

export default function GlobalContentPage() {
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    
    const [contact, setContact] = useState(DEFAULTS.contact);
    const [footerLinks, setFooterLinks] = useState(DEFAULTS.footerLinks);
    const [headerLinks, setHeaderLinks] = useState(DEFAULTS.headerLinks);
    const [visibility, setVisibility] = useState({ headerBanner: true, newsletter: true });
    
    const [activeSection, setActiveSection] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const autoSaveTimerRef = useRef(null);
    const initialLoadRef = useRef(true);

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/admin/content/global', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                if (data.contact) setContact(data.contact);
                if (data.footerLinks) setFooterLinks(data.footerLinks);
                if (data.headerLinks) setHeaderLinks(data.headerLinks);
                if (data.visibility) setVisibility(prev => ({ ...prev, ...data.visibility }));
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
    }, [contact, footerLinks, headerLinks, visibility]);

    const save = async () => {
        setSaving(true);
        try {
            await fetch('/api/admin/content/global', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact, footerLinks, headerLinks, visibility })
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch { alert('Erreur lors de la sauvegarde'); }
        finally { setSaving(false); }
    };

    if (!loaded) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '12px', color: '#64748b' }}>
            <div style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#1F4B40', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Chargement…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    const previewSections = [
        { id: 'header', type: 'Header', props: { 
            menuItems: headerLinks, 
            bannerVisible: visibility.headerBanner !== false,
            logoText: "LES AMIS DU CBD",
            logoImage: "/images/logo.webp",
        }},
        { id: 'placeholder', type: 'RichText', props: { 
            content: '<div style="text-align: center; padding: 120px 20px; color: #94a3b8; background: #f8fafc; border: 2px dashed #e2e8f0; margin: 40px; border-radius: 20px;"><h2>Contenu de la page</h2><p>Le contenu spécifique à chaque page s\'affichera ici.</p></div>' 
        }},
        { id: 'footer', type: 'Footer', props: { 
            columnLinks: footerLinks, 
            contactInfo: contact, 
            newsletter: { isVisible: visibility.newsletter !== false, placeholder: "Votre adresse e-mail", disclaimer: "Vous pouvez vous désinscrire à tout moment." },
            copyright: "©2024 - Les Amis du CBD"
        }}
    ];

    const currentMeta = activeSection ? SECTIONS_META.find(s => s.id === activeSection) : null;

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
                            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>🌍 Éléments Globaux</h1>
                            <code style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/global</code>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                            padding: '6px 12px', borderRadius: '8px',
                            background: '#f0fdf4', color: '#166534', fontWeight: 700, fontSize: '0.8rem',
                            border: '1px solid #16653430',
                        }}>✅ Actif partout</span>

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
                        {!activeSection ? (
                            /* ═══ SECTION LIST VIEW ═══ */
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{
                                    padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F4B40' }}>
                                        Éléments
                                    </span>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                                    {SECTIONS_META.map((meta) => (
                                        <div
                                            key={meta.id}
                                            onClick={() => setActiveSection(meta.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '12px', borderRadius: '10px', marginBottom: '4px',
                                                cursor: 'pointer', transition: 'all 0.15s',
                                                background: '#f8fafc', border: '1px solid #f1f5f9',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                                        >
                                            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{meta.icon}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                                                    {meta.label}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>→</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* ═══ EDITOR VIEW ═══ */
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
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{currentMeta?.label}</div>
                                    </div>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                                    
                                    {/* ── HEADER EDITOR ── */}
                                    {activeSection === 'header' && (
                                        <>
                                            <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                                                    <input type="checkbox" checked={visibility.headerBanner !== false} onChange={e => setVisibility(v => ({ ...v, headerBanner: e.target.checked }))} />
                                                    Afficher le bandeau d'annonce
                                                </label>
                                            </div>
                                            <h3 style={{ fontSize: '0.9rem', color: '#1F4B40', marginBottom: '12px' }}>Liens de navigation</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {headerLinks.map((link, i) => (
                                                    <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <strong style={{ fontSize: '0.75rem', color: '#64748b' }}>Lien {i + 1}</strong>
                                                            <button onClick={() => setHeaderLinks(links => links.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <input style={{ ...inputStyle, flex: 1 }} placeholder="Texte" value={link.label} onChange={e => setHeaderLinks(links => links.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l))} />
                                                            <input style={{ ...inputStyle, flex: 1 }} placeholder="URL" value={link.href} onChange={e => setHeaderLinks(links => links.map((l, idx) => idx === i ? { ...l, href: e.target.value } : l))} />
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => setHeaderLinks(links => [...links, { label: 'Nouveau lien', href: '/' }])} style={{ padding: '10px', background: 'transparent', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}>+ Ajouter un lien</button>
                                            </div>
                                        </>
                                    )}

                                    {/* ── FOOTER EDITOR ── */}
                                    {activeSection === 'footer' && (
                                        <>
                                            <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                                                    <input type="checkbox" checked={visibility.newsletter !== false} onChange={e => setVisibility(v => ({ ...v, newsletter: e.target.checked }))} />
                                                    Afficher le module Newsletter
                                                </label>
                                            </div>
                                            <h3 style={{ fontSize: '0.9rem', color: '#1F4B40', marginBottom: '12px' }}>Liens utiles (Colonne 1)</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {footerLinks.map((link, i) => (
                                                    <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <strong style={{ fontSize: '0.75rem', color: '#64748b' }}>Lien {i + 1}</strong>
                                                            <button onClick={() => setFooterLinks(links => links.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <input style={{ ...inputStyle, flex: 1 }} placeholder="Texte" value={link.label} onChange={e => setFooterLinks(links => links.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l))} />
                                                            <input style={{ ...inputStyle, flex: 1 }} placeholder="URL" value={link.href} onChange={e => setFooterLinks(links => links.map((l, idx) => idx === i ? { ...l, href: e.target.value } : l))} />
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => setFooterLinks(links => [...links, { label: 'Nouveau lien', href: '/' }])} style={{ padding: '10px', background: 'transparent', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}>+ Ajouter un lien</button>
                                            </div>
                                        </>
                                    )}

                                    {/* ── CONTACT EDITOR ── */}
                                    {activeSection === 'contact' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <Field label="Nom de l'entreprise">
                                                <input style={inputStyle} value={contact.title || ''} onChange={e => setContact(c => ({ ...c, title: e.target.value }))} />
                                            </Field>
                                            <Field label="Adresse physique">
                                                <input style={inputStyle} value={contact.address || ''} onChange={e => setContact(c => ({ ...c, address: e.target.value }))} />
                                            </Field>
                                            <Field label="Numéro de téléphone">
                                                <input style={inputStyle} value={contact.phone || ''} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} />
                                            </Field>
                                            <Field label="Adresse email">
                                                <input style={inputStyle} value={contact.email || ''} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} />
                                            </Field>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── RIGHT: Live Preview ─────────────────── */}
                <div style={{ position: 'relative', overflow: 'hidden', background: '#e5e7eb' }}>
                    <LivePreview
                        sections={previewSections}
                        activeIndex={activeSection === 'header' ? 0 : activeSection === 'footer' || activeSection === 'contact' ? 2 : null}
                        onSelect={(idx) => {
                            if (idx === 0) setActiveSection('header');
                            else if (idx === 2) setActiveSection('footer');
                        }}
                        isFullscreen={isFullscreen}
                        setIsFullscreen={setIsFullscreen}
                    />
                </div>
            </div>
        </div>
    );
}
