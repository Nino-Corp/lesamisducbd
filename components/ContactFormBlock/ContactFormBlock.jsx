'use client';

import React, { useState } from 'react';
import styles from './ContactFormBlock.module.css';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactFormBlock({ title = "Contactez-nous", description = "Laissez-nous un message et nous vous répondrons rapidement.", buttonText = "Envoyer le message" }) {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) return;
        setStatus('loading');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
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
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>

                {status === 'success' ? (
                    <div className={styles.successMessage}>
                        <CheckCircle2 size={32} color="#166534" />
                        <span>Votre message a été envoyé avec succès !</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Votre nom"
                                value={formData.name}
                                onChange={handleChange}
                                className={styles.input}
                                disabled={status === 'loading'}
                            />
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="Votre e-mail"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                disabled={status === 'loading'}
                            />
                        </div>
                        <textarea
                            name="message"
                            required
                            placeholder="Votre message..."
                            value={formData.message}
                            onChange={handleChange}
                            className={styles.textarea}
                            rows={5}
                            disabled={status === 'loading'}
                        />
                        <button type="submit" className={styles.button} disabled={status === 'loading'}>
                            {status === 'loading' ? 'Envoi en cours...' : buttonText}
                            <Send size={18} />
                        </button>
                    </form>
                )}
                {status === 'error' && (
                    <div className={styles.errorMessage}>
                        <AlertCircle size={16} /> Erreur lors de l'envoi. Veuillez réessayer plus tard.
                    </div>
                )}
            </div>
        </div>
    );
}
