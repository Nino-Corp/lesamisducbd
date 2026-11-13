/**
 * Title case français pour les noms de produits.
 *
 *  - Majuscule à chaque mot, sauf les mots de liaison (de, du, des, la, le, et, à, pour...) hors 1er mot
 *  - Acronymes conservés en majuscules (CBD, THC, PLV...)
 *  - Élisions : "l'huile" -> "l'Huile", "d'été" -> "d'Été"
 *  - Mots à tirets : "gorilla-glue" -> "Gorilla-Glue"
 *  - Unités normalisées : "4 G" / "4G" -> "4 g" / "4g", "10ML" -> "10ml"
 *  - Sigles à points : "l.a. california" -> "L.A. California"
 *  - Mots volontairement mixtes (ex: "MoonRock") laissés intacts
 */

const ACRONYMS = new Set(['CBD', 'CBG', 'CBN', 'CBC', 'CBDA', 'THC', 'THCV', 'HHC', 'PLV', 'XL', 'XXL', 'UV', 'USB', 'LED', 'TVA', 'TTC', 'HT', 'QR', 'OG']);
const SMALL_WORDS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'ou', 'à', 'a', 'au', 'aux', 'en', 'par', 'pour', 'sans', 'avec', 'sur', 'sous', 'dans', 'd', 'l']);
const ELISIONS = /^(l|d|j|m|n|s|t|c|qu|jusqu|lorsqu|puisqu)['’]/i;
const UNIT_TOKEN = /^(\d+(?:[.,]\d+)?)(g|mg|ml|cl|l|kg|%)$/i;

const cap = (w) => (w ? w.charAt(0).toLocaleUpperCase('fr-FR') + w.slice(1).toLocaleLowerCase('fr-FR') : w);

const formatSimpleWord = (word, isFirst) => {
    const upper = word.toLocaleUpperCase('fr-FR');
    if (ACRONYMS.has(upper)) return upper;
    const lower = word.toLocaleLowerCase('fr-FR');
    if (!isFirst && SMALL_WORDS.has(lower)) return lower;
    return cap(word);
};

const formatWord = (word, isFirst) => {
    if (!word) return word;

    // Sigles à points : L.A., N.Y, U.S.A -> tout en majuscules
    if (/^(?:[A-Za-zÀ-ÿ]\.)+[A-Za-zÀ-ÿ]?\.?$/.test(word)) return word.toLocaleUpperCase('fr-FR');

    // Nombres + unités collés : 4G, 10ML, 3,5g
    const unit = word.match(UNIT_TOKEN);
    if (unit) return `${unit[1]}${unit[2].toLowerCase()}`;
    if (/^\d+(?:[.,]\d+)?$/.test(word)) return word;

    // Mot volontairement en casse mixte (MoonRock, iPhone) : on ne touche pas
    const hasInnerUpper = /[a-zà-ÿ][A-ZÀ-Ý]/.test(word);
    if (hasInnerUpper) return word;

    // Mots à tirets
    if (word.includes('-')) {
        return word.split('-').map((part, i) => formatSimpleWord(part, isFirst && i === 0)).join('-');
    }

    // Élisions : l'huile -> l'Huile
    const el = word.match(ELISIONS);
    if (el) {
        const prefix = el[0];
        const rest = word.slice(prefix.length);
        const prefixOut = isFirst ? cap(prefix.slice(0, -1)) + prefix.slice(-1) : prefix.toLocaleLowerCase('fr-FR');
        return prefixOut + formatSimpleWord(rest, false);
    }

    return formatSimpleWord(word, isFirst);
};

export function toTitleCase(input) {
    if (!input || typeof input !== 'string') return input || '';
    const tokens = input.trim().replace(/\s+/g, ' ').split(' ');
    let firstDone = false;
    return tokens.map((tok, i) => {
        // "4 g" : la lettre seule après un nombre devient une unité en minuscule
        if (i > 0 && /^g$/i.test(tok) && /^\d+(?:[.,]\d+)?$/.test(tokens[i - 1])) return 'g';
        if (i > 0 && /^(mg|ml|cl|kg)$/i.test(tok) && /^\d+(?:[.,]\d+)?$/.test(tokens[i - 1])) return tok.toLowerCase();
        const out = formatWord(tok, !firstDone);
        if (/[a-zà-ÿ]/i.test(tok)) firstDone = true;
        return out;
    }).join(' ');
}
