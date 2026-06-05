import styles from './TwoColumns.module.css';
import Image from 'next/image';

export default function TwoColumns({
    title = "",
    text = "<p>Votre texte ici...</p>",
    imageSrc = "",
    imageAlt = "",
    imagePosition = "right",
    imageWidth = 50,
    backgroundColor = "#ffffff",
    buttonText = "",
    buttonLink = "",
    headingTag = "h2"
}) {
    const isReversed = imagePosition === 'left';
    const imgPct = Math.min(80, Math.max(20, Number(imageWidth) || 50));
    const textPct = 100 - imgPct;
    const Tag = headingTag;

    return (
        <section className={styles.section}>
            <div className={`${styles.bubble} ${isReversed ? styles.reversed : ''}`} style={{ backgroundColor }}>
                <div
                    className={styles.inner}
                    style={{ '--text-cols': `${textPct}fr`, '--img-cols': `${imgPct}fr` }}
                >
                    <div className={styles.textCol}>
                        {title && <Tag className={styles.title}>{title}</Tag>}
                        <div className={styles.text} dangerouslySetInnerHTML={{ __html: text.replace(/&nbsp;/g, ' ') }} />
                        {buttonText && (
                            <a href={buttonLink || '#'} className={styles.btn}>{buttonText}</a>
                        )}
                    </div>
                    <div className={styles.imageCol}>
                        {imageSrc ? (
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={imageSrc}
                                    alt={imageAlt || title || ''}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        ) : (
                            <div className={styles.imagePlaceholder} />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
