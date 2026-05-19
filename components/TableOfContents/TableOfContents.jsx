'use client';
import { useState } from 'react';
import styles from './TableOfContents.module.css';

export default function TableOfContents({ title = 'Sommaire', items = [] }) {
    const [isOpen, setIsOpen] = useState(true);
    if (!items || items.length === 0) return null;

    return (
        <nav className={styles.wrapper} aria-label="Table des matières">
            <div className={styles.container}>
                <button className={styles.toggle} onClick={() => setIsOpen(o => !o)} aria-expanded={isOpen}>
                    <span className={styles.toggleIcon}>📋</span>
                    <span className={styles.toggleTitle}>{title}</span>
                    <span className={styles.arrow} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </button>
                {isOpen && (
                    <ol className={styles.list}>
                        {items.map((item, i) => (
                            <li key={i} className={`${styles.item} ${item.level === 3 ? styles.subItem : ''}`}>
                                <a href={`#${item.anchor}`} className={styles.link}>
                                    <span className={styles.num}>{i + 1}.</span>
                                    {item.text}
                                </a>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </nav>
    );
}
