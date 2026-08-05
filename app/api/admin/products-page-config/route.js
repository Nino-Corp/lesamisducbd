import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const PAGE_CONFIG_KEY = 'products_page_config';

export async function GET() {
    try {
        const config = await kv.get(PAGE_CONFIG_KEY);
        return NextResponse.json(config || {});
    } catch (error) {
        console.error('[Products Page Config API] GET error:', error);
        return NextResponse.json({});
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        await kv.set(PAGE_CONFIG_KEY, body);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Products Page Config API] POST error:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}
