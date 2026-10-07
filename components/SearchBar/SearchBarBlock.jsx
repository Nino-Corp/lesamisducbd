'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Loader2, FileText, Package } from 'lucide-react';
import Fuse from 'fuse.js';
import styles from './SearchBarBlock.module.css';

const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') ?? '';

const FALLBACK_PAGES = [
    { id: 'p0', title: "Accueil", slug: "/", desc: "Page principale de la boutique Les Amis du CBD.", keywords: "accueil, home, boutique, page principale, cbd", type: "page" },
    { id: 'p1', title: "L'Essentiel", slug: "/essentiel", desc: "Tout savoir sur le CBD, nos guides et explications.", keywords: "guide, explications, qu'est-ce que le cbd, information, débutant, apprendre, faq, questions", type: "page" },
    { id: 'p2', title: "CBD & Usages", slug: "/usages", desc: "Comment utiliser le CBD, dosage, effets, conseils pratiques.", keywords: "utilisation, dosage, effets, conseils, comment consommer, fumer, vaporiser, infuser, tisane, posologie", type: "page" },
    { id: 'p3', title: "Professionnel / Grossiste", slug: "/professionnel", desc: "Espace B2B, devenir revendeur, tarifs grossiste.", keywords: "b2b, grossiste, pro, professionnel, revendeur, achat gros, revendre, magasin, tabac, boutique", type: "page" },
    { id: 'p4', title: "Transparence & Qualité", slug: "/transparence", desc: "Nos engagements, analyses de laboratoire, origine de nos fleurs.", keywords: "qualité, transparence, laboratoire, analyses, origine, traçabilité, bio, naturel, culture, engagement", type: "page" },
    { id: 'p5', title: "Livraison & Retours", slug: "/livraison", desc: "Frais de port, délais d'expédition, politique de retour.", keywords: "livraison, retours, expédition, frais de port, délais, colis, suivi, remboursement, chronopost, colissimo", type: "page" },
    { id: 'p6', title: "Conditions Générales de Vente", slug: "/cgv", desc: "CGV, mentions légales, conditions d'achat.", keywords: "cgv, conditions de vente, mentions légales, achat, paiement, légal", type: "page" },
    { id: 'p7', title: "Politique de Confidentialité", slug: "/privacy", desc: "Protection de vos données personnelles (RGPD).", keywords: "confidentialité, privacy, données personnelles, rgpd, cookies, sécurité", type: "page" },
    { id: 'p8', title: "Recrutement", slug: "/recrutement", desc: "Rejoindre l'équipe Les Amis du CBD, offres d'emploi.", keywords: "recrutement, emploi, job, travailler, candidature, cv, offre, nous rejoindre", type: "page" },
];

