
export function toSlug(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize("NFD") // Decompose accents
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
}

export function truncateText(str, length = 160) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + '...';
}

/**
 * Normalise un slug de page builder. Les "/" sont conservés pour permettre
 * des dossiers (ex: guides/sommeil/cbd-et-sommeil). Avec `final: true`,
 * les "/" et "-" en début/fin de segment sont supprimés (à l'enregistrement).
 */
export function normalizePageSlug(value = '', { final = false } = {}) {
    let s = String(value).toLowerCase().replace(/[^a-z0-9/-]/g, '-').replace(/-+/g, '-').replace(/\/+/g, '/');
    if (final) {
        s = s.split('/').map(seg => seg.replace(/^-+|-+$/g, '')).filter(Boolean).join('/');
    }
    return s.replace(/^\//, '');
}
