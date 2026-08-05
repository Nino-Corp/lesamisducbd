import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const CATEGORY_OVERRIDES_KEY = 'category_overrides';

export async function GET() {
    try {
        const overrides = await kv.get(CATEGORY_OVERRIDES_KEY);
        return NextResponse.json(overrides || {});
    } catch (error) {
        console.error('[Category Overrides API] GET error:', error);
        return NextResponse.json({});
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // body is the full overrides map: { [productId]: "fleur" | "resine" | "pack" | "autre" | null }
        // Remove null entries (= reset to auto-detection)
        const cleaned = {};
        for (const [id, category] of Object.entries(body)) {
            if (category && category !== 'auto') {
                cleaned[id] = category;
            }
        }

        await kv.set(CATEGORY_OVERRIDES_KEY, cleaned);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Category Overrides API] POST error:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}
