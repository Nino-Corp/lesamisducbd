'use client';

import { useState, useEffect } from 'react';

let cachedRatio = null;
let fetchPromise = null;

/**
 * Hook partagé qui récupère le ratio de fidélité depuis le Dashboard.
 * Le résultat est mis en cache globalement pour éviter des dizaines d'appels API
 * (un par ProductCard affichée sur la page).
 */
export function useLoyaltyRatio() {
    const [ratio, setRatio] = useState(cachedRatio || 1);

    useEffect(() => {
        if (cachedRatio !== null) {
            setRatio(cachedRatio);
            return;
        }

        if (!fetchPromise) {
            fetchPromise = fetch('/api/admin/loyalty-settings')
                .then(res => res.json())
                .then(data => {
                    cachedRatio = data.ratio || 1;
                    return cachedRatio;
                })
                .catch(() => {
                    cachedRatio = 1;
                    return 1;
                });
        }

        fetchPromise.then(r => setRatio(r));
    }, []);

    return ratio;
}
