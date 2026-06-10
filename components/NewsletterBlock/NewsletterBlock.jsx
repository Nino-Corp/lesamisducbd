'use client';

import React, { useState } from 'react';
import styles from './NewsletterBlock.module.css';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NewsletterBlock({ title = "Rejoignez notre Newsletter", description = "Recevez nos dernières offres.", buttonText = "S'inscrire", placeholder = "Votre e-mail" }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <Mail size={32} color="#1F4B40" />
                </div>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.description} dangerouslySetInnerHTML={{ __html: description }} />

                {status === 'success' ? (
                    <div className={styles.successMessage}>
                        <CheckCircle2 size={20} color="#166534" />
                        <span>Inscription réussie ! Merci.</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <input
                            type="email"
                            required
                            placeholder={placeholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            disabled={status === 'loading'}
                        />
                        <button type="submit" className={styles.button} disabled={status === 'loading'}>
                            {status === 'loading' ? '...' : buttonText}
                        </button>
                    </form>
                )}
                {status === 'error' && (
                    <div className={styles.errorMessage}>
                        <AlertCircle size={16} /> Une erreur est survenue. Veuillez réessayer.
                    </div>
                )}
            </div>
        </div>
    );
}
