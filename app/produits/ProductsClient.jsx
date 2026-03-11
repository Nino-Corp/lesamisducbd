
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from './Products.module.css';
import { useSession } from 'next-auth/react';
import { calculateGroupPrice } from '@/lib/utils/groupPricing';

const HEADER_PROPS = {
    logoText: "LES AMIS DU CBD",
    logoImage: "/images/logo.webp",
    menuItems: [
        { label: "PRODUITS", href: "/produits" },
        { label: "L'ESSENTIEL", href: "/essentiel" },
        { label: "CBD & USAGES", href: "/usages" },
        { label: "PROFESSIONNEL", href: "/professionnel" }
    ]
};

const FOOTER_PROPS = {
    columnLinks: [
        { label: "Livraison", href: "/livraison" },
        { label: "CGV", href: "/cgv" },
        { label: "Politique de confidentialité", href: "/privacy" },
        { label: "Transparence", href: "/transparence" },
        { label: "Professionnel", href: "/professionnel" }
    ],
    contactInfo: {
        title: "Les Amis du CBD France",
        address: "25 rue principale 07120 Chauzon (FR)",
        phone: "06 71 82 42 87",
        email: "lesamisducbd@gmail.com"
    },
    newsletter: {
        placeholder: "Votre adresse e-mail",
        disclaimer: "Vous pouvez vous désinscrire à tout moment."
    },
    copyright: "©2024 - Les Amis du CBD"
};

const CAROUSEL_SLIDES = [
    {
        id: 1,
        title: "L'Essentiel du CBD",
        subtitle: "Découvrez notre sélection rigoureuse, pensée pour votre bien-être au quotidien.",
        image: "/images/hero.webp",
        buttonText: "Notre histoire",
        buttonLink: "/essentiel"
    },
    {
        id: 2,
        title: "La Qualité Premium",
        subtitle: "Des fleurs et résines exceptionnelles, cultivées avec passion pour des arômes uniques.",
        image: "/images/carousel_nature_cbd.png",
        buttonText: "Voir nos fleurs",
        buttonLink: "/produits?cat=fleur"
    },
    {
        id: 3,
        title: "Bien-être & Sérénité",
        subtitle: "Des conseils experts pour intégrer nos produits à votre routine détente.",
        image: "/images/carousel_wellness_cbd.png",
        buttonText: "Nos conseils",
        buttonLink: "/usages"
    }
];

