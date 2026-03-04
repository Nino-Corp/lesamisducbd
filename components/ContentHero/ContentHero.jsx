import React from 'react';
import Image from 'next/image';
import styles from './ContentHero.module.css';

export default function ContentHero({ title, children, imageSrc, imageAlt, imagePosition = "center" }) {
    return (
        <section className={styles.heroSection}>
            <div className={styles.heroContainer}>
                <div className={styles.heroContent}>
                    {title && <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: title }} />}
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
                        <div className={styles.overlay} />
                    </div>
                )}
            </div>
        </section>
    );
}
