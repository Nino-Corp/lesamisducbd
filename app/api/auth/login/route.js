
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

    let kvAvailable = false;
    let dbUsers = null;

    // 1. Database Users Check (Priorité n°1 absolue au mot de passe en base)
    try {
        const users = await kv.get('admin_users');
        if (Array.isArray(users)) {
            kvAvailable = true;
            dbUsers = users;
            const user = users.find(u => u && u.username && u.username.toLowerCase() === username.toLowerCase());

            if (user) {
                const hash = crypto.createHash('sha256').update(password).digest('hex');
                
                if (hash === user.passwordHash) {
                    // Mot de passe valide en base
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
                } else {
                    // Utilisateur trouvé mais mot de passe invalide : rejet immédiat.
                    // L'ancien mot de passe en dur dans Vercel n'est PLUS accepté.
                    record.count += 1;
                    rateLimit.set(ip, record);
                    return NextResponse.json({ success: false, message: 'Identifiant ou mot de passe incorrect' }, { status: 401 });
                }
            }
        }
    } catch (error) {
        console.error('Login KV lookup error (e.g. quota limit reached):', error.message);
        kvAvailable = false;
    }

    // 2. Master Emergency Fallback Check (ENV credentials)
    // Actif UNIQUEMENT si la base de données est en panne ou si le compte admin n'existe pas encore en base
    const adminExistsInDb = dbUsers && dbUsers.some(u => u?.username?.toLowerCase() === 'admin');
    if (!kvAvailable || (!adminExistsInDb && username.toLowerCase() === 'admin')) {
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
    }

    // Increment attempts on failure
    record.count += 1;
    rateLimit.set(ip, record);

    return NextResponse.json({ success: false, message: 'Identifiant ou mot de passe incorrect' }, { status: 401 });
}
