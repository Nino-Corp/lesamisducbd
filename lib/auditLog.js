import { safeKvGet, safeKvSet, invalidateKvCache } from '@/lib/kvCache';
import crypto from 'crypto';

const MAX_AUTH_LOGS = 50;
const MAX_AUDIT_LOGS = 100;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Lightweight User-Agent parser without third-party dependencies
 */
export function parseUserAgent(ua = '') {
    let browser = 'Navigateur standard';
    let os = 'Système inconnu';
    let device = 'Ordinateur';

    if (/mobile|android|iphone|ipod/i.test(ua)) {
        device = /ipad|tablet/i.test(ua) ? 'Tablette' : 'Mobile';
    } else if (/ipad|tablet/i.test(ua)) {
        device = 'Tablette';
    }

    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    if (/edg/i.test(ua)) browser = 'Microsoft Edge';
    else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/opera|opr/i.test(ua)) browser = 'Opera';

    return { browser, os, device };
}

/**
 * Extract clean IP address from request headers
 */
export function getClientIp(request) {
    if (!request) return '127.0.0.1';
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    return '127.0.0.1';
}

/**
 * Record a login event (success or failure) in capped FIFO list
 */
export async function recordAuthEvent({ username, success, ip, userAgent, reason }) {
    try {
        const { browser, os, device } = parseUserAgent(userAgent);
        const existing = await safeKvGet('admin_auth_logs', []);
        const logs = Array.isArray(existing) ? existing : [];

        const newEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            username: username || 'inconnu',
            success: Boolean(success),
            ip: ip || '127.0.0.1',
            browser,
            os,
            device,
            reason: reason || (success ? 'Connexion réussie' : 'Mot de passe erroné')
        };

        const updated = [newEntry, ...logs].slice(0, MAX_AUTH_LOGS);
        await safeKvSet('admin_auth_logs', updated);
        return newEntry;
    } catch (e) {
        console.error('[AuditLog] Failed to record auth event:', e.message);
    }
}

/**
 * Register an active admin session on successful login
 */
export async function recordActiveSession({ sessionId, username, ip, userAgent }) {
    try {
        const { browser, os, device } = parseUserAgent(userAgent);
        const existing = await safeKvGet('admin_active_sessions', []);
        const now = Date.now();

        // Prune expired sessions older than 2 hours
        const active = Array.isArray(existing) 
            ? existing.filter(s => s && s.createdAt && (now - s.createdAt < SESSION_TTL_MS))
            : [];

        const newSession = {
            sessionId,
            username,
            ip: ip || '127.0.0.1',
            browser,
            os,
            device,
            createdAt: now,
            lastActiveAt: now
        };

        const updated = [newSession, ...active].slice(0, 20);
        await safeKvSet('admin_active_sessions', updated);
        return newSession;
    } catch (e) {
        console.error('[AuditLog] Failed to register active session:', e.message);
    }
}

/**
 * Record a sensitive modification (builder, products, settings, users, backup)
 */
export async function recordAdminAction({ username, action, target, details, ip }) {
    try {
        const existing = await safeKvGet('admin_audit_trail', []);
        const logs = Array.isArray(existing) ? existing : [];

        const newEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            username: username || 'admin',
            action,
            target: target || 'Système',
            details: details || '',
            ip: ip || '127.0.0.1'
        };

        const updated = [newEntry, ...logs].slice(0, MAX_AUDIT_LOGS);
        await safeKvSet('admin_audit_trail', updated);
        return newEntry;
    } catch (e) {
        console.error('[AuditLog] Failed to record admin action:', e.message);
    }
}

/**
 * Remote session revocation: disconnect all other devices
 */
export async function revokeOtherSessions(username, keepSessionId = null) {
    try {
        const now = Date.now();
        // Invalidate all tokens issued before now
        await safeKvSet(`admin_session_revoked_${username}`, now);
        
        if (keepSessionId) {
            await safeKvSet(`admin_session_exempt_${username}`, keepSessionId);
        }

        // Clean up session list
        const existing = await safeKvGet('admin_active_sessions', []);
        const sessions = Array.isArray(existing) ? existing : [];
        const filtered = sessions.filter(s => s && s.username === username && s.sessionId === keepSessionId);
        
        await safeKvSet('admin_active_sessions', filtered);
        invalidateKvCache();

        // Record security audit event
        await recordAdminAction({
            username,
            action: 'Révocation des sessions',
            target: 'Sécurité du compte',
            details: 'Toutes les autres sessions actives ont été déconnectées à distance'
        });

        return true;
    } catch (e) {
        console.error('[AuditLog] Failed to revoke sessions:', e.message);
        return false;
    }
}
