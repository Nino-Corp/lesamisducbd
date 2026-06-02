'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './Builder.module.css';

const PAGE_TYPES = [
    { value: 'WebPage',     label: 'Page',          icon: '📄', color: '#6b7280' },
    { value: 'BlogPosting', label: 'Article Blog',   icon: '📝', color: '#2563eb' },
    { value: 'Article',     label: 'Article',        icon: '📰', color: '#7c3aed' },
    { value: 'LandingPage', label: 'Landing SEA',    icon: '🎯', color: '#dc2626' },
    { value: 'FAQPage',     label: 'FAQ',            icon: '❓', color: '#d97706' },
];

const PAGE_TEMPLATES = {
    blank: { label: 'Page Vide', icon: '📄', sections: [] },
    blog: { 
        label: 'Article de Blog Typique', 
        icon: '📝',
        sections: [
            { id: `hero-${Date.now()}`, type: 'ContentHero', props: { title: 'Titre de l\'article', textAlign: 'center' } },
            { id: `toc-${Date.now()}`, type: 'TableOfContents', props: { title: 'Sommaire', items: [] } },
            { id: `rt-${Date.now()}`, type: 'RichText', props: { content: '<h2>Introduction</h2><p>Commencez à écrire ici...</p>' } },
            { id: `auth-${Date.now()}`, type: 'AuthorCard', props: { name: 'Auteur', role: 'Rédacteur CBD' } },
            { id: `rel-${Date.now()}`, type: 'RelatedArticles', props: { title: 'À lire aussi', articles: [] } }
        ]
    },
    landing: {
        label: 'Landing Page Promo',
        icon: '🎯',
        sections: [
            { id: `hero-${Date.now()}`, type: 'ContentHero', props: { title: 'Offre Spéciale', textAlign: 'center' } },
            { id: `why-${Date.now()}`, type: 'WhyChooseUs', props: { title: 'Pourquoi choisir nos produits ?' } },
            { id: `prod-${Date.now()}`, type: 'FeaturedProducts', props: { title: 'Notre Sélection' } },
            { id: `cta-${Date.now()}`, type: 'CTABlock', props: { title: 'Prêt à commander ?' } }
        ]
    }
};

