'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const startTimeRef = useRef(Date.now());
    const currentPageRef = useRef(pathname);
    const hasTrackedViewRef = useRef(false);

    // Get simplified page identifier
    const getPageIdentifier = (path) => {
        if (path === '/') return 'accueil';
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 1) return parts[0];
        if (parts[0] === 'legal' && parts[1]) return `legal/${parts[1]}`;
        if (parts[0] === 'p' && parts[1]) return parts[1];
        return path;
    };

    const sendDuration = () => {
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) return;
        if (currentPageRef.current.startsWith('/admin')) return;
        
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (duration > 0 && duration < 3600) { // Ignore unrealistic times > 1h
            const pageId = getPageIdentifier(currentPageRef.current);
            // Send using sendBeacon for reliability when page unloads
            const payload = JSON.stringify({ type: 'time', page: pageId, duration });
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/analytics', payload);
            } else {
                fetch('/api/analytics', { method: 'POST', body: payload, keepalive: true }).catch(() => {});
            }
        }
    };

    useEffect(() => {
        if (!pathname) return;
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) return;
        if (pathname.startsWith('/admin')) return;

        // If path changes, send duration of previous page
        if (currentPageRef.current !== pathname) {
            sendDuration();
            currentPageRef.current = pathname;
            startTimeRef.current = Date.now();
            hasTrackedViewRef.current = false;
        }

        // Track new view
        if (!hasTrackedViewRef.current) {
            hasTrackedViewRef.current = true;
            const pageId = getPageIdentifier(pathname);
            const device = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
            const referrer = document.referrer ? new URL(document.referrer).hostname : 'direct';

            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'view', page: pageId, device, referrer })
            }).catch(e => console.error('Analytics view error:', e));
        }
    }, [pathname]);

    // Track duration when window is closed or hidden
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                sendDuration();
                // Reset start time so if they come back, we track a new segment
                startTimeRef.current = Date.now();
            } else if (document.visibilityState === 'visible') {
                startTimeRef.current = Date.now();
            }
        };

        const handleBeforeUnload = () => {
            sendDuration();
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Also send duration on final unmount
            sendDuration();
        };
    }, []);

    return null;
}
