import styles from './CTABlock.module.css';
import Link from 'next/link';

export default function CTABlock({
    title = "Prêt à nous rejoindre ?",
    subtitle = "",
    buttonText = "Découvrir nos produits",
    buttonLink = "/produits",
    buttonSecondaryText = "",
    buttonSecondaryLink = "",
    backgroundColor = "#1F4B40",
    textColor = "#ffffff",
    accentColor = "#00FF94",
    alignment = "center",
    headingTag = "h2"
}) {
    const Tag = headingTag;
    return (
        <section className={styles.section}>
            <div className={styles.bubble} style={{ backgroundColor, textAlign: alignment }}>
                <Tag className={styles.title} style={{ color: textColor }}>{title}</Tag>
                {subtitle && <p className={styles.subtitle} style={{ color: textColor }}>{subtitle}</p>}
                <div className={styles.buttons}>
                    <Link
                        href={buttonLink || '#'}
                        className={styles.primaryBtn}
                        style={{ background: accentColor, color: backgroundColor }}
                    >
                        {buttonText}
                    </Link>
                    {buttonSecondaryText && (
                        <Link
                            href={buttonSecondaryLink || '#'}
                            className={styles.secondaryBtn}
                            style={{ color: accentColor, borderColor: accentColor + '66' }}
                        >
                            {buttonSecondaryText}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
