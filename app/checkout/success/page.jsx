'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './success.module.css';

export default function CheckoutSuccessPage() {
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart(true); // silent = true
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <CheckCircle size={64} className={styles.icon} />
                <h1 className={styles.title}>Merci pour votre commande !</h1>
                <p className={styles.subtitle}>
                    Votre paiement a été accepté. Vous allez recevoir un email de confirmation.
                </p>
                <p className={styles.note}>
                    Votre commande est en cours de traitement. Nous vous contacterons dès qu'elle sera expédiée.
                </p>
                <Link href="/" className={styles.btn}>
                    Retourner à la boutique
                </Link>
            </div>
        </div>
    );
}
