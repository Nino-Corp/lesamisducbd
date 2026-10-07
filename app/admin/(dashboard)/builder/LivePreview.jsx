'use client';

// Live preview panel — renders all builder blocks in real time (no iframe)
import dynamic from 'next/dynamic';
import ContentHero from '@/components/ContentHero/ContentHero';
import RichText from '@/components/RichText/RichText';
import ImageBlock from '@/components/ImageBlock/ImageBlock';
import Quote from '@/components/Quote/Quote';
import FAQ from '@/components/FAQ/FAQ';
import CTABlock from '@/components/CTABlock/CTABlock';
import TwoColumns from '@/components/TwoColumns/TwoColumns';
import CardsGrid from '@/components/CardsGrid/CardsGrid';
import ImageCardsGrid from '@/components/ImageCardsGrid/ImageCardsGrid';
import IconSummary from '@/components/IconSummary/IconSummary';
import StatsBanner from '@/components/StatsBanner/StatsBanner';
import VideoEmbed from '@/components/VideoEmbed/VideoEmbed';
import Divider from '@/components/Divider/Divider';
import AuthorCard from '@/components/AuthorCard/AuthorCard';
import CalloutBox from '@/components/CalloutBox/CalloutBox';
import RelatedArticles from '@/components/RelatedArticles/RelatedArticles';
import LatestArticlesPreview from '@/components/LatestArticles/LatestArticlesPreview';
import TableOfContents from '@/components/TableOfContents/TableOfContents';
import FeaturedProductsPreview from '@/components/FeaturedProducts/FeaturedProductsPreview';
import Marquee from '@/components/Marquee/Marquee';
import OfferComparator from '@/components/OfferComparator/OfferComparator';
import PartnersNetwork from '@/components/PartnersNetwork/PartnersNetwork';
import QualityBanner from '@/components/QualityBanner/QualityBanner';
import WhyChooseUs from '@/components/WhyChooseUs/WhyChooseUs';
import CodeEmbed from '@/components/CodeEmbed/CodeEmbed';
import Hero from '@/components/Hero/Hero';
import ProductList from '@/components/ProductList/ProductList';
import Partners from '@/components/Partners/Partners';
import InteractiveMapWrapper from '@/components/InteractiveMap/InteractiveMapWrapper';
import JoinUs from '@/components/JoinUs/JoinUs';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { EssentielIntro, EssentielCarousel, EssentielPoints } from '@/components/EssentielBlocks/EssentielBlocks';
import { ProHero, ProSteps } from '@/components/ProBlocks/ProBlocks';
import { UsagesIntro, UsagesCarouselBlock, UsagesWarning, UsagesEssentialBox } from '@/components/UsagesBlocks/UsagesBlocks';
import { TransparenceHeader, TransparenceQuote, TransparenceFeature, TransparenceCertificates } from '@/components/TransparenceBlocks/TransparenceBlocks';
import { RecrutementText, RecrutementJobs, RecrutementContact } from '@/components/RecrutementBlocks/RecrutementBlocks';
import DeliverySteps from '@/components/LivraisonBlocks/DeliverySteps';
import ContactFormBlock from '@/components/ContactFormBlock/ContactFormBlock';
import NewsletterBlock from '@/components/NewsletterBlock/NewsletterBlock';
import TitleBlock from '@/components/TitleBlock/TitleBlock';
import { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { SessionProvider } from "next-auth/react";

function IFramePreview({ children, style }) {
    const iframeRef = useRef();
    const [mountNode, setMountNode] = useState(null);

    useEffect(() => {
        const doc = iframeRef.current?.contentDocument;
        if (doc) {
            const head = doc.head;
            
            const copyNodes = (nodes) => {
                nodes.forEach(el => {
                    if (el.tagName === 'STYLE' || (el.tagName === 'LINK' && el.rel === 'stylesheet')) {
                        const clone = el.cloneNode(true);
                        head.appendChild(clone);
                    }
                });
            };

            // 1. Initial copy
            copyNodes(document.head.querySelectorAll('style, link[rel="stylesheet"]'));

            // 2. Observe future additions (for dynamic imports CSS)
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length) {
                        copyNodes(Array.from(mutation.addedNodes));
                    }
                });
            });

            observer.observe(document.head, { childList: true });

            // Add a base style to match the body
            const baseStyle = doc.createElement('style');
            baseStyle.innerHTML = `
                body { margin: 0; background-color: var(--background-light, #e3fff8); overflow-x: hidden; }
                * { box-sizing: border-box; }
            `;
            head.appendChild(baseStyle);
            
            // Copy parent body classes for next/font to work
            doc.body.className = document.body.className;
            
            setMountNode(doc.body);

            return () => observer.disconnect();
        }
    }, []);

    return (
        <iframe ref={iframeRef} style={style} frameBorder="0">
            {mountNode && createPortal(<SessionProvider>{children}</SessionProvider>, mountNode)}
        </iframe>
    );
}