function seoScore(page) {
    const seo = page.seo || {};
    const checks = [
        !!(seo.metaTitle?.length > 0),
        !!(seo.metaTitle && seo.metaTitle.length <= 60),
        !!(seo.metaDescription?.length > 0),
        !!(seo.metaDescription && seo.metaDescription.length <= 160),
        !!(seo.ogImage?.length > 0),
        !!(seo.pageType && seo.pageType !== 'WebPage'),
        (page.sections?.filter(s => s.type === 'ContentHero').length === 1),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function SeoScorePill({ score }) {
    const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <span style={{ background: color + '18', color, border: `1px solid ${color}40`, borderRadius: '99px', padding: '2px 9px', fontSize: '0.72rem', fontWeight: 700 }}>
            SEO {score}%
        </span>
    );
}

function TypeBadge({ pageType }) {
    const t = PAGE_TYPES.find(p => p.value === pageType) || PAGE_TYPES[0];
    return (
        <span style={{ background: t.color + '15', color: t.color, border: `1px solid ${t.color}30`, borderRadius: '99px', padding: '2px 9px', fontSize: '0.72rem', fontWeight: 700 }}>
            {t.icon} {t.label}
        </span>
    );
}

export default function BuilderIndex() {
    const [pages, setPages] = useState({});
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('updated_desc');
    const [newPage, setNewPage] = useState({ title: '', slug: '', seo: { pageType: 'WebPage' } });
    const [selectedTemplate, setSelectedTemplate] = useState('blank');

    useEffect(() => { fetchPages(); }, []);

    const fetchPages = async () => {
        try {
            const res = await fetch('/api/admin/builder');
            const data = await res.json();
            setPages(data);
        } catch (error) {
            console.error('Error fetching pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const initialSections = PAGE_TEMPLATES[selectedTemplate]?.sections || [];
            // Re-generate IDs to ensure uniqueness at creation
            const sectionsWithNewIds = initialSections.map(s => ({ ...s, id: `${s.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}` }));

            const res = await fetch('/api/admin/builder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newPage, sections: sectionsWithNewIds })
            });
            if (res.ok) {
                const { page } = await res.json();
                window.location.href = `/admin/builder/${page.slug}`;
            }
        } catch (error) {
            console.error('Error creating page:', error);
        }
    };

    const handleDelete = async (slug) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;
        try {
            const res = await fetch(`/api/admin/builder?slug=${slug}`, { method: 'DELETE' });
            if (res.ok) { fetchPages(); }
        } catch (error) {
            console.error('Error deleting page:', error);
        }
    };

    const handleDuplicate = async (page) => {
        const newSlug = `${page.slug}-copie-${Date.now().toString(36)}`;
        const newTitle = `${page.title} (copie)`;
        try {
            const res = await fetch('/api/admin/builder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'duplicate', originalSlug: page.slug, slug: newSlug, title: newTitle })
            });
            if (res.ok) {
                await fetchPages();
                window.location.href = `/admin/builder/${newSlug}`;
            }
        } catch (error) {
            console.error('Error duplicating page:', error);
        }
    };

    const pageList = useMemo(() => {
        let all = Object.values(pages);
        
        // 1. Filter by type
        if (filterType !== 'all') {
            all = all.filter(p => (p.seo?.pageType || 'WebPage') === filterType);
        }
        
        // 2. Filter by search query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            all = all.filter(p => p.title?.toLowerCase().includes(query) || p.slug?.toLowerCase().includes(query));
        }

        // 3. Sort
        all.sort((a, b) => {
            if (sortBy === 'updated_desc') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
            if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
            if (sortBy === 'seo_desc') return seoScore(b) - seoScore(a);
            return 0;
        });

        return all;
    }, [pages, filterType, searchQuery, sortBy]);

    if (loading) return <div className={styles.container}>Chargement...</div>;

    const allPages = Object.values(pages);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Page Builder</h1>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>{allPages.length} page{allPages.length !== 1 ? 's' : ''}</p>
                </div>
                <button className={styles.createBtn} onClick={() => setIsCreating(true)}>
                    <span>+</span> Créer
                </button>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '2px solid #00FF94', boxShadow: '0 4px 20px rgba(0,255,148,0.1)' }}>
                    <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 800, color: '#1F4B40' }}>Nouvelle création</h2>

                    {/* Type selector */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
                        {PAGE_TYPES.map(t => (
                            <button key={t.value} type="button"
                                onClick={() => setNewPage({ ...newPage, seo: { pageType: t.value } })}
                                style={{
                                    padding: '10px 6px', borderRadius: '10px',
                                    border: `2px solid ${newPage.seo?.pageType === t.value ? t.color : '#e5e7eb'}`,
                                    background: newPage.seo?.pageType === t.value ? t.color + '15' : '#fafafa',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                                }}>
                                <div style={{ fontSize: '1.3rem', marginBottom: '2px' }}>{t.icon}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: newPage.seo?.pageType === t.value ? t.color : '#6b7280' }}>{t.label}</div>
                            </button>
                        ))}
                    </div>

                    {/* Modèles de départ */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Démarrer avec un modèle :</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {Object.entries(PAGE_TEMPLATES).map(([key, tpl]) => (
                                <button key={key} type="button" onClick={() => setSelectedTemplate(key)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '8px',
                                        border: `2px solid ${selectedTemplate === key ? '#00FF94' : '#e5e7eb'}`,
                                        background: selectedTemplate === key ? '#f0fdf4' : '#fff',
                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#1F4B40',
                                        transition: 'all 0.15s'
                                    }}>
                                    {tpl.icon} {tpl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Titre de la page"
                            value={newPage.title}
                            onChange={(e) => {
                                const title = e.target.value;
                                const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                setNewPage({ ...newPage, title, slug });
                            }}
                            style={{ flex: 2, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '200px' }}
                            required
                        />
                        <input
                            type="text"
                            placeholder="slug"
                            value={newPage.slug}
                            onChange={(e) => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'monospace', minWidth: '150px' }}
                            required
                        />
                        <button type="submit" className={styles.createBtn}>Créer</button>
                        <button type="button" onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '10px' }}>Annuler</button>
                    </form>
                </div>
            )}

            {/* Search and Sort Toolbar */}
            {allPages.length > 0 && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <input 
                            type="text" 
                            placeholder="Rechercher par titre ou slug..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Trier par :</label>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', background: '#fff', cursor: 'pointer' }}
                        >
                            <option value="updated_desc">Mise à jour (récent en premier)</option>
                            <option value="title_asc">Titre (A-Z)</option>
                            <option value="seo_desc">Score SEO (décroissant)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            {allPages.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <button onClick={() => setFilterType('all')}
                        style={{ padding: '6px 14px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: filterType === 'all' ? '#1F4B40' : '#f3f4f6', color: filterType === 'all' ? '#00FF94' : '#555' }}>
                        Tout ({allPages.length})
                    </button>
                    {PAGE_TYPES.map(t => {
                        const count = allPages.filter(p => (p.seo?.pageType || 'WebPage') === t.value).length;
                        if (count === 0) return null;
                        return (
                            <button key={t.value} onClick={() => setFilterType(t.value)}
                                style={{ padding: '6px 14px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: filterType === t.value ? t.color : '#f3f4f6', color: filterType === t.value ? '#fff' : '#555' }}>
                                {t.icon} {t.label} ({count})
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Grid */}
            <div className={styles.grid}>
                {pageList.length === 0 ? (
                    <div className={styles.empty}>
                        <p>Aucune page{filterType !== 'all' ? ' de ce type' : ''} pour le moment.</p>
                    </div>
                ) : (
                    pageList.map(page => {
                        const score = seoScore(page);
                        const pageType = page.seo?.pageType || 'WebPage';
                        const isArticle = pageType === 'BlogPosting' || pageType === 'Article';
                        return (
                            <div key={page.slug} className={styles.pageCard}>
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                    <TypeBadge pageType={pageType} />
                                    <SeoScorePill score={score} />
                                    {(() => {
                                        const s = page.status || 'draft';
                                        const cfg = { draft: ['#f3f4f6','#374151','Brouillon'], published: ['#f0fdf4','#166534','Publié'], scheduled: ['#fffbeb','#92400e','Planifié'] }[s] || ['#f3f4f6','#374151',s];
                                        return <span style={{ background: cfg[0], color: cfg[1], border: `1px solid ${cfg[1]}30`, borderRadius: '99px', padding: '2px 9px', fontSize: '0.72rem', fontWeight: 700 }}>{cfg[2]}</span>;
                                    })()}
                                    {page.seo?.noindex && <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '99px', padding: '2px 9px', fontSize: '0.72rem', fontWeight: 700 }}>noindex</span>}
                                </div>
                                <h2 className={styles.pageTitle}>{page.title}</h2>
                                {isArticle && page.seo?.author && (
                                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '4px' }}>par {page.seo.author}</div>
                                )}
                                {isArticle && page.seo?.category && (
                                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '4px' }}>🏷️ {page.seo.category}</div>
                                )}
                                <span className={styles.pageSlug}>/p/{page.slug}</span>
                                <div className={styles.pageMeta}>
                                    {page.sections?.length || 0} section{page.sections?.length !== 1 ? 's' : ''}
                                    <br />
                                    Mis à jour le {new Date(page.updatedAt).toLocaleDateString('fr-FR')}
                                    {isArticle && page.seo?.publishedAt && (
                                        <><br />Publié le {new Date(page.seo.publishedAt).toLocaleDateString('fr-FR')}</>
                                    )}
                                </div>
                                <div className={styles.actions}>
                                    <Link href={`/admin/builder/${page.slug}`} className={styles.editLink}>Modifier</Link>
                                    <button onClick={() => handleDuplicate(page)}
                                        style={{ padding: '6px 12px', borderRadius: '8px', background: '#f0fdf4', color: '#1F4B40', border: '1px solid #d1fae5', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                                        title="Dupliquer">
                                        📋
                                    </button>
                                    <a href={`https://www.lesamisducbd.fr/p/${page.slug}`} target="_blank" rel="noopener noreferrer"
                                        style={{ padding: '6px 12px', borderRadius: '8px', background: '#f3f4f6', color: '#374151', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}
                                        title="Voir en ligne">
                                        🔗
                                    </a>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(page.slug)}>Supprimer</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
