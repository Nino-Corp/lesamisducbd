/**
 * Regroupement des produits PrestaShop en "variétés" (4g / 10g / Cartouche)
 * et règles de visibilité par groupe client.
 *
 * Convention de nommage PrestaShop :
 *  - "Amnésia Haze 4 g", "Amnésia Haze 10 g"  -> onglets 4g / 10g
 *  - "Amnésia Haze Cartouche" (ou "... Cartouche 10 paquets") -> onglet "Cartouche"
 */

const WEIGHT_SUFFIX = /\s*\d+(?:[.,]\d+)?\s*g\s*$/i;
const CARTON_SUFFIX = /\s*[-–(]?\s*cartouches?(?:\s*(?:de\s*)?(?:x\s*)?\d+\s*(?:paquets?|pqts?)?)?\s*\)?\s*$/i;

/** Nom sans grammage ni mention "Cartouche" (ex: "Amnésia Haze 4 g" -> "Amnésia Haze"). */
export const getBaseName = (name = '') =>
    String(name || '').replace(CARTON_SUFFIX, '').replace(WEIGHT_SUFFIX, '').trim();

export const isCartouche = (product) => /cartouche/i.test(product?.name || '');

/** Clé de regroupement insensible à la casse. */
export const getGroupKey = (product) => getBaseName(product?.name).toLowerCase();

/** Ajoute `weight` et `label` à un produit pour l'affichage en onglet. */
export const toVariation = (p, extra = {}) => {
    if (isCartouche(p)) {
        return { ...p, ...extra, weight: 0, isCartouche: true, label: 'Cartouche' };
    }
    const m = (p.name || '').match(/(\d+(?:[.,]\d+)?)\s*g/i);
    const weight = m ? parseFloat(m[1].replace(',', '.')) : 0;
    return { ...p, ...extra, weight, isCartouche: false, label: weight > 0 ? `${weight}g` : p.name };
};

/** Tri : grammages croissants, cartouche toujours en dernier. */
export const sortVariations = (a, b) => {
    if (a.isCartouche !== b.isCartouche) return a.isCartouche ? 1 : -1;
    if (a.weight && b.weight) return a.weight - b.weight;
    return (a.priceTTC || 0) - (b.priceTTC || 0);
};

/**
 * Visibilité par groupe client.
 * `rules` (KV `product_group_visibility`) : { [productId]: [groupIds autorisés] }.
 * Sans règle explicite, les cartouches et présentoirs sont réservés au groupe 4 (Buraliste/Pro).
 */
const RESTRICTED_KEYWORDS = ['cartouche', 'presentoir', 'présentoir'];
const DEFAULT_ALLOWED_GROUPS = ['4'];

export const isVisibleForGroup = (product, groupId, rules = {}) => {
    const explicit = rules?.[product?.id];
    const g = String(groupId || 3);
    if (Array.isArray(explicit)) return explicit.map(String).includes(g);
    const name = (product?.name || '').toLowerCase();
    if (RESTRICTED_KEYWORDS.some(k => name.includes(k))) return DEFAULT_ALLOWED_GROUPS.includes(g);
    return true;
};

/**
 * Affiche les onglets dès qu'il y a plusieurs formats, ou un seul format
 * identifiable (poids ou cartouche) : la pastille sélectionnée informe le client.
 * Les produits sans format (accessoires, présentoirs...) n'ont pas d'onglets.
 */
export const shouldShowTabs = (variations = []) =>
    variations.length > 1 || (variations.length === 1 && (variations[0].weight > 0 || variations[0].isCartouche));
