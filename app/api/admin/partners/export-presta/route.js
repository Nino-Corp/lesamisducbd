import { NextResponse } from 'next/server';

const PRESTA_GROUP_PRO = 4;

export async function GET() {
    const url = process.env.PRESTASHOP_API_URL;
    const key = process.env.PRESTASHOP_API_KEY;

    if (!url || !key) {
        return NextResponse.json({ error: 'PrestaShop API not configured' }, { status: 500 });
    }

    try {
        // ── Appel 1 : Tous les clients du groupe Pro (groupe 4) ──────────────
        const customersUrl = `${url}/customers?ws_key=${key}&output_format=JSON&display=[id,firstname,lastname,company]&filter[id_default_group]=${PRESTA_GROUP_PRO}&limit=2000`;
        const customersRes = await fetch(customersUrl);
        if (!customersRes.ok) throw new Error(`Customers fetch failed: ${customersRes.status}`);
        const customersData = await customersRes.json();
        const customers = customersData?.customers || [];

        if (customers.length === 0) return NextResponse.json([]);

        // Build a fast lookup: customerId → customer object
        const customerMap = {};
        for (const c of customers) customerMap[String(c.id)] = c;

        const customerIds = customers.map(c => c.id);

        // ── Appel 2 : Toutes les adresses non supprimées ─────────────────────
        // PrestaShop allows filtering by id_customer with [id_customer]=[X|Y|Z]
        // but for large sets we just fetch all and filter in memory.
        const addressesUrl = `${url}/addresses?ws_key=${key}&output_format=JSON&display=[id,id_customer,company,address1,postcode,city]&filter[deleted]=0&limit=5000`;
        const addressesRes = await fetch(addressesUrl);
        if (!addressesRes.ok) throw new Error(`Addresses fetch failed: ${addressesRes.status}`);
        const addressesData = await addressesRes.json();
        const allAddresses = addressesData?.addresses || [];

        // ── Join in memory ────────────────────────────────────────────────────
        const customerIdSet = new Set(customerIds.map(String));
        // Keep only the first address per customer
        const seen = new Set();
        const results = [];

        for (const addr of allAddresses) {
            const cid = String(addr.id_customer);
            if (!customerIdSet.has(cid)) continue; // not a pro
            if (seen.has(cid)) continue;            // already have one address for this customer
            seen.add(cid);

            const customer = customerMap[cid];
            const name = addr.company || customer?.company || `${customer?.firstname || ''} ${customer?.lastname || ''}`.trim();

            if (!addr.address1 || !addr.postcode || !addr.city) continue; // skip incomplete

            results.push({
                name: name || 'Partenaire',
                address: addr.address1,
                zip: addr.postcode,
                city: addr.city,
            });
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('[Export PrestaShop] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
