import React from 'react';
import Image from 'next/image';
import styles from './ContentHero.module.css';

export default function ContentHero({ title, subtitle, children, imageSrc, imageAlt, imagePosition = "center", textAlign = "center", overlayOpacity = 50 }) {
    return (
        <section className={styles.heroSection}>
            <div className={styles.heroContainer}>
                <div className={styles.heroContent} style={{ textAlign }}>
                    {title && <h1 className={styles.title} dangerouslySetInnerHTML={{ 
                        __html: title.replace(/<\/?(p|h[1-6]|div)[^>]*>/gi, '') 
                    }} />}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    {children}
                </div>
                {imageSrc && (
                    <div className={styles.heroImageWrapper}>
                        <Image
                            src={imageSrc}
                            alt={imageAlt || title || "Hero background"}
                            className={styles.heroImage}
                            fill
                            priority
                            sizes="100vw"
                            style={{ objectPosition: imagePosition, objectFit: 'cover' }}
                        />
                        <div className={styles.overlay} style={{ opacity: overlayOpacity / 100 }} />
                    </div>
                )}
            </div>
        </section>
    );
}
