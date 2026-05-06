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
};

export default function LivePreview({ sections = [], activeIndex = null, onSelect }) {
    if (!sections.length) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', gap: '12px' }}>
                <span style={{ fontSize: '3rem' }}>🖼️</span>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>Ajoutez des blocs pour voir la preview</p>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto', background: '#f5f5f5' }}>
            <div style={{ background: '#fff', minHeight: '100%', transform: 'scale(0.75)', transformOrigin: 'top center', width: '133%', marginLeft: '-16.5%' }}>
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
                            onClick={() => onSelect(i)}
                            style={wrapperStyle}
                        >
                            {isActive && (
                                <div style={{ position: 'absolute', top: 8, right: 8, background: '#00FF94', color: '#1F4B40', padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, zIndex: 10, pointerEvents: 'none' }}>
                                    ACTIF
                                </div>
                            )}
                            {isHidden && (
                                <div style={{ position: 'absolute', top: 8, left: 8, background: '#f59e0b', color: '#fff', padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, zIndex: 10, pointerEvents: 'none' }}>
                                    MASQUÉ
                                </div>
                            )}
                            {Component ? (
                                <Component {...componentProps} />
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
}
