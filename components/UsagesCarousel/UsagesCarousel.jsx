'use client';

import React from 'react';
import Image from 'next/image';
import styles from './UsagesCarousel.module.css';

export default function UsagesCarousel({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <div className={styles.carouselWrapper}>
            <div className={styles.carousel}>
                {items.map((item, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.imageWrapper}>
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <div className={styles.cardText} dangerouslySetInnerHTML={{ __html: item.description || '' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
