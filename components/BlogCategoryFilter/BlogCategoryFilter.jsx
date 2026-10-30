'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './BlogCategoryFilter.module.css';
import { Sprout } from 'lucide-react';

// SVG Icon Library
function FilterIcon({ name }) {
    switch (name) {
        case 'chef':
        case 'recettes':
            return (
                <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M6 12h20" />
                    <path d="M8 12v11c0 3 2 5 5 5h6c3 0 5-2 5-5V12" />
                    <path d="M11 8h10" />
                    <path d="M14 5h4" />
                </svg>
            );
        case 'lightbulb':
        case 'astuces':
        case 'conseil':
            return (
                <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M10 14a6 6 0 1 1 12 0c0 4-3 5-4 8h-4c-1-3-4-4-4-8z" />
                    <path d="M14 25h4" />
                    <path d="M16 3V1" />
                    <path d="M5 8L3 6" />
                    <path d="M27 8l2-2" />
                </svg>
            );
        case 'flower':
        case 'leaf':
        case 'fleurs':
            return (
                <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M16 28V13" />
                    <path d="M16 18c-5 0-8-3-8-7 5 0 8 3 8 7z" />
                    <path d="M16 16c5 0 8-3 8-7-5 0-8 3-8 7z" />
                    <path d="M16 13c-3-3-3-7 0-10 3 3 3 7 0 10z" />
                </svg>
            );
        case 'book':
        case 'debuter':
            return (
                <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M7 11l9-7 9 7-2 15H9z" />
                    <path d="M12 15c2-3 6-3 8 0" />
                    <path d="M16 15v7" />
                </svg>
            );
        case 'oil':
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
            );
        case 'heart':
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            );
        case 'star':
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        case 'shield':
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            );
        case 'all':
        default:
            return (
                <svg viewBox="0 0 32 32" aria-hidden="true">
                    <rect x="5" y="5" width="9" height="9" rx="2" />
                    <rect x="18" y="5" width="9" height="9" rx="2" />
                    <rect x="5" y="18" width="9" height="9" rx="2" />
                    <rect x="18" y="18" width="9" height="9" rx="2" />
                </svg>
            );
    }
}

const DEFAULT_FILTERS = [
    {
        id: 'all',
        label: 'Tous les articles',
        icon: 'all',
        h2Prefix: 'Tous nos articles',
        h2Highlight: 'Cuisine & CBD',
        introText: 'Plats salés, desserts, boissons... faites le plein d\'inspiration avec nos recettes gourmandes au CBD.'
    },
    {
        id: 'recettes',
        label: 'Recettes',
        icon: 'chef',
        h2Prefix: 'À vos tabliers,',
        h2Highlight: 'on passe en cuisine !',
        introText: 'Du salé, du sucré, des classiques revisités et quelques expériences maison pour inviter le CBD dans vos assiettes et dans vos verres.'
    },
    {
        id: 'astuces',
        label: 'Conseils',
        icon: 'lightbulb',
        h2Prefix: 'Nos trucs & astuces,',
        h2Highlight: 'les secrets des chefs',
        introText: 'Dosage, décarboxylation, matières grasses : les techniques indispensables pour cuisiner le CBD sans fausse note.'
    },
    {
        id: 'fleurs',
        label: 'Fleurs & cuisine',
        icon: 'flower',
        h2Prefix: 'Fleurs & saveurs,',
        h2Highlight: 'l’art des terpènes',
        introText: 'Associer les arômes, choisir les bonnes variétés et sublimer les profils gustatifs de vos préparations.'
    },
    {
        id: 'debuter',
        label: 'Débuter',
        icon: 'book',
        h2Prefix: 'Bien débuter,',
        h2Highlight: 'votre première recette',
        introText: 'Guides pas-à-pas, précautions de base et conseils faciles pour se lancer en toute sérénité.'
    }
];

