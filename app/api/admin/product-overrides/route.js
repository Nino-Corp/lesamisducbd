import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const OVERRIDES_KEY = 'product_overrides';

export async function GET() {
    try {
        const overrides = await kv.get(OVERRIDES_KEY);
        return NextResponse.json(overrides || {});
    } catch (error) {
        console.error('[Product Overrides API] GET error:', error);
        return NextResponse.json({});
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Merge with existing overrides so we don't wipe other products
        const existing = await kv.get(OVERRIDES_KEY) || {};
        const merged = { ...existing, ...body };

        await kv.set(OVERRIDES_KEY, merged);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Product Overrides API] POST error:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}
