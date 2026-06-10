
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';


// Simple in-memory rate limiter
const rateLimit = new Map();

export async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    const record = rateLimit.get(ip) || { count: 0, startTime: now };

    // Reset if window passed
    if (now - record.startTime > windowMs) {
        record.count = 0;
        record.startTime = now;
    }

    if (record.count >= maxAttempts) {
        return NextResponse.json({ success: false, message: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
    }

    const body = await request.json();
    const { password } = body;

    // Secure Password Check
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
        console.error('CRITICAL: ADMIN_PASSWORD is not set in environment variables.');
        return NextResponse.json({ success: false, message: 'Configuration error' }, { status: 500 });
    }

    if (password === ADMIN_PASSWORD) {
        // Reset attempts on success
        rateLimit.delete(ip);

        const token = await signToken({ role: 'admin' });

        const response = NextResponse.json({ success: true });

        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 2 // 2 hours
        });

        return response;
    }

    // Increment attempts on failure
    record.count += 1;
    rateLimit.set(ip, record);

    return NextResponse.json({ success: false, message: 'Mot de passe incorrect' }, { status: 401 });
}
