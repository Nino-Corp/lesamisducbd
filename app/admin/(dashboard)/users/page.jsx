'use client';

import { useState, useEffect } from 'react';
import styles from './Users.module.css';
import { 
    Key, ShieldCheck, Lock, Eye, EyeOff, Sparkles, 
    Check, X, UserPlus, Trash2, Users, AlertCircle, 
    Calendar, CheckCircle2 
} from 'lucide-react';

/* ── Password Security Evaluator ── */
function evaluatePassword(pwd) {
    if (!pwd) {
        return {
            score: 0,
            label: 'Vide',
            color: '#e2e8f0',
            checks: [
                { id: 'length', label: 'Au moins 8 caractères', met: false },
                { id: 'case', label: 'Majuscule et minuscule', met: false },
                { id: 'number', label: 'Au moins un chiffre', met: false },
                { id: 'special', label: 'Un symbole (!, @, #...)', met: false }
            ]
        };
    }

    const checks = [
        { id: 'length', label: 'Au moins 8 caractères', met: pwd.length >= 8 },
        { id: 'case', label: 'Majuscule et minuscule', met: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) },
        { id: 'number', label: 'Au moins un chiffre', met: /[0-9]/.test(pwd) },
        { id: 'special', label: 'Un symbole (!, @, #...)', met: /[^A-Za-z0-9]/.test(pwd) }
    ];

    const passedCount = checks.filter(c => c.met).length;

    let score = passedCount;
    // Boost for 12+ chars
    if (pwd.length >= 12 && passedCount >= 3) score = 4;

    let label = 'Très faible';
    let color = '#ef4444';

    if (score === 2) {
        label = 'Faible';
        color = '#f97316';
    } else if (score === 3) {
        label = 'Moyen';
        color = '#eab308';
    } else if (score >= 4) {
        label = 'Robuste';
        color = '#10b981';
    }

    return { score, label, color, checks };
}

