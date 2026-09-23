import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await kv.get('admin_users') || [];
        // Don't send password hashes to the client
        const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
        return NextResponse.json(safeUsers);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
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

        const { passwordHash, ...safeUser } = newUser;
        return NextResponse.json(safeUser);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
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
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
