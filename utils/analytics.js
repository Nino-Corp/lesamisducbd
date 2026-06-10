export const trackCTA = async (ctaId) => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) return;
    try {
        await fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'cta', ctaId }),
        });
    } catch (e) {
        console.error('Failed to track CTA:', e);
    }
};
