'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Products.module.css';
import WysiwygEditor from '../builder/WysiwygEditor';
import ImageUpload from '@/components/Admin/ImageUpload';

// Suppression de BADGE_OPTIONS pour saisie libre

const OrderInput = ({ idx, total, onChange, className }) => {
    const [val, setVal] = useState('');
    useEffect(() => { setVal((idx + 1).toString()); }, [idx]);

    const handleBlur = () => {
        onChange(val);
        setVal((idx + 1).toString());
    };

    return (
        <input
            type="number" min="1" max={total}
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
            className={className}
        />
    );
};

export default function ProductsPage() {
    const [tab, setTab] = useState('vitrine'); // 'vitrine' | 'visibility' | 'descriptions' | 'categories' | 'couverture'
    const [allProducts, setAllProducts] = useState([]);
    const [vitrine, setVitrine] = useState({ flowers: [], resins: [] });
    const [hiddenIds, setHiddenIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [search, setSearch] = useState('');
    const [visSearch, setVisSearch] = useState('');

    // Descriptions overrides
    const [overrides, setOverrides] = useState({});
    const [descSearch, setDescSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState({ description: '', descriptionShort: '' });
    const [descSaving, setDescSaving] = useState(false);
    const [descSaved, setDescSaved] = useState(false);

    // Category overrides
    const [categoryOverrides, setCategoryOverrides] = useState({});
    const [catSearch, setCatSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all'); // 'all' | 'overridden' | 'auto'
    const [catSaving, setCatSaving] = useState(false);
    const [catSaved, setCatSaved] = useState(false);

    // Products Page Config
    const [pageConfig, setPageConfig] = useState({
        carousel: [
            { id: 1, title: "L'Essentiel du CBD", subtitle: "Découvrez notre sélection rigoureuse, pensée pour votre bien-être au quotidien.", image: "/images/hero.webp", buttonText: "Notre histoire", buttonLink: "/essentiel" },
            { id: 2, title: "La Qualité Premium", subtitle: "Des fleurs et résines exceptionnelles, cultivées avec passion pour des arômes uniques.", image: "/images/carousel_nature_cbd.png", buttonText: "Voir nos fleurs", buttonLink: "/produits?cat=fleur" },
            { id: 3, title: "Bien-être & Sérénité", subtitle: "Des conseils experts pour intégrer nos produits à votre routine détente.", image: "/images/carousel_wellness_cbd.png", buttonText: "Nos conseils", buttonLink: "/usages" }
        ],
        premiumBadge: { enabled: true, text: "Qualité Premium" }
    });
    const [configSaving, setConfigSaving] = useState(false);
    const [configSaved, setConfigSaved] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/admin/vitrine').then(r => r.json()),
            fetch('/api/admin/product-overrides').then(r => r.json()),
            fetch('/api/admin/category-overrides').then(r => r.json()),
            fetch('/api/admin/products-page-config').then(r => r.json())
        ]).then(([products, config, overridesData, catOverridesData, pageConfigData]) => {
            const fetchedProducts = Array.isArray(products) ? products : [];
            const pOrder = Array.isArray(config?.productOrder) ? config.productOrder : [];

            if (pOrder.length > 0) {
                fetchedProducts.sort((a, b) => {
                    const idxA = pOrder.indexOf(a.id);
                    const idxB = pOrder.indexOf(b.id);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    if (idxA !== -1) return -1;
                    if (idxB !== -1) return 1;
                    return 0;
                });
            }

            setAllProducts(fetchedProducts);
            setOverrides(overridesData || {});

            // Auto-heal vitrine items' images with fresh catalogue data
            // This fixes old broken API URLs in KV and keeps images in sync with PrestaShop
            const healItem = (item) => {
                const fresh = fetchedProducts.find(p => p.slug === item.slug);
                return fresh && fresh.image ? { ...item, image: fresh.image } : item;
            };

            setVitrine({ 
                flowers: (config?.flowers || []).map(healItem), 
                resins: (config?.resins || []).map(healItem) 
            });
            
            setHiddenIds(Array.isArray(config?.hiddenIds) ? config.hiddenIds : []);
            setCategoryOverrides(catOverridesData || {});
            if (pageConfigData && pageConfigData.carousel) {
                setPageConfig(pageConfigData);
            }
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    // ── Search helpers ───────────────────────────────────────────
    const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchSearch = (p, q) => {
        const hay = normalize(`${p.name} ${p.reference || ''} ${p.slug}`);
        return normalize(q).split(/\s+/).filter(Boolean).every(w => hay.includes(w));
    };

    const RESIN_KEYWORDS = ['hash', 'pollen', 'resin', 'résine', 'harsh', 'golden'];
    const isResin = (p) => RESIN_KEYWORDS.some(k => p.name.toLowerCase().includes(k));

    // Category detection (same logic as ProductsClient for consistency)
    const CATEGORY_OPTIONS = [
        { id: 'auto', label: '🤖 Auto-détection' },
        { id: 'fleur', label: '🌿 Fleur CBD' },
        { id: 'resine', label: '🍫 Résine / Pollen' },
        { id: 'pack', label: '📦 Pack' },
        { id: 'autre', label: '🔧 Accessoire / Divers' }
    ];

    const detectCategory = (product) => {
        const nameNorm = (product.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (['plv', 'flyer', 'tourniquet', 'presentoir', 'accessoire', 'goodies', 'feuille', 'briquet', 'grinder'].some(k => nameNorm.includes(k))) return 'autre';
        if (['resine', 'hash', 'filtre', 'pollen'].some(k => nameNorm.includes(k))) return 'resine';
        if (['pack', 'mystere', 'decouverte'].some(k => nameNorm.includes(k))) return 'pack';
        if (['fleur', 'trim', 'mix', 'skunk', 'amnesia', 'gorilla', 'remedy', 'cbd', 'kush', 'haze', 'gelato'].some(k => nameNorm.includes(k)) || product.category === 3) return 'fleur';
        if (/(?:^|\s|-)(\d+(?:[.,]\d+)?)\s*g\b/.test(nameNorm)) return 'fleur';
        return 'autre';
    };

    const getEffectiveCategory = (product) => {
        return categoryOverrides[product.id] || detectCategory(product);
    };

    const saveCategoryOverrides = async () => {
        setCatSaving(true);
        try {
            const res = await fetch('/api/admin/category-overrides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryOverrides)
            });
            if (res.ok) {
                setCatSaved(true);
                setTimeout(() => setCatSaved(false), 3000);
            } else alert('Erreur lors de la sauvegarde');
        } catch { alert('Erreur réseau'); }
        finally { setCatSaving(false); }
    };

    const savePageConfig = async () => {
        setConfigSaving(true);
        try {
            const res = await fetch('/api/admin/products-page-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pageConfig)
            });
            if (res.ok) {
                setConfigSaved(true);
                setTimeout(() => setConfigSaved(false), 3000);
            } else alert('Erreur lors de la sauvegarde');
        } catch { alert('Erreur réseau'); }
        finally { setConfigSaving(false); }
    };

    const filteredProducts = allProducts.filter(p => !search || matchSearch(p, search));
    const filteredVis = allProducts.filter(p => !visSearch || matchSearch(p, visSearch));

    // ── Vitrine helpers ──────────────────────────────────────────
    const isPinnedFlower = (p) => vitrine.flowers.some(f => f.slug === p.slug);
    const isPinnedResin = (p) => vitrine.resins.some(r => r.slug === p.slug);
    const isPinned = (p) => isPinnedFlower(p) || isPinnedResin(p);

    const pin = (product) => {
        const entry = { slug: product.slug, name: product.name, image: product.image, badge: '', badgeColor: '#00FFC2', formattedPrice: product.formattedPrice };
        if (isResin(product)) {
            if (isPinnedResin(product)) return;
            setVitrine(v => ({ ...v, resins: [...v.resins, entry] }));
        } else {
            if (isPinnedFlower(product)) return;
            setVitrine(v => ({ ...v, flowers: [...v.flowers, entry] }));
        }
        setSaved(false);
    };

    const unpin = (slug, type) => {
        setVitrine(v => ({ ...v, [type]: v[type].filter(p => p.slug !== slug) }));
        setSaved(false);
    };

    const updateBadge = (slug, type, badge) => {
        setVitrine(v => ({ ...v, [type]: v[type].map(p => p.slug === slug ? { ...p, badge } : p) }));
        setSaved(false);
    };
    const updateBadgeColor = (slug, type, badgeColor) => {
        setVitrine(v => ({ ...v, [type]: v[type].map(p => p.slug === slug ? { ...p, badgeColor } : p) }));
        setSaved(false);
    };

    const moveUp = (index, type) => {
        if (index === 0) return;
        setVitrine(v => {
            const arr = [...v[type]];
            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
            return { ...v, [type]: arr };
        });
        setSaved(false);
    };

    const moveDown = (index, type) => {
        setVitrine(v => {
            if (index >= v[type].length - 1) return v;
            const arr = [...v[type]];
            [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
            return { ...v, [type]: arr };
        });
        setSaved(false);
    };

    const changeVitrineOrder = (productSlug, type, newPosStr) => {
        let newPos = parseInt(newPosStr, 10);
        if (isNaN(newPos)) return;

        let targetIdx = newPos - 1;
        setVitrine(v => {
            const arr = [...v[type]];
            const oldIdx = arr.findIndex(p => p.slug === productSlug);
            if (oldIdx === -1) return v;

            if (targetIdx < 0) targetIdx = 0;
            if (targetIdx >= arr.length) targetIdx = arr.length - 1;

            if (oldIdx === targetIdx) return v;

            const [item] = arr.splice(oldIdx, 1);
            arr.splice(targetIdx, 0, item);
            return { ...v, [type]: arr };
        });
        setSaved(false);
    };

    // ── Visibility helpers ───────────────────────────────────────
    const isHidden = (p) => hiddenIds.includes(p.id);

    const toggleVisibility = (product) => {
        setHiddenIds(prev =>
            prev.includes(product.id)
                ? prev.filter(id => id !== product.id)
                : [...prev, product.id]
        );
        setSaved(false);
    };

    const changeCatalogOrder = (productId, newPosStr) => {
        let newPos = parseInt(newPosStr, 10);
        if (isNaN(newPos)) return;

        let targetIdx = newPos - 1;

        setAllProducts(prev => {
            const arr = [...prev];
            const oldIdx = arr.findIndex(p => p.id === productId);
            if (oldIdx === -1) return prev;

            if (targetIdx < 0) targetIdx = 0;
            if (targetIdx >= arr.length) targetIdx = arr.length - 1;

            if (oldIdx === targetIdx) return prev;

            const [item] = arr.splice(oldIdx, 1);
            arr.splice(targetIdx, 0, item);
            return arr;
        });
        setSaved(false);
    };

    // ── Save ─────────────────────────────────────────────────────
    const save = async () => {
        setSaving(true);
        try {
            const productOrder = allProducts.map(p => p.id);
            const res = await fetch('/api/admin/vitrine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...vitrine, hiddenIds, productOrder })
            });
            if (res.ok) setSaved(true);
            else alert('Erreur lors de la sauvegarde');
        } catch { alert('Erreur réseau'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className={styles.loading}>Chargement des produits PrestaShop...</div>;

    const hiddenCount = hiddenIds.length;
    const visibleCount = allProducts.length - hiddenCount;

    return (
        <div className={styles.container}>
            {/* ── Header ── */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.title}>Gestion Produits</h1>
                    <p className={styles.subtitle}>
                        Configurez la vitrine homepage et la visibilité des produits. Le catalogue est géré depuis PrestaShop.
                    </p>
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className={`${styles.saveButton} ${saved ? styles.savedButton : ''}`}
                >
                    {saving ? 'Enregistrement...' : saved ? '✓ Sauvegardé' : 'Enregistrer'}
                </button>
            </div>

            {/* ── Tabs ── */}
            <div className={styles.tabs}>
                <button
                    onClick={() => setTab('vitrine')}
                    className={`${styles.tab} ${tab === 'vitrine' ? styles.activeTab : ''}`}
                >
                    🏪 Vitrine Homepage
                </button>
                <button
                    onClick={() => setTab('visibility')}
                    className={`${styles.tab} ${tab === 'visibility' ? styles.activeTab : ''}`}
                >
                    👁 Visibilité Catalogue
                    {hiddenCount > 0 && <span className={styles.hiddenBadge}>{hiddenCount} masqué{hiddenCount > 1 ? 's' : ''}</span>}
                </button>
                <button
                    onClick={() => setTab('descriptions')}
                    className={`${styles.tab} ${tab === 'descriptions' ? styles.activeTab : ''}`}
                >
                    ✏️ Descriptions
                    {Object.keys(overrides).length > 0 && <span className={styles.hiddenBadge}>{Object.keys(overrides).length} modifié{Object.keys(overrides).length > 1 ? 's' : ''}</span>}
                </button>
                <button
                    onClick={() => setTab('categories')}
                    className={`${styles.tab} ${tab === 'categories' ? styles.activeTab : ''}`}
                >
                    🏷️ Catégories
                    {Object.keys(categoryOverrides).length > 0 && <span className={styles.hiddenBadge}>{Object.keys(categoryOverrides).length} forcé{Object.keys(categoryOverrides).length > 1 ? 's' : ''}</span>}
                </button>
                <button
                    onClick={() => setTab('couverture')}
                    className={`${styles.tab} ${tab === 'couverture' ? styles.activeTab : ''}`}
                >
                    🖼️ Page Couverture
                </button>
            </div>

            {/* ══════════════ TAB: VITRINE ══════════════ */}
            {tab === 'vitrine' && (
                <div className={styles.layout}>
                    {/* Catalogue */}
                    <div className={styles.panel}>
                        <h2 className={styles.panelTitle}>
                            Catalogue PrestaShop
                            <span className={styles.counter}>{allProducts.length} produits actifs</span>
                        </h2>
                        <input
                            className={styles.search}
                            placeholder="Rechercher un produit..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <div className={styles.catalogList}>
                            {filteredProducts.map(product => (
                                <div key={product.id} className={`${styles.catalogItem} ${isPinned(product) ? styles.pinned : ''}`}>
                                    <img src={product.image} alt={product.name} className={styles.catalogImg} />
                                    <div className={styles.catalogInfo}>
                                        <strong>{product.name}</strong>
                                        <span className={styles.catalogPrice}>{product.formattedPrice}</span>
                                        <span className={styles.typeLabel}>{isResin(product) ? '🍫 Résine' : '🌿 Fleur'}</span>
                                    </div>
                                    <button
                                        onClick={() => pin(product)}
                                        disabled={isPinned(product)}
                                        className={isPinned(product) ? styles.pinnedBtn : styles.pinBtn}
                                    >
                                        {isPinned(product) ? '✓ Épinglé' : '+ Épingler'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vitrine Config */}
                    <div className={styles.panel}>
                        <h2 className={styles.panelTitle}>Vitrine Homepage</h2>

                        <div className={styles.vitrineSection}>
                            <h3 className={styles.sectionLabel}>🌿 Fleurs — "Nos fleurs phares"</h3>
                            {vitrine.flowers.length === 0 ? (
                                <p className={styles.emptyHint}>Aucune fleur épinglée.</p>
                            ) : vitrine.flowers.map((item, idx) => (
                                <div
                                    key={item.slug}
                                    className={styles.vitrineItem}
                                >
                                    <div className={styles.vitrineOrder}>
                                        <button onClick={() => moveUp(idx, 'flowers')} disabled={idx === 0} className={styles.orderBtn}>▲</button>
                                        <OrderInput idx={idx} total={vitrine.flowers.length} onChange={(val) => changeVitrineOrder(item.slug, 'flowers', val)} className={styles.orderInputBox} />
                                        <button onClick={() => moveDown(idx, 'flowers')} disabled={idx === vitrine.flowers.length - 1} className={styles.orderBtn}>▼</button>
                                    </div>
                                    <img src={item.image} alt={item.name} className={styles.vitrineImg} />
                                    <div className={styles.vitrineInfo}>
                                        <strong>{item.name}</strong>
                                        <span className={styles.catalogPrice}>{item.formattedPrice}</span>
                                        <div className={styles.badgeConfig}>
                                            <input
                                                type="text"
                                                value={item.badge || ''}
                                                onChange={e => updateBadge(item.slug, 'flowers', e.target.value)}
                                                className={styles.badgeInput}
                                                placeholder="Texte (ex: Promo)"
                                            />
                                            <input
                                                type="color"
                                                value={item.badgeColor || '#00FFC2'}
                                                onChange={e => updateBadgeColor(item.slug, 'flowers', e.target.value)}
                                                className={styles.colorPicker}
                                                title="Couleur du badge"
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => unpin(item.slug, 'flowers')} className={styles.unpinBtn}>✕</button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.vitrineSection}>
                            <h3 className={styles.sectionLabel}>🍫 Résines — "Nos résines phares"</h3>
                            {vitrine.resins.length === 0 ? (
                                <p className={styles.emptyHint}>Aucune résine épinglée.</p>
                            ) : vitrine.resins.map((item, idx) => (
                                <div
                                    key={item.slug}
                                    className={styles.vitrineItem}
                                >
                                    <div className={styles.vitrineOrder}>
                                        <button onClick={() => moveUp(idx, 'resins')} disabled={idx === 0} className={styles.orderBtn}>▲</button>
                                        <OrderInput idx={idx} total={vitrine.resins.length} onChange={(val) => changeVitrineOrder(item.slug, 'resins', val)} className={styles.orderInputBox} />
                                        <button onClick={() => moveDown(idx, 'resins')} disabled={idx === vitrine.resins.length - 1} className={styles.orderBtn}>▼</button>
                                    </div>
                                    <img src={item.image} alt={item.name} className={styles.vitrineImg} />
                                    <div className={styles.vitrineInfo}>
                                        <strong>{item.name}</strong>
                                        <span className={styles.catalogPrice}>{item.formattedPrice}</span>
                                        <div className={styles.badgeConfig}>
                                            <input
                                                type="text"
                                                value={item.badge || ''}
                                                onChange={e => updateBadge(item.slug, 'resins', e.target.value)}
                                                className={styles.badgeInput}
                                                placeholder="Texte (ex: Promo)"
                                            />
                                            <input
                                                type="color"
                                                value={item.badgeColor || '#00FFC2'}
                                                onChange={e => updateBadgeColor(item.slug, 'resins', e.target.value)}
                                                className={styles.colorPicker}
                                                title="Couleur du badge"
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => unpin(item.slug, 'resins')} className={styles.unpinBtn}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ TAB: VISIBILITY ══════════════ */}
            {tab === 'visibility' && (
                <div className={styles.panel}>
                    <div className={styles.visHeader}>
                        <h2 className={styles.panelTitle}>
                            Visibilité sur /produits
                            <span className={styles.counter}>{visibleCount} affiché{visibleCount > 1 ? 's' : ''} · {hiddenCount} masqué{hiddenCount > 1 ? 's' : ''}</span>
                        </h2>
                        <p className={styles.visHint}>
                            Les produits masqués ne s'affichent plus sur la page boutique, mais restent actifs sur PrestaShop.
                        </p>
                    </div>
                    <input
                        className={styles.search}
                        placeholder="Rechercher un produit..."
                        value={visSearch}
                        onChange={e => setVisSearch(e.target.value)}
                    />
                    <div className={styles.visList}>
                        {filteredVis.map((product, idx) => {
                            const hidden = isHidden(product);
                            return (
                                <div
                                    key={product.id}
                                    className={`${styles.visItem} ${hidden ? styles.visHidden : ''}`}
                                >
                                    {!visSearch && (
                                        <div className={styles.catalogOrderCtrl}>
                                            <OrderInput idx={idx} total={filteredVis.length} onChange={(val) => changeCatalogOrder(product.id, val)} className={styles.orderInputBox} />
                                        </div>
                                    )}
                                    <img src={product.image} alt={product.name} className={styles.catalogImg} />
                                    <div className={styles.catalogInfo}>
                                        <strong>{product.name}</strong>
                                        <span className={styles.catalogPrice}>{product.formattedPrice}</span>
                                        <span className={styles.typeLabel}>{isResin(product) ? '🍫 Résine' : '🌿 Fleur'}</span>
                                    </div>
                                    <div className={styles.visStatus}>
                                        <span className={hidden ? styles.statusHidden : styles.statusVisible}>
                                            {hidden ? '🙈 Masqué' : '👁 Visible'}
                                        </span>
                                        <button
                                            onClick={() => toggleVisibility(product)}
                                            className={hidden ? styles.showBtn : styles.hideBtn}
                                        >
                                            {hidden ? 'Afficher' : 'Masquer'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══════════════ TAB: DESCRIPTIONS ══════════════ */}
            {tab === 'descriptions' && (
                <div className={styles.panel}>
                    <div className={styles.visHeader}>
                        <h2 className={styles.panelTitle}>
                            Descriptions Produits
                            <span className={styles.counter}>Override sans toucher à PrestaShop</span>
                        </h2>
                        <p className={styles.visHint}>
                            Modifiez la description courte affichée sur les fiches produit. Laissez vide pour revenir à la description PrestaShop.
                        </p>
                    </div>
                    <input
                        className={styles.search}
                        placeholder="Rechercher un produit..."
                        value={descSearch}
                        onChange={e => setDescSearch(e.target.value)}
                    />
                    <div className={styles.visList}>
                        {allProducts
                            .filter(p => !descSearch || normalize(`${p.name} ${p.reference || ''}`).includes(normalize(descSearch)))
                            .map(product => {
                                const hasOverride = !!overrides[product.id];
                                const isEditing = editingId === product.id;

                                return (
                                    <div key={product.id} className={`${styles.visItem} ${hasOverride ? styles.pinned : ''}`}>
                                        <img src={product.image} alt={product.name} className={styles.catalogImg} />
                                        <div className={styles.catalogInfo} style={{ flex: 1 }}>
                                            <strong>{product.name}</strong>
                                            {hasOverride && !isEditing && (
                                                <span className={styles.statusVisible} style={{ marginLeft: 8, fontSize: '0.75rem' }}>✓ Description personnalisée</span>
                                            )}
                                            {isEditing ? (
                                                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>Description courte (affichée sur la fiche)</label>
                                                    <textarea
                                                        rows={3}
                                                        value={editDraft.descriptionShort}
                                                        onChange={e => setEditDraft(d => ({ ...d, descriptionShort: e.target.value }))}
                                                        className={styles.search}
                                                        style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem' }}
                                                        placeholder="Ex: Résine noire premium, taux de CBD entre 30 et 35%..."
                                                    />
                                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>Description longue (HTML autorisé)</label>
                                                    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                                                        <WysiwygEditor
                                                            value={editDraft.description || ''}
                                                            onChange={val => setEditDraft(d => ({ ...d, description: val }))}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button
                                                            className={styles.saveButton}
                                                            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                                                            disabled={descSaving}
                                                            onClick={async () => {
                                                                setDescSaving(true);
                                                                try {
                                                                    const payload = { [product.id]: editDraft.description || editDraft.descriptionShort
                                                                        ? { description: editDraft.description, descriptionShort: editDraft.descriptionShort }
                                                                        : null
                                                                    };
                                                                    // If both are empty, delete the override
                                                                    if (!editDraft.description && !editDraft.descriptionShort) {
                                                                        const newOverrides = { ...overrides };
                                                                        delete newOverrides[product.id];
                                                                        await fetch('/api/admin/product-overrides', {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify(newOverrides)
                                                                        });
                                                                        setOverrides(newOverrides);
                                                                    } else {
                                                                        await fetch('/api/admin/product-overrides', {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ [product.id]: { description: editDraft.description, descriptionShort: editDraft.descriptionShort } })
                                                                        });
                                                                        setOverrides(prev => ({ ...prev, [product.id]: { description: editDraft.description, descriptionShort: editDraft.descriptionShort } }));
                                                                    }
                                                                    setDescSaved(true);
                                                                    setEditingId(null);
                                                                    setTimeout(() => setDescSaved(false), 3000);
                                                                } catch { alert('Erreur réseau'); }
                                                                finally { setDescSaving(false); }
                                                            }}
                                                        >
                                                            {descSaving ? 'Enregistrement...' : descSaved ? '✓ Sauvegardé' : '💾 Sauvegarder'}
                                                        </button>
                                                        <button
                                                            className={styles.hideBtn}
                                                            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                                                            onClick={() => setEditingId(null)}
                                                        >
                                                            Annuler
                                                        </button>
                                                        {hasOverride && (
                                                            <button
                                                                className={styles.unpinBtn}
                                                                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                                                                onClick={async () => {
                                                                    const newOverrides = { ...overrides };
                                                                    delete newOverrides[product.id];
                                                                    await fetch('/api/admin/product-overrides', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify(newOverrides)
                                                                    });
                                                                    setOverrides(newOverrides);
                                                                    setEditingId(null);
                                                                }}
                                                            >
                                                                🗑 Supprimer l'override
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#888', maxHeight: 40, overflow: 'hidden' }}>
                                                    {overrides[product.id]?.descriptionShort
                                                        ? overrides[product.id].descriptionShort.replace(/<[^>]+>/g, '').substring(0, 100) + '...'
                                                        : <em>Description PrestaShop</em>
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        {!isEditing && (
                                            <button
                                                className={styles.pinBtn}
                                                onClick={() => {
                                                    setEditingId(product.id);
                                                    setEditDraft({
                                                        description: overrides[product.id]?.description || product.description || '',
                                                        descriptionShort: overrides[product.id]?.descriptionShort || product.descriptionShort || ''
                                                    });
                                                }}
                                            >
                                                ✏️ Modifier
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            )}

            {/* ══════════════ TAB: CATÉGORIES ══════════════ */}
            {tab === 'categories' && (
                <div className={styles.panel} style={{ maxWidth: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h2 className={styles.panelTitle} style={{ marginBottom: '4px' }}>
                                Gestion des catégories
                                <span className={styles.counter}>{allProducts.length} produits</span>
                            </h2>
                            <p style={{ fontSize: '0.82rem', color: '#888', margin: 0 }}>
                                Par défaut, la catégorie est détectée automatiquement par le nom du produit. Utilisez le menu pour forcer une catégorie manuellement.
                            </p>
                        </div>
                        <button
                            onClick={saveCategoryOverrides}
                            disabled={catSaving}
                            className={`${styles.saveButton} ${catSaved ? styles.savedButton : ''}`}
                        >
                            {catSaving ? 'Enregistrement...' : catSaved ? '✓ Sauvegardé' : '💾 Sauvegarder les catégories'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                        <input
                            className={styles.search}
                            style={{ flex: 1, minWidth: '200px' }}
                            placeholder="Rechercher un produit..."
                            value={catSearch}
                            onChange={e => setCatSearch(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {[
                                { id: 'all', label: 'Tous' },
                                { id: 'overridden', label: '🔒 Forcés' },
                                { id: 'fleur', label: '🌿 Fleurs' },
                                { id: 'resine', label: '🍫 Résines' },
                                { id: 'pack', label: '📦 Packs' },
                                { id: 'autre', label: '🔧 Divers' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setCatFilter(f.id)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: catFilter === f.id ? '2px solid #1F4B40' : '1px solid #ddd',
                                        background: catFilter === f.id ? '#E3FFF8' : '#fff',
                                        color: catFilter === f.id ? '#1F4B40' : '#666',
                                        fontWeight: catFilter === f.id ? 600 : 400,
                                        cursor: 'pointer',
                                        fontSize: '0.82rem',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.catalogList}>
                        {allProducts
                            .filter(p => !catSearch || matchSearch(p, catSearch))
                            .filter(p => {
                                if (catFilter === 'all') return true;
                                if (catFilter === 'overridden') return !!categoryOverrides[p.id];
                                return getEffectiveCategory(p) === catFilter;
                            })
                            .map(product => {
                                const detected = detectCategory(product);
                                const effective = getEffectiveCategory(product);
                                const isOverridden = !!categoryOverrides[product.id];
                                const detectedLabel = CATEGORY_OPTIONS.find(o => o.id === detected)?.label || detected;

                                return (
                                    <div key={product.id} className={styles.catalogItem} style={{ 
                                        borderLeft: isOverridden ? '3px solid #f59e0b' : '3px solid transparent',
                                        transition: 'border-color 0.2s'
                                    }}>
                                        <img src={product.image} alt={product.name} className={styles.catalogImg} />
                                        <div className={styles.catalogInfo} style={{ flex: 1, minWidth: 0 }}>
                                            <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</strong>
                                            <span style={{ fontSize: '0.75rem', color: '#999' }}>
                                                Auto-détecté : {detectedLabel}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            <select
                                                value={categoryOverrides[product.id] || 'auto'}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setCategoryOverrides(prev => {
                                                        const next = { ...prev };
                                                        if (val === 'auto') {
                                                            delete next[product.id];
                                                        } else {
                                                            next[product.id] = val;
                                                        }
                                                        return next;
                                                    });
                                                    setCatSaved(false);
                                                }}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    border: isOverridden ? '2px solid #f59e0b' : '1px solid #ddd',
                                                    background: isOverridden ? '#fffbeb' : '#fff',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    fontWeight: isOverridden ? 600 : 400,
                                                    minWidth: '170px'
                                                }}
                                            >
                                                {CATEGORY_OPTIONS.map(opt => (
                                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                                ))}
                                            </select>
                                            {isOverridden && (
                                                <button
                                                    onClick={() => {
                                                        setCategoryOverrides(prev => {
                                                            const next = { ...prev };
                                                            delete next[product.id];
                                                            return next;
                                                        });
                                                        setCatSaved(false);
                                                    }}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #fca5a5',
                                                        background: '#fef2f2',
                                                        color: '#dc2626',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    title="Remettre en auto-détection"
                                                >
                                                    ✕ Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            )}

            {/* ══════════════ TAB: PAGE COUVERTURE ══════════════ */}
            {tab === 'couverture' && (
                <div className={styles.panel} style={{ maxWidth: '800px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h2 className={styles.panelTitle} style={{ marginBottom: '4px' }}>Page Couverture (/produits)</h2>
                            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Personnalisez l'en-tête et les badges de la page catalogue.</p>
                        </div>
                        <button
                            onClick={savePageConfig}
                            disabled={configSaving}
                            className={`${styles.saveButton} ${configSaved ? styles.savedButton : ''}`}
                        >
                            {configSaving ? 'Enregistrement...' : configSaved ? '✓ Sauvegardé' : '💾 Sauvegarder'}
                        </button>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1F4B40', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🏅</span> Badge Produit
                        </h3>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={pageConfig.premiumBadge.enabled}
                                    onChange={e => setPageConfig(p => ({ ...p, premiumBadge: { ...p.premiumBadge, enabled: e.target.checked } }))}
                                    style={{ width: '16px', height: '16px', accentColor: '#1F4B40' }}
                                />
                                Afficher le badge sur les fleurs/résines
                            </label>
                            
                            {pageConfig.premiumBadge.enabled && (
                                <input
                                    type="text"
                                    value={pageConfig.premiumBadge.text}
                                    onChange={e => setPageConfig(p => ({ ...p, premiumBadge: { ...p.premiumBadge, text: e.target.value } }))}
                                    className={styles.search}
                                    style={{ margin: 0, padding: '8px 12px', minWidth: '250px' }}
                                    placeholder="Ex: Qualité Premium"
                                />
                            )}
                        </div>
                    </div>

                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#1F4B40', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🎠</span> Slides du Carousel
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {pageConfig.carousel.map((slide, index) => (
                            <div key={slide.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ background: '#f1f5f9', padding: '10px 16px', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                                    Slide {index + 1}
                                </div>
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Titre</label>
                                        <input
                                            type="text"
                                            value={slide.title}
                                            onChange={e => {
                                                const newCarousel = [...pageConfig.carousel];
                                                newCarousel[index].title = e.target.value;
                                                setPageConfig({ ...pageConfig, carousel: newCarousel });
                                            }}
                                            className={styles.search}
                                            style={{ margin: 0, width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Sous-titre</label>
                                        <input
                                            type="text"
                                            value={slide.subtitle}
                                            onChange={e => {
                                                const newCarousel = [...pageConfig.carousel];
                                                newCarousel[index].subtitle = e.target.value;
                                                setPageConfig({ ...pageConfig, carousel: newCarousel });
                                            }}
                                            className={styles.search}
                                            style={{ margin: 0, width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Image de la slide</label>
                                        <ImageUpload
                                            currentImage={slide.image}
                                            onImageChange={(url) => {
                                                const newCarousel = [...pageConfig.carousel];
                                                newCarousel[index].image = url;
                                                setPageConfig({ ...pageConfig, carousel: newCarousel });
                                            }}
                                            accept="image/*"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Texte du Bouton</label>
                                            <input
                                                type="text"
                                                value={slide.buttonText}
                                                onChange={e => {
                                                    const newCarousel = [...pageConfig.carousel];
                                                    newCarousel[index].buttonText = e.target.value;
                                                    setPageConfig({ ...pageConfig, carousel: newCarousel });
                                                }}
                                                className={styles.search}
                                                style={{ margin: 0, width: '100%' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Lien du Bouton</label>
                                            <input
                                                type="text"
                                                value={slide.buttonLink}
                                                onChange={e => {
                                                    const newCarousel = [...pageConfig.carousel];
                                                    newCarousel[index].buttonLink = e.target.value;
                                                    setPageConfig({ ...pageConfig, carousel: newCarousel });
                                                }}
                                                className={styles.search}
                                                style={{ margin: 0, width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
