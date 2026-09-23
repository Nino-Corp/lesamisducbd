'use client';

import { useState, useEffect } from 'react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // New user form state
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('editor');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de la récupération');
            }
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setAdding(true);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de la création');
            }

            setUsers([...users, data]);
            setNewUsername('');
            setNewPassword('');
            setNewRole('editor');
        } catch (err) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (username) => {
        if (!confirm(`Voulez-vous vraiment supprimer l'utilisateur ${username} ?`)) return;
        
        try {
            const res = await fetch(`/api/admin/users?username=${encodeURIComponent(username)}`, {
                method: 'DELETE'
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de la suppression');
            }
            
            setUsers(users.filter(u => u.username !== username));
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Chargement...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', color: '#1F4B40', marginBottom: '1.5rem', fontWeight: 800 }}>Gestion des accès</h1>
            
            {error && (
                <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Liste des utilisateurs */}
                <div>
                    <h2 style={{ fontSize: '1.2rem', color: '#374151', marginBottom: '1rem', fontWeight: 700 }}>Comptes existants</h2>
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        {users.map(user => (
                            <div key={user.username} style={{ 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' 
                            }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '1.05rem' }}>{user.username}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                                            background: user.role === 'superadmin' ? '#fef3c7' : '#e0f2fe',
                                            color: user.role === 'superadmin' ? '#92400e' : '#0369a1'
                                        }}>
                                            {user.role === 'superadmin' ? 'Super Admin' : 'Éditeur'}
                                        </span>
                                        <span>Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(user.username)}
                                    disabled={user.username === 'admin'}
                                    style={{ 
                                        padding: '6px 12px', background: '#fee2e2', color: '#991b1b', 
                                        border: 'none', borderRadius: '6px', cursor: user.username === 'admin' ? 'not-allowed' : 'pointer',
                                        opacity: user.username === 'admin' ? 0.5 : 1, fontWeight: 600, fontSize: '0.85rem'
                                    }}
                                >
                                    Révoquer
                                </button>
                            </div>
                        ))}
                        {users.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                Aucun utilisateur trouvé.
                            </div>
                        )}
                    </div>
                </div>

                {/* Formulaire d'ajout */}
                <div>
                    <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '1.2rem', color: '#1F4B40', marginBottom: '1.5rem', fontWeight: 700 }}>Créer un compte</h2>
                        
                        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Identifiant</label>
                                <input 
                                    type="text" 
                                    value={newUsername}
                                    onChange={e => setNewUsername(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Mot de passe</label>
                                <input 
                                    type="text" 
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Le mot de passe que l'employé devra utiliser.</p>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Rôle</label>
                                <select 
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none', background: 'white' }}
                                >
                                    <option value="editor">Éditeur (Gère le site)</option>
                                    <option value="superadmin">Super Admin (Gère tout)</option>
                                </select>
                            </div>

                            <button 
                                type="submit"
                                disabled={adding}
                                style={{ 
                                    marginTop: '0.5rem', padding: '0.75rem', background: '#00FF94', color: '#1F4B40', 
                                    border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                                    opacity: adding ? 0.7 : 1
                                }}
                            >
                                {adding ? 'Création...' : 'Créer le compte'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
