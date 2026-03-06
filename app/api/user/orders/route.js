import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await getServerSession();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
        }

        const email = session.user.email;
        const prestaUrl = process.env.PRESTASHOP_API_URL;
        const prestaKey = process.env.PRESTASHOP_API_KEY;

        if (!prestaUrl || !prestaKey) {
            throw new Error("Configuration PrestaShop manquante");
        }

        // 1. Find Customer ID by Email
        const customerRes = await fetch(`${prestaUrl}/customers?ws_key=${prestaKey}&output_format=JSON&display=full&filter[email]=${encodeURIComponent(email)}`);
        const customerData = await customerRes.json();

        if (!customerData?.customers?.length) {
            return NextResponse.json({ success: true, email: email, orders: [] }); // No customer = no orders
        }

        const customerIds = customerData.customers.map(c => c.id);

        // 2. Fetch Orders for all these Customer IDs, sorted by date DESC
        const ordersPromises = customerIds.map(cId =>
            fetch(`${prestaUrl}/orders?ws_key=${prestaKey}&output_format=JSON&display=full&filter[id_customer]=${cId}&sort=[id_DESC]`)
                .then(res => res.json())
                .catch(err => { return null; })
        );

        const ordersResults = await Promise.all(ordersPromises);

        let rawOrders = [];
        ordersResults.forEach(data => {
            if (data?.orders?.length) {
                rawOrders = [...rawOrders, ...data.orders];
            }
        });

        if (rawOrders.length === 0) {
            return NextResponse.json({ success: true, email: email, orders: [] });
        }

        // Sort all aggregated orders by date DESC just in case
        rawOrders.sort((a, b) => new Date(b.date_add) - new Date(a.date_add));

        // 3. Fetch Order States mappings (to know what state "2" means etc.)
        const statesRes = await fetch(`${prestaUrl}/order_states?ws_key=${prestaKey}&output_format=JSON&display=[id,name,color]`);
        const statesData = await statesRes.json();
        const stateMap = {};

        if (statesData?.order_states) {
            statesData.order_states.forEach(st => {
                // Name might be an array if multi-lang, we take the first value usually
                const stateName = Array.isArray(st.name) ? st.name[0].value : st.name;
                stateMap[st.id] = { name: stateName, color: st.color };
            });
        }

        // 4. Transform and enrich orders
        // Note: For full tracking, we'd need to query /order_carriers for each order,
        // but to avoid N+1 queries making it slow, we can query order_carriers filtered by these orders 
        // OR fetch them on-demand if the frontend needs it. 
        // Let's fetch the tracking IDs for these specific orders in parallel:
        const enrichedOrders = await Promise.all(rawOrders.map(async (order) => {
            let trackingNumber = null;
            let trackingUrl = null;
            let carrierName = 'Non défini';

            try {
                // Fetch carrier data for tracking
                const ocRes = await fetch(`${prestaUrl}/order_carriers?ws_key=${prestaKey}&output_format=JSON&display=full&filter[id_order]=${order.id}`);
                const ocData = await ocRes.json();
                if (ocData?.order_carriers?.length > 0) {
                    const oc = ocData.order_carriers[0];
                    trackingNumber = oc.tracking_number || null;

                    // Fetch the carrier's tracking URL from PrestaShop (instead of hardcoding La Poste)
                    if (trackingNumber && oc.id_carrier) {
                        try {
                            const carrierRes = await fetch(`${prestaUrl}/carriers/${oc.id_carrier}?ws_key=${prestaKey}&output_format=JSON&display=[name,url]`);
                            const carrierData = await carrierRes.json();

                            if (carrierData?.carrier) {
                                carrierName = carrierData.carrier.name;
                                const carrierUrl = carrierData.carrier.url;
                                if (carrierUrl && carrierUrl !== 'null' && carrierUrl.length > 0) {
                                    // PrestaShop uses @ as placeholder for the tracking number
                                    trackingUrl = carrierUrl.replace('@', trackingNumber);
                                }
                            }
                        } catch (cErr) { /* Silently fail, we just won't have a URL */ }
                    }
                }
            } catch (err) {
                // Silently fail, tracking is optional
            }

            // Fetch Delivery Address
            let deliveryAddress = null;
            if (order.id_address_delivery && order.id_address_delivery !== '0') {
                try {
                    const addrRes = await fetch(`${prestaUrl}/addresses/${order.id_address_delivery}?ws_key=${prestaKey}&output_format=JSON`);
                    const addrData = await addrRes.json();
                    if (addrData?.address) {
                        const a = addrData.address;
                        deliveryAddress = `${a.firstname} ${a.lastname}\n${a.address1}${a.address2 ? '\n' + a.address2 : ''}\n${a.postcode} ${a.city}`;
                    }
                } catch (e) { }
            }

            // Fetch Invoice Address
            let invoiceAddress = null;
            if (order.id_address_invoice && order.id_address_invoice !== '0') {
                try {
                    const addrRes = await fetch(`${prestaUrl}/addresses/${order.id_address_invoice}?ws_key=${prestaKey}&output_format=JSON`);
                    const addrData = await addrRes.json();
                    if (addrData?.address) {
                        const a = addrData.address;
                        invoiceAddress = `${a.firstname} ${a.lastname}\n${a.address1}${a.address2 ? '\n' + a.address2 : ''}\n${a.postcode} ${a.city}`;
                    }
                } catch (e) { }
            }

            const stateInfo = stateMap[order.current_state] || { name: 'En cours', color: '#4169E1' };

            return {
                id: order.id,
                reference: order.reference,
                date: order.date_add,
                total: parseFloat(order.total_paid).toFixed(2),
                payment: order.payment,
                shippingCost: parseFloat(order.total_shipping_tax_incl).toFixed(2),
                status: stateInfo.name,
                statusColor: stateInfo.color,
                trackingNumber: trackingNumber,
                trackingUrl: trackingUrl,
                carrierName: carrierName,
                deliveryAddress: deliveryAddress,
                invoiceAddress: invoiceAddress,
                products: order.associations?.order_rows?.map(row => ({
                    name: row.product_name,
                    quantity: row.product_quantity,
                    price: parseFloat(row.unit_price_tax_incl).toFixed(2)
                })) || []
            };
        }));

        return NextResponse.json({ success: true, email: email, orders: enrichedOrders });

    } catch (error) {
        console.error("[api/user/orders] Error:", error);
        return NextResponse.json({ success: false, error: "Erreur serveur lors de la récupération des commandes" }, { status: 500 });
    }
}
