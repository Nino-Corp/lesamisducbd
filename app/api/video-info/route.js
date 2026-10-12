import { NextResponse } from 'next/server';

function parseIsoDuration(iso) {
    if (!iso) return 0;
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const h = parseInt(match[1] || '0', 10);
    const m = parseInt(match[2] || '0', 10);
    const s = parseInt(match[3] || '0', 10);
    return h * 3600 + m * 60 + s;
}

function formatDuration(sec) {
    if (!sec || isNaN(sec)) return '';
    const total = Math.round(Number(sec));
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
        return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
        return NextResponse.json({ error: 'Paramètre url manquant' }, { status: 400 });
    }

    try {
        // 1. YouTube
        const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?]+)/);
        if (ytMatch) {
            const videoId = ytMatch[1];
            try {
                const ytRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
                    },
                    next: { revalidate: 3600 }
                });

                if (ytRes.ok) {
                    const html = await ytRes.text();
                    
                    // Priorité 1: lengthSeconds
                    const lenMatch = html.match(/"lengthSeconds":"(\d+)"/);
                    let seconds = lenMatch ? parseInt(lenMatch[1], 10) : 0;

                    // Priorité 2: itemprop="duration" (ex: PT3M34S)
                    if (!seconds) {
                        const isoMatch = html.match(/itemprop="duration" content="([^"]+)"/);
                        if (isoMatch) {
                            seconds = parseIsoDuration(isoMatch[1]);
                        }
                    }

                    // Récupérer le titre si possible
                    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
                    const rawTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : '';

                    return NextResponse.json({
                        provider: 'youtube',
                        videoId,
                        duration: formatDuration(seconds),
                        seconds,
                        title: rawTitle,
                        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                    });
                }
            } catch (err) {
                console.warn('[VideoInfo] Failed to fetch YouTube watch page:', err.message);
            }

            // Fallback si YouTube bloque le scraping
            return NextResponse.json({
                provider: 'youtube',
                videoId,
                duration: '',
                seconds: 0,
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            });
        }

        // 2. Vimeo
        const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (vimeoMatch) {
            const vimeoId = vimeoMatch[1];
            try {
                const vRes = await fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    next: { revalidate: 3600 }
                });

                if (vRes.ok) {
                    const data = await vRes.json();
                    if (Array.isArray(data) && data[0]) {
                        const item = data[0];
                        const seconds = parseInt(item.duration, 10) || 0;
                        return NextResponse.json({
                            provider: 'vimeo',
                            videoId: vimeoId,
                            duration: formatDuration(seconds),
                            seconds,
                            title: item.title || '',
                            thumbnail: item.thumbnail_large || ''
                        });
                    }
                }
            } catch (err) {
                console.warn('[VideoInfo] Failed to fetch Vimeo info:', err.message);
            }

            return NextResponse.json({
                provider: 'vimeo',
                videoId: vimeoId,
                duration: '',
                seconds: 0
            });
        }

        // 3. Fichier vidéo direct (.mp4, .webm, etc.)
        const isDirect = videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.includes('/video/upload/');
        if (isDirect) {
            return NextResponse.json({
                provider: 'direct',
                isDirect: true,
                duration: ''
            });
        }

        return NextResponse.json({
            provider: 'unknown',
            duration: '',
            seconds: 0
        });
    } catch (e) {
        console.error('[VideoInfo] Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