const DEFAULT_ARTICLES = [
    {
        id: 'art-1',
        title: 'Pâtes crémeuses au CBD et parmesan',
        badge: 'RECETTE',
        filterId: 'recettes',
        excerpt: 'Une recette simple et savoureuse pour un dîner tout en douceur !',
        image: 'https://res.cloudinary.com/dasqyp35f/image/upload/v1791291468/lesamisducbd/partners/uv7fitxw2ycmqe6dfhib.png',
        readTime: '8 min',
        date: '12/08/2024',
        href: '/p/cuisiner-avec-du-cbd-conseils-idees-et-recettes'
    },
    {
        id: 'art-2',
        title: 'Comment faire une huile infusée au CBD ?',
        badge: 'CONSEIL',
        filterId: 'astuces',
        excerpt: 'Découvrez notre méthode simple et efficace pour des huiles parfaitement aromatisées.',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
        readTime: '7 min',
        date: '15/07/2024',
        href: '/p/cuisiner-avec-du-cbd-conseils-idees-et-recettes'
    },
    {
        id: 'art-3',
        title: 'Brownies au CBD : le duo parfait ?',
        badge: 'RECETTE',
        filterId: 'recettes',
        excerpt: 'Un grand classique gourmand à partager (ou pas !).',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        readTime: '6 min',
        date: '28/07/2024',
        href: '/p/cuisiner-avec-du-cbd-conseils-idees-et-recettes'
    },
    {
        id: 'art-4',
        title: 'Quelle fleur de CBD choisir pour cuisiner ?',
        badge: 'CONSEIL',
        filterId: 'fleurs',
        excerpt: 'Nos variétés coups de cœur selon vos recettes.',
        image: 'https://res.cloudinary.com/dasqyp35f/image/upload/v1791460034/lesamisducbd/partners/vcl8mmcwrw77ttrjliyp.png',
        readTime: '6 min',
        date: '01/07/2024',
        href: '/p/cuisiner-avec-du-cbd-conseils-idees-et-recettes'
    },
    {
        id: 'art-5',
        title: 'Bien débuter avec le CBD en cuisine : guide débutant',
        badge: 'DÉBUTER',
        filterId: 'debuter',
        excerpt: 'Température, décarboxylation et dosage : tout ce qu’il faut savoir pour commencer sans stress.',
        image: '/images/usages/cuisine.webp',
        readTime: '5 min',
        date: '20/06/2024',
        href: '/p/cuisiner-avec-du-cbd-conseils-idees-et-recettes'
    }
];

