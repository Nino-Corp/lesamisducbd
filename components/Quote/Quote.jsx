import styles from './Quote.module.css';

export default function Quote({ text, author, textAlign = "center" }) {
    return (
        <section className={styles.section} style={{ textAlign }}>
            <div className={styles.container}>
                <blockquote className={styles.quote} dangerouslySetInnerHTML={{ __html: text }}>
                </blockquote>
                <cite className={styles.author}>{author}</cite>
            </div>
        </section>
    );
}