const PREVIEW_COMPONENTS = {
    TitleBlock,
    ContentHero,
    RichText,
    ImageBlock,
    Quote,
    FAQ,
    CTABlock,
    TwoColumns,
    CardsGrid,
    ImageCardsGrid,
    IconSummary,
    StatsBanner,
    VideoEmbed,
    Divider,
    AuthorCard,
    CalloutBox,
    RelatedArticles,
    LatestArticlesBlock: LatestArticlesPreview,
    TableOfContents,
    FeaturedProducts: FeaturedProductsPreview,
    Marquee,
    OfferComparator,
    PartnersNetwork,
    QualityBanner,
    WhyChooseUs,
    CodeEmbed,
    ContactFormBlock,
    NewsletterBlock,
    Hero,
    ProductList,
    Partners,
    InteractiveMap: InteractiveMapWrapper,
    SearchBarBlock: dynamic(() => import('@/components/SearchBar/SearchBarBlock')),
    StoreLocatorWidget: dynamic(() => import('@/components/StoreLocator/StoreLocatorWidget'), { ssr: false }),
    JoinUs,
    Header,
    Footer,
    EssentielIntro,
    EssentielCarousel,
    EssentielPoints,
    ProHero,
    ProSteps,
    UsagesIntro,
    UsagesCarouselBlock,
    UsagesWarning,
    UsagesEssentialBox,
    TransparenceHeader,
    TransparenceQuote,
    TransparenceFeature,
    TransparenceCertificates,
    RecrutementText,
    RecrutementJobs,
    RecrutementContact,
    DeliverySteps
};

