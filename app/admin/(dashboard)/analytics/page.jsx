'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './Analytics.module.css';
import Link from 'next/link';

const STATIC_PAGES = {
    'accueil': "Page d'Accueil",
    'essentiel': "L'Essentiel",
    'professionnel': "Professionnel",
    'usages': "CBD & Usages",
    'transparence': "Transparence",
    'recrutement': "Recrutement",
    'produits': "Nos Produits",
    'legal/cgv': "CGV",
    'legal/livraison': "Livraison",
    'legal/privacy': "Confidentialité"
};

// Helper SVG Line Chart (Clean & Explicit)
const LineChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => d.views), 10);
    const minVal = 0;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 30;
    const width = 800;
    const height = 280;
    
    // Grid lines (Y axis)
    const ySteps = 4;
    const gridLines = Array.from({length: ySteps + 1}).map((_, i) => {
        const val = Math.round(maxVal * (i / ySteps));
        const y = height - paddingBottom - (i / ySteps) * (height - paddingTop - paddingBottom);
        return { val, y };
    });

    // Generate path points
    const pointsArray = data.map((d, i) => {
        const x = paddingLeft + (i / (data.length - 1)) * (width - paddingLeft - paddingRight);
        const y = height - paddingBottom - ((d.views - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
        const dateObj = new Date(d.date);
        const dateStr = !isNaN(dateObj) ? `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth()+1).toString().padStart(2, '0')}` : d.date;
        return {x, y, dateStr, ...d};
    });
    
    const pathData = pointsArray.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaPath = `${pathData} L ${width-paddingRight},${height-paddingBottom} L ${paddingLeft},${height-paddingBottom} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid & Y-Axis */}
            {gridLines.map((line, i) => (
                <g key={`y-${i}`}>
                    <line x1={paddingLeft} y1={line.y} x2={width-paddingRight} y2={line.y} stroke="#f1f5f9" strokeWidth="1.5" />
                    <text x={paddingLeft - 10} y={line.y + 4} fill="#64748b" fontSize="12" fontWeight="600" textAnchor="end" fontFamily="sans-serif">{line.val.toLocaleString('fr-FR')}</text>
                </g>
            ))}

            {/* X-Axis labels (show 1 every ~5 days if 30 days) */}
            {pointsArray.map((p, i) => {
                if (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) {
                    return (
                        <text key={`x-${i}`} x={p.x} y={height - 5} fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
                            {p.dateStr}
                        </text>
                    );
                }
                return null;
            })}

            <defs>
                <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(5, 150, 105, 0.15)" />
                    <stop offset="100%" stopColor="rgba(5, 150, 105, 0)" />
                </linearGradient>
            </defs>
            
            {/* Chart Area and Line */}
            <path d={areaPath} fill="url(#chartFill)" />
            <path d={pathData} fill="none" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Interactive Points */}
            {pointsArray.map((p, i) => (
                <g key={i} className={styles.chartPointGroup}>
                    {/* Invisible hit area */}
                    <circle cx={p.x} cy={p.y} r="15" fill="transparent" />
                    {/* Visible circle */}
                    <circle className={styles.chartCircle} cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                    
                    {/* Tooltip */}
                    <g className={styles.chartTooltip}>
                        <rect x={p.x - 45} y={p.y - 45} width="90" height="30" rx="6" fill="#1e293b" />
                        <text x={p.x} y={p.y - 25} fill="#ffffff" fontSize="13" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
                            {p.views.toLocaleString('fr-FR')} vues
                        </text>
                        <polygon points={`${p.x-6},${p.y-15} ${p.x+6},${p.y-15} ${p.x},${p.y-9}`} fill="#1e293b" />
                    </g>
                </g>
            ))}
        </svg>
    );
};

export default function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [dynamicPages, setDynamicPages] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'views', direction: 'desc' });

    const fetchData = async () => {
        try {
            const timestamp = Date.now();
            const [analyticsRes, pagesRes] = await Promise.all([
                fetch(`/api/admin/builder/analytics?t=${timestamp}`, { cache: 'no-store' }),
                fetch(`/api/admin/builder?t=${timestamp}`, { cache: 'no-store' })
            ]);
            const analyticsData = await analyticsRes.json();
            const pagesData = await pagesRes.json();
            
            setAnalytics(analyticsData);
            setDynamicPages(pagesData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const allPages = useMemo(() => {
        if (!analytics) return [];
        const { viewsMap, timeMap, sessionsMap } = analytics;
        const pagesArray = [];

        Object.entries(STATIC_PAGES).forEach(([slug, title]) => {
            const views = viewsMap[slug] || 0;
            const time = timeMap[slug] || 0;
            const sessions = sessionsMap[slug] || 0;
            pagesArray.push({
                slug, title, type: 'static', typeLabel: 'Page de base',
                views, avgTime: sessions > 0 ? Math.round(time / sessions) : 0,
                href: slug.startsWith('legal/') ? `/admin/content/${slug}` : (slug === 'produits' ? '/admin/products' : `/admin/content/${slug}`)
            });
        });

        Object.values(dynamicPages).forEach(page => {
            if (page.slug.startsWith('/admin')) return; // Ignore admin pages

            const views = viewsMap[page.slug] || 0;
            const time = timeMap[page.slug] || 0;
            const sessions = sessionsMap[page.slug] || 0;
            pagesArray.push({
                slug: page.slug, title: page.title, type: 'dynamic', 
                typeLabel: page.seo?.pageType === 'Article' ? 'Article' : 'Page Builder',
                views, avgTime: sessions > 0 ? Math.round(time / sessions) : 0,
                href: `/admin/builder/${page.slug}`
            });
        });

        return pagesArray;
    }, [analytics, dynamicPages]);

    const tableData = useMemo(() => {
        let filtered = [...allPages];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => p.title.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query));
        }
        filtered.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [allPages, searchQuery, sortConfig]);

    if (loading || !analytics) {
        return <div className={styles.container}>Chargement des statistiques avancées...</div>;
    }

    const { viewsMap, ctaMap, deviceMap, referrerMap, dailyStats } = analytics;
    const totalViews = Object.values(viewsMap).reduce((a, b) => a + b, 0);
    const topPage = [...allPages].sort((a, b) => b.views - a.views)[0] || null;
    
    // Sort referrers (exclude localhost and own domain for existing data)
    const ignoredDomains = ['localhost', '127.0.0.1', 'lesamisducbd.fr'];
    const topReferrers = Object.entries(referrerMap || {})
        .filter(([ref]) => !ignoredDomains.some(d => ref.includes(d)))
        .sort((a, b) => b[1] - a[1]);

    // Separate product clicks from other CTAs
    const productClicks = [];
    const mainCTAs = [];
    
    Object.entries(ctaMap || {}).forEach(([key, count]) => {
        if (key.startsWith('product_click_')) {
            productClicks.push([key.replace('product_click_', ''), count]);
        } else {
            mainCTAs.push([key, count]);
        }
    });

    productClicks.sort((a, b) => b[1] - a[1]);
    mainCTAs.sort((a, b) => b[1] - a[1]);

    // Format CTA labels
    const formatCTALabel = (key) => {
        if (key === 'home_hero_discover') return 'Bannière Principale (Héros)';
        if (key === 'recrutement_postuler') return 'Recrutement: Postuler';
        if (key === 'professionnel_contact') return 'Pro: Modale Contact';
        return key;
    };
    const totalDevices = (deviceMap?.desktop || 0) + (deviceMap?.mobile || 0) + (deviceMap?.tablet || 0);
    const getDevicePct = (val) => totalDevices > 0 ? Math.round((val / totalDevices) * 100) : 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Statistiques Avancées</h1>
                <p className={styles.subtitle}>Temps réel, évolution sur 30 jours, appareils et clics stratégiques.</p>
            </div>

            {/* KPIs */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>Total des vues</div>
                    <div className={styles.kpiValue}>{totalViews.toLocaleString('fr-FR')}</div>
                    <div className={styles.kpiSub}>Sur tout le site</div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>Trafic Mobile vs Desktop</div>
                    <div className={styles.kpiValue} style={{ fontSize: '1.4rem' }}>
                        📱 {getDevicePct(deviceMap?.mobile || 0)}% / 💻 {getDevicePct(deviceMap?.desktop || 0)}%
                    </div>
                    <div className={styles.kpiSub}>Total tracés: {totalDevices}</div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>Page la plus visitée</div>
                    <div className={styles.kpiValue} style={{ fontSize: '1.4rem' }}>{topPage ? topPage.title : '-'}</div>
                    <div className={styles.kpiSub}>{topPage ? `${topPage.views.toLocaleString('fr-FR')} vues (${topPage.avgTime}s en moy.)` : ''}</div>
                </div>
            </div>

            {/* 30 Days Trend */}
            <div className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Évolution des vues (30 derniers jours)</h2>
                <div style={{ height: '320px', padding: '10px 0', width: '100%' }}>
                    <LineChart data={dailyStats} />
                </div>
            </div>

            {/* Sub-Grids: Referrers & CTAs */}
            <div className={styles.grid2}>
                <div className={styles.sectionBlock}>
                    <h2 className={styles.sectionTitle}>🌍 Sources de trafic</h2>
                    <ul className={styles.listBlock}>
                        {topReferrers.length > 0 ? topReferrers.map(([ref, count]) => (
                            <li key={ref} className={styles.listItem}>
                                <span>{ref}</span>
                                <strong>{count}</strong>
                            </li>
                        )) : <li className={styles.listItem}>Aucune donnée récente</li>}
                    </ul>
                </div>
                
                <div className={styles.sectionBlock}>
                    <h2 className={styles.sectionTitle}>🖱️ Call-To-Action (Clics)</h2>
                    <ul className={styles.listBlock}>
                        {mainCTAs.length > 0 ? mainCTAs.map(([key, count]) => (
                            <li key={key} className={styles.listItem}>
                                <span>{formatCTALabel(key)}</span>
                                <strong>{count}</strong>
                            </li>
                        )) : <li className={styles.listItem}>Aucun clic récent</li>}
                    </ul>
                </div>

                <div className={styles.sectionBlock}>
                    <h2 className={styles.sectionTitle}>🛍️ Produits les plus cliqués</h2>
                    <ul className={styles.listBlock}>
                        {productClicks.length > 0 ? productClicks.map(([slug, count]) => (
                            <li key={slug} className={styles.listItem}>
                                <span>{slug.replace(/-/g, ' ')}</span>
                                <strong>{count}</strong>
                            </li>
                        )) : <li className={styles.listItem}>Aucun clic récent</li>}
                    </ul>
                </div>
            </div>

            {/* Data Table */}
            <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                    <h2 className={styles.tableTitle}>Détail par page</h2>
                    <input 
                        type="text" 
                        placeholder="Rechercher une page..." 
                        className={styles.searchBox}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th onClick={() => setSortConfig({ key: 'title', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Titre</th>
                                <th>URL</th>
                                <th>Type</th>
                                <th onClick={() => setSortConfig({ key: 'views', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })} style={{ textAlign: 'right' }}>Vues</th>
                                <th onClick={() => setSortConfig({ key: 'avgTime', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })} style={{ textAlign: 'right' }}>Temps Moyen</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Aucune page.</td></tr>
                            ) : (
                                tableData.map(page => (
                                    <tr key={page.slug}>
                                        <td style={{ fontWeight: 600 }}>{page.title}</td>
                                        <td><div className={styles.pageSlug}>{page.slug}</div></td>
                                        <td><span className={`${styles.typeBadge} ${styles[page.type]}`}>{page.typeLabel}</span></td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#1F4B40' }}>{page.views.toLocaleString('fr-FR')}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{page.avgTime > 0 ? `${page.avgTime}s` : '-'}</td>
                                        <td>
                                            <Link href={page.href} style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>Éditer ↗</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
