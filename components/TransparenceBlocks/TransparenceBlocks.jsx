'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Star, BadgeEuro, ShieldCheck, FileText } from 'lucide-react';
import useLockBodyScroll from '@/hooks/useLockBodyScroll';
import styles from './TransparenceBlocks.module.css';

// Mini Markdown parser for Columns: line starting with "-" or "*" becomes <li>, else <p>
function renderTextLines(textBlocks) {
    if (!textBlocks) return null;
    const lines = textBlocks.split('\n');
    let listItems = [];
    const elements = [];

    lines.forEach((line, idx) => {
        const t = line.trim();
        if (t.startsWith('-') || t.startsWith('*')) {
            listItems.push(<li key={`li-${idx}`}>{t.substring(1).trim()}</li>);
        } else {
            if (listItems.length > 0) {
                elements.push(<ul key={`ul-${idx}`}>{listItems}</ul>);
                listItems = [];
            }
            if (t.length > 0) {
                elements.push(<p key={`p-${idx}`}>{t}</p>);
            }
        }
    });

    if (listItems.length > 0) {
        elements.push(<ul key={`ul-end`}>{listItems}</ul>);
    }

    return <>{elements}</>;
}

export function TransparenceHeader({ title, subtitle }) {
    if (!title && !subtitle) return null;
    return (
        <div className={styles.header}>
            {title && <h1 className={styles.title}>{title}</h1>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
    );
}

export function TransparenceQuote({ text, author, image }) {
    if (!text && !author) return null;
    return (
        <section className={styles.introSection}>
            <div className={styles.profileWrapper}>
                <Image
                    src={image || "/images/nelson.png"}
                    alt={author || "Auteur"}
                    fill
                    className={styles.profileImage}
                />
            </div>
            <div className={styles.quoteBlock}>
                {text && text.split('\n').map((line, i) => (
                    <p key={i} className={styles.quoteText} style={{ marginBottom: '1rem' }}>
                        {line}
                    </p>
                ))}
                {author && <p className={styles.quoteAuthor}>{author}</p>}
            </div>
        </section>
    );
}

const ICONS = {
    star: Star,
    badgeEuro: BadgeEuro,
    shieldCheck: ShieldCheck,
    fileText: FileText
};

export function TransparenceFeature({ title, icon, col1, col2 }) {
    if (!title && !col1?.title && !col2?.title) return null;
    const Icon = ICONS[icon] || Star;
    return (
        <section className={styles.featureSection}>
            {title && (
                <div className={styles.sectionHeader}>
                    <div className={styles.iconCircle}><Icon size={40} /></div>
                    <h2>{title}</h2>
                </div>
            )}
            <div className={styles.columns}>
                <div className={styles.column}>
                    {col1?.title && <h3>{col1.title}</h3>}
                    {renderTextLines(col1?.text)}
                </div>
                <div className={styles.column}>
                    {col2?.title && <h3>{col2.title}</h3>}
                    {renderTextLines(col2?.text)}
                </div>
            </div>
        </section>
    );
}

export function TransparenceCertificates({ title, items }) {
    const [selectedImage, setSelectedImage] = useState(null);
    useLockBodyScroll(!!selectedImage);

    if (!items || !items.length) return null;

    return (
        <>
            <section className={styles.featureSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.iconCircle}><ShieldCheck size={40} /></div>
                    <h2>Sécurité</h2>
                </div>

                {title && <h3 className={styles.certifTitle}>{title}</h3>}

                <div className={styles.galleryGrid}>
                    {items.filter(c => c.src).map((analyse, idx) => (
                        <div
                            key={idx}
                            className={styles.imageCard}
                            onClick={() => setSelectedImage(analyse)}
                        >
                            <div className={styles.imageWrapper}>
                                {analyse.src.toLowerCase().endsWith('.pdf') ? (
                                    <iframe
                                        src={`${analyse.src}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                        title={analyse.alt || 'Certificat PDF'}
                                        className={styles.pdfThumbnail}
                                        tabIndex={-1}
                                    />
                                ) : (
                                    <Image
                                        src={analyse.src}
                                        alt={analyse.alt || 'Certificat analyse'}
                                        fill
                                        className={styles.image}
                                    />
                                )}
                            </div>
                            <div className={styles.imageCaption}>
                                {analyse.label}
                            </div>
                        </div>
                    ))}
                    {items.filter(c => c.src).length === 0 && (
                        <p style={{ textAlign: 'center', width: '100%', padding: '2rem' }}>Aucun certificat publié.</p>
                    )}
                </div>
            </section>

            {/* Lightbox / Modal for viewing full document */}
            {selectedImage && selectedImage.src && (
                <div className={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
                    <button
                        className={styles.modalClose}
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                        aria-label="Fermer"
                    >
                        <X size={40} />
                    </button>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {selectedImage.src.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                                src={selectedImage.src}
                                className={styles.modalIframe}
                                title={selectedImage.alt || 'Certificat PDF'}
                            />
                        ) : (
                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.alt || 'Certificat'}
                                fill
                                className={styles.modalImage}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
