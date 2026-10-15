import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { safeKvGet } from '@/lib/kvCache';
import { revokeOtherSessions, recordAdminAction, getClientIp } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Accès réservé aux super-administrateurs' }, { status: 401 });
    }

    try {
        const [authLogs, activeSessionsRaw, auditTrail] = await Promise.all([
            safeKvGet('admin_auth_logs', []),
            safeKvGet('admin_active_sessions', []),
            safeKvGet('admin_audit_trail', [])
        ]);

        const now = Date.now();
        const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2h

        // Filter expired sessions and flag current session
        const activeSessions = (Array.isArray(activeSessionsRaw) ? activeSessionsRaw : [])
            .filter(s => s && s.createdAt && (now - s.createdAt < SESSION_TTL_MS))
            .map(s => ({
                ...s,
                isCurrent: s.sessionId === session.sessionId
            }));

        return NextResponse.json({
            authLogs: Array.isArray(authLogs) ? authLogs : [],
            activeSessions,
            auditTrail: Array.isArray(auditTrail) ? auditTrail : []
        });
    } catch (error) {
        console.error('[Audit API] GET error:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des journaux de sécurité' }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Accès réservé aux super-administrateurs' }, { status: 401 });
    }

    const ip = getClientIp(request);

    try {
        const body = await request.json();
        const { action } = body;

        if (action === 'revoke-others') {
            await revokeOtherSessions(session.username, session.sessionId);
            return NextResponse.json({
                success: true,
                message: 'Toutes les autres sessions ont été révoquées et déconnectées avec succès.'
            });
        }

        if (action === 'log') {
            const { actionName, target, details } = body;
            await recordAdminAction({
                username: session.username,
                action: actionName || 'Action administrateur',
                target: target || 'Système',
                details: details || '',
                ip
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    } catch (error) {
        console.error('[Audit API] POST error:', error);
        return NextResponse.json({ error: 'Erreur lors du traitement de la requête' }, { status: 500 });
    }
}
