import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(req, { params }) {
    try {
        const { pageKey } = await params;
        
        if (!['cgv', 'livraison', 'privacy', 'mentions'].includes(pageKey)) {
            return NextResponse.json({ error: 'Page invalide' }, { status: 400 });
        }

        const data = await kv.get(`${pageKey}_content`);
        return NextResponse.json(data || {});
    } catch (error) {
        console.error(`Erreur API GET /admin/content/legal/${pageKey}`, error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { pageKey } = await params;
        const data = await req.json();

        // Security check, restrict keys
        if (!['cgv', 'livraison', 'privacy', 'mentions'].includes(pageKey)) {
            return NextResponse.json({ error: 'Page invalide' }, { status: 400 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
        }

        await kv.set(`${pageKey}_content`, data);

        return NextResponse.json({ success: true, message: `Contenu ${pageKey} mis à jour` }, { status: 200 });
    } catch (error) {
        console.error(`Erreur API POST /admin/content/legal/${pageKey}`, error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
