import { safeKvGet, safeKvSet } from '@/lib/kvCache';

const REDIRECTS_KEY = 'builder_redirects';

/**
 * Redirections permanentes des pages du builder déplacées (ancien slug → nouveau slug).
 * Évite de perdre le référencement quand une page change de dossier.
 */
export async function recordPageRedirect(from, to) {
    if (!from || !to || from === to) return;
    const redirects = await safeKvGet(REDIRECTS_KEY, {});
    // Pas de chaînes : tout ce qui pointait vers l'ancien slug pointe directement vers le nouveau
    Object.keys(redirects).forEach(k => { if (redirects[k] === from) redirects[k] = to; });
    redirects[from] = to;
    // Une page qui reprend un ancien slug annule sa redirection
    delete redirects[to];
    await safeKvSet(REDIRECTS_KEY, redirects);
}

export async function getPageRedirect(slug) {
    const redirects = await safeKvGet(REDIRECTS_KEY, {});
    return redirects[slug] || null;
}
