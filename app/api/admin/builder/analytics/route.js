import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        const key = `builder_views:${slug}`;
        const newCount = await kv.incr(key);

        return NextResponse.json({ success: true, views: newCount });
    } catch (error) {
        console.error('Analytics POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        // Fetch all views for all pages
        // Vercel KV doesn't have a simple way to get all keys with a prefix and their values in one go easily,
        // but since we only have a handful of pages, we can get the pages array and fetch views for each.
        const pages = await kv.get('builder_pages') || {};
        const builderSlugs = Object.keys(pages);
        
        // Add static pages
        const staticSlugs = [
            'accueil', 'essentiel', 'professionnel', 'usages', 
            'transparence', 'recrutement', 'produits',
            'legal/cgv', 'legal/livraison', 'legal/privacy'
        ];
        
        const allSlugs = [...builderSlugs, ...staticSlugs];
        
        if (allSlugs.length === 0) return NextResponse.json({});

        const pipeline = kv.pipeline();
        allSlugs.forEach(slug => {
            pipeline.get(`builder_views:${slug}`);
        });
        
        const results = await pipeline.exec();
        
        const viewsMap = {};
        allSlugs.forEach((slug, index) => {
            viewsMap[slug] = results[index] || 0;
        });

        return NextResponse.json(viewsMap);
    } catch (error) {
        console.error('Analytics GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
