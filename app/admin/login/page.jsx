
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Force hard navigation to ensure cookies are sent 
                window.location.href = '/admin/content';
            } else {
                setError(data.message || 'Mot de passe incorrect');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Erreur de connexion serveur');
            alert('Erreur technique: ' + err.message);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#1F4B40', // Brand Dark Green
            backgroundImage: 'radial-gradient(circle at top left, #1F4B40 0%, #0d211c 100%)',
            fontFamily: "'Bricolage Grotesque', sans-serif",
            padding: '20px'
        }}>
            <form onSubmit={handleSubmit} style={{
                padding: '3rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                width: '100%',
                maxWidth: '420px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ color: '#00FF94', fontSize: '2rem', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px' }}>ADMIN</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>Espace de gestion Les Amis du CBD</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#00FF94', marginLeft: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identifiant</label>
                    <input
                        type="text"
                        placeholder=""
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            padding: '1.25rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '1rem',
                            outline: 'none',
                            background: 'rgba(0, 0, 0, 0.2)',
                            color: 'white',
                            transition: 'all 0.2s',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                            width: '100%'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#00FF94', marginLeft: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mot de passe</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                padding: '1.25rem',
                                paddingRight: '3.5rem',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '1rem',
                                outline: 'none',
                                background: 'rgba(0, 0, 0, 0.2)',
                                color: 'white',
                                transition: 'all 0.2s',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                                width: '100%'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'rgba(255, 255, 255, 0.6)',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {error && <p style={{ color: '#ff6b6b', fontSize: '0.9rem', background: 'rgba(255, 107, 107, 0.1)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255, 107, 107, 0.2)' }}>{error}</p>}

                <button type="submit" style={{
                    padding: '1.25rem',
                    backgroundColor: '#00FF94',
                    color: '#1F4B40',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    marginTop: '1rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 255, 148, 0.4)',
                    transition: 'transform 0.2s'
                }}>Se connecter</button>

                <Link href="/" style={{
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    marginTop: '1rem',
                    transition: 'color 0.2s'
                }} className="hover:text-white">
                    ← Revenir au site
                </Link>
            </form>
        </div>
    );
}