export default function BlogCategoryFilter({
    filters = DEFAULT_FILTERS,
    articles: customArticles = DEFAULT_ARTICLES,
    sourceMode = 'auto', // 'auto' | 'manual' (aligné sur l'éditeur et la config du builder)
    autoCategory = '', // optional filter by category in API
    defaultFilter = 'all',
    searchPlaceholder: customPlaceholder,
    showSearch = true,
    showSort = true,
    showCountBadges = false,
    columns = 4 // 2, 3, 4
}) {
    const [activeFilterId, setActiveFilterId] = useState(defaultFilter);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [fetchedArticles, setFetchedArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchDone, setFetchDone] = useState(false);
    const searchPlaceholder = customPlaceholder?.trim() || 'Rechercher un article...';
    const tabRefs = useRef([]);

    // Auto-fetch real published articles when in auto mode
    useEffect(() => {
        if (sourceMode !== 'auto') return;
        let isCancelled = false;

        async function loadArticles() {
            setLoading(true);
            try {
                // Les brouillons ne sont visibles que dans l'admin (prévisualisation du builder)
                const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
                const params = new URLSearchParams();
                if (autoCategory) params.set('category', autoCategory);
                if (isAdmin) params.set('preview', 'true');
                const res = await fetch(`/api/articles?${params.toString()}`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (!isCancelled && Array.isArray(data.articles)) {
                        setFetchedArticles(data.articles);
                    }
                }
            } catch (err) {
                console.warn('[BlogCategoryFilter] Failed to fetch auto articles, using fallback.', err);
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                    setFetchDone(true);
                }
            }
        }

        loadArticles();
        return () => { isCancelled = true; };
    }, [sourceMode, autoCategory]);

    // Combined article pool: if manual or fetched empty, use customArticles / DEFAULT_ARTICLES
    const allArticles = useMemo(() => {
        if (sourceMode === 'manual') {
            return customArticles && customArticles.length > 0 ? customArticles : DEFAULT_ARTICLES;
        }
        // Mode auto : on affiche les vrais articles ; les cartes de démo ne servent
        // qu'avant la fin du chargement ou si l'API est injoignable.
        if (fetchedArticles.length > 0 || fetchDone) {
            return fetchedArticles;
        }
        return customArticles && customArticles.length > 0 ? customArticles : [];
    }, [sourceMode, fetchedArticles, fetchDone, customArticles]);

    // Sync from URL search params on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const urlFilter = params.get('filtre') || params.get('cat');
        if (urlFilter && filters.some(f => f.id.toLowerCase() === urlFilter.toLowerCase())) {
            setActiveFilterId(urlFilter.toLowerCase());
        }
    }, [filters]);

    // Active filter object
    const activeFilterData = useMemo(() => {
        return filters.find(f => f.id === activeFilterId) || filters[0] || DEFAULT_FILTERS[0];
    }, [filters, activeFilterId]);

    // Count of articles per filter for badges
    const filterCounts = useMemo(() => {
        const counts = {};
        filters.forEach(f => {
            if (f.id === 'all') {
                counts[f.id] = allArticles.length;
            } else {
                counts[f.id] = allArticles.filter(a => {
                    const fid = (a.filterId || a.category || a.badge || '').toLowerCase();
                    const target = f.id.toLowerCase();
                    return fid === target || fid.includes(target) || (a.tags && a.tags.some(t => t.toLowerCase() === target));
                }).length;
            }
        });
        return counts;
    }, [filters, allArticles]);

    // Filtered and sorted articles
    const filteredArticles = useMemo(() => {
        let result = [...allArticles];

        // 1. Filter by category pill (unless 'all')
        if (activeFilterId && activeFilterId !== 'all') {
            result = result.filter(art => {
                const artFilter = (art.filterId || art.category || art.badge || '').toLowerCase();
                const targetFilter = activeFilterId.toLowerCase();
                const matchTag = art.tags && art.tags.some(t => t.toLowerCase() === targetFilter);
                return artFilter === targetFilter || artFilter.includes(targetFilter) || matchTag;
            });
        }

        // 2. Filter by search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(art => {
                const title = (art.title || '').toLowerCase();
                const excerpt = (art.excerpt || '').toLowerCase();
                const badge = (art.badge || '').toLowerCase();
                return title.includes(q) || excerpt.includes(q) || badge.includes(q);
            });
        }

        // 3. Sorting
        result.sort((a, b) => {
            if (sortBy === 'recent' || sortBy === 'oldest') {
                const parseDate = (dStr, raw) => {
                    if (raw) return new Date(raw).getTime();
                    if (!dStr) return 0;
                    if (dStr.includes('/')) {
                        const [d, m, y] = dStr.split('/');
                        return new Date(`${y}-${m}-${d}`).getTime();
                    }
                    return new Date(dStr).getTime() || 0;
                };
                const timeA = parseDate(a.date, a.publishedAt);
                const timeB = parseDate(b.date, b.publishedAt);
                return sortBy === 'recent' ? timeB - timeA : timeA - timeB;
            } else if (sortBy === 'duration') {
                const durA = parseInt(a.readTime, 10) || 0;
                const durB = parseInt(b.readTime, 10) || 0;
                return durA - durB;
            }
            return 0;
        });

        return result;
    }, [allArticles, activeFilterId, searchQuery, sortBy]);

    // Handle tab selection + keyboard navigation
    const handleFilterClick = (filterId) => {
        setActiveFilterId(filterId);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (filterId === 'all') {
                url.searchParams.delete('filtre');
            } else {
                url.searchParams.set('filtre', filterId);
            }
            window.history.replaceState({}, '', url.toString());
        }
    };

    const handleKeyDown = (e, index) => {
        let nextIndex = null;
        if (e.key === 'ArrowRight') {
            nextIndex = (index + 1) % filters.length;
        } else if (e.key === 'ArrowLeft') {
            nextIndex = (index - 1 + filters.length) % filters.length;
        } else if (e.key === 'Home') {
            nextIndex = 0;
        } else if (e.key === 'End') {
            nextIndex = filters.length - 1;
        }

        if (nextIndex !== null) {
            e.preventDefault();
            const targetFilter = filters[nextIndex];
            if (targetFilter) {
                handleFilterClick(targetFilter.id);
                tabRefs.current[nextIndex]?.focus();
            }
        }
    };

    // Build H2 Title structure: supports h2Prefix + h2Highlight, OR extracts from h2Title
    const renderHeading = () => {
        if (!activeFilterData) return null;

        let prefix = activeFilterData.h2Prefix;
        let highlight = activeFilterData.h2Highlight;

        // If not separated, extract from h2Title or raw HTML
        if (!prefix && !highlight && activeFilterData.h2Title) {
            const h2 = activeFilterData.h2Title;
            const match = h2.match(/<span[^>]*class=["']highlight["'][^>]*>([\s\S]*?)<\/span>/i);
            if (match) {
                prefix = h2.substring(0, match.index).replace(/<[^>]*>/g, '').trim();
                highlight = match[1].replace(/<[^>]*>/g, '').trim();
            } else {
                prefix = h2.replace(/<[^>]*>/g, '').trim();
            }
        }

        if (prefix || highlight) {
            return (
                <>
                    {prefix && <span>{prefix} </span>}
                    {highlight && (
                        <span className={styles.highlight}>
                            {highlight}
                            <svg 
                                className={styles.highlightUnderline} 
                                viewBox="0 0 300 22" 
                                preserveAspectRatio="none" 
                                aria-hidden="true"
                            >
                                <path 
                                    d="M6 15 C80 5, 210 5, 294 13" 
                                    fill="none" 
                                    stroke="#087D45" 
                                    strokeWidth="4.2" 
                                    strokeLinecap="round" 
                                />
                            </svg>
                        </span>
                    )}
                </>
            );
        }

        return activeFilterData.label;
    };

    const gridColClass = columns === 3 ? styles.cols3 : columns === 2 ? styles.cols2 : styles.cols4;

    return (
        <section className={styles.container} aria-label="Section d'articles et filtres">
            {/* ── 1. BARRE DE FILTRES + RECHERCHE ── */}
            <div className={styles.filterBar}>
                <div 
                    className={styles.buttonGroup}
                    role="tablist"
                    aria-label="Catégories d'articles"
                >
                    {filters.map((filter, index) => {
                        const isActive = filter.id === activeFilterId;
                        const count = filterCounts[filter.id] || 0;
                        return (
                            <button
                                key={filter.id}
                                ref={el => tabRefs.current[index] = el}
                                type="button"
                                role="tab"
                                id={`tab-${filter.id}`}
                                aria-selected={isActive}
                                aria-controls="articles-grid-panel"
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => handleFilterClick(filter.id)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                            >
                                <FilterIcon name={filter.icon || filter.id} />
                                <span>{filter.label}</span>
                                {showCountBadges && count > 0 && (
                                    <span className={styles.tabCountBadge} aria-label={`${count} articles`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {showSearch && (
                    <div className={styles.searchBox} role="search">
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            className={styles.searchInput}
                            aria-label="Rechercher parmi les articles"
                        />
                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className={styles.clearSearchBtn}
                                aria-label="Effacer la recherche"
                                title="Effacer la recherche"
                            >
                                ✕
                            </button>
                        ) : (
                            <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="11" cy="11" r="6" />
                                <path d="M16 16l4 4" />
                            </svg>
                        )}
                    </div>
                )}
            </div>

            {/* ── 2. EN-TÊTE DYNAMIQUE (H2 + INTRO + TRIER PAR) ── */}
            <div className={styles.headerRow}>
                <div className={styles.headerTextSide}>
                    <h2 key={`h2-${activeFilterId}`} className={styles.h2Title}>
                        {renderHeading()}
                    </h2>
                    {activeFilterData?.introText && (
                        <p key={`intro-${activeFilterId}`} className={styles.introText}>
                            {activeFilterData.introText}
                        </p>
                    )}
                </div>

                <div className={styles.sortSide}>
                    {showSort && (
                        <div className={styles.sortControls}>
                            <label htmlFor="sort-articles-select" className={styles.sortLabel}>
                                Trier par :
                            </label>
                            <select
                                id="sort-articles-select"
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className={styles.sortSelect}
                                aria-label="Trier les articles"
                            >
                                <option value="recent">Plus récents</option>
                                <option value="oldest">Plus anciens</option>
                                <option value="duration">Temps de lecture</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 3. GRILLE D'ARTICLES RÉACTIVE ── */}
            <div 
                id="articles-grid-panel"
                role="tabpanel"
                aria-labelledby={`tab-${activeFilterId}`}
                className={`${styles.grid} ${gridColClass}`}
            >
                {loading && filteredArticles.length === 0 ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <span>Chargement des articles...</span>
                    </div>
                ) : filteredArticles.length > 0 ? (
                    filteredArticles.map(article => (
                        <article key={article.id || article.title} className={styles.card}>
                            <Link href={article.href || '#'} className={styles.cardLink} style={{ display: 'contents' }}>
                                <div className={styles.cardImageWrapper}>
                                    {article.badge && (
                                        <span className={styles.badge}>{article.badge}</span>
                                    )}
                                    <img
                                        src={article.image || '/images/og-image.jpg'}
                                        alt={article.title}
                                        className={styles.cardImage}
                                        loading="lazy"
                                    />
                                </div>

                                <div className={styles.cardBody}>
                                    <h3 className={styles.cardTitle}>{article.title}</h3>
                                    {article.excerpt && (
                                        <p className={styles.cardExcerpt}>{article.excerpt}</p>
                                    )}

                                    <div className={styles.cardMeta}>
                                        {article.readTime && (
                                            <span className={styles.metaItem} title="Temps de lecture">
                                                <svg className={styles.metaIcon} viewBox="0 0 24 24" aria-hidden="true">
                                                    <circle cx="12" cy="12" r="9" />
                                                    <path d="M12 7v5l3 2" />
                                                </svg>
                                                <span>{article.readTime}</span>
                                            </span>
                                        )}

                                        {article.date && (
                                            <span className={styles.metaItem} title="Date de publication">
                                                <svg className={styles.metaIcon} viewBox="0 0 24 24" aria-hidden="true">
                                                    <rect x="3" y="4" width="18" height="17" rx="3" />
                                                    <path d="M16 2v4M8 2v4M3 10h18" />
                                                </svg>
                                                <time dateTime={article.publishedAt || undefined}>
                                                    {article.date}
                                                </time>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </article>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <Sprout size={40} color="#1F4B40" style={{ opacity: 0.6 }} />
                        </div>
                        <h3 className={styles.emptyStateTitle}>Aucun article trouvé</h3>
                        <p className={styles.emptyStateSub}>
                            {searchQuery
                                ? `Aucun article ne correspond à votre recherche « ${searchQuery} ».`
                                : `Aucun article n'est disponible pour l'instant dans cette sélection.`}
                        </p>
                        {(searchQuery || activeFilterId !== 'all') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveFilterId('all');
                                }}
                                className={styles.resetBtn}
                            >
                                Voir tous les articles
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
