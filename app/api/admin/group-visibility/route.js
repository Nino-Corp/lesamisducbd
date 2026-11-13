import { NextResponse } from 'next/server';
import { safeKvGet, safeKvSet } from '@/lib/kvCache';
import { getSession } from '@/lib/auth';

const KEY = 'product_group_visibility';
const VALID_GROUPS = ['3', '4']; // 3 = Particuliers & visiteurs, 4 = Buralistes / Pros

export async function GET() {
    const rules = await safeKvGet(KEY, {});
    return NextResponse.json(rules || {});
}

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const body = await request.json();
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // body : { [productId]: ["3","4"] } — seules les règles explicites sont conservées
        const cleaned = {};
        for (const [id, groups] of Object.entries(body)) {
            if (!Array.isArray(groups)) continue;
            cleaned[String(id)] = [...new Set(groups.map(String))].filter(g => VALID_GROUPS.includes(g));
        }

        await safeKvSet(KEY, cleaned);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Group Visibility API] POST error:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}
