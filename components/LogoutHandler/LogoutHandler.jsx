'use client';

/**
 * LogoutHandler
 *
 * Mounted once at the root layout level. Detects when PrestaShop redirects the
 * user back to the front-end with ?action=logout after a checkout-side logout,
 * then silently:
 *   1. Signs the user out of Next-Auth (destroys the JWT/session cookie).
 *   2. Clears the cart from localStorage so stale data doesn't persist.
 *   3. Opens the Login modal so the user can log in again immediately.
 *   4. Removes the ?action=logout param from the URL bar without a page reload.
 */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import LoginModal from '@/components/LoginModal/LoginModal';

function LogoutHandlerInner() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        if (searchParams.get('action') !== 'logout') return;

        // 1. Clean the URL immediately — no reload, no flash
        const cleanUrl = pathname || '/';
        window.history.replaceState({}, '', cleanUrl);

        // 2. Clear cart from localStorage & save it
        const saveAndClearCart = async () => {
            try {
                const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
                if (currentCart.length > 0) {
                    await fetch('/api/user/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cart: currentCart })
                    });
                }
                localStorage.removeItem('cart');
            } catch (_) { /* SSR-safe */ }
        };

        saveAndClearCart().finally(() => {
            // 3. Sign out of Next-Auth (destroy JWT session cookie client-side)
            //    redirect: false so we stay on the current page
            signOut({ redirect: false }).then(() => {
                // 4. Open the login modal once the session is destroyed
                setShowLoginModal(true);
            });
        });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount — searchParams is stable at mount time

    return (
        <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
        />
    );
}

/**
 * Wrap in Suspense because useSearchParams() requires a Suspense boundary
 * when used in the App Router (avoids the "missing Suspense" build error).
 */
export default function LogoutHandler() {
    return (
        <Suspense fallback={null}>
            <LogoutHandlerInner />
        </Suspense>
    );
}
