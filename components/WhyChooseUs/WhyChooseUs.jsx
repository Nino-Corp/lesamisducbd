import Link from 'next/link';
import Image from 'next/image';
import styles from './WhyChooseUs.module.css';

export default function WhyChooseUs({ title, features, ctaLabel, ctaLink = "/essentiel", imageSrc = "/images/whychooseus/Scientist.webp", imageAlt = "Expert Les Amis du CBD", isReversed = false }) {
    return (
        <section className={`${styles.section} ${isReversed ? styles.reversed : ''}`}>
            <div className={`${styles.container} ${isReversed ? styles.containerReversed : ''}`}>
                <div className={styles.imageCol}>
                    <div className={styles.imageWrapper}>
                        <Image
                            src={imageSrc}
                            alt={imageAlt}
                            width={800}
                            height={1000}
                            className={styles.scientistImage}
                            priority
                        />
                    </div>
                </div>

                <h2 className={styles.title}>{title}</h2>
                <div className={styles.list}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.item}>
                            <h3 className={styles.itemTitle}>{feature.title}</h3>
                            <div className={styles.itemDesc} dangerouslySetInnerHTML={{ __html: feature.description }} />
                        </div>
                    ))}
                </div>
                {ctaLabel && (
                    <Link href={ctaLink} className={styles.cta}>
                        {ctaLabel}
                    </Link>
                )}
            </div>
        </section>
    );
}
