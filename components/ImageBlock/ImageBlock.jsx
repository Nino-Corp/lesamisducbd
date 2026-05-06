import styles from './ImageBlock.module.css';

export default function ImageBlock({ src, alt, caption, imageWidth = 100, imageAlign = "center" }) {
    if (!src) return null;
    
    let jc = 'center';
    if (imageAlign === 'left') jc = 'flex-start';
    if (imageAlign === 'right') jc = 'flex-end';

    return (
        <section className={styles.section}>
            <div className={styles.wrapper} style={{ display: 'flex', flexDirection: 'column', alignItems: jc }}>
                <img src={src} alt={alt || ''} className={styles.image} style={{ width: `${imageWidth}%`, maxWidth: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                {caption && <p className={styles.caption} style={{ textAlign: imageAlign }}>{caption}</p>}
            </div>
        </section>
    );
}
