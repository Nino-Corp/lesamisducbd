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
    const { pathname, searchParams } = req.nextUrl;
    
    // We create a base response object. Next.js middleware allows returning this or modifying it.
    let response = NextResponse.next();

    // 0. Catch Sponsorship Parameter (Tracking)
    const sponsorship = searchParams.get('sponsorship');
    if (sponsorship) {
        // Set a cookie for 30 days
        response.cookies.set({
            name: 'sponsorship_code',
            value: sponsorship,
            path: '/',
            maxAge: 60 * 60 * 24 * 30, 
            httpOnly: true, // Secure, not readable via JS
            secure: process.env.NODE_ENV === 'production'
        });
    }

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
            const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
            
            // Check for superadmin routes
            if (pathname.startsWith('/admin/users')) {
                if (payload.role !== 'superadmin') {
                    // Redirect non-superadmins back to the main dashboard
                    return NextResponse.redirect(new URL('/admin/content', req.url));
                }
            }
            
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

    return response;
}

export const config = {
    matcher: [
        "/",
        "/admin/:path*",
        "/account/:path*",
        "/checkout/:path*",
        "/produit/:path*",
        "/produits/:path*"
    ]
};
