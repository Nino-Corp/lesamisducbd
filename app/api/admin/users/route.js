import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import crypto from 'crypto';
import { recordAdminAction, getClientIp } from '@/lib/auditLog';

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await kv.get('admin_users');
        const safeUsers = Array.isArray(users) ? users.map(({ passwordHash, ...rest }) => rest) : [];
        if (!safeUsers.some(u => u.username === 'admin')) {
            safeUsers.unshift({ username: 'admin', role: 'superadmin', createdAt: 'Système' });
        }
        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error('Users API GET error (returning fallback):', error.message);
        return NextResponse.json([{ username: 'admin', role: 'superadmin', createdAt: 'Système' }]);
    }
}

export async function POST(request) {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { username, password, role } = await request.json();

        if (!username || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Le mot de passe doit comporter au moins 8 caractères' }, { status: 400 });
        }

        const users = await kv.get('admin_users') || [];
        
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return NextResponse.json({ error: 'Cet identifiant existe déjà' }, { status: 400 });
        }

        const hash = crypto.createHash('sha256').update(password).digest('hex');

        const newUser = {
            username: username.toLowerCase(),
            passwordHash: hash,
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await kv.set('admin_users', users);

        recordAdminAction({
            username: session.username,
            action: 'Création de compte',
            target: username,
            details: `Rôle : ${role === 'superadmin' ? 'Super Admin' : 'Éditeur'}`,
            ip: getClientIp(request)
        }).catch(() => {});

        const { passwordHash, ...safeUser } = newUser;
        return NextResponse.json(safeUser);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { username, newPassword } = await request.json();

        if (!username || !newPassword) {
            return NextResponse.json({ error: 'Identifiant et nouveau mot de passe requis' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 });
        }

        const users = await kv.get('admin_users') || [];
        const userIndex = users.findIndex(u => u.username && u.username.toLowerCase() === username.toLowerCase());

        const hash = crypto.createHash('sha256').update(newPassword).digest('hex');

        if (userIndex === -1) {
            if (username.toLowerCase() === 'admin') {
                users.unshift({
                    username: 'admin',
                    passwordHash: hash,
                    role: 'superadmin',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } else {
                return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
            }
        } else {
            users[userIndex].passwordHash = hash;
            users[userIndex].updatedAt = new Date().toISOString();
        }

        await kv.set('admin_users', users);

        recordAdminAction({
            username: session.username,
            action: 'Modification de mot de passe',
            target: username,
            details: 'Mot de passe administrateur mis à jour',
            ip: getClientIp(request)
        }).catch(() => {});

        return NextResponse.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
        console.error('Password update error:', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du mot de passe' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: 'Missing username' }, { status: 400 });
        }

        if (username.toLowerCase() === 'admin') {
            return NextResponse.json({ error: 'Cannot delete the initial superadmin' }, { status: 400 });
        }
        
        if (username.toLowerCase() === session.username.toLowerCase()) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        const users = await kv.get('admin_users') || [];
        const filteredUsers = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());

        if (users.length === filteredUsers.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await kv.set('admin_users', filteredUsers);

        recordAdminAction({
            username: session.username,
            action: "Révocation d'accès",
            target: username,
            details: 'Compte administrateur supprimé définitivement',
            ip: getClientIp(request)
        }).catch(() => {});

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
