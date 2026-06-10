import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { type, page, device, referrer, duration, ctaId } = body;
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        const dailyKey = `analytics:daily:${today}`;
        const totalsKey = 'analytics:totals';

        const pipeline = kv.pipeline();

        if (type === 'view' && page) {
            // Increment total views
            pipeline.hincrby(totalsKey, `views:${page}`, 1);
            // Increment daily views
            pipeline.hincrby(dailyKey, `views:${page}`, 1);
            
            // Increment device stats
            if (device) {
                pipeline.hincrby(totalsKey, `device:${device}`, 1);
            }
            
            // Increment referrer stats (exclude own domain and localhost)
            if (referrer && referrer !== 'direct') {
                let cleanRef = referrer.replace('www.', '').toLowerCase();
                const ignoredDomains = ['localhost', '127.0.0.1', 'lesamisducbd.fr'];
                
                // Check if cleanRef includes any of the ignored domains
                const isIgnored = ignoredDomains.some(domain => cleanRef.includes(domain));
                
                if (!isIgnored) {
                    pipeline.hincrby(totalsKey, `referrer:${cleanRef}`, 1);
                }
            }
        } 
        else if (type === 'time' && page && duration) {
            // Increment total time spent and number of sessions with tracked time
            pipeline.hincrby(totalsKey, `time:${page}`, duration);
            pipeline.hincrby(totalsKey, `sessions:${page}`, 1);
        }
        else if (type === 'cta' && ctaId) {
            pipeline.hincrby(totalsKey, `cta:${ctaId}`, 1);
            pipeline.hincrby(dailyKey, `cta:${ctaId}`, 1);
        }

        await pipeline.exec();
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics endpoint error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