/* ── Strong Password Generator ── */
function generateStrongPassword() {
    const lowers = 'abcdefghjkmnpqrstuvwxyz';
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const specials = '!@#$%^&*-_+=';
    const all = lowers + uppers + numbers + specials;

    let pwd = '';
    pwd += lowers[Math.floor(Math.random() * lowers.length)];
    pwd += uppers[Math.floor(Math.random() * uppers.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += specials[Math.floor(Math.random() * specials.length)];

    for (let i = 4; i < 14; i++) {
        pwd += all[Math.floor(Math.random() * all.length)];
    }

    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

/* ── Visual Password Strength Meter ── */
function PasswordStrengthMeter({ password }) {
    if (!password) return null;

    const { score, label, color, checks } = evaluatePassword(password);

    return (
        <div className={styles.strengthMeterContainer}>
            <div className={styles.strengthLabelRow}>
                <span className={styles.strengthLabelText}>Robustesse du mot de passe</span>
                <span 
                    className={styles.strengthScoreBadge}
                    style={{ background: `${color}20`, color: color === '#00FF94' ? '#047857' : color }}
                >
                    {label}
                </span>
            </div>

            <div className={styles.strengthBar}>
                {[1, 2, 3, 4].map((seg) => (
                    <div 
                        key={seg} 
                        className={styles.strengthSegment}
                        style={{
                            backgroundColor: score >= seg ? color : '#e2e8f0'
                        }}
                    />
                ))}
            </div>

            <ul className={styles.checklist}>
                {checks.map((chk) => (
                    <li 
                        key={chk.id} 
                        className={`${styles.checkItem} ${chk.met ? styles.checkItemMet : styles.checkItemPending}`}
                    >
                        {chk.met ? <Check size={12} strokeWidth={3} /> : <span style={{ width: 12, textAlign: 'center' }}>•</span>}
                        <span>{chk.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // New user form state
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [newRole, setNewRole] = useState('editor');
    const [adding, setAdding] = useState(false);

    // Edit password modal state
    const [editUser, setEditUser] = useState(null);
    const [editPassword, setEditPassword] = useState('');
    const [editConfirm, setEditConfirm] = useState('');
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [modalError, setModalError] = useState('');
    const [copiedNotify, setCopiedNotify] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 4000);
    };

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

        if (newPassword.length < 8) {
            setError('Le mot de passe doit comporter au moins 8 caractères.');
            return;
        }

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
            showSuccess(`Compte "${data.username}" créé avec succès !`);
        } catch (err) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    const handleOpenEditPassword = (user) => {
        setEditUser(user);
        setEditPassword('');
        setEditConfirm('');
        setModalError('');
        setShowEditPassword(false);
        setCopiedNotify(false);
    };

    const handleGenerateForEdit = () => {
        const strong = generateStrongPassword();
        setEditPassword(strong);
        setEditConfirm(strong);
        setShowEditPassword(true);
        navigator.clipboard?.writeText(strong);
        setCopiedNotify(true);
        setTimeout(() => setCopiedNotify(false), 3000);
    };

    const handleGenerateForNew = () => {
        const strong = generateStrongPassword();
        setNewPassword(strong);
        setShowNewPassword(true);
        navigator.clipboard?.writeText(strong);
        showSuccess('Mot de passe généré et copié dans le presse-papiers !');
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setModalError('');

        if (editPassword.length < 8) {
            setModalError('Le mot de passe doit comporter au moins 8 caractères.');
            return;
        }

        if (editPassword !== editConfirm) {
            setModalError('Les deux mots de passe ne correspondent pas.');
            return;
        }

        setSavingPassword(true);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: editUser.username, 
                    newPassword: editPassword 
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de la modification');
            }

            // Update local user list
            setUsers(prev => prev.map(u => u.username === editUser.username ? { ...u, updatedAt: new Date().toISOString() } : u));
            setEditUser(null);
            showSuccess(`Mot de passe de "${editUser.username}" mis à jour avec succès !`);
        } catch (err) {
            setModalError(err.message);
        } finally {
            setSavingPassword(false);
        }
    };

    const handleDelete = async (username) => {
        if (!confirm(`Voulez-vous vraiment révoquer l'accès pour "${username}" ?`)) return;
        
        try {
            const res = await fetch(`/api/admin/users?username=${encodeURIComponent(username)}`, {
                method: 'DELETE'
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de la suppression');
            }
            
            setUsers(users.filter(u => u.username !== username));
            showSuccess(`L'utilisateur "${username}" a été révoqué.`);
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className={styles.container} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Chargement des accès...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    <ShieldCheck size={32} color="#1F4B40" />
                    Accès & Sécurité
                </h1>
                <p className={styles.pageSubtitle}>
                    Gérez les comptes autorisés à administrer la boutique et définissez leurs mots de passe.
                </p>
            </div>

            {/* Notification Messages */}
            {successMessage && (
                <div className={styles.alertSuccess}>
                    <CheckCircle2 size={18} />
                    <span>{successMessage}</span>
                </div>
            )}

            {error && (
                <div className={styles.alertError}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Content Grid */}
            <div className={styles.grid}>
                {/* Left: Accounts List */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            <Users size={18} color="#1F4B40" />
                            Comptes Administrateurs
                        </h2>
                        <span className={styles.badgeCount}>{users.length} compte{users.length > 1 ? 's' : ''}</span>
                    </div>

                    <div className={styles.userList}>
                        {users.map(user => {
                            const isSystemAdmin = user.username.toLowerCase() === 'admin';
                            const initial = user.username.charAt(0).toUpperCase();

                            return (
                                <div key={user.username} className={styles.userRow}>
                                    <div className={styles.userInfo}>
                                        <div className={styles.avatar}>{initial}</div>
                                        <div>
                                            <div className={styles.username}>
                                                {user.username}
                                                <span className={user.role === 'superadmin' ? styles.roleSuperadmin : styles.roleEditor}>
                                                    {user.role === 'superadmin' ? 'Super Admin' : 'Éditeur'}
                                                </span>
                                            </div>
                                            <div className={styles.meta}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} />
                                                    Créé le {user.createdAt ? (user.createdAt === 'Système' ? 'Système' : new Date(user.createdAt).toLocaleDateString('fr-FR')) : 'Inconnu'}
                                                </span>
                                                {user.updatedAt && (
                                                    <span style={{ color: '#059669', fontWeight: 600 }}>
                                                        • Modifié le {new Date(user.updatedAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.userActions}>
                                        <button 
                                            onClick={() => handleOpenEditPassword(user)}
                                            className={styles.btnKey}
                                            title="Modifier le mot de passe"
                                        >
                                            <Key size={14} />
                                            <span>Modifier mot de passe</span>
                                        </button>

                                        <button 
                                            onClick={() => handleDelete(user.username)}
                                            disabled={isSystemAdmin}
                                            className={styles.btnRevoke}
                                            title={isSystemAdmin ? "Le super-administrateur principal ne peut pas être révoqué" : "Révoquer l'accès"}
                                        >
                                            <Trash2 size={13} />
                                            <span>Révoquer</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {users.length === 0 && (
                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                                Aucun utilisateur trouvé.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Create Account Form */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            <UserPlus size={18} color="#1F4B40" />
                            Créer un accès
                        </h2>
                    </div>

                    <form onSubmit={handleAddUser} className={styles.formBody}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Identifiant</label>
                            <input 
                                type="text" 
                                value={newUsername}
                                onChange={e => setNewUsername(e.target.value)}
                                placeholder="ex: sophie_marketing"
                                required
                                className={styles.input}
                                style={{ paddingRight: '0.85rem' }}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <div className={styles.formLabel}>
                                <span>Mot de passe</span>
                                <button 
                                    type="button" 
                                    onClick={handleGenerateForNew}
                                    className={styles.generateBtn}
                                >
                                    <Sparkles size={12} />
                                    Générer robuste
                                </button>
                            </div>
                            <div className={styles.inputWrapper}>
                                <input 
                                    type={showNewPassword ? "text" : "password"} 
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="8 caractères min."
                                    required
                                    className={styles.input}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className={styles.toggleEyeBtn}
                                    title={showNewPassword ? "Masquer" : "Afficher"}
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            
                            <PasswordStrengthMeter password={newPassword} />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Rôle & Permissions</label>
                            <select 
                                value={newRole}
                                onChange={e => setNewRole(e.target.value)}
                                className={styles.select}
                            >
                                <option value="editor">Éditeur (Gestion du site & contenu)</option>
                                <option value="superadmin">Super Admin (Accès total)</option>
                            </select>
                        </div>

                        <button 
                            type="submit"
                            disabled={adding || newPassword.length < 8}
                            className={styles.btnPrimary}
                            style={{ marginTop: '0.5rem' }}
                        >
                            <UserPlus size={16} />
                            {adding ? 'Création en cours...' : 'Créer le compte'}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Modal: Change / Reset Password ── */}
            {editUser && (
                <div className={styles.modalOverlay} onClick={() => setEditUser(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                <Key size={18} color="#1F4B40" />
                                Modifier le mot de passe
                            </h3>
                            <button 
                                onClick={() => setEditUser(null)} 
                                className={styles.closeBtn}
                                title="Fermer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSavePassword}>
                            <div className={styles.modalBody}>
                                <div style={{ 
                                    padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', 
                                    border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' 
                                }}>
                                    <div className={styles.avatar} style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
                                        {editUser.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                                            {editUser.username}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {editUser.role === 'superadmin' ? 'Super Admin' : 'Éditeur'}
                                        </div>
                                    </div>
                                </div>

                                {modalError && (
                                    <div className={styles.alertError} style={{ margin: 0, padding: '0.7rem 1rem' }}>
                                        <AlertCircle size={15} />
                                        <span>{modalError}</span>
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <div className={styles.formLabel}>
                                        <span>Nouveau mot de passe</span>
                                        <button 
                                            type="button" 
                                            onClick={handleGenerateForEdit}
                                            className={styles.generateBtn}
                                        >
                                            <Sparkles size={12} />
                                            {copiedNotify ? 'Copié dans le presse-papiers !' : 'Générer robuste'}
                                        </button>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <input 
                                            type={showEditPassword ? "text" : "password"}
                                            value={editPassword}
                                            onChange={e => setEditPassword(e.target.value)}
                                            placeholder="8 caractères minimum"
                                            required
                                            autoFocus
                                            className={styles.input}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowEditPassword(!showEditPassword)}
                                            className={styles.toggleEyeBtn}
                                        >
                                            {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    <PasswordStrengthMeter password={editPassword} />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Confirmer le mot de passe</label>
                                    <div className={styles.inputWrapper}>
                                        <input 
                                            type={showEditPassword ? "text" : "password"}
                                            value={editConfirm}
                                            onChange={e => setEditConfirm(e.target.value)}
                                            placeholder="Retapez le mot de passe"
                                            required
                                            className={styles.input}
                                            style={{
                                                borderColor: editConfirm && editPassword !== editConfirm ? '#ef4444' : undefined
                                            }}
                                        />
                                    </div>
                                    {editConfirm && editPassword === editConfirm && (
                                        <div style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                            <Check size={12} /> Les mots de passe correspondent
                                        </div>
                                    )}
                                    {editConfirm && editPassword !== editConfirm && (
                                        <div style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                            <X size={12} /> Les mots de passe ne correspondent pas
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button 
                                    type="button" 
                                    onClick={() => setEditUser(null)}
                                    className={styles.btnCancel}
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={savingPassword || editPassword.length < 8 || editPassword !== editConfirm}
                                    className={styles.btnPrimary}
                                    style={{ padding: '0.75rem 1.4rem' }}
                                >
                                    <Lock size={15} />
                                    {savingPassword ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
