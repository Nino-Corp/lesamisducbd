import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import crypto from 'crypto';

export async function POST(request) {
    try {
        const session = await getServerSession();

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const payload = await request.json();
        const { orderId } = payload;

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'ID de commande manquant' }, { status: 400 });
        }

        const id_customer = session.user.legacy_ps_id;
        if (!id_customer) {
            return NextResponse.json({ success: false, error: 'Compte client PrestaShop non lié' }, { status: 400 });
        }

        const secretKey = process.env.PRESTASHOP_SAS_SECRET_KEY;
        if (!secretKey) {
            console.error("[api/orders/invoice] ERREUR : PRESTASHOP_SAS_SECRET_KEY n'est pas défini.");
            return NextResponse.json({ success: false, error: 'Erreur de configuration serveur' }, { status: 500 });
        }

        const ts = Math.floor(Date.now() / 1000);
        const signaturePayload = `${orderId}-${id_customer}-${ts}`;
        const signature = crypto.createHmac('sha256', secretKey).update(signaturePayload).digest('hex');

        const prestaUrl = process.env.PRESTASHOP_API_URL.replace('/api', '');
        const invoiceUrl = `${prestaUrl}/invoice.php?id_order=${orderId}&id_customer=${id_customer}&ts=${ts}&sign=${signature}`;

        return NextResponse.json({
            success: true,
            url: invoiceUrl
        });

    } catch (error) {
        console.error('[api/orders/invoice] Error:', error);
        return NextResponse.json({ success: false, error: 'Erreur interne lors de la génération du lien.' }, { status: 500 });
    }
}
