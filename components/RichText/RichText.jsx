import styles from './RichText.module.css';

export default function RichText({ content, title, textAlign = "left", maxWidth = 800, headingTag = "h2" }) {
    if (!content) return null;

    const Tag = headingTag;

    return (
        <section className={styles.section} style={{ textAlign }}>
            <div className="container" style={{ maxWidth: `${maxWidth}px`, margin: '0 auto' }}>
                {title && <Tag className={styles.title}>{title}</Tag>}
                <div
                    className={styles.content}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        </section>
    );
}
