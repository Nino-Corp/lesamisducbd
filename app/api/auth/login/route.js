
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

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
    const { username, password } = body;

    if (!username || !password) {
        return NextResponse.json({ success: false, message: 'Identifiants manquants' }, { status: 400 });
    }

    // 1. Master Emergency Fallback Check (ENV credentials)
    // Always available, even if KV/Redis is down, throttled or quota exceeded
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (username.toLowerCase() === 'admin' && password === envAdminPassword) {
        rateLimit.delete(ip);
        const token = await signToken({ role: 'superadmin', username: 'admin' });
        const response = NextResponse.json({ success: true, role: 'superadmin' });
        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 2 // 2 hours
        });
        return response;
    }

    // 2. Database Users Check with safe error handling
    try {
        const users = await kv.get('admin_users');
        if (Array.isArray(users)) {
            const user = users.find(u => u && u.username && u.username.toLowerCase() === username.toLowerCase());

            if (user) {
                const hash = crypto.createHash('sha256').update(password).digest('hex');
                
                if (hash === user.passwordHash) {
                    // Reset attempts on success
                    rateLimit.delete(ip);

                    const token = await signToken({ role: user.role || 'superadmin', username: user.username });

                    const response = NextResponse.json({ success: true, role: user.role || 'superadmin' });

                    response.cookies.set('admin_token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                        maxAge: 60 * 60 * 2 // 2 hours
                    });

                    return response;
                }
            }
        }
    } catch (error) {
        console.error('Login KV lookup error (e.g. quota limit reached):', error.message);
        // Do not return 500 if KV is down, proceed to return 401
    }

    // Increment attempts on failure
    record.count += 1;
    rateLimit.set(ip, record);

    return NextResponse.json({ success: false, message: 'Identifiant ou mot de passe incorrect' }, { status: 401 });
}
