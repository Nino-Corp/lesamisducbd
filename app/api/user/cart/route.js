import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { kv } from '@vercel/kv';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

const cartKey = (userId) => `cart:${userId}`;

// GET — Fetch the saved cart for the logged-in user, then delete it (one-time restore)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const key = cartKey(session.user.id);
        const savedCart = await kv.get(key);

        if (savedCart) {
            // Delete immediately after read — it's a one-time restore
            await kv.del(key);
        }

        return NextResponse.json({ success: true, cart: savedCart || null });
    } catch (error) {
        console.error('[api/user/cart GET]', error);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST — Save the current cart for the logged-in user (called before logout)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const { cart } = await request.json();

        if (!Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ success: true, saved: false });
        }

        // Keep the saved cart for 30 days
        await kv.set(cartKey(session.user.id), cart, { ex: 30 * 24 * 60 * 60 });

        return NextResponse.json({ success: true, saved: true });
    } catch (error) {
        console.error('[api/user/cart POST]', error);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
