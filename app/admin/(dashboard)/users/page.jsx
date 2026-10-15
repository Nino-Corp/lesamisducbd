'use client';

import { useState, useEffect } from 'react';
import styles from './Users.module.css';
import { 
    Key, ShieldCheck, Lock, Eye, EyeOff, Sparkles, 
    Check, X, UserPlus, Trash2, Users, AlertCircle, 
    Calendar, CheckCircle2, Download, UploadCloud, Database, 
    Archive, FileJson, RefreshCw, AlertTriangle, Layers,
    ShoppingBag, Award, FileText, MapPin, RotateCcw,
    Monitor, Smartphone, Tablet, Laptop, Activity, History,
    ShieldAlert, LogOut, XCircle
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

    // ── Tabs State ──
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'audit' | 'backups'

    // ── Audit & Surveillance State ──
    const [authLogs, setAuthLogs] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [auditTrail, setAuditTrail] = useState([]);
    const [loadingAudit, setLoadingAudit] = useState(true);
    const [revokingSessions, setRevokingSessions] = useState(false);

    // ── Backup & Continuity State ──
    const [backupStats, setBackupStats] = useState(null);
    const [loadingBackupStats, setLoadingBackupStats] = useState(true);
    const [downloadingBackup, setDownloadingBackup] = useState(false);
    const [backupError, setBackupError] = useState('');

    // Restore state
    const [uploadedFile, setUploadedFile] = useState(null);
    const [parsedBackup, setParsedBackup] = useState(null);
    const [fileParseError, setFileParseError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedModules, setSelectedModules] = useState({
        builder: true,
        vitrine: true,
        loyalty: true,
        content: true,
        partners: true
    });
    const [restoring, setRestoring] = useState(false);
    const [showConfirmRestore, setShowConfirmRestore] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchBackupStats();
        fetchAuditLogs();
    }, []);

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    const fetchAuditLogs = async () => {
        try {
            setLoadingAudit(true);
            const res = await fetch('/api/admin/audit');
            if (res.ok) {
                const data = await res.json();
                setAuthLogs(data.authLogs || []);
                setActiveSessions(data.activeSessions || []);
                setAuditTrail(data.auditTrail || []);
            }
        } catch (e) {
            console.error('Failed to load audit logs:', e);
        } finally {
            setLoadingAudit(false);
        }
    };

    const handleRevokeOtherSessions = async () => {
        if (!confirm('Voulez-vous vraiment déconnecter immédiatement tous les autres appareils connectés à ce compte ?')) return;
        setRevokingSessions(true);
        try {
            const res = await fetch('/api/admin/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'revoke-others' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur lors de la révocation');
            showSuccess(data.message || 'Toutes les autres sessions ont été révoquées.');
            fetchAuditLogs();
        } catch (err) {
            alert(err.message);
        } finally {
            setRevokingSessions(false);
        }
    };

    const fetchBackupStats = async () => {
        try {
            setLoadingBackupStats(true);
            const res = await fetch('/api/admin/backup?preview=true');
            if (res.ok) {
                const data = await res.json();
                if (data.meta?.summary) {
                    setBackupStats(data.meta.summary);
                }
            }
        } catch (e) {
            console.error('Failed to load backup stats:', e);
        } finally {
            setLoadingBackupStats(false);
        }
    };

    const handleDownloadBackup = async () => {
        setDownloadingBackup(true);
        setBackupError('');
        try {
            const res = await fetch('/api/admin/backup');
            if (!res.ok) {
                throw new Error('Erreur lors de la récupération de la sauvegarde');
            }
            const data = await res.json();
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
            const filename = `backup-lesamisducbd-${dateStr}.json`;
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showSuccess('Sauvegarde complète du site téléchargée avec succès (.json) !');
        } catch (err) {
            setBackupError(err.message || 'Impossible de télécharger la sauvegarde.');
        } finally {
            setDownloadingBackup(false);
        }
    };

    const handleProcessFile = (file) => {
        setFileParseError('');
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            setFileParseError('Veuillez sélectionner un fichier JSON valide (.json).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (!json || typeof json !== 'object' || !json.data) {
                    throw new Error("Ce fichier ne semble pas être une archive de sauvegarde valide Les Amis du CBD (clé 'data' introuvable).");
                }

                setUploadedFile({
                    name: file.name,
                    size: (file.size / 1024).toFixed(1) + ' Ko'
                });
                setParsedBackup(json);
                
                // Auto-configure selected modules based on content found
                setSelectedModules({
                    builder: Boolean(json.data.builder?.pages && Object.keys(json.data.builder.pages).length > 0),
                    vitrine: Boolean(json.data.vitrine && (json.data.vitrine.config || json.data.vitrine.productOrder)),
                    loyalty: Boolean(json.data.loyalty?.settings),
                    content: Boolean(json.data.content && Object.keys(json.data.content).length > 0),
                    partners: Boolean(Array.isArray(json.data.partners) && json.data.partners.length > 0)
                });
            } catch (err) {
                setFileParseError(err.message || 'Fichier JSON invalide ou illisible.');
                setUploadedFile(null);
                setParsedBackup(null);
            }
        };
        reader.readAsText(file);
    };

    const handleExecuteRestore = async () => {
        if (!parsedBackup) return;
        setRestoring(true);
        setBackupError('');
        setShowConfirmRestore(false);

        try {
            const res = await fetch('/api/admin/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    backupData: parsedBackup,
                    modules: selectedModules
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de la restauration');
            }

            showSuccess(`Restauration réussie ! (${data.details?.join(', ') || 'Tous les modules sélectionnés'})`);
            setUploadedFile(null);
            setParsedBackup(null);
            fetchBackupStats();
        } catch (err) {
            setBackupError(err.message);
        } finally {
            setRestoring(false);
        }
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

            {/* ── Tabs Navigation ── */}
            <div className={styles.tabsContainer}>
                <button
                    type="button"
                    className={`${styles.tabButton} ${activeTab === 'users' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={16} />
                    <span>Comptes & Droits d'Accès</span>
                    <span className={styles.tabBadge}>{users.length}</span>
                </button>

                <button
                    type="button"
                    className={`${styles.tabButton} ${activeTab === 'audit' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('audit')}
                >
                    <Activity size={16} />
                    <span>Surveillance & Journal d'Audit</span>
                    <span className={styles.tabBadge}>
                        {activeSessions.length} session{activeSessions.length > 1 ? 's' : ''}
                    </span>
                </button>

                <button
                    type="button"
                    className={`${styles.tabButton} ${activeTab === 'backups' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('backups')}
                >
                    <Database size={16} />
                    <span>Sauvegardes & Continuité</span>
                    <span className={styles.tabBadge}>1 clic</span>
                </button>
            </div>

            {/* ── TAB 1: Comptes & Droits d'Accès ── */}
            {activeTab === 'users' && (
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
            )}

            {/* ── TAB 2: Surveillance & Journal d'Audit ── */}
            {activeTab === 'audit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* 1. Active Sessions */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>
                                <Monitor size={18} color="#1F4B40" />
                                Sessions Actives & Appareils Connectés
                            </h2>
                            {activeSessions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={handleRevokeOtherSessions}
                                    disabled={revokingSessions}
                                    className={styles.btnRevokeOtherSessions}
                                    title="Déconnecter toutes les autres sessions ouvertes sur d'autres appareils"
                                >
                                    <LogOut size={14} />
                                    {revokingSessions ? 'Déconnexion en cours...' : 'Déconnecter les autres sessions'}
                                </button>
                            )}
                        </div>

                        <div className={styles.sessionsList}>
                            {activeSessions.map((s, idx) => {
                                const isMobile = s.device === 'Mobile';
                                const isTablet = s.device === 'Tablette';
                                const DeviceIcon = isMobile ? Smartphone : (isTablet ? Tablet : Laptop);

                                return (
                                    <div key={s.sessionId || idx} className={styles.sessionRow}>
                                        <div className={styles.sessionInfo}>
                                            <div className={styles.sessionDeviceIcon}>
                                                <DeviceIcon size={20} />
                                            </div>
                                            <div>
                                                <div className={styles.sessionTitleRow}>
                                                    <span>{s.browser} sur {s.os} ({s.device})</span>
                                                    {s.isCurrent && (
                                                        <span className={styles.sessionCurrentBadge}>
                                                            <Check size={11} strokeWidth={3} /> Cette session (actuelle)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={styles.sessionMeta}>
                                                    <span>Compte : <strong>{s.username}</strong></span>
                                                    <span>•</span>
                                                    <span>IP : <code>{s.ip}</code></span>
                                                    <span>•</span>
                                                    <span>Connecté le {s.createdAt ? new Date(s.createdAt).toLocaleString('fr-FR') : 'Récemment'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {activeSessions.length === 0 && (
                                <div className={styles.emptyAuditBox}>
                                    Aucune session active enregistrée pour le moment.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Login History */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>
                                <History size={18} color="#1F4B40" />
                                Historique des Connexions (50 dernières)
                            </h2>
                            <span className={styles.badgeCount}>{authLogs.length} tentative{authLogs.length > 1 ? 's' : ''}</span>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.securityTable}>
                                <thead>
                                    <tr>
                                        <th>Statut</th>
                                        <th>Date & Heure</th>
                                        <th>Identifiant</th>
                                        <th>Navigateur & OS</th>
                                        <th>Adresse IP</th>
                                        <th>Motif / Résultat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {authLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td>
                                                {log.success ? (
                                                    <span className={styles.statusBadgeSuccess}>
                                                        <CheckCircle2 size={13} /> Succès
                                                    </span>
                                                ) : (
                                                    <span className={styles.statusBadgeDanger}>
                                                        <XCircle size={13} /> Échec
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                {new Date(log.timestamp).toLocaleString('fr-FR')}
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#0f172a' }}>
                                                {log.username}
                                            </td>
                                            <td style={{ color: '#475569' }}>
                                                {log.browser} ({log.os})
                                            </td>
                                            <td>
                                                <code style={{ fontSize: '0.82rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {log.ip}
                                                </code>
                                            </td>
                                            <td style={{ color: log.success ? '#059669' : '#dc2626', fontSize: '0.82rem', fontWeight: 500 }}>
                                                {log.reason || (log.success ? 'Connexion réussie' : 'Mot de passe erroné')}
                                            </td>
                                        </tr>
                                    ))}

                                    {authLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className={styles.emptyAuditBox}>
                                                Aucun historique de connexion enregistré pour l'instant.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Sensitive Modifications Audit Trail */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>
                                <ShieldAlert size={18} color="#1F4B40" />
                                Journal des Modifications Sensibles (Audit Trail)
                            </h2>
                            <span className={styles.badgeCount}>{auditTrail.length} action{auditTrail.length > 1 ? 's' : ''}</span>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.securityTable}>
                                <thead>
                                    <tr>
                                        <th>Date & Heure</th>
                                        <th>Auteur</th>
                                        <th>Action</th>
                                        <th>Cible</th>
                                        <th>Détails</th>
                                        <th>Adresse IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditTrail.map((action) => (
                                        <tr key={action.id}>
                                            <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                {new Date(action.timestamp).toLocaleString('fr-FR')}
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#0f172a' }}>
                                                {action.username}
                                            </td>
                                            <td>
                                                <span className={styles.actionBadge}>{action.action}</span>
                                            </td>
                                            <td style={{ fontWeight: 600, color: '#1e293b' }}>
                                                {action.target}
                                            </td>
                                            <td style={{ color: '#475569', fontSize: '0.82rem', maxWidth: '320px' }}>
                                                {action.details}
                                            </td>
                                            <td>
                                                <code style={{ fontSize: '0.82rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {action.ip}
                                                </code>
                                            </td>
                                        </tr>
                                    ))}

                                    {auditTrail.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className={styles.emptyAuditBox}>
                                                Aucune modification sensible enregistrée pour le moment.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 3: Sauvegardes & Plan de Continuité ── */}
            {activeTab === 'backups' && (
                <div className={styles.backupSection} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                    <div className={styles.backupHeader}>
                        <h2 className={styles.backupSectionTitle}>
                            <Database size={24} color="#1F4B40" />
                            Sauvegardes & Plan de Continuité (Backups)
                        </h2>
                        <p className={styles.backupSectionSubtitle}>
                            Téléchargez une archive JSON complète en 1 clic contenant tout le contenu du site (pages du builder, réglages vitrine, fidélité), ou restaurez une sauvegarde précédente en cas de fausse manipulation d'un éditeur.
                        </p>
                    </div>

                    <div className={styles.backupGrid}>
                        {/* Card 1: 1-Click Export / Download */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>
                                    <Download size={18} color="#1F4B40" />
                                    Sauvegarde & Export en 1 clic
                                </h3>
                                <span className={styles.backupBadgeRecommended}>Recommandé régulier</span>
                            </div>

                            <div className={styles.cardBody}>
                                <div>
                                    <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                                        Générez instantanément un fichier <span className={styles.jsonBadge}>.json</span> complet et autonome comprenant l'intégralité du site. Vous pouvez le stocker localement en toute sécurité ou le transférer.
                                    </p>

                                    <div className={styles.backupStatsGrid}>
                                        <div className={styles.statTile}>
                                            <div className={styles.statTileIcon}>
                                                <Layers size={16} />
                                            </div>
                                            <div className={styles.statTileInfo}>
                                                <span className={styles.statTileValue}>
                                                    {loadingBackupStats ? '...' : (backupStats?.builderPagesCount ?? 0)}
                                                </span>
                                                <span className={styles.statTileLabel}>Pages du Builder</span>
                                            </div>
                                        </div>

                                        <div className={styles.statTile}>
                                            <div className={styles.statTileIcon}>
                                                <ShoppingBag size={16} />
                                            </div>
                                            <div className={styles.statTileInfo}>
                                                <span className={styles.statTileValue}>
                                                    {loadingBackupStats ? '...' : (backupStats?.hasVitrineConfig ? 'Actif' : 'Défaut')}
                                                </span>
                                                <span className={styles.statTileLabel}>Vitrine & Produits</span>
                                            </div>
                                        </div>

                                        <div className={styles.statTile}>
                                            <div className={styles.statTileIcon}>
                                                <Award size={16} />
                                            </div>
                                            <div className={styles.statTileInfo}>
                                                <span className={styles.statTileValue}>
                                                    {loadingBackupStats ? '...' : (backupStats?.hasLoyaltySettings ? 'Configuré' : 'Défaut')}
                                                </span>
                                                <span className={styles.statTileLabel}>Fidélité VIP</span>
                                            </div>
                                        </div>

                                        <div className={styles.statTile}>
                                            <div className={styles.statTileIcon}>
                                                <FileText size={16} />
                                            </div>
                                            <div className={styles.statTileInfo}>
                                                <span className={styles.statTileValue}>
                                                    {loadingBackupStats ? '...' : (backupStats?.contentPagesCount ?? 0)}
                                                </span>
                                                <span className={styles.statTileLabel}>Pages CMS & Légal</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        onClick={handleDownloadBackup}
                                        disabled={downloadingBackup}
                                        className={styles.btnDownloadBackup}
                                    >
                                        {downloadingBackup ? (
                                            <>
                                                <RefreshCw size={18} className="spinAnimation" />
                                                <span>Génération de l'archive en cours...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download size={18} />
                                                <span>Télécharger la sauvegarde complète (.json)</span>
                                            </>
                                        )}
                                    </button>

                                    <div className={styles.backupInfoNote}>
                                        <Check size={14} color="#059669" />
                                        <span>Export sécurisé, non-bloquant et direct sans coupure du site.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Restore / Rollback */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>
                                    <RotateCcw size={18} color="#1F4B40" />
                                    Restaurer depuis une sauvegarde
                                </h3>
                                <span className={styles.backupBadgeSafety}>Plan de secours</span>
                            </div>

                            <div className={styles.cardBody}>
                                <div>
                                {!uploadedFile ? (
                                    <div>
                                        <div
                                            className={`${styles.dropzone} ${isDragging ? styles.dropzoneDragOver : ''}`}
                                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setIsDragging(false);
                                                if (e.dataTransfer.files?.[0]) {
                                                    handleProcessFile(e.dataTransfer.files[0]);
                                                }
                                            }}
                                            onClick={() => document.getElementById('backupFileInput')?.click()}
                                        >
                                            <input
                                                id="backupFileInput"
                                                type="file"
                                                accept=".json,application/json"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        handleProcessFile(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                            <div className={styles.dropzoneIconWrapper}>
                                                <UploadCloud size={24} />
                                            </div>
                                            <p className={styles.dropzoneText}>
                                                Glissez-déposez un fichier de sauvegarde <span className={styles.jsonBadge}>.json</span>
                                            </p>
                                            <p className={styles.dropzoneSubtext}>
                                                Ou cliquez pour parcourir vos fichiers
                                            </p>
                                        </div>

                                        {fileParseError && (
                                            <div className={styles.alertError} style={{ marginTop: '0.85rem', marginBottom: 0 }}>
                                                <AlertCircle size={15} />
                                                <span>{fileParseError}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        {/* File loaded banner */}
                                        <div className={styles.fileLoadedCard}>
                                            <div className={styles.fileLoadedInfo}>
                                                <div className={styles.fileLoadedIcon}>
                                                    <FileJson size={20} />
                                                </div>
                                                <div>
                                                    <p className={styles.fileLoadedName}>{uploadedFile.name}</p>
                                                    <p className={styles.fileLoadedMeta}>
                                                        Taille : {uploadedFile.size} • Export du {parsedBackup?.meta?.generatedAt ? new Date(parsedBackup.meta.generatedAt).toLocaleString('fr-FR') : 'Date inconnue'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadedFile(null);
                                                    setParsedBackup(null);
                                                    setFileParseError('');
                                                }}
                                                className={styles.btnRemoveFile}
                                                title="Retirer ce fichier"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        {/* Selectable Modules to Restore */}
                                        <div className={styles.modulesSection}>
                                            <span className={styles.modulesSectionLabel}>Contenus à restaurer :</span>
                                            <div className={styles.moduleCheckboxList}>
                                                <label className={styles.moduleCheckboxItem}>
                                                    <div className={styles.moduleCheckboxLabel}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedModules.builder}
                                                            onChange={(e) => setSelectedModules({ ...selectedModules, builder: e.target.checked })}
                                                            disabled={!parsedBackup?.data?.builder?.pages}
                                                        />
                                                        <span>Page Builder</span>
                                                    </div>
                                                    <span className={styles.moduleBadgeCount}>
                                                        {parsedBackup?.data?.builder?.pages ? `${Object.keys(parsedBackup.data.builder.pages).length} pages` : '0'}
                                                    </span>
                                                </label>

                                                <label className={styles.moduleCheckboxItem}>
                                                    <div className={styles.moduleCheckboxLabel}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedModules.vitrine}
                                                            onChange={(e) => setSelectedModules({ ...selectedModules, vitrine: e.target.checked })}
                                                        />
                                                        <span>Vitrine & Produits</span>
                                                    </div>
                                                    <span className={styles.moduleBadgeCount}>
                                                        {parsedBackup?.data?.vitrine ? 'Inclus' : '0'}
                                                    </span>
                                                </label>

                                                <label className={styles.moduleCheckboxItem}>
                                                    <div className={styles.moduleCheckboxLabel}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedModules.loyalty}
                                                            onChange={(e) => setSelectedModules({ ...selectedModules, loyalty: e.target.checked })}
                                                            disabled={!parsedBackup?.data?.loyalty?.settings}
                                                        />
                                                        <span>Fidélité VIP</span>
                                                    </div>
                                                    <span className={styles.moduleBadgeCount}>
                                                        {parsedBackup?.data?.loyalty?.settings ? 'Inclus' : '0'}
                                                    </span>
                                                </label>

                                                <label className={styles.moduleCheckboxItem}>
                                                    <div className={styles.moduleCheckboxLabel}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedModules.content}
                                                            onChange={(e) => setSelectedModules({ ...selectedModules, content: e.target.checked })}
                                                            disabled={!parsedBackup?.data?.content}
                                                        />
                                                        <span>Pages CMS (Accueil, Légal...)</span>
                                                    </div>
                                                    <span className={styles.moduleBadgeCount}>
                                                        {parsedBackup?.data?.content ? `${Object.keys(parsedBackup.data.content).length} pages` : '0'}
                                                    </span>
                                                </label>

                                                <label className={styles.moduleCheckboxItem}>
                                                    <div className={styles.moduleCheckboxLabel}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedModules.partners}
                                                            onChange={(e) => setSelectedModules({ ...selectedModules, partners: e.target.checked })}
                                                            disabled={!Array.isArray(parsedBackup?.data?.partners) || parsedBackup.data.partners.length === 0}
                                                        />
                                                        <span>Partenaires / Buralistes</span>
                                                    </div>
                                                    <span className={styles.moduleBadgeCount}>
                                                        {Array.isArray(parsedBackup?.data?.partners) ? `${parsedBackup.data.partners.length} adresses` : '0'}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className={styles.warningAlertBox}>
                                            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                                            <span>
                                                Les modifications actuelles pour les modules sélectionnés seront remplacées par celles du fichier.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                {uploadedFile && (
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmRestore(true)}
                                        disabled={restoring || !Object.values(selectedModules).some(Boolean)}
                                        className={styles.btnRestore}
                                    >
                                        <RotateCcw size={16} />
                                        <span>Restaurer les données sélectionnées</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}

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

            {/* ── Modal: Confirmation Restauration ── */}
            {showConfirmRestore && (
                <div className={styles.modalOverlay} onClick={() => setShowConfirmRestore(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle} style={{ color: '#b45309' }}>
                                <AlertTriangle size={20} color="#b45309" />
                                Confirmer la restauration
                            </h3>
                            <button 
                                onClick={() => setShowConfirmRestore(false)} 
                                className={styles.closeBtn}
                                title="Fermer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem', lineHeight: 1.5 }}>
                                Êtes-vous sûr de vouloir restaurer les éléments cochés à partir du fichier <strong>{uploadedFile?.name}</strong> ?
                            </p>

                            <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', lineHeight: 1.4 }}>
                                <strong>⚠️ Attention :</strong> Les contenus actuellement en ligne pour les modules sélectionnés seront immédiatement écrasés et remplacés par ceux de cette sauvegarde.
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button 
                                type="button" 
                                onClick={() => setShowConfirmRestore(false)}
                                className={styles.btnCancel}
                            >
                                Annuler
                            </button>
                            <button 
                                type="button" 
                                onClick={handleExecuteRestore}
                                disabled={restoring}
                                className={styles.btnPrimary}
                                style={{ background: '#b45309', padding: '0.75rem 1.4rem' }}
                            >
                                <RotateCcw size={15} />
                                {restoring ? 'Restauration en cours...' : 'Oui, appliquer la restauration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