export default function ProductsClient({ initialProducts, globalContent }) {
    const footerProps = {
        ...FOOTER_PROPS,
        newsletter: { ...FOOTER_PROPS.newsletter, isVisible: globalContent?.visibility?.newsletter !== false },
        columnLinks: globalContent?.footerLinks || FOOTER_PROPS.columnLinks,
        contactInfo: globalContent?.contact || FOOTER_PROPS.contactInfo
    };
    const { addItem } = useCart();
    const { data: session } = useSession();
    const groupId = session?.user?.id_default_group || 3;

    // State
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [expandedId, setExpandedId] = useState(null);

    // Carousel Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Fermer le tiroir de quantité si on clique ailleurs (Mobile)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // On vérifie si le clic s'est fait en dehors de la zone du bouton
            if (!event.target.closest(`.${styles.actionWrapper}`)) {
                setExpandedId(null);
            }
        };

        // On écoute les clics souris et les tapotements tactiles
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        // Nettoyage de l'écouteur quand on quitte la page
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const nextSlide = () => setCurrentSlide((currentSlide + 1) % CAROUSEL_SLIDES.length);
    const prevSlide = () => setCurrentSlide((currentSlide - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);

    // Helper to determine product type robustly (handles accents and forces PLV away from Fleurs)
    const getProductType = (product) => {
        const nameNorm = (product.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const tagNorm = (product.tag || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Exclude PLV/Flyers/Accessories first
        if (['plv', 'flyer', 'tourniquet', 'presentoir', 'accessoire'].some(k => nameNorm.includes(k) || tagNorm.includes(k))) return 'autre';

        if (['resine', 'hash', 'filtre', 'pollen'].some(k => nameNorm.includes(k) || tagNorm.includes(k))) return 'resine';
        if (['pack', 'mystere', 'decouverte'].some(k => nameNorm.includes(k) || tagNorm.includes(k))) return 'pack';
        if (['fleur', 'trim', 'mix', 'skunk', 'amnesia', 'gorilla', 'remedy', 'cbd'].some(k => nameNorm.includes(k) || tagNorm.includes(k)) || product.category === 3) return 'fleur';

        return 'autre';
    };

    // Derived Categories
    const categories = [
        { id: 'all', label: 'Tout voir' },
        { id: 'fleur', label: 'Fleurs CBD' },
        { id: 'resine', label: 'Résines & Pollens' },
        { id: 'pack', label: 'Packs' },
        { id: 'autre', label: 'Accessoires & Divers' }
    ];

    // Filter Logic
    const filteredProducts = initialProducts.filter(product => {
        // Search filter
        if (searchQuery) {
            const searchNorm = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const nameNorm = (product.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (!nameNorm.includes(searchNorm)) return false;
        }

        // Category filter
        if (activeCategory === 'all') return true;
        return getProductType(product) === activeCategory;
    });

    return (
        <main className={styles.main}>
            <Header {...HEADER_PROPS} />

            {/* Hero Carousel */}
            <div className={styles.carouselContainer}>
                {CAROUSEL_SLIDES.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`${styles.carouselSlide} ${index === currentSlide ? styles.slideActive : ''}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className={styles.slideOverlay}></div>
                        <div className={styles.slideContent}>
                            <h1>{slide.title}</h1>
                            <p>{slide.subtitle}</p>
                            {slide.buttonLink && (
                                <Link href={slide.buttonLink} className={styles.slideBtn}>
                                    {slide.buttonText}
                                </Link>
                            )}
                        </div>
                    </div>
                ))}

                {/* Carousel Controls */}
                <button className={`${styles.carouselNav} ${styles.navPrev}`} onClick={prevSlide} aria-label="Image précédente">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button className={`${styles.carouselNav} ${styles.navNext}`} onClick={nextSlide} aria-label="Image suivante">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>

                <div className={styles.carouselIndicators}>
                    {CAROUSEL_SLIDES.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.indicator} ${index === currentSlide ? styles.indicatorActive : ''}`}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Aller à la diapositive ${index + 1}`}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Rechercher un produit (ex: Amnésia, Pollen...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                    {searchQuery && (
                        <button className={styles.clearSearchBtn} onClick={() => setSearchQuery('')} aria-label="Effacer la recherche">
                            &times;
                        </button>
                    )}
                </div>
            </div>

            <section className={styles.container}>
                {/* Category Filters */}
                <div className={styles.filtersWrapper}>
                    <div className={styles.filtersScroll}>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className={styles.grid}>
                    {filteredProducts.map((product, index) => {
                        const groupPrice = calculateGroupPrice(product, groupId);

                        // Calcul du grammage & Prix au gramme
                        const searchString = `${product.name || ''} ${product.reference || ''}`.toLowerCase();
                        const weightMatch = searchString.match(/(?:^|\s|-)(\d+(?:[.,]\d+)?)\s*g\b/);
                        let exactGrams = null;
                        let perGramText = null;

                        const priceToUse = groupPrice.suggestShowHT ? groupPrice.priceHT : (groupPrice?.priceTTC || product.priceTTC || 0);

                        if (weightMatch) {
                            exactGrams = parseFloat(weightMatch[1].replace(',', '.'));
                            if (exactGrams > 0 && priceToUse > 0) {
                                const newPerGram = (priceToUse / exactGrams).toFixed(2).replace('.', ',');
                                perGramText = `${newPerGram}€/g ${groupPrice.suggestShowHT ? 'HT' : ''}`;
                            }
                        }

                        return (
                            <div key={product.name} className={styles.card}>
                                <Link href={`/produit/${product.slug}`} className={styles.imageLink}>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={product.image || '/images/placeholder.webp'}
                                            alt={product.name}
                                            fill
                                            priority={index < 6}
                                            unoptimized
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className={styles.image}
                                        />
                                        {product.tag && product.tag.toLowerCase() !== 'bestseller' && (
                                            <span className={styles.tag}>
                                                {product.tag}
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.productName}>{product.name}</h3>
                                        <p className={styles.productSubtitle}>
                                            {getProductType(product) === 'fleur' ? 'Cultivé en France' : 'Qualité Premium'}
                                        </p>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <div className={styles.priceInfo}>
                                            <span className={styles.priceLabel}>{groupPrice.suggestShowHT ? 'Prix HT' : 'Prix TTC'}</span>
                                            <span className={styles.priceValue}>
                                                {groupPrice.hasDiscount ? (
                                                    <span className={styles.pricesContainer}>
                                                        <span className={styles.originalPrice}>
                                                            {product.formattedPrice}
                                                        </span>
                                                        <span className={styles.discountedPrice}>
                                                            {groupPrice.suggestShowHT ? groupPrice.formattedPriceHT : groupPrice.formattedPrice}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className={styles.normalPrice}>
                                                        {groupPrice.suggestShowHT ? groupPrice.formattedPriceHT : (product.formattedPrice || `${product.priceTTC || product.price || 5} €`)}
                                                    </span>
                                                )}
                                            </span>
                                            {perGramText && (
                                                <span className={styles.perGramText}>{perGramText}</span>
                                            )}
                                        </div>
                                        <div className={`${styles.actionWrapper} ${expandedId === product.id ? styles.expanded : ''}`}>
                                            <div className={styles.qtyDrawer}>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const pHT = groupPrice.priceHT || product.priceHT || product.price || 0;
                                                        const pTTC = groupPrice.priceTTC || product.priceTTC || 0;
                                                        const displayPrice = groupPrice.suggestShowHT ? pHT : pTTC;
                                                        addItem({ ...product, rawProduct: product, price: displayPrice, priceHT: pHT, priceTTC: pTTC }, 1);
                                                        setExpandedId(null);
                                                    }}
                                                    aria-label="Ajouter 1 au panier"
                                                    title="x1"
                                                >
                                                    x1
                                                </button>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const pHT = groupPrice.priceHT || product.priceHT || product.price || 0;
                                                        const pTTC = groupPrice.priceTTC || product.priceTTC || 0;
                                                        const displayPrice = groupPrice.suggestShowHT ? pHT : pTTC;
                                                        addItem({ ...product, rawProduct: product, price: displayPrice, priceHT: pHT, priceTTC: pTTC }, 3);
                                                        setExpandedId(null);
                                                    }}
                                                    aria-label="Ajouter 3 au panier"
                                                    title="x3"
                                                >
                                                    x3
                                                </button>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const pHT = groupPrice.priceHT || product.priceHT || product.price || 0;
                                                        const pTTC = groupPrice.priceTTC || product.priceTTC || 0;
                                                        const displayPrice = groupPrice.suggestShowHT ? pHT : pTTC;
                                                        addItem({ ...product, rawProduct: product, price: displayPrice, priceHT: pHT, priceTTC: pTTC }, 5);
                                                        setExpandedId(null);
                                                    }}
                                                    aria-label="Ajouter 5 au panier"
                                                    title="x5"
                                                >
                                                    x5
                                                </button>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const pHT = groupPrice.priceHT || product.priceHT || product.price || 0;
                                                        const pTTC = groupPrice.priceTTC || product.priceTTC || 0;
                                                        const displayPrice = groupPrice.suggestShowHT ? pHT : pTTC;
                                                        addItem({ ...product, rawProduct: product, price: displayPrice, priceHT: pHT, priceTTC: pTTC }, 10);
                                                        setExpandedId(null);
                                                    }}
                                                    aria-label="Ajouter 10 au panier"
                                                    title="x10"
                                                >
                                                    x10
                                                </button>
                                            </div>
                                            <button
                                                className={styles.addBtn}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (window.innerWidth <= 768) {
                                                        setExpandedId(expandedId === product.id ? null : product.id);
                                                    } else {
                                                        const pHT = groupPrice.priceHT || product.priceHT || product.price || 0;
                                                        const pTTC = groupPrice.priceTTC || product.priceTTC || 0;
                                                        const displayPrice = groupPrice.suggestShowHT ? pHT : pTTC;
                                                        addItem({ ...product, rawProduct: product, price: displayPrice, priceHT: pHT, priceTTC: pTTC }, 1);
                                                    }
                                                }}
                                                aria-label="Ajouter au panier"
                                                title="Ajouter au panier"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredProducts.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>Aucun produit ne correspond à cette catégorie pour le moment.</p>
                    </div>
                )}
            </section>

            <Footer {...footerProps} />
        </main>
    );
}

