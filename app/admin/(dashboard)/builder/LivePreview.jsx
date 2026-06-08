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
import StatsBanner from '@/components/StatsBanner/StatsBanner';
import VideoEmbed from '@/components/VideoEmbed/VideoEmbed';
import Divider from '@/components/Divider/Divider';
import AuthorCard from '@/components/AuthorCard/AuthorCard';
import CalloutBox from '@/components/CalloutBox/CalloutBox';
import RelatedArticles from '@/components/RelatedArticles/RelatedArticles';
import TableOfContents from '@/components/TableOfContents/TableOfContents';
import FeaturedProducts from '@/components/FeaturedProducts/FeaturedProducts';
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
import { useState, memo, useMemo } from 'react';

const PREVIEW_COMPONENTS = {
    ContentHero,
    RichText,
    ImageBlock,
    Quote,
    FAQ,
    CTABlock,
    TwoColumns,
    CardsGrid,
    StatsBanner,
    VideoEmbed,
    Divider,
    AuthorCard,
    CalloutBox,
    RelatedArticles,
    TableOfContents,
    FeaturedProducts,
    Marquee,
    OfferComparator,
    PartnersNetwork,
    QualityBanner,
    WhyChooseUs,
    CodeEmbed,
    Hero,
    ProductList,
    Partners,
    InteractiveMap: InteractiveMapWrapper,
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
    TransparenceCertificates
};

const LivePreview = memo(function LivePreview({ 
    sections = [], 
    activeIndex = null, 
    onSelect,
    onMove,
    onDuplicate,
    onUpdateProps,
    onReorder,
    isFullscreen,
    setIsFullscreen
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

    // Calcul des styles de la frame de preview
    let frameStyles = { 
        background: '#fff', 
        minHeight: '100%', 
        marginTop: '0px',
        marginBottom: '0px',
        marginLeft: 'auto',
        marginRight: 'auto',
        transition: 'all 0.3s' 
    };
    
    if (previewMode === 'desktop') {
        frameStyles = { ...frameStyles, transform: 'scale(0.75)', transformOrigin: 'top center', width: '133%', marginLeft: '-16.5%' };
    } else if (previewMode === 'tablet') {
        frameStyles = { ...frameStyles, width: '768px', marginTop: '40px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' };
    } else if (previewMode === 'mobile') {
        frameStyles = { ...frameStyles, width: '375px', height: '667px', overflowY: 'auto', marginTop: '40px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '8px solid #333' };
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto', background: '#e5e7eb', position: 'relative' }}>
            {/* Barre de sélection Responsive */}
            <div style={{ position: 'sticky', top: '12px', left: '0', right: '0', display: 'flex', justifyContent: 'center', zIndex: 50, pointerEvents: 'none' }}>
                <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '4px', borderRadius: '99px', display: 'flex', gap: '4px', pointerEvents: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', alignItems: 'center' }}>
                    <button onClick={() => setPreviewMode('desktop')} style={{ background: previewMode === 'desktop' ? '#fff' : 'transparent', color: previewMode === 'desktop' ? '#000' : '#fff', border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>💻 PC</button>
                    <button onClick={() => setPreviewMode('tablet')} style={{ background: previewMode === 'tablet' ? '#fff' : 'transparent', color: previewMode === 'tablet' ? '#000' : '#fff', border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>📱 Tablette</button>
                    <button onClick={() => setPreviewMode('mobile')} style={{ background: previewMode === 'mobile' ? '#fff' : 'transparent', color: previewMode === 'mobile' ? '#000' : '#fff', border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>📱 Mobile</button>
                    
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', height: '16px', margin: '0 4px' }}></div>
                    
                    <button onClick={() => setIsFullscreen(!isFullscreen)} 
                        title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
                        style={{ background: isFullscreen ? '#00FF94' : 'transparent', color: isFullscreen ? '#000' : '#fff', border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                        {isFullscreen ? '↙️ Quitter' : '↗️ Plein écran'}
                    </button>
                </div>
            </div>

            <div style={frameStyles}>
                {sections.map((section, i) => {
                    const Component = PREVIEW_COMPONENTS[section.type];
                    const isActive = activeIndex === i;
                    const isHidden = section.props?.isVisible === false;

                    const { paddingTop, paddingBottom, hideMobile, hideDesktop, sectionId, ...componentProps } = section.props || {};

                    const paddingMap = { none: '0px', small: '20px', medium: '40px', large: '80px', xl: '120px' };
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
                                    const finalProps = { ...componentProps };
                                    if (section.type === 'ProductList' && (!finalProps.products || finalProps.products.length === 0)) {
                                        finalProps.products = [
                                            { name: "Produit Test 1", image: "/images/hero.webp", formattedPrice: "10,00 €", slug: "test-1" },
                                            { name: "Produit Test 2", image: "/images/hero.webp", formattedPrice: "20,00 €", slug: "test-2" },
                                            { name: "Produit Test 3", image: "/images/hero.webp", formattedPrice: "30,00 €", slug: "test-3" },
                                            { name: "Produit Test 4", image: "/images/hero.webp", formattedPrice: "40,00 €", slug: "test-4" }
                                        ];
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
                })}
            </div>
        </div>
    );
});

export default LivePreview;
