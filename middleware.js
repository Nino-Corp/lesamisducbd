import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super-secret-key-change-this';
const key = new TextEncoder().encode(secretKey);

const nextAuthMiddleware = withAuth(
    function middleware(req) {
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
        pages: {
            signIn: '/connexion',
        },
    }
);

export default async function middleware(req) {
    const { pathname } = req.nextUrl;

    // 1. Admin Routes Protection
    if (pathname.startsWith('/admin')) {
        if (pathname === '/admin/login') {
            return NextResponse.next();
        }

        const token = req.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        try {
            await jwtVerify(token, key, { algorithms: ['HS256'] });
            return NextResponse.next();
        } catch (e) {
            console.error('Middleware Admin JWT Error:', e.message);
            const response = NextResponse.redirect(new URL('/admin/login', req.url));
            response.cookies.delete('admin_token');
            return response;
        }
    }

    // 2. Client Routes Protection (NextAuth)
    if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
        return nextAuthMiddleware(req, Object.assign({}));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/account/:path*",
        "/checkout/:path*"
    ]
};
