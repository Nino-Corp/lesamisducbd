import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const CATEGORIES_KEY = 'product_categories';

const DEFAULT_CATEGORIES = [
    { id: 'fleur', label: '🌿 Fleurs CBD' },
    { id: 'resine', label: '🍫 Résines / Pollens' },
    { id: 'pack', label: '📦 Packs & Découverte' },
    { id: 'autre', label: '🔧 Accessoires & Divers' }
];

export async function GET() {
    try {
        const categories = await kv.get(CATEGORIES_KEY);
        return NextResponse.json(categories || DEFAULT_CATEGORIES);
    } catch (error) {
        console.error('[Product Categories API] GET error:', error);
        return NextResponse.json(DEFAULT_CATEGORIES);
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Payload must be an array' }, { status: 400 });
        }

        await kv.set(CATEGORIES_KEY, body);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Product Categories API] POST error:', error);
        return NextResponse.json({ error: 'Failed to save categories' }, { status: 500 });
    }
}
