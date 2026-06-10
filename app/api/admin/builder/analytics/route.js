import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        if (!slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 });

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
        // 1. Fetch legacy views
        const pages = await kv.get('builder_pages') || {};
        const builderSlugs = Object.keys(pages);
        const staticSlugs = ['accueil', 'essentiel', 'professionnel', 'usages', 'transparence', 'recrutement', 'produits', 'legal/cgv', 'legal/livraison', 'legal/privacy'];
        const allSlugs = [...builderSlugs, ...staticSlugs];

        const pipeline = kv.pipeline();
        allSlugs.forEach(slug => pipeline.get(`builder_views:${slug}`));
        const legacyResults = await pipeline.exec();

        const legacyViewsMap = {};
        allSlugs.forEach((slug, index) => {
            legacyViewsMap[slug] = legacyResults[index] || 0;
        });

        // 2. Fetch extended analytics
        const totals = await kv.hgetall('analytics:totals') || {};
        
        // 3. Fetch daily history (Last 30 days)
        const dailyPipeline = kv.pipeline();
        const dates = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dates.push(dateStr);
            dailyPipeline.hgetall(`analytics:daily:${dateStr}`);
        }
        const dailyResults = await dailyPipeline.exec();

        // 4. Transform and merge data
        const viewsMap = { ...legacyViewsMap };
        const timeMap = {};
        const sessionsMap = {};
        const ctaMap = {};
        const deviceMap = { desktop: 0, mobile: 0, tablet: 0 };
        const referrerMap = {};

        // Parse totals
        for (const [key, value] of Object.entries(totals)) {
            const numVal = Number(value);
            // Ignore stats for admin pages
            if (key.includes(':/admin')) continue;

            if (key.startsWith('views:')) viewsMap[key.replace('views:', '')] = (viewsMap[key.replace('views:', '')] || 0) + numVal;
            else if (key.startsWith('time:')) timeMap[key.replace('time:', '')] = numVal;
            else if (key.startsWith('sessions:')) sessionsMap[key.replace('sessions:', '')] = numVal;
            else if (key.startsWith('cta:')) ctaMap[key.replace('cta:', '')] = numVal;
            else if (key.startsWith('device:')) deviceMap[key.replace('device:', '')] = numVal;
            else if (key.startsWith('referrer:')) referrerMap[key.replace('referrer:', '')] = numVal;
        }

        // Parse daily
        const dailyStats = dates.map((date, index) => {
            const dayData = dailyResults[index] || {};
            let totalViews = 0;
            const pages = {};
            for (const [k, v] of Object.entries(dayData)) {
                if (k.startsWith('views:')) {
                    if (k.includes(':/admin')) continue; // Ignore admin pages in daily views
                    
                    totalViews += Number(v);
                    pages[k.replace('views:', '')] = Number(v);
                }
            }
            return { date, views: totalViews, pages };
        });

        return NextResponse.json({
            viewsMap,
            timeMap,
            sessionsMap,
            ctaMap,
            deviceMap,
            referrerMap,
            dailyStats
        });
    } catch (error) {
        console.error('Analytics GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
