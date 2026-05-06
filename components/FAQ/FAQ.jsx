'use client';
import { useState } from 'react';
import styles from './FAQ.module.css';

export default function FAQ({ items, title, headingTag = "h2" }) {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const Tag = headingTag;

    // Generate JSON-LD for FAQPage
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items?.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer.replace(/<[^>]+>/g, '') // strip HTML for JSON-LD
            }
        })) || []
    };

    return (
        <section className={styles.section}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            {title && <Tag className={styles.title}>{title}</Tag>}
            <div className={styles.container}>
                {items.map((item, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div key={index} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
                            <button className={styles.question} onClick={() => toggle(index)}>
                                <span>{item.question}</span>
                                <span className={styles.icon}>{isOpen ? '-' : '+'}</span>
                            </button>
                            {isOpen && (
                                <div
                                    className={styles.answer}
                                    dangerouslySetInnerHTML={{ __html: item.answer }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
