import styles from './VideoEmbed.module.css';

function getEmbedUrl(url) {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    if (url.includes('embed')) return url;
    return null;
}

export default function VideoEmbed({
    url = "",
    title = "",
    caption = "",
    aspectRatio = "16/9",
    backgroundColor = "#1F4B40",
    videoWidth = 100,
    videoAlign = "center"
}) {
    const embedUrl = getEmbedUrl(url);

    let jc = 'center';
    if (videoAlign === 'left') jc = 'flex-start';
    if (videoAlign === 'right') jc = 'flex-end';

    return (
        <section className={styles.section}>
            <div className={styles.bubble} style={{ backgroundColor, display: 'flex', flexDirection: 'column', alignItems: jc }}>
                {title && <h2 className={styles.title} style={{ color: '#fff', textAlign: videoAlign, width: '100%' }}>{title}</h2>}
                <div className={styles.videoWrapper} style={{ aspectRatio, width: `${videoWidth}%` }}>
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            title={title || "Vidéo"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className={styles.iframe}
                        />
                    ) : (
                        <div className={styles.placeholder}>
                            <span>🎥</span>
                            <p>Collez une URL YouTube ou Vimeo</p>
                        </div>
                    )}
                </div>
                {caption && <p className={styles.caption} style={{ color: '#fff', textAlign: videoAlign, width: '100%' }}>{caption}</p>}
            </div>
        </section>
    );
}
