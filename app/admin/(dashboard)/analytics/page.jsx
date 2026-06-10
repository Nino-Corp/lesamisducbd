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

export default function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState({});
    const [dynamicPages, setDynamicPages] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'views', direction: 'desc' });

    const fetchData = async () => {
        try {
            const [analyticsRes, pagesRes] = await Promise.all([
                fetch('/api/admin/builder/analytics'),
                fetch('/api/admin/builder')
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

        // Auto-refresh every 15 seconds
        const interval = setInterval(() => {
            fetch('/api/admin/builder/analytics')
                .then(res => res.json())
                .then(data => setAnalytics(data))
                .catch(err => console.error('Auto-refresh error:', err));
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    // Combine all pages into a unified array
    const allPages = useMemo(() => {
        const pagesArray = [];

        // 1. Add static pages
        Object.entries(STATIC_PAGES).forEach(([slug, title]) => {
            pagesArray.push({
                slug,
                title,
                type: 'static',
                typeLabel: 'Page de base',
                views: analytics[slug] || 0,
                href: slug.startsWith('legal/') ? `/admin/content/${slug}` : (slug === 'produits' ? '/admin/products' : `/admin/content/${slug}`)
            });
        });

        // 2. Add dynamic pages
        Object.values(dynamicPages).forEach(page => {
            pagesArray.push({
                slug: page.slug,
                title: page.title,
                type: 'dynamic',
                typeLabel: page.seo?.pageType === 'Article' || page.seo?.pageType === 'BlogPosting' ? 'Article / Blog' : 'Page Builder',
                views: analytics[page.slug] || 0,
                href: `/admin/builder/${page.slug}`
            });
        });

        return pagesArray;
    }, [analytics, dynamicPages]);

    // Calculate KPIs
    const totalViews = allPages.reduce((sum, page) => sum + page.views, 0);
    const averageViews = allPages.length > 0 ? Math.round(totalViews / allPages.length) : 0;
    const topPage = [...allPages].sort((a, b) => b.views - a.views)[0] || null;

    // Filter and Sort Table
    const tableData = useMemo(() => {
        let filtered = [...allPages];
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.slug.toLowerCase().includes(query)
            );
        }

        filtered.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [allPages, searchQuery, sortConfig]);

    // Top 5 for Chart
    const chartData = [...allPages].sort((a, b) => b.views - a.views).slice(0, 5);
    const maxChartViews = chartData.length > 0 ? chartData[0].views : 1;

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    if (loading) {
        return <div className={styles.container}>Chargement des statistiques...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Statistiques des Pages</h1>
                <p className={styles.subtitle}>Consultez l'audience de votre site en temps réel (actualisation automatique toutes les 15s).</p>
            </div>

            {/* KPIs */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>Total des vues</div>
                    <div className={styles.kpiValue}>{totalViews.toLocaleString('fr-FR')}</div>
                    <div className={styles.kpiSub}>Sur tout le site</div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>Moyenne par page</div>
                    <div className={styles.kpiValue}>{averageViews.toLocaleString('fr-FR')}</div>
                    <div className={styles.kpiSub}>Pour {allPages.length} pages actives</div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>Page la plus populaire</div>
                    <div className={styles.kpiValue} style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                        {topPage ? topPage.title : '-'}
                    </div>
                    <div className={styles.kpiSub}>{topPage ? `${topPage.views.toLocaleString('fr-FR')} vues` : ''}</div>
                </div>
            </div>

            {/* Chart */}
            {totalViews > 0 && (
                <div className={styles.chartContainer}>
                    <h2 className={styles.chartTitle}>Top 5 des pages les plus visitées</h2>
                    <div className={styles.chart}>
                        {chartData.map(page => (
                            <div key={`chart-${page.slug}`} className={styles.barRow}>
                                <div className={styles.barLabel}>{page.title}</div>
                                <div className={styles.barTrack}>
                                    <div 
                                        className={styles.barFill} 
                                        style={{ width: `${Math.max((page.views / maxChartViews) * 100, 1)}%` }}
                                    />
                                </div>
                                <div className={styles.barValue}>{page.views.toLocaleString('fr-FR')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                    <h2 className={styles.tableTitle}>Toutes les pages</h2>
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
                                <th onClick={() => handleSort('title')}>Titre de la page {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => handleSort('slug')}>URL / Slug {sortConfig.key === 'slug' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => handleSort('typeLabel')}>Type {sortConfig.key === 'typeLabel' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => handleSort('views')} style={{ textAlign: 'right' }}>Vues (Temps réel) {sortConfig.key === 'views' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>Aucune page trouvée.</td>
                                </tr>
                            ) : (
                                tableData.map(page => (
                                    <tr key={page.slug}>
                                        <td style={{ fontWeight: 600 }}>{page.title}</td>
                                        <td>
                                            <div className={styles.pageSlug}>{page.slug}</div>
                                        </td>
                                        <td>
                                            <span className={`${styles.typeBadge} ${styles[page.type]}`}>
                                                {page.typeLabel}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#1F4B40', fontSize: '1.1rem' }}>
                                            {page.views.toLocaleString('fr-FR')}
                                        </td>
                                        <td>
                                            <Link href={page.href} style={{ color: '#059669', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                                                Éditer ↗
                                            </Link>
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
