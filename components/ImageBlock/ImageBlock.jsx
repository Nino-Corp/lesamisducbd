import styles from './ImageBlock.module.css';

export default function ImageBlock({ src, alt, caption, imageWidth = 100, imageAlign = "center", fullWidth = false }) {
    if (!src) return null;
    
    let jc = 'center';
    if (imageAlign === 'left') jc = 'flex-start';
    if (imageAlign === 'right') jc = 'flex-end';

    return (
        <section className={`${styles.section} ${fullWidth ? styles.fullWidthSection : ''}`}>
            <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidthWrapper : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: jc }}>
                <img src={src} alt={alt || ''} className={`${styles.image} ${fullWidth ? styles.fullWidthImage : ''}`} style={{ width: fullWidth ? '100%' : `${imageWidth}%`, maxWidth: '100%', objectFit: 'cover' }} />
                {caption && <p className={styles.caption} style={{ textAlign: imageAlign }}>{caption}</p>}
            </div>
        </section>
    );
}
