import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { safeKvGet } from '@/lib/kvCache';
import crypto from 'crypto';

const secretKey = process.env.JWT_SECRET || 'super-secret-key-change-this';
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload) {
    const fullPayload = {
        sessionId: payload?.sessionId || crypto.randomUUID(),
        createdAt: payload?.createdAt || Date.now(),
        ...payload,
    };
    return await new SignJWT(fullPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(key);
}

export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (e) {
        console.error('JWT Verify Error:', e);
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;
    const session = await verifyToken(token);
    if (!session) return null;

    // Check if user sessions were remotely revoked
    if (session.username && session.createdAt) {
        try {
            const revokedBefore = await safeKvGet(`admin_session_revoked_${session.username}`, 0);
            if (revokedBefore && session.createdAt < revokedBefore) {
                const exemptSessionId = await safeKvGet(`admin_session_exempt_${session.username}`, null);
                if (!exemptSessionId || session.sessionId !== exemptSessionId) {
                    return null; // Session has been remotely revoked!
                }
            }
        } catch {
            // Non-blocking fallback
        }
    }

    return session;
}