const LivePreview = memo(function LivePreview({ 
    sections = [], 
    activeIndex = null, 
    onSelect,
    onMove,
    onDuplicate,
    onDelete,
    onUpdateProps,
    onReorder,
    isFullscreen,
    setIsFullscreen,
    pageKey
}) {
    if (!sections.length) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', gap: '12px' }}>
                <span style={{ fontSize: '3rem' }}>🖼️</span>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>Ajoutez des blocs pour voir la preview</p>
            </div>
        );
    }

    const [previewMode, setPreviewMode] = useState('desktop');
    const [desktopSize, setDesktopSize] = useState({ width: 1280, height: 800, label: 'MacBook Air' });
    const [mobileSize, setMobileSize] = useState({ width: 390, height: 844, label: 'iPhone 14' });
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const desktopOptions = [
        { width: 1280, height: 800, label: 'MacBook Air' },
        { width: 1440, height: 900, label: 'MacBook Pro 15"' },
        { width: 1920, height: 1080, label: 'Écran 1080p' }
    ];

    const mobileOptions = [
        { width: 375, height: 667, label: 'iPhone SE' },
        { width: 390, height: 844, label: 'iPhone 14' },
        { width: 430, height: 932, label: 'iPhone 14 Pro Max' },
        { width: 768, height: 1024, label: 'iPad (Portrait)' }
    ];

    const hasHeader = sections.some(s => s.type === 'Header');
    const hasFooter = sections.some(s => s.type === 'Footer');

    const defaultHeaderProps = {
        logoText: "LES AMIS DU CBD",
        logoImage: "/images/logo.webp",
        menuItems: [
            { label: "PRODUITS", href: "#" },
            { label: "L'ESSENTIEL", href: "#" },
            { label: "CBD & USAGES", href: "#" },
            { label: "PROFESSIONNEL", href: "#" }
        ]
    };

    const defaultFooterProps = {
        columnLinks: [
            { label: "Livraison", href: "#" },
            { label: "CGV", href: "#" },
            { label: "Politique de confidentialité", href: "#" }
        ],
        contactInfo: {
            title: "Les Amis du CBD France",
            address: "25 rue principale 07120 Chauzon (FR)",
            phone: "06 71 82 42 87",
            email: "lesamisducbd@gmail.com"
        },
        newsletter: { placeholder: "Votre adresse e-mail", isVisible: true }
    };

    // Calcul des styles de la frame de preview
    let frameStyles = { 
        background: '#fff', 
        minHeight: '100%', 
        display: 'block',
        marginTop: '0px',
        marginBottom: '0px',
        marginLeft: 'auto',
        marginRight: 'auto',
        transition: 'all 0.3s' 
    };
    
    let scale = 1;
    let scaledWidth = 0;
    let scaledHeight = 0;

    if (previewMode === 'desktop') {
        const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 500 : 1000;
        const containerHeight = typeof window !== 'undefined' ? window.innerHeight - 320 : 800;
        const scaleX = (containerWidth - 60) / (desktopSize.width + 24);
        const scaleY = (containerHeight - 60) / (desktopSize.height + 36);
        
        scale = Math.min(1, scaleX, scaleY);
        scaledWidth = (desktopSize.width + 24) * scale;
        scaledHeight = (desktopSize.height + 36) * scale;
        
        frameStyles = { 
            ...frameStyles, 
            width: `${desktopSize.width}px`, 
            height: `${desktopSize.height}px`,
            border: '12px solid #222',
            borderBottomWidth: '24px',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            overflow: 'hidden'
        };
    } else if (previewMode === 'mobile') {
        const containerHeight = typeof window !== 'undefined' ? window.innerHeight - 320 : 800;
        const scaleY = (containerHeight - 40) / (mobileSize.height + 28);
        scale = Math.min(0.9, scaleY);
        
        scaledWidth = (mobileSize.width + 28) * scale;
        scaledHeight = (mobileSize.height + 28) * scale;
        
        frameStyles = { 
            ...frameStyles, 
            width: `${mobileSize.width}px`, 
            height: `${mobileSize.height}px`, 
            borderRadius: '40px', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)', 
            border: '14px solid #111',
            position: 'relative',
            overflow: 'hidden'
        };
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto', background: '#e5e7eb', position: 'relative' }}>
            <div style={{ position: 'sticky', top: '12px', left: '0', right: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 50, pointerEvents: 'none' }}>
                <div style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '99px', display: 'flex', gap: '6px', pointerEvents: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', alignItems: 'center' }}>
                    <button onClick={() => setPreviewMode('desktop')} style={{ background: previewMode === 'desktop' ? '#fff' : 'transparent', color: previewMode === 'desktop' ? '#000' : '#fff', border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>💻 PC (Mac)</button>
                    <button onClick={() => setPreviewMode('mobile')} style={{ background: previewMode === 'mobile' ? '#fff' : 'transparent', color: previewMode === 'mobile' ? '#000' : '#fff', border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>📱 Mobile (iPhone)</button>
                    
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', height: '16px', margin: '0 4px' }}></div>
                    
                    <div style={{ position: 'relative' }}>
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '6px 16px', 
                                borderRadius: '99px', 
                                fontSize: '0.8rem', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            {previewMode === 'desktop' 
                                ? (desktopOptions.find(o => o.width === desktopSize.width && o.height === desktopSize.height)?.label || 'Personnalisé...') 
                                : (mobileOptions.find(o => o.width === mobileSize.width && o.height === mobileSize.height)?.label || 'Personnalisé...')}
                            <span style={{ fontSize: '0.6rem', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                        </button>
                        
                        {dropdownOpen && (
                            <>
                                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={() => setDropdownOpen(false)}></div>
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '100%', 
                                    left: '0',
                                    marginTop: '8px', 
                                    background: '#1a1a1a', 
                                    borderRadius: '12px', 
                                    padding: '6px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                    zIndex: 100,
                                    width: '220px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {(previewMode === 'desktop' ? desktopOptions : mobileOptions).map(o => (
                                        <button 
                                            key={o.width}
                                            onClick={() => {
                                                if (previewMode === 'desktop') setDesktopSize(o);
                                                else setMobileSize(o);
                                                setDropdownOpen(false);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#fff',
                                                padding: '8px 12px',
                                                textAlign: 'left',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <span style={{ fontWeight: 600 }}>{o.label}</span>
                                            <span style={{ opacity: 0.5, fontSize: '0.7rem', marginTop: '2px' }}>{o.width}x{o.height}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '99px' }}>
                        <input 
                            type="number" 
                            title="Largeur"
                            value={previewMode === 'desktop' ? desktopSize.width : mobileSize.width}
                            onChange={e => {
                                const val = +e.target.value || 0;
                                if (previewMode === 'desktop') setDesktopSize({...desktopSize, width: val, label: 'Custom'});
                                else setMobileSize({...mobileSize, width: val, label: 'Custom'});
                            }}
                            style={{ width: '45px', background: 'transparent', color: '#fff', border: 'none', fontSize: '0.8rem', textAlign: 'center', outline: 'none' }}
                        />
                        <span style={{ color: '#fff', fontSize: '0.8rem', opacity: 0.5 }}>x</span>
                        <input 
                            type="number" 
                            title="Hauteur"
                            value={previewMode === 'desktop' ? desktopSize.height : mobileSize.height}
                            onChange={e => {
                                const val = +e.target.value || 0;
                                if (previewMode === 'desktop') setDesktopSize({...desktopSize, height: val, label: 'Custom'});
                                else setMobileSize({...mobileSize, height: val, label: 'Custom'});
                            }}
                            style={{ width: '45px', background: 'transparent', color: '#fff', border: 'none', fontSize: '0.8rem', textAlign: 'center', outline: 'none' }}
                        />
                    </div>

                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', height: '16px', margin: '0 4px' }}></div>
                    
                    <button onClick={() => setIsFullscreen(!isFullscreen)} 
                        title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
                        style={{ background: isFullscreen ? '#00FF94' : 'transparent', color: isFullscreen ? '#000' : '#fff', border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                        {isFullscreen ? '↙️ Quitter' : '↗️ Plein écran'}
                    </button>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '4px 12px', borderRadius: '99px', fontSize: '0.7rem', color: '#333', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    ℹ️ Mobile / Tablette : jusqu'à 1024px (le menu devient un bouton ☰) — PC : à partir de 1025px
                </div>
            </div>

            {(() => {
                const renderSection = (section, i) => {
                    const Component = PREVIEW_COMPONENTS[section.type];
                    const isActive = activeIndex === i;
                    const isHidden = section.props?.isVisible === false;

                    const { paddingTop, paddingBottom, marginTop, marginBottom, hideMobile, hideDesktop, sectionId, ...componentProps } = section.props || {};

                    const paddingMap = { none: '0px', small: '20px', medium: '40px', large: '80px', xl: '120px' };
                    const marginMap = { 'negative-large': '-80px', 'negative-medium': '-40px', 'negative-small': '-20px', none: '0px', small: '20px', medium: '40px', large: '80px', xl: '120px' };

                    const wrapperStyle = {
                        position: 'relative',
                        cursor: 'pointer',
                        outline: isActive ? '3px solid #00FF94' : '2px solid transparent',
                        outlineOffset: isActive ? '2px' : '0',
                        opacity: isHidden ? 0.35 : 1,
                        transition: 'outline 0.15s, opacity 0.2s',
                    };
                    if (paddingTop && paddingMap[paddingTop]) wrapperStyle.paddingTop = paddingMap[paddingTop];
                    if (paddingBottom && paddingMap[paddingBottom]) wrapperStyle.paddingBottom = paddingMap[paddingBottom];
                    if (marginTop && marginMap[marginTop]) wrapperStyle.marginTop = marginMap[marginTop];
                    if (marginBottom && marginMap[marginBottom]) wrapperStyle.marginBottom = marginMap[marginBottom];

                    return (
                        <div
                            key={section.id || i}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', i.toString());
                                e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                if (!isNaN(fromIndex) && fromIndex !== i && onReorder) {
                                    onReorder(fromIndex, i);
                                }
                            }}
                            onClick={() => onSelect(i)}
                            style={wrapperStyle}
                        >
                            {isActive && (
                                <div style={{ position: 'absolute', top: -34, right: 16, background: '#1F4B40', borderRadius: '8px 8px 0 0', display: 'flex', zIndex: 100, overflow: 'hidden', boxShadow: '0 -4px 12px rgba(0,0,0,0.1)' }}>
                                    <button onClick={(e) => { e.stopPropagation(); onMove(i, -1); }} disabled={i === 0} style={{ padding: '6px 10px', background: 'none', border: 'none', color: i === 0 ? '#555' : '#fff', cursor: i === 0 ? 'default' : 'pointer' }} title="Monter">▲</button>
                                    <button onClick={(e) => { e.stopPropagation(); onMove(i, 1); }} disabled={i === sections.length - 1} style={{ padding: '6px 10px', background: 'none', border: 'none', color: i === sections.length - 1 ? '#555' : '#fff', cursor: i === sections.length - 1 ? 'default' : 'pointer' }} title="Descendre">▼</button>
                                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(i); }} style={{ padding: '6px 10px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} title="Dupliquer">📋</button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(i); }} style={{ padding: '6px 10px', background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }} title="Supprimer">🗑</button>
                                </div>
                            )}

                            {isActive && (section.type === 'TwoColumns' || section.type === 'ImageBlock') && (
                                <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', background: '#1F4B40', padding: '8px 20px', borderRadius: '99px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
                                    <span style={{ color: '#00FF94', fontSize: '0.8rem', fontWeight: 600 }}>Taille Image</span>
                                    <input 
                                        type="range" 
                                        min="20" max="80" 
                                        value={section.props?.imageWidth || 50} 
                                        onChange={(e) => onUpdateProps(i, { imageWidth: parseInt(e.target.value) })}
                                        style={{ width: '150px', cursor: 'ew-resize' }}
                                    />
                                    <span style={{ color: '#fff', fontSize: '0.8rem', minWidth: '32px' }}>{section.props?.imageWidth || 50}%</span>
                                </div>
                            )}

                            {isHidden && (
                                <div style={{ position: 'absolute', top: 8, left: 8, background: '#f59e0b', color: '#fff', padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, zIndex: 10, pointerEvents: 'none' }}>
                                    MASQUÉ
                                </div>
                            )}
                            {Component ? (
                                (() => {
                                    const cleanHtmlStrings = (obj) => {
                                        if (typeof obj === 'string') return obj.replace(/&nbsp;/g, ' ');
                                        if (Array.isArray(obj)) return obj.map(cleanHtmlStrings);
                                        if (typeof obj === 'object' && obj !== null) {
                                            const newObj = {};
                                            for (const key in obj) newObj[key] = cleanHtmlStrings(obj[key]);
                                            return newObj;
                                        }
                                        return obj;
                                    };

                                    const finalProps = cleanHtmlStrings({ ...componentProps });
                                    if (section.type === 'ProductList' && (!finalProps.products || finalProps.products.length === 0)) {
                                        finalProps.products = [
                                            { name: "Produit Test 1", image: "/images/hero.webp", formattedPrice: "10,00 €", slug: "test-1" },
                                            { name: "Produit Test 2", image: "/images/hero.webp", formattedPrice: "20,00 €", slug: "test-2" },
                                            { name: "Produit Test 3", image: "/images/hero.webp", formattedPrice: "30,00 €", slug: "test-3" },
                                            { name: "Produit Test 4", image: "/images/hero.webp", formattedPrice: "40,00 €", slug: "test-4" }
                                        ];
                                    }

                                    const isLegalPage = ['cgv', 'livraison', 'mentions', 'privacy'].includes(pageKey);
                                    if (isLegalPage) {
                                        if (section.type === 'ContentHero') {
                                            return (
                                                <div style={{ textAlign: 'center', marginTop: i > 0 ? '60px' : '40px', marginBottom: '60px', padding: '0 20px' }}>
                                                    <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#1F4B40', marginBottom: '12px', letterSpacing: '-0.02em', lineHeight: 1.1 }} dangerouslySetInnerHTML={{ __html: finalProps.title || "Titre" }} />
                                                    <p style={{ fontSize: '1.2rem', color: '#1F4B40', fontWeight: 500, margin: 0 }}>{finalProps.subtitle || ""}</p>
                                                </div>
                                            );
                                        }
                                        if (section.type === 'RichText') {
                                            return (
                                                <div style={{ 
                                                    maxWidth: pageKey === 'livraison' ? '800px' : '1200px', 
                                                    margin: i > 0 ? '40px auto 0' : '0 auto', 
                                                    padding: '40px', 
                                                    background: '#fff', 
                                                    borderRadius: '24px', 
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.03)', 
                                                    border: '1px solid rgba(0,0,0,0.02)',
                                                    overflowWrap: 'break-word',
                                                    color: '#1F4B40',
                                                    lineHeight: 1.7,
                                                    fontSize: '1.05rem',
                                                    fontFamily: 'inherit'
                                                }}>
                                                    <div dangerouslySetInnerHTML={{ __html: (finalProps.content || "Contenu texte libre...").replace(/&nbsp;/g, ' ') }} />
                                                </div>
                                            );
                                        }
                                    }

                                    if (section.type === 'Header') {
                                        return (
                                            <div 
                                                onClickCapture={e => { e.preventDefault(); e.stopPropagation(); }} 
                                                style={{ position: 'relative' }}
                                            >
                                                <Component {...finalProps} />
                                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, cursor: 'not-allowed' }}></div>
                                            </div>
                                        );
                                    }

                                    return <Component {...finalProps} />;
                                })()
                            ) : (
                                <div style={{ padding: '32px', textAlign: 'center', background: '#fafafa', color: '#999', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                    [{section.type}] — aperçu non disponible
                                </div>
                            )}
                        </div>
                    );
                };

                const wrappedContent = (
                    <div style={{ paddingTop: !hasHeader ? '80px' : '0' }}>
                        {!hasHeader && (
                            <div 
                                onClickCapture={e => { e.preventDefault(); e.stopPropagation(); }} 
                                style={{ opacity: 0.8, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999 }}
                            >
                                <Header {...defaultHeaderProps} />
                                {/* Invisible overlay to aggressively block all clicks even native ones */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, cursor: 'not-allowed' }}></div>
                            </div>
                        )}
                        {sections.map((section, i) => renderSection(section, i))}
                        {!hasFooter && <div style={{ opacity: 0.8, pointerEvents: 'none', marginTop: '40px' }}><Footer {...defaultFooterProps} /></div>}
                    </div>
                );

                return (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ width: scaledWidth, height: scaledHeight, position: 'relative' }}>
                            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                                {previewMode === 'mobile' ? (
                                    <div style={frameStyles}>
                                        {/* iPhone Notch */}
                                        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: '25px', background: '#111', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 9999 }}></div>
                                        <IFramePreview style={{ width: '100%', height: '100%', border: 'none', borderRadius: '26px' }}>
                                            {wrappedContent}
                                        </IFramePreview>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={frameStyles}>
                                            <IFramePreview style={{ width: '100%', height: '100%', border: 'none' }}>
                                                {wrappedContent}
                                            </IFramePreview>
                                        </div>
                                        <div style={{ background: '#ddd', height: '12px', width: '20%', margin: '0 auto', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.1)' }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
});

export default LivePreview;
