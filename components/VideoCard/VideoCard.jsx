'use client';

import { useState, useEffect } from 'react';
import styles from './VideoCard.module.css';
import { Pin } from 'lucide-react';

function getEmbedUrl(url, autoplay = true) {
    if (!url) return null;
    const ap = autoplay ? 1 : 0;
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?]+)/);
    if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=${ap}&rel=0`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${ap}`;
    }
    if (url.includes('embed')) {
        return url.includes('?') ? `${url}&autoplay=${ap}` : `${url}?autoplay=${ap}`;
    }
    return url;
}

export default function VideoCard({
    embedType = 'video',
    embedCode = '',
    aspectRatio = '16/9',
    videoUrl = '',
    thumbnail = '',
    duration = '',
    title = 'On vous montre ?',
    showUnderline = true,
    badgeIcon = 'camera',
    buttonText = 'Voir la vidéo →',
    buttonColor = '#185A48',
    cardStyle = 'sticker',
    cardBgColor = '#FAF6EB',
    cardWidth = 520,
    rotation = -1.5,
    cornerDecoration = 'candy',
    showAnnotation = true,
    annotationText = 'Poppy vous montre comment doser le CBD dans vos recettes sans se tromper !',
    annotationPosition = 'right',
    showArrows = true,
    borderColor = '',
    annotationColor = '',
    marginTop = 'none',
    marginBottom = 'medium'
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [detectedDuration, setDetectedDuration] = useState('');

    const embedUrl = getEmbedUrl(videoUrl, true);
    const isDirectVideo = videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.includes('/video/upload/'));

    // Détection automatique de la vraie durée si non fournie dans les props
    useEffect(() => {
        if (duration) return;
        if (!videoUrl) {
            setDetectedDuration('');
            return;
        }

        let isCancelled = false;

        if (isDirectVideo) {
            const v = document.createElement('video');
            v.preload = 'metadata';
            v.src = videoUrl;
            v.onloadedmetadata = () => {
                if (!isCancelled && v.duration) {
                    const total = Math.round(v.duration);
                    const hrs = Math.floor(total / 3600);
                    const mins = Math.floor((total % 3600) / 60);
                    const secs = total % 60;
                    const pad = (n) => String(n).padStart(2, '0');
                    const fmt = hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
                    setDetectedDuration(fmt);
                }
            };
            return () => { isCancelled = true; };
        }

        fetch(`/api/video-info?url=${encodeURIComponent(videoUrl)}`)
            .then(res => res.json())
            .then(data => {
                if (!isCancelled && data.duration) {
                    setDetectedDuration(data.duration);
                }
            })
            .catch(() => {});

        return () => { isCancelled = true; };
    }, [videoUrl, duration, isDirectVideo]);

    const displayDuration = duration || detectedDuration;

    const effectiveThumbnail = (() => {
        if (thumbnail) return thumbnail;
        const ytMatch = videoUrl?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?]+)/);
        if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        return '/images/og-image.jpg';
    })();

    const formattedEmbedCode = (() => {
        if (!embedCode) return '';
        const trimmed = embedCode.trim();
        if (trimmed.startsWith('http') && !trimmed.includes('<iframe')) {
            return `<iframe src="${trimmed}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
        return trimmed;
    })();

    const handlePlay = (e) => {
        if (e) e.preventDefault();
        if (embedType === 'iframe' ? formattedEmbedCode : videoUrl) {
            setIsPlaying(true);
        }
    };

    return (
        <div className={`${styles.wrapper} ${styles[`mt_${marginTop}`] || ''} ${styles[`mb_${marginBottom}`] || ''}`}>
            <div className={`${styles.container} ${styles[`annot_${annotationPosition}`] || ''}`}>
                {/* ── 1. La Carte / Encadré Vidéo ── */}
                <div 
                    className={`${styles.card} ${styles[`style_${cardStyle}`] || styles.style_sticker}`}
                    style={{
                        backgroundColor: cardBgColor || '#FAF6EB',
                        maxWidth: `${cardWidth || 520}px`,
                        transform: rotation ? `rotate(${rotation}deg)` : 'none',
                        ...(borderColor ? { borderColor } : {})
                    }}
                >
                    {/* Décoration en coin (bonbon vert, scotch, épingle) */}
                    {cornerDecoration === 'candy' && (
                        <div className={styles.candyDeco} title="Bonbon">
                            <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Fil d'attache */}
                                <path d="M12 28 C18 20, 22 18, 26 14" stroke="#8E7845" strokeWidth="2" strokeDasharray="3 2" />
                                {/* Emballage gauche */}
                                <path d="M14 18 L6 13 C5 12, 4 14, 5 15 L12 23 Z" fill="#0C573E" />
                                {/* Corps du bonbon */}
                                <rect x="12" y="14" width="22" height="18" rx="8" transform="rotate(-25 12 14)" fill="#137454" stroke="#0A4632" strokeWidth="1.5" />
                                {/* Plis / reflets du bonbon */}
                                <path d="M16 22 L30 15" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M19 28 L33 21" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                                {/* Emballage droit */}
                                <path d="M33 27 L42 31 C43 32, 43 34, 41 34 L32 29 Z" fill="#0C573E" />
                            </svg>
                        </div>
                    )}

                    {cornerDecoration === 'tape' && (
                        <div className={styles.tapeDeco} />
                    )}

                    {cornerDecoration === 'pin' && (
                        <div className={styles.pinDeco} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Pin size={18} color="#ef4444" style={{ transform: 'rotate(-45deg)' }} />
                        </div>
                    )}

                    {/* En-tête : Icône + Titre */}
                    <div className={styles.cardHeader}>
                        {badgeIcon === 'camera' && (
                            <div className={styles.cameraIcon}>
                                <svg width="34" height="26" viewBox="0 0 34 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Bobines supérieures */}
                                    <circle cx="8" cy="6" r="4" fill="#123F32" />
                                    <circle cx="8" cy="6" r="2" fill="#FAF6EB" />
                                    <circle cx="18" cy="6" r="4" fill="#123F32" />
                                    <circle cx="18" cy="6" r="2" fill="#FAF6EB" />
                                    {/* Corps caméra */}
                                    <rect x="2" y="8" width="22" height="16" rx="4" fill="#123F32" />
                                    <circle cx="13" cy="16" r="3.5" fill="#00FFC2" />
                                    {/* Objectif trapèze */}
                                    <path d="M24 12 L31 9 C32 8.5 33 9 33 10 L33 22 C33 23 32 23.5 31 23 L24 20 Z" fill="#123F32" />
                                </svg>
                            </div>
                        )}
                        <h3 className={styles.cardTitle}>
                            {title}
                            {showUnderline && <span className={styles.titleUnderline} />}
                        </h3>
                    </div>

                    {/* Écran / Lecteur Vidéo ou Code Iframe */}
                    <div 
                        className={styles.mediaContainer}
                        style={aspectRatio ? { aspectRatio: aspectRatio.replace('/', ' / ') } : undefined}
                    >
                        {embedType === 'iframe' ? (
                            formattedEmbedCode ? (
                                isPlaying || !thumbnail ? (
                                    <div 
                                        className={styles.customEmbedWrapper}
                                        dangerouslySetInnerHTML={{ __html: formattedEmbedCode }}
                                    />
                                ) : (
                                    <div 
                                        className={styles.posterWrapper}
                                        onClick={handlePlay}
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Charger l'intégration"
                                    >
                                        <img 
                                            src={effectiveThumbnail} 
                                            alt={title}
                                            className={styles.posterImg}
                                        />
                                        <div className={styles.playOverlay}>
                                            <div className={styles.playButtonCircle}>
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M8 5V19L19 12L8 5Z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className={styles.noUrl}>
                                    <p>Veuillez coller votre code iframe dans le panneau d'édition.</p>
                                </div>
                            )
                        ) : isPlaying ? (
                            <div className={styles.playerWrapper}>
                                {isDirectVideo ? (
                                    <video 
                                        src={videoUrl} 
                                        controls 
                                        autoPlay 
                                        className={styles.videoPlayer}
                                    />
                                ) : embedUrl ? (
                                    <iframe
                                        src={embedUrl}
                                        title={title || 'Vidéo'}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className={styles.iframePlayer}
                                    />
                                ) : (
                                    <div className={styles.noUrl}>
                                        <p>Veuillez renseigner une URL vidéo dans le panneau d'édition.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div 
                                className={styles.posterWrapper}
                                onClick={handlePlay}
                                role="button"
                                tabIndex={0}
                                aria-label="Lire la vidéo"
                            >
                                <img 
                                    src={effectiveThumbnail} 
                                    alt={title}
                                    className={styles.posterImg}
                                />
                                <div className={styles.playOverlay}>
                                    <div className={styles.playButtonCircle}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 5V19L19 12L8 5Z" />
                                        </svg>
                                    </div>
                                </div>
                                {displayDuration && (
                                    <span className={styles.durationBadge}>{displayDuration}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bouton d'action "Voir la vidéo →" */}
                    {buttonText && (
                        <div className={styles.btnRow}>
                            <button
                                type="button"
                                className={styles.actionBtn}
                                style={{ backgroundColor: buttonColor || '#185A48' }}
                                onClick={handlePlay}
                            >
                                {isPlaying ? 'Recharger la vidéo' : buttonText}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── 2. Annotation latérale avec Flèches ── */}
                {showAnnotation && annotationText && (
                    <div className={styles.annotationSide}>
                        {showArrows && (
                            <div className={styles.arrowsSvgWrapper}>
                                <svg width="60" height="42" viewBox="0 0 70 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Première flèche courbée */}
                                    <path d="M60 8 C40 4, 22 14, 10 18" stroke={annotationColor || "#123F32"} strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M18 12 L8 18 L16 23" stroke={annotationColor || "#123F32"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    {/* Deuxième flèche courbée */}
                                    <path d="M62 26 C45 25, 26 34, 12 40" stroke={annotationColor || "#123F32"} strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M20 34 L10 40 L18 46" stroke={annotationColor || "#123F32"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                        <p className={styles.annotationText} style={annotationColor ? { color: annotationColor } : undefined}>{annotationText}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
