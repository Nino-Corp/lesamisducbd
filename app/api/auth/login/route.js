import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import crypto from 'crypto';
import { recordAuthEvent, recordActiveSession, getClientIp } from '@/lib/auditLog';

// Simple in-memory rate limiter
const rateLimit = new Map();

export async function POST(request) {
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
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
        await recordAuthEvent({ username: 'inconnu', success: false, ip, userAgent, reason: 'Blocage sécurité (trop de tentatives)' });
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

                    const sessionId = crypto.randomUUID();
                    const token = await signToken({ role: user.role || 'superadmin', username: user.username, sessionId });
                    const response = NextResponse.json({ success: true, role: user.role || 'superadmin' });

                    response.cookies.set('admin_token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                        maxAge: 60 * 60 * 2 // 2 hours
                    });

                    // Log success and active session in background
                    recordAuthEvent({ username: user.username, success: true, ip, userAgent }).catch(() => {});
                    recordActiveSession({ sessionId, username: user.username, ip, userAgent }).catch(() => {});

                    return response;
                } else {
                    // Utilisateur trouvé mais mot de passe invalide
                    record.count += 1;
                    rateLimit.set(ip, record);
                    await recordAuthEvent({ username, success: false, ip, userAgent, reason: 'Mot de passe incorrect' });
                    return NextResponse.json({ success: false, message: 'Identifiant ou mot de passe incorrect' }, { status: 401 });
                }
            }
        }
    } catch (error) {
        console.error('Login KV lookup error (e.g. quota limit reached):', error.message);
        kvAvailable = false;
    }

    // 2. Master Emergency Fallback Check (ENV credentials)
    const adminExistsInDb = dbUsers && dbUsers.some(u => u?.username?.toLowerCase() === 'admin');
    if (!kvAvailable || (!adminExistsInDb && username.toLowerCase() === 'admin')) {
        const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        if (username.toLowerCase() === 'admin' && password === envAdminPassword) {
            rateLimit.delete(ip);
            const sessionId = crypto.randomUUID();
            const token = await signToken({ role: 'superadmin', username: 'admin', sessionId });
            const response = NextResponse.json({ success: true, role: 'superadmin' });
            response.cookies.set('admin_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 2 // 2 hours
            });

            recordAuthEvent({ username: 'admin', success: true, ip, userAgent, reason: 'Connexion de secours (ENV)' }).catch(() => {});
            recordActiveSession({ sessionId, username: 'admin', ip, userAgent }).catch(() => {});

            return response;
        }
    }

    // Increment attempts on failure
    record.count += 1;
    rateLimit.set(ip, record);
    await recordAuthEvent({ username, success: false, ip, userAgent, reason: 'Identifiant inexistant ou incorrect' });

    return NextResponse.json({ success: false, message: 'Identifiant ou mot de passe incorrect' }, { status: 401 });
}
