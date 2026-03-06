import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const PARTNERS_KEY = 'partners_locations';
const NOMINATIM_DELAY_MS = 1500; // Respect Nominatim 1 req/sec rate limit

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Geocode a single address using the Nominatim (OpenStreetMap) service.
 * Returns { lat, lng } or null if not found.
 */
async function geocodeAddress(address, zip, city) {
    const query = `${address}, ${zip} ${city}, France`;
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&limit=1`,
            { headers: { 'User-Agent': 'LesAmisduCBD-StoreLocator/1.0 (contact@lesamisducbd.fr)' } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch (err) {
        console.warn(`[Bulk Import] Geocoding failed for "${query}":`, err.message);
    }
    return null;
}

/**
 * POST /api/admin/partners/bulk-import
 * Body: JSON array of { name, address, zip, city }
 * For each entry, geocodes the address and saves to KV.
 * Returns a summary of successes and failures.
 */
export async function POST(request) {
    try {
        const rows = await request.json();

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: 'Aucune ligne à importer' }, { status: 400 });
        }

        // Load existing partners to append to
        let partners = await kv.get(PARTNERS_KEY) || [];

        let successCount = 0;
        let failCount = 0;
        const failed = [];

        for (const row of rows) {
            const { name, address, zip, city } = row;

            if (!name || !address || !zip || !city) {
                failCount++;
                failed.push({ row, reason: 'Champs manquants (name, address, zip, city requis)' });
                continue;
            }

            await sleep(NOMINATIM_DELAY_MS);

            const coords = await geocodeAddress(address, zip, city);

            if (!coords) {
                failCount++;
                failed.push({ row, reason: 'Adresse introuvable via géocodage' });
                continue;
            }

            const newPartner = {
                id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
                name: name.trim(),
                address: address.trim(),
                zip: zip.trim(),
                city: city.trim(),
                lat: coords.lat,
                lng: coords.lng,
            };

            partners.push(newPartner);
            successCount++;
        }

        // Save the updated list
        await kv.set(PARTNERS_KEY, partners);

        return NextResponse.json({
            success: true,
            imported: successCount,
            failed: failCount,
            failedRows: failed,
            total: partners.length,
        });
    } catch (error) {
        console.error('[Bulk Import] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
