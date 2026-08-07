
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
import { trackCTA } from '@/utils/analytics';

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

export default function ProductsClient({ initialProducts, globalContent, categoryOverrides = {}, pageConfig, productOverrides = {}, productCategories }) {
    // Provide defaults if pageConfig is missing
    const config = pageConfig || {
        carousel: [
            { id: 1, title: "L'Essentiel du CBD", subtitle: "Découvrez notre sélection rigoureuse, pensée pour votre bien-être au quotidien.", image: "/images/hero.webp", buttonText: "Notre histoire", buttonLink: "/essentiel" },
            { id: 2, title: "La Qualité Premium", subtitle: "Des fleurs et résines exceptionnelles, cultivées avec passion pour des arômes uniques.", image: "/images/carousel_nature_cbd.png", buttonText: "Voir nos fleurs", buttonLink: "/produits?cat=fleur" },
            { id: 3, title: "Bien-être & Sérénité", subtitle: "Des conseils experts pour intégrer nos produits à votre routine détente.", image: "/images/carousel_wellness_cbd.png", buttonText: "Nos conseils", buttonLink: "/usages" }
        ],
        premiumBadge: { enabled: true, text: "Qualité Premium" }
    };
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
            setCurrentSlide((prev) => (prev + 1) % config.carousel.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [config.carousel.length]);

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

    // Helper to determine product type robustly 
    const getProductType = (product) => {
        // Check for admin override first
        if (categoryOverrides[product.id]) {
            return categoryOverrides[product.id];
        }

        const nameNorm = (product.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const tagNorm = (product.tag || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Exclude PLV/Flyers/Accessories first
        if (['plv', 'flyer', 'tourniquet', 'presentoir', 'accessoire', 'goodies', 'feuille', 'briquet', 'grinder'].some(k => nameNorm.includes(k) || tagNorm.includes(k))) return 'autre';

        // Pack & Résines
        if (['resine', 'hash', 'filtre', 'pollen'].some(k => nameNorm.includes(k) || tagNorm.includes(k))) return 'resine';
        if (['pack', 'mystere', 'decouverte'].some(k => nameNorm.includes(k) || tagNorm.includes(k))) return 'pack';
        
        // Fleurs (Par mot-clé direct ou catégorie PrestaShop)
        if (['fleur', 'trim', 'mix', 'skunk', 'amnesia', 'gorilla', 'remedy', 'cbd', 'kush', 'haze', 'gelato'].some(k => nameNorm.includes(k) || tagNorm.includes(k)) || product.category === 3) return 'fleur';

        // Fallback ultime intelligent pour les Fleurs : Si le nom contient un grammage (ex: "5g", "10 G")
        if (/(?:^|\s|-)(\d+(?:[.,]\d+)?)\s*g\b/.test(nameNorm)) return 'fleur';

        return 'autre';
    };

    // Dynamic Categories
    const categories = [
        { id: 'all', label: 'Tout voir' },
        ...(productCategories && productCategories.length > 0 
            ? productCategories 
            : [
                { id: 'fleur', label: '🌿 Fleurs CBD' },
                { id: 'resine', label: '🍫 Résines & Pollens' },
                { id: 'pack', label: '📦 Packs & Découverte' },
                { id: 'autre', label: '🔧 Accessoires & Divers' }
            ]
        )
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

    // Group filtered products by base name to present a unified premium selector experience
    const groupedProducts = (() => {
        const groups = new Map();
        filteredProducts.forEach(product => {
            const baseName = (product.name || '').replace(/\s*\d+(?:[.,]\d+)?\s*g\s*$/i, '').trim();
            const key = baseName.toLowerCase();
            
            if (!groups.has(key)) {
                // Find all variations for this base product from the full initialProducts list
                const variations = initialProducts
                    .filter(p => {
                        const pBase = (p.name || '').replace(/\s*\d+(?:[.,]\d+)?\s*g\s*$/i, '').trim();
                        return pBase.toLowerCase() === key;
                    })
                    .map(p => {
                        const m = (p.name || '').match(/(\d+(?:[.,]\d+)?)\s*g/i);
                        const weight = m ? parseFloat(m[1].replace(',', '.')) : 0;
                        return {
                            ...p,
                            weight,
                            label: weight > 0 ? `${weight}g` : p.name
                        };
                    })
                    .sort((a, b) => {
                        if (a.weight && b.weight) return a.weight - b.weight;
                        return (a.priceTTC || 0) - (b.priceTTC || 0);
                    });

                groups.set(key, {
                    ...product,
                    baseName,
                    variations: variations.length > 1 ? variations : null
                });
            }
        });
        return Array.from(groups.values());
    })();

    return (
        <main className={styles.main}>
            <Header {...HEADER_PROPS} menuItems={globalContent?.headerLinks || HEADER_PROPS.menuItems} />

            {/* Hero Carousel */}
            <div className={styles.carouselContainer}>
                {config.carousel.map((slide, index) => (
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
                    {config.carousel.map((_, index) => (
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
                    {groupedProducts.map((product) => {
                        return (
                            <ProductCard 
                                key={product.id || product.slug}
                                product={product}
                                groupId={groupId}
                                addItem={addItem}
                                expandedId={expandedId}
                                setExpandedId={setExpandedId}
                                config={config}
                                productOverrides={productOverrides}
                            />
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

// Extract ProductType helper
const getProductType = (product) => {
    const name = product.name?.toLowerCase() || '';
    if (name.includes('fleur')) return 'fleur';
    if (name.includes('resine') || name.includes('hash') || name.includes('jaune')) return 'resine';
    if (name.includes('huile')) return 'huile';
    return 'autre';
};

// Sub-component for individual product cards
function ProductCard({ product, groupId, addItem, expandedId, setExpandedId, config, productOverrides }) {
    const hasVariations = product.variations && product.variations.length > 0;
    const hasVariants = product.variants && product.variants.length > 0;

    const [selectedVariationSlug, setSelectedVariationSlug] = useState(
        hasVariations ? (product.variations.find(v => v.slug === product.slug)?.slug || product.variations[0].slug) : null
    );
    const [selectedVariantId, setSelectedVariantId] = useState(
        hasVariants ? (product.variants.find(v => v.isDefault)?.id || product.variants[0].id) : null
    );

    const activeVariation = hasVariations ? product.variations.find(v => v.slug === selectedVariationSlug) : null;
    const selectedVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;
    
    // Construct active product data (merging selected variation or variant info if any)
    const activeProduct = (() => {
        if (activeVariation) {
            return activeVariation;
        }
        if (selectedVariant) {
            return {
                ...product,
                priceHT: selectedVariant.priceImpactHT + product.priceHT,
                priceTTC: selectedVariant.priceTTC,
                formattedPrice: selectedVariant.formattedPrice,
                variant: selectedVariant
            };
        }
        return product;
    })();

    const groupPrice = calculateGroupPrice(activeProduct, groupId);

    // Calcul du grammage & Prix au gramme
    const searchString = `${activeProduct.name || ''} ${activeProduct.reference || ''} ${selectedVariant?.label || ''}`.toLowerCase();
    const weightMatch = searchString.match(/(?:^|\s|-)(\d+(?:[.,]\d+)?)\s*g\b/);
    let exactGrams = null;
    let perGramText = null;

    const priceToUse = groupPrice.suggestShowHT ? groupPrice.priceHT : (groupPrice?.priceTTC || activeProduct.priceTTC || 0);

    if (weightMatch) {
        exactGrams = parseFloat(weightMatch[1].replace(',', '.'));
        if (exactGrams > 0 && priceToUse > 0) {
            const newPerGram = (priceToUse / exactGrams).toFixed(2).replace('.', ',');
            perGramText = `${newPerGram}€/g ${groupPrice.suggestShowHT ? 'HT' : ''}`;
        }
    }

    // Vérifier si le produit mérite l'appellation "Qualité Premium" (Whitelist)
    const nameNorm = (activeProduct.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const tagNorm = (activeProduct.tag || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const isPremium = (() => {
        if (['plv', 'flyer', 'tourniquet', 'presentoir', 'accessoire', 'goodies', 'feuille', 'briquet', 'grinder', 'plateau', 'cendrier'].some(k => nameNorm.includes(k) || tagNorm.includes(k))) return false;
        
        const premiumKeywords = ['resine', 'hash', 'pollen', 'fleur', 'trim', 'mix', 'skunk', 'amnesia', 'gorilla', 'kush', 'haze', 'gelato', 'moonrock', 'asteroide', 'huile', 'cbd', 'cbg', 'cbn', 'pack', 'mystere', 'decouverte'];
        if (premiumKeywords.some(k => nameNorm.includes(k) || tagNorm.includes(k))) return true;

        if (/(?:^|\s|-)(\d+(?:[.,]\d+)?)\s*(g|ml|%)\b/.test(nameNorm)) return true;

        const type = getProductType(activeProduct);
        if (type !== 'autre') return true;

        return false;
    })();

    const handleAddToCart = (e, quantity) => {
        e.preventDefault();
        const pHT = groupPrice.priceHT || activeProduct.priceHT || activeProduct.price || 0;
        const pTTC = groupPrice.priceTTC || activeProduct.priceTTC || 0;
        const displayPrice = groupPrice.suggestShowHT ? pHT : pTTC;
        
        const itemToAdd = { 
            ...activeProduct, 
            rawProduct: activeProduct, 
            price: displayPrice, 
            priceHT: pHT, 
            priceTTC: pTTC 
        };
        
        addItem(itemToAdd, quantity);
        setExpandedId(null);
    };

    return (
        <div className={styles.card}>
            <Link href={`/produit/${activeProduct.slug}`} className={styles.imageLink} onClick={() => trackCTA(`product_click_${activeProduct.slug}`)}>
                <div className={styles.imageWrapper}>
                    <Image
                        src={activeProduct.image || '/images/placeholder.webp'}
                        alt={activeProduct.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className={styles.image}
                    />
                    {activeProduct.tag && activeProduct.tag.toLowerCase() !== 'bestseller' && (
                        <span className={styles.tag}>
                            {activeProduct.tag}
                        </span>
                    )}
                </div>
            </Link>

            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.productName}>{activeProduct.name}</h3>
                    {(productOverrides[activeProduct.id]?.badge || (isPremium && config.premiumBadge.enabled)) && (
                        <p className={styles.productSubtitle}>
                            {productOverrides[activeProduct.id]?.badge || config.premiumBadge.text}
                        </p>
                    )}
                </div>

                {(hasVariations || hasVariants) && (
                    <div className={styles.variantsWrapper}>
                        {hasVariations ? (
                            product.variations.map(v => (
                                <button
                                    key={v.slug}
                                    className={`${styles.variantPill} ${v.slug === selectedVariationSlug ? styles.variantPillActive : ''}`}
                                    onClick={(e) => { e.preventDefault(); setSelectedVariationSlug(v.slug); }}
                                >
                                    {v.label}
                                </button>
                            ))
                        ) : (
                            product.variants.map(v => (
                                <button
                                    key={v.id}
                                    className={`${styles.variantPill} ${v.id === selectedVariantId ? styles.variantPillActive : ''}`}
                                    onClick={(e) => { e.preventDefault(); setSelectedVariantId(v.id); }}
                                >
                                    {v.label}
                                </button>
                            ))
                        )}
                    </div>
                )}

                <div className={styles.cardFooter}>
                    <div className={styles.priceInfo}>
                        <span className={styles.priceLabel}>{groupPrice.suggestShowHT ? 'Prix HT' : 'Prix TTC'}</span>
                        <span className={styles.priceValue}>
                            {groupPrice.hasDiscount ? (
                                <span className={styles.pricesContainer}>
                                    <span className={styles.originalPrice}>
                                        {activeProduct.formattedPrice}
                                    </span>
                                    <span className={styles.discountedPrice}>
                                        {groupPrice.suggestShowHT ? groupPrice.formattedPriceHT : groupPrice.formattedPrice}
                                    </span>
                                </span>
                            ) : (
                                <span className={styles.normalPrice}>
                                    {groupPrice.suggestShowHT ? groupPrice.formattedPriceHT : (activeProduct.formattedPrice || `${activeProduct.priceTTC || activeProduct.price || 5} €`)}
                                </span>
                            )}
                        </span>
                        {perGramText && (
                            <span className={styles.perGramText}>{perGramText}</span>
                        )}
                    </div>
                    <div className={`${styles.actionWrapper} ${expandedId === product.id ? styles.expanded : ''}`}>
                        <div className={styles.qtyDrawer}>
                            {[1, 3, 5, 10].map(qty => (
                                <button
                                    key={qty}
                                    className={styles.qtyBtn}
                                    onClick={(e) => handleAddToCart(e, qty)}
                                    aria-label={`Ajouter ${qty} au panier`}
                                    title={`x${qty}`}
                                >
                                    x{qty}
                                </button>
                            ))}
                        </div>
                        <button
                            className={styles.addBtn}
                            onClick={(e) => {
                                e.preventDefault();
                                if (window.innerWidth <= 768) {
                                    setExpandedId(expandedId === product.id ? null : product.id);
                                } else {
                                    handleAddToCart(e, 1);
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
}
