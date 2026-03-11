/**
 * Calcule le prix final d'un produit en fonction du groupe de l'utilisateur (id_default_group)
 * et des règles de prix spécifiques (specific_prices) rattachées au produit.
 * 
 * @param {Object} product - L'objet produit (issu de productServicePresta)
 * @param {number} groupId - L'ID du groupe client (ex: 3 pour Client, 4 pour Pro). Défaut à 3.
 * @returns {Object} - Un objet contenant le nouveau priceTTC, priceHT, et s'il y a eu une promo appliquée.
 */
export function calculateGroupPrice(product, groupId = 3) {
    if (!product) return null;

    let finalPriceHT = product.priceHT;
    let finalPriceTTC = product.priceTTC;
    let hasDiscount = false;

    // S'il n'y a pas de specificPrices ou qu'on est un invité (sans groupe précis), on renvoie le prix de base
    if (!product.specificPrices || product.specificPrices.length === 0) {
        return {
            priceHT: finalPriceHT,
            priceTTC: finalPriceTTC,
            formattedPrice: finalPriceTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
            formattedPriceHT: finalPriceHT.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
            hasDiscount,
            suggestShowHT: String(groupId) === "4" // Pro group
        };
    }

    // Chercher la règle qui s'applique à ce groupe
    // L'API PrestaShop renvoie id_group en string, groupId est souvent un entier
    const rule = product.specificPrices.find(sp => String(sp.id_group) === String(groupId));

    if (rule) {
        hasDiscount = true;

        // Deux cas possibles dans PrestaShop :
        // 1. rule.price !== "-1.000000" => C'est un prix forcé (ex: on fixe le prix à 8€)
        // 2. rule.price === "-1.000000" => C'est une réduction appliquée sur le prix normal (ex: reduction=2.00)

        // On a besoin de savoir la taxe pour recalculer si c'est du HT. 
        // Par défaut, on peut déduire la taxe du produit de base
        const taxMultiplier = product.priceHT > 0 ? (product.priceTTC / product.priceHT) : 1.055;

        // Cas 1 : Prix de base écrasé
        if (rule.price && rule.price !== "-1.000000") {
            const forcedPrice = parseFloat(rule.price);
            finalPriceHT = forcedPrice;
            finalPriceTTC = forcedPrice * taxMultiplier;
        }
        // Cas 2 : Réduction
        else if (rule.reduction && parseFloat(rule.reduction) > 0) {
            const reduction = parseFloat(rule.reduction);

            if (rule.reduction_type === 'amount') {
                // Montant fixe (en HT ou TTC selon rule.reduction_tax)
                if (String(rule.reduction_tax) === "1") {
                    finalPriceTTC = Math.max(0, product.priceTTC - reduction);
                    finalPriceHT = finalPriceTTC / taxMultiplier;
                } else {
                    finalPriceHT = Math.max(0, product.priceHT - reduction);
                    finalPriceTTC = finalPriceHT * taxMultiplier;
                }
            } else if (rule.reduction_type === 'percentage') {
                // Pourcentage (0.10 pour 10%)
                finalPriceHT = product.priceHT * (1 - reduction);
                finalPriceTTC = product.priceTTC * (1 - reduction);
            }
        }
    }

    // Arrondis finaux à 2 décimales
    finalPriceHT = Math.round(finalPriceHT * 100) / 100;
    finalPriceTTC = Math.round(finalPriceTTC * 100) / 100;

    return {
        priceHT: finalPriceHT,
        priceTTC: finalPriceTTC,
        formattedPrice: finalPriceTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
        formattedPriceHT: finalPriceHT.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
        hasDiscount,
        suggestShowHT: String(groupId) === "4" // Pro group
    };
}