export default function SearchBarBlock({ placeholder = "Rechercher un produit ou une information… (ex: Gorilla, livraison, grossiste…)", title = "" }) {
    const [query, setQuery] = useState('');
    const [productResults, setProductResults] = useState([]);
    const [pageResults, setPageResults] = useState([]);
    const [allProducts, setAllProducts] = useState(null);
    const [allPages, setAllPages] = useState(FALLBACK_PAGES);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);
    const hasFetched = useRef(false);

    const fusePages = useRef(null);
    const fuseProducts = useRef(null);

    useEffect(() => {
        if (allPages && allPages.length > 0) {
            fusePages.current = new Fuse(allPages, {
                keys: ['title', 'desc', 'keywords', 'content'],
                threshold: 0.35,
                ignoreLocation: true,
                minMatchCharLength: 2,
            });
        }
    }, [allPages]);

    useEffect(() => {
        if (allProducts && allProducts.length > 0) {
            fuseProducts.current = new Fuse(allProducts, {
                keys: ['name', 'descriptionShort', 'reference'],
                threshold: 0.35,
                ignoreLocation: true,
                minMatchCharLength: 2,
            });
        }
    }, [allProducts]);

    const fetchData = useCallback(async () => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        setLoading(true);
        try {
            const [prodRes, pagesRes] = await Promise.all([
                fetch('/api/products').catch(() => null),
                fetch(`/search-pages.json?t=${Date.now()}`, { cache: 'no-store' }).catch(() => null)
            ]);

            if (prodRes && prodRes.ok) {
                const data = await prodRes.json();
                setAllProducts(Array.isArray(data) ? data : []);
            } else {
                setAllProducts([]);
            }

            if (pagesRes && pagesRes.ok) {
                const pagesData = await pagesRes.json();
                if (Array.isArray(pagesData) && pagesData.length > 0) {
                    const mergedPages = FALLBACK_PAGES.map(fb => {
                        const loaded = pagesData.find(p => p.slug === fb.slug);
                        return { ...fb, content: loaded ? loaded.content : '' };
                    });
                    setAllPages(mergedPages);
                }
            }
        } catch {
            setAllProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch data on mount
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (!query.trim()) {
            setProductResults([]);
            setPageResults([]);
            return;
        }
        
        debounceRef.current = setTimeout(() => {
            const q = query.trim();
            
            if (fusePages.current) {
                const results = fusePages.current.search(q);
                setPageResults(results.map(r => r.item).slice(0, 3));
            }

            if (fuseProducts.current) {
                const results = fuseProducts.current.search(q);
                setProductResults(results.map(r => r.item).slice(0, 5));
            }
        }, 250);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    return (
        <div className={styles.container}>
            {title && <h3 className={styles.blockTitle}>{title}</h3>}
            <div className={styles.panel}>
                <div className={styles.inputRow}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.input}
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Recherche"
                        autoComplete="off"
                        spellCheck={false}
                    />
                    {loading && <Loader2 size={18} className={styles.spinner} />}
                </div>

                {!query && !loading && (
                    <p className={styles.hint}>
                        Tapez le nom d'un produit, une catégorie ou une information (ex: livraison, qualité, grossiste)…
                    </p>
                )}

                {productResults.length > 0 && (
                    <div className={styles.resultsGroup}>
                        <h4 className={styles.groupTitle}><Package size={14}/> Produits</h4>
                        <ul className={styles.results} role="listbox">
                            {productResults.map((product) => (
                                <li key={product.id} role="option">
                                    <Link href={`/produit/${product.slug}`} className={styles.resultItem}>
                                        <div className={styles.resultImage}>
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className={styles.img}
                                                sizes="56px"
                                                unoptimized
                                            />
                                        </div>
                                        <div className={styles.resultInfo}>
                                            <span className={styles.resultName}>{product.name}</span>
                                            {product.descriptionShort && (
                                                <span className={styles.resultDesc}>
                                                    {stripHtml(product.descriptionShort).slice(0, 70)}…
                                                </span>
                                            )}
                                        </div>
                                        <span className={styles.resultPrice}>{product.formattedPrice}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {pageResults.length > 0 && (
                    <div className={styles.resultsGroup}>
                        <h4 className={styles.groupTitle}><FileText size={14}/> Pages & Informations</h4>
                        <ul className={styles.results} role="listbox">
                            {pageResults.map((page) => (
                                <li key={page.id} role="option">
                                    <Link href={page.slug} className={styles.resultItem}>
                                        <div className={styles.pageIconWrapper}>
                                            <FileText size={24} className={styles.pageIcon}/>
                                        </div>
                                        <div className={styles.resultInfo}>
                                            <span className={styles.resultName}>{page.title}</span>
                                            <span className={styles.resultDesc}>{page.desc}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {query.trim().length > 1 && !loading && productResults.length === 0 && pageResults.length === 0 && (
                    <p className={styles.noResult}>
                        Aucun résultat trouvé pour «&nbsp;<strong>{query}</strong>&nbsp;»
                    </p>
                )}
            </div>
        </div>
    );
}
