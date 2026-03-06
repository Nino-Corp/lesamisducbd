'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { signIn } from 'next-auth/react';

import useLockBodyScroll from '../../hooks/useLockBodyScroll';
import styles from './LoginModal.module.css';

export default function LoginModal({ isOpen, onClose, fromCheckout = false, initialView = 'login', resetToken = null }) {
    useLockBodyScroll(isOpen);
    const [mounted, setMounted] = useState(false);

    const [view, setView] = useState(initialView); // 'login' | 'register' | 'forgot_password' | 'reset_password'

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [idGender, setIdGender] = useState(''); // 1 for Mr, 2 for Mme
    const [birthday, setBirthday] = useState('');
    const [company, setCompany] = useState('');
    const [siret, setSiret] = useState('');
    const [rgpdAccepted, setRgpdAccepted] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setIsLoading(false);
            setError('');
            setMessage('');
        }
    }, [isOpen, initialView]);
    // Calculate password strength (0-3)
    const calculateStrength = (pwd) => {
        let score = 0;
        if (!pwd) return 0;

        // Critère 1 : Longueur brute (au moins 8)
        if (pwd.length >= 8) score += 1;

        // Critère 2 : Diversité (majuscules, minuscules)
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;

        // Critère 3 : Complexité (chiffres ET spéciaux)
        if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 1;

        return score; // Max 3 (Fort)
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        if (view === 'register') setPasswordStrength(calculateStrength(val));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        if (view === 'login') {
            const res = await signIn('credentials', {
                redirect: false,
                email,
                password
            });

            if (res?.error) {
                setError('Email ou mot de passe incorrect.');
                setIsLoading(false);
            } else {
                setIsLoading(false);
                onClose();
            }
        }
        else if (view === 'register') {
            if (!rgpdAccepted) {
                setError("Vous devez accepter la politique de confidentialité pour créer un compte.");
                setIsLoading(false);
                return;
            }

            if (passwordStrength < 3) {
                setError("Veuillez choisir un mot de passe plus fort.");
                setIsLoading(false);
                return;
            }

            try {
                const registerRes = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        firstname,
                        lastname,
                        id_gender: idGender || undefined,
                        birthday: birthday || undefined,
                        company: company || undefined,
                        siret: siret || undefined
                    })
                });

                const data = await registerRes.json();

                if (!registerRes.ok || !data.success) {
                    setError(data.message || "Erreur lors de l'inscription.");
                    setIsLoading(false);
                    return;
                }

                // Inscription réussie, connexion automatique
                const loginRes = await signIn('credentials', {
                    redirect: false,
                    email,
                    password
                });

                if (loginRes?.error) {
                    setError("Inscription réussie, mais erreur de connexion automatique.");
                } else {
                    onClose();
                }
            } catch (err) {
                console.error("Erreur lors de l'enregistrement:", err);
                setError("Impossible de joindre le serveur d'inscription.");
            } finally {
                setIsLoading(false);
            }
        }
        else if (view === 'forgot_password') {
            try {
                const res = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'request', email })
                });
                const data = await res.json();

                if (res.ok) {
                    setMessage(data.message);
                    setEmail('');
                } else {
                    setError(data.message || 'Une erreur est survenue');
                }
            } catch (err) {
                setError('Impossible de joindre le serveur');
            } finally {
                setIsLoading(false);
            }
        }
        else if (view === 'reset_password') {
            if (password !== confirmPassword) {
                setError('Les mots de passe ne correspondent pas');
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'reset', token: resetToken, newPassword: password })
                });
                const data = await res.json();

                if (res.ok) {
                    setMessage(data.message);
                    setTimeout(() => {
                        setView('login');
                        setPassword('');
                        setConfirmPassword('');
                        setMessage('');
                    }, 2000);
                } else {
                    setError(data.message || 'Une erreur est survenue');
                }
            } catch (err) {
                setError('Impossible de joindre le serveur');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const toggleMode = (e, newView) => {
        e?.preventDefault();
        setView(newView);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstname('');
        setLastname('');
        setIdGender('');
        setBirthday('');
        setCompany('');
        setSiret('');
        setRgpdAccepted(false);
        setError('');
        setMessage('');
    };

    if (!mounted || !isOpen) return null;

    const getTitle = () => {
        if (view === 'login') return fromCheckout ? 'Identifiez-vous' : 'Bon retour !';
        if (view === 'register') return fromCheckout ? 'Nouveau client ?' : 'Rejoignez-nous';
        if (view === 'forgot_password') return 'Mot de passe oublié ?';
        if (view === 'reset_password') return 'Nouveau mot de passe';
    };

    const getSubtitle = () => {
        if (view === 'login') return fromCheckout ? 'Connectez-vous pour valider votre commande' : 'Connectez-vous pour accéder à votre espace';
        if (view === 'register') return fromCheckout ? 'Créez votre compte pour finaliser vos achats' : 'Créez votre compte pour profiter de nos offres';
        if (view === 'forgot_password') return 'Entrez votre adresse email. Si un compte existe, nous vous enverrons un lien de réinitialisation.';
        if (view === 'reset_password') return 'Veuillez saisir votre nouveau mot de passe ci-dessous.';
    };

    return createPortal(
        <div className={styles.overlay}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
                    <X size={24} />
                </button>

                <h2 className={styles.title}>{getTitle()}</h2>

                <p className={styles.subtitle} style={view === 'forgot_password' ? { marginBottom: '20px' } : {}}>
                    {getSubtitle()}
                </p>

                {message && (
                    <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', lineHeight: '1.4' }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {(view === 'login' || view === 'register' || view === 'forgot_password') && (
                        <>
                            {view === 'register' && (
                                <>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Civilité</label>
                                        <div style={{ display: 'flex', gap: '20px', marginTop: '5px', marginBottom: '10px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="1"
                                                    checked={idGender === '1'}
                                                    onChange={(e) => setIdGender(e.target.value)}
                                                    style={{ cursor: 'pointer' }}
                                                    required
                                                />
                                                Monsieur
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="2"
                                                    checked={idGender === '2'}
                                                    onChange={(e) => setIdGender(e.target.value)}
                                                    style={{ cursor: 'pointer' }}
                                                    required
                                                />
                                                Madame
                                            </label>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label} htmlFor="firstname">Prénom</label>
                                        <input
                                            type="text"
                                            id="firstname"
                                            className={styles.input}
                                            placeholder="Jean"
                                            value={firstname}
                                            onChange={(e) => setFirstname(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label} htmlFor="lastname">Nom</label>
                                        <input
                                            type="text"
                                            id="lastname"
                                            className={styles.input}
                                            placeholder="Dupont"
                                            value={lastname}
                                            onChange={(e) => setLastname(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label} htmlFor="company">
                                            Société <span style={{ color: '#999', fontWeight: 400 }}>(optionnel)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            className={styles.input}
                                            placeholder="Ma Boutique"
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label} htmlFor="siret">
                                            Numéro d'identification fiscale <span style={{ color: '#999', fontWeight: 400 }}>(optionnel)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="siret"
                                            className={styles.input}
                                            placeholder="SIRET / TVA"
                                            value={siret}
                                            onChange={(e) => setSiret(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label} htmlFor="birthday">
                                            Date de naissance <span style={{ color: '#999', fontWeight: 400 }}>(optionnel)</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="birthday"
                                            className={styles.input}
                                            value={birthday}
                                            onChange={(e) => setBirthday(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </>
                            )}

                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className={styles.input}
                                    placeholder="vous@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {(view === 'login' || view === 'register' || view === 'reset_password') && (
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="password">
                                {view === 'reset_password' ? 'Nouveau mot de passe' : 'Mot de passe'}
                            </label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className={styles.input}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={view === 'reset_password' ? 6 : undefined}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {view === 'register' && (
                                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', height: '4px', borderRadius: '2px', overflow: 'hidden', background: '#e5e7eb' }}>
                                        <div style={{ flex: 1, background: passwordStrength >= 1 ? (passwordStrength === 1 ? '#EF4444' : passwordStrength === 2 ? '#F59E0B' : '#10B981') : 'transparent', transition: 'background 0.3s' }}></div>
                                        <div style={{ flex: 1, background: passwordStrength >= 2 ? (passwordStrength === 2 ? '#F59E0B' : '#10B981') : 'transparent', transition: 'background 0.3s' }}></div>
                                        <div style={{ flex: 1, background: passwordStrength >= 3 ? '#10B981' : 'transparent', transition: 'background 0.3s' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: password.length >= 8 ? '#10B981' : '#6B7280' }}>
                                            {password.length >= 8 ? <Check size={14} /> : <X size={14} />}
                                            Entrez un mot de passe entre 8 et 72 caractères.
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) ? '#10B981' : '#6B7280' }}>
                                            {(/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) ? <Check size={14} /> : <X size={14} />}
                                            Inclure au moins 1 chiffre et 1 symbole.
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordStrength >= 3 ? '#10B981' : '#6B7280' }}>
                                            {passwordStrength >= 3 ? <Check size={14} /> : <X size={14} />}
                                            Le score minimum doit être: Fort.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'reset_password' && (
                        <div className={styles.inputGroup} style={{ marginTop: '15px' }}>
                            <label className={styles.label} htmlFor="confirmPassword">Confirmer le mot de passe</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                className={styles.input}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    {view === 'login' && (
                        <div style={{ textAlign: 'right', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={(e) => toggleMode(e, 'forgot_password')}
                                style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>
                    )}

                    {view === 'register' && (
                        <div className={styles.checkboxGroup} style={{ marginTop: '4px' }}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={rgpdAccepted}
                                    onChange={(e) => setRgpdAccepted(e.target.checked)}
                                    className={styles.checkbox}
                                    required
                                />
                                J&apos;accepte la{' '}
                                <a href="/privacy" target="_blank" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                    politique de confidentialité
                                </a>{' '}
                                et le traitement de mes données personnelles.
                            </label>
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: view === 'login' ? '10px' : '-0.5rem', marginBottom: '0.5rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className={styles.submitButton} disabled={isLoading} style={view === 'forgot_password' ? { marginTop: '15px' } : {}}>
                        {isLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                {view === 'login' ? 'Connexion...' : view === 'register' ? 'Inscription...' : 'Envoi en cours...'}
                            </span>
                        ) : (
                            view === 'login' ? 'Se connecter' : view === 'register' ? "S'inscrire" : view === 'forgot_password' ? 'Recevoir le lien' : 'Enregistrer le mot de passe'
                        )}
                    </button>

                    <style jsx global>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </form>

                <div className={styles.switchText}>
                    {view === 'login' && (
                        <>
                            Pas encore de compte ?
                            <button className={styles.switchLink} onClick={(e) => toggleMode(e, 'register')} type="button">
                                Créer un compte
                            </button>
                        </>
                    )}
                    {view === 'register' && (
                        <>
                            Déjà un compte ?
                            <button className={styles.switchLink} onClick={(e) => toggleMode(e, 'login')} type="button">
                                Se connecter
                            </button>
                        </>
                    )}
                    {view === 'forgot_password' && (
                        <button className={styles.switchLink} onClick={(e) => toggleMode(e, 'login')} type="button" style={{ display: 'block', margin: '0 auto' }}>
                            ← Retour à la connexion
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
