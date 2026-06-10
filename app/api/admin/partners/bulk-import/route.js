import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const PARTNERS_KEY = 'partners_locations';
const NOMINATIM_DELAY_MS = 1500; // Respect Nominatim 1 req/sec rate limit
const BAN_DELAY_MS = 50; // French BAN API allows 50 req/sec

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Geocode a single address using the French Government API (BAN),
 * with a fallback to Nominatim (OpenStreetMap) for foreign addresses.
 */
async function geocodeAddress(address, zip, city) {
    // 1. Try French BAN API (Fast & Smart for France)
    try {
        // BAN is smart, we don't need commas, just the full string
        const query = `${address} ${zip} ${city}`;
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        
        if (data && data.features && data.features.length > 0) {
            // BAN returns score, we could filter by score > 0.4 if we wanted to be strict
            const coords = data.features[0].geometry.coordinates;
            // BAN returns [longitude, latitude]
            return { lat: parseFloat(coords[1]), lng: parseFloat(coords[0]) };
        }
    } catch (err) {
        console.warn(`[Bulk Import] BAN Geocoding failed for "${address}":`, err.message);
    }

    // 2. Fallback to Nominatim (Slow & Strict for World)
    try {
        await sleep(NOMINATIM_DELAY_MS);
        const query = `${address}, ${zip} ${city}`;
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { 'User-Agent': 'LesAmisduCBD-StoreLocator/1.0 (contact@lesamisducbd.fr)' } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch (err) {
        console.warn(`[Bulk Import] Nominatim Geocoding failed for "${address}":`, err.message);
    }
    
    return null;
}

/**
 * Helper: Smart Title Case for Shop Names
 */
const MINOR_WORDS = new Set(['de', 'la', 'le', 'les', 'des', 'du', 'd', 'l', 'et', 'à', 'au', 'aux', 'en', 'un', 'une']);

const toSmartTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/[\p{L}\p{N}]+/gu, (word, offset) => {
        if (offset === 0 || !MINOR_WORDS.has(word)) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
    });
};

/**
 * Helper: Normalize string to compare efficiently
 */
const normalize = (str) => {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // remove spaces and punctuation
};

/**
 * POST /api/admin/partners/bulk-import
 * Body: JSON array of { name, address, zip, city }
 * For each entry, geocodes the address and saves to KV.
 * Returns a summary of successes and failures.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        
        // Support old format (array directly) or new format { rows: [...], exactSync: true }
        const rows = Array.isArray(body) ? body : body.rows;
        const exactSync = body.exactSync === true;

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: 'Aucune ligne à importer' }, { status: 400 });
        }

        // Load existing partners to append to or update
        let partners = await kv.get(PARTNERS_KEY) || [];

        let successCount = 0; // newly inserted
        let updatedCount = 0; // existing partner but updated address
        let skippedCount = 0; // existing partner and exact same address
        let failCount = 0;
        const failed = [];
        
        // Track the IDs of all partners that are part of this import file
        const processedIds = new Set();

        for (const row of rows) {
            const { name, address, zip, city } = row;

            if (!name || !address || !zip || !city) {
                failCount++;
                failed.push({ row, reason: 'Champs manquants (name, address, zip, city requis)' });
                continue;
            }

            const cleanName = toSmartTitleCase(name.trim());
            const cleanAddress = address.trim();
            const cleanZip = zip.trim();
            const cleanCity = city.trim();

            const normName = normalize(cleanName);
            const normZip = normalize(cleanZip);
            const normAddress = normalize(cleanAddress);

            // Find if this partner already exists (Match by Name + Zip)
            const existingIndex = partners.findIndex(p => 
                normalize(p.name) === normName && 
                normalize(p.zip) === normZip
            );

            if (existingIndex !== -1) {
                const existingPartner = partners[existingIndex];
                
                // If the address is also strictly the same (normalized), we SKIP to save time
                if (normalize(existingPartner.address) === normAddress) {
                    existingPartner.name = cleanName; // Update name format silently
                    processedIds.add(existingPartner.id);
                    skippedCount++;
                    continue;
                }

                // If address changed, we need to Re-geocode and UPDATE
                await sleep(BAN_DELAY_MS);
                const coords = await geocodeAddress(cleanAddress, cleanZip, cleanCity);

                if (!coords) {
                    failCount++;
                    failed.push({ row, reason: 'Nouvelle adresse introuvable via géocodage' });
                    continue;
                }

                // Update the existing partner
                partners[existingIndex] = {
                    ...existingPartner, // Keep ID
                    name: cleanName,
                    address: cleanAddress,
                    zip: cleanZip,
                    city: cleanCity,
                    lat: coords.lat,
                    lng: coords.lng,
                };
                
                processedIds.add(existingPartner.id);
                updatedCount++;
                continue;
            }

            // --- It's a completely NEW partner ---
            await sleep(BAN_DELAY_MS);
            const coords = await geocodeAddress(cleanAddress, cleanZip, cleanCity);

            if (!coords) {
                failCount++;
                failed.push({ row, reason: 'Adresse introuvable via géocodage' });
                continue;
            }

            const newPartner = {
                id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
                name: cleanName,
                address: cleanAddress,
                zip: cleanZip,
                city: cleanCity,
                lat: coords.lat,
                lng: coords.lng,
            };

            processedIds.add(newPartner.id);
            partners.push(newPartner);
            successCount++;
        }

        // --- Exact Sync: Delete partners that were NOT in the import file ---
        let deletedCount = 0;
        if (exactSync) {
            const beforeCount = partners.length;
            partners = partners.filter(p => processedIds.has(p.id));
            deletedCount = beforeCount - partners.length;
        }

        // Save the updated list
        await kv.set(PARTNERS_KEY, partners);

        return NextResponse.json({
            success: true,
            imported: successCount,
            updated: updatedCount,
            skipped: skippedCount,
            deleted: deletedCount,
            failed: failCount,
            failedRows: failed,
            total: partners.length,
        });
    } catch (error) {
        console.error('[Bulk Import] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
