import styles from './RichText.module.css';

export default function RichText({ content, title, textAlign = "left", maxWidth = 800, headingTag = "h2", titleFontFamily = 'inherit', titleFontSize = '', titleColor = '', columnCount = 1 }) {
    if (!content) return null;

    const Tag = headingTag;

    let alignClass = '';
    if (textAlign === 'center') alignClass = styles.centered;
    if (textAlign === 'right') alignClass = styles.rightAligned;

    return (
        <section className={`${styles.section} ${alignClass}`.trim()} style={{ textAlign }}>
            <div className="container" style={{ maxWidth: isNaN(maxWidth) ? maxWidth : `${maxWidth}px`, margin: '0 auto' }}>
                {title && <Tag className={styles.title} style={{ fontFamily: titleFontFamily, fontSize: titleFontSize || undefined, color: titleColor || undefined }}>{title}</Tag>}
                <div
                    className={styles.content}
                    style={{ columnCount: columnCount, columnGap: '40px' }}
                    dangerouslySetInnerHTML={{ __html: content.replace(/&nbsp;/g, ' ') }}
                />
            </div>
        </section>
    );
}
