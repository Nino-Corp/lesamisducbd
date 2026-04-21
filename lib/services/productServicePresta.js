// PrestaShop API Service
// NOTE: Uses ws_key URL param because Ionos/FastCGI strips Authorization headers.

const getPrestaConfig = () => {
    const url = process.env.PRESTASHOP_API_URL;
    const key = process.env.PRESTASHOP_API_KEY;
    if (!url || !key) {
        console.warn('[ProductService] PrestaShop configuration is missing in environment variables.');
    }
    return { url, key };
};

/**
 * Fetches data from the PrestaShop API using ws_key URL parameter.
 * @param {string} endpoint - The API endpoint (e.g., '/products')
 * @param {Object} params - Additional query parameters
 */
const fetchPrestaApi = async (endpoint, params = {}) => {
    const { url, key } = getPrestaConfig();
    if (!url || !key) return null;

    const queryParams = new URLSearchParams({
        ws_key: key,
        output_format: 'JSON',
        ...params
    });

    const finalUrl = `${url}${endpoint}?${queryParams.toString()}`;

    try {
        const response = await fetch(finalUrl, { next: { revalidate: 60 } });

        if (!response.ok) {
            console.error(`[PrestaShop API] Error ${response.status} fetching ${finalUrl}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`[PrestaShop API] Network error:`, error.message);
        return null;
    }
};

/**
 * Maps a raw PrestaShop product object to a clean frontend model.
 */
const mapPrestaProduct = (p) => {
    const { url, key } = getPrestaConfig();
    const baseUrl = url.replace(/\/api$/, '');

    // --- Name & Slug ---
    const name = typeof p.name === 'string' ? p.name : (p.name?.[0]?.value || '');
    const linkRewrite = typeof p.link_rewrite === 'string' ? p.link_rewrite : (p.link_rewrite?.[0]?.value || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    // Prefix with product ID to ensure uniqueness across variants (e.g. gorilla-glue 4g vs 10g)
    const slug = `${p.id}-${linkRewrite}`;

    // --- Description (HTML) ---
    const description = typeof p.description === 'string' ? p.description : (p.description?.[0]?.value || '');
    const descriptionShort = typeof p.description_short === 'string' ? p.description_short : (p.description_short?.[0]?.value || '');

    // --- Price: Convert string "18.957346" -> arrondi à 2 décimales ---
    const rawPrice = parseFloat(p.price || 0);

    // Determine tax rate based on PrestaShop id_tax_rules_group
    let taxRate = 0.055; // Default TVA 5,5% for CBD products (group 55)
    if (String(p.id_tax_rules_group) === '53') {
        taxRate = 0.20; // TVA 20% for accessories and goodies
    } else if (String(p.id_tax_rules_group) === '0') {
        taxRate = 0; // No tax
    }

    const priceHT = Math.round(rawPrice * 100) / 100;
    const priceTTC = Math.round(rawPrice * (1 + taxRate) * 100) / 100;
    const formattedPrice = priceTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

    // --- Image URL construction ---
    // Instead of using /api/images/ which requires Basic Auth and exposes the ws_key,
    // we use PrestaShop's public URL rewrite: /ID-home_default/slug.jpg
    const imageId = p.id_default_image;
    const image = imageId
        ? `${baseUrl}/${imageId}-home_default/${linkRewrite}.jpg`
        : '/images/placeholder.jpg';
        
    const imageLarge = imageId
        ? `${baseUrl}/${imageId}-large_default/${linkRewrite}.jpg`
        : '/images/placeholder.jpg';

    return {
        id: String(p.id),
        name,
        slug,
        description,
        descriptionShort,
        priceHT,
        priceTTC,
        formattedPrice,
        image,
        imageLarge,
        reference: p.reference || '',
        quantity: parseInt(p.quantity || 0, 10),
        active: p.active === '1' || p.active === 1 || p.active === true,
        onSale: p.on_sale === '1',
        category: p.id_category_default,
    };
};

export const productServicePresta = {
    async getProducts() {
        console.log('[ProductService] Fetching products from PrestaShop API (ws_key)...');

        // 1. Fetching all products
        const data = await fetchPrestaApi('/products', { display: 'full' });

        if (!data || !data.products) {
            console.error('[ProductService] No products data received from API.');
            return [];
        }

        const active = data.products.filter(p => p.active === '1' || p.active === 1 || p.active === true);
        console.log(`[ProductService] ${data.products.length} total, ${active.length} active.`);

        // 2. Fetching specific prices (discounts by group)
        let specificPrices = [];
        try {
            console.log('[ProductService] Fetching specific prices for groups...');
            const specificRes = await fetchPrestaApi('/specific_prices', { display: 'full' });
            if (specificRes && specificRes.specific_prices) {
                specificPrices = specificRes.specific_prices;
                console.log(`[ProductService] Found ${specificPrices.length} specific price rules.`);
            }
        } catch (e) {
            console.error("[ProductService] Could not fetch specific prices:", e.message);
        }

        // 3. Mapping products and injecting their specific prices
        return active.map(p => {
            const productMapped = mapPrestaProduct(p);

            // Attach specific prices related to this exact product (ignore cart-specific or combination-specific for now, focus on product-level group discounts)
            const productSpecificPrices = specificPrices.filter(sp =>
                String(sp.id_product) === String(p.id) &&
                String(sp.id_shop) === '1' && // Main shop
                String(sp.id_cart) === '0' && // Not a cart-specific reduction
                String(sp.id_group) !== '0'   // Only care about GROUP specific prices (Pro, etc.)
            );

            return {
                ...productMapped,
                specificPrices: productSpecificPrices
            };
        });
    },

    async getProduct(slug) {
        console.log(`[ProductService] Fetching product "${slug}" from PrestaShop...`);
        const data = await fetchPrestaApi('/products', { display: 'full' });

        if (!data?.products) return null;

        const productRow = data.products.find(p => {
            const linkRewrite = typeof p.link_rewrite === 'string' ? p.link_rewrite : (p.link_rewrite?.[0]?.value || '');
            const compositeSlug = `${p.id}-${linkRewrite}`;
            return compositeSlug === slug;
        });

        if (!productRow) return null;

        const productMapped = mapPrestaProduct(productRow);

        // Fetch specific prices
        let specificPrices = [];
        try {
            const specificRes = await fetchPrestaApi('/specific_prices', { display: 'full' });
            if (specificRes && specificRes.specific_prices) {
                specificPrices = specificRes.specific_prices;
            }
        } catch (e) {
            console.error("[ProductService] Could not fetch specific prices:", e.message);
        }

        const productSpecificPrices = specificPrices.filter(sp =>
            String(sp.id_product) === String(productRow.id) &&
            String(sp.id_shop) === '1' &&
            String(sp.id_cart) === '0' &&
            String(sp.id_group) !== '0'
        );

        return {
            ...productMapped,
            specificPrices: productSpecificPrices
        };
    },

    async createProduct() {
        console.log('[ProductService] Creation not supported in PrestaShop mode.');
        return null;
    },

    async updateProduct() {
        console.log('[ProductService] Updates not supported in PrestaShop mode.');
        return null;
    },

    async deleteProduct() {
        console.log('[ProductService] Deletion not supported in PrestaShop mode.');
        return false;
    }
};
