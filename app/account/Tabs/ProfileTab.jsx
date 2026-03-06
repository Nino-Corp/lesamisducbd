'use client';
import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Field = ({ label, children, optional, hint }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#4B5563' }}>
            {label} {optional && <span style={{ color: '#9CA3AF', fontWeight: '400' }}>(Optionnel)</span>}
        </label>
        {children}
        {hint && <small style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '2px' }}>{hint}</small>}
    </div>
);

export default function ProfileTab({ user, onUpdate }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showOldPwd, setShowOldPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);

    const [formData, setFormData] = useState({
        id_gender: 1, // 1 = M., 2 = Mme
        firstname: '',
        lastname: '',
        company: '',
        siret: '',
        birthday: '',
        oldPassword: '',
        newPassword: '',
        privacyAccepted: false
    });

    useEffect(() => {
        // Fetch live from PrestaShop via our API proxy
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                const data = await res.json();
                if (data.success && data.user) {
                    setFormData(prev => ({
                        ...prev,
                        id_gender: data.user.id_gender || 1,
                        firstname: data.user.firstname || '',
                        lastname: data.user.lastname || '',
                        company: data.user.company || '',
                        siret: data.user.siret || '',
                        birthday: data.user.birthday || '', // YYYY-MM-DD from API
                    }));
                }
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.privacyAccepted) {
            setMessage({ text: 'Vous devez accepter la politique de confidentialité.', type: 'error' });
            return;
        }

        if (formData.newPassword && !formData.oldPassword) {
            setMessage({ text: 'Veuillez renseigner votre mot de passe actuel.', type: 'error' });
            return;
        }

        const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
        if (!nameRegex.test(formData.firstname)) {
            setMessage({ text: 'Le prénom ne doit contenir que des lettres, des espaces, des tirets ou des apostrophes.', type: 'error' });
            return;
        }
        if (!nameRegex.test(formData.lastname)) {
            setMessage({ text: 'Le nom ne doit contenir que des lettres, des espaces, des tirets ou des apostrophes.', type: 'error' });
            return;
        }

        if (formData.siret && !/^[0-9A-Z]{1,14}$/.test(formData.siret)) {
            // relaxed regex in case some countries have letters in VAT/SIRET
            setMessage({ text: 'Le numéro d\'identification fiscale (SIRET/TVA) ne semble pas valide.', type: 'error' });
            return;
        }

        setIsSaving(true);
        setMessage({ text: '', type: '' });

        try {
            // Format birthday to JJ/MM/AAAA or leave as is if already formatted
            let formattedBirthday = formData.birthday;
            if (formData.birthday && formData.birthday.includes('-')) {
                const parts = formData.birthday.split('-');
                if (parts[0].length === 4) { // YYYY-MM-DD -> DD/MM/YYYY
                    formattedBirthday = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            const payload = {
                id_gender: formData.id_gender,
                firstname: formData.firstname,
                lastname: formData.lastname,
                company: formData.company,
                siret: formData.siret,
                birthday: formattedBirthday,
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            };

            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ text: 'Profil mis à jour avec succès.', type: 'success' });
                // Only pass up the fields that KV stores to avoid replacing the user object with missing data
                onUpdate(data.user);
                setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '', privacyAccepted: false }));
            } else {
                setMessage({ text: data.message || 'Erreur lors de la mise à jour.', type: 'error' });
            }
        } catch (err) {
            console.error("Erreur saving profile:", err);
            setMessage({ text: 'Erreur réseau.', type: 'error' });
        } finally {
            setIsSaving(false);
            setTimeout(() => {
                if (message.type === 'success') setMessage({ text: '', type: '' });
            }, 4000);
        }
    };

    const inputStyle = {
        padding: '13px 16px',
        borderRadius: '12px',
        border: '1px solid #D1D5DB',
        outline: 'none',
        fontFamily: 'inherit',
        fontSize: '0.95rem',
        transition: 'border-color 0.2s',
        width: '100%',
        background: '#fff'
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <Loader2 size={36} style={{ color: 'var(--primary-dark)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '650px', animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem', color: 'var(--primary-dark)', letterSpacing: '-0.02em' }}>
                Vos informations personnelles
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

                {/* Titre */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#4B5563', width: '80px' }}>Titre</label>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#374151' }}>
                            <input type="radio" name="gender" value={1} checked={formData.id_gender === 1}
                                onChange={() => setFormData({ ...formData, id_gender: 1 })}
                                style={{ accentColor: 'var(--primary-dark)', width: '16px', height: '16px' }} />
                            M.
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#374151' }}>
                            <input type="radio" name="gender" value={2} checked={formData.id_gender === 2}
                                onChange={() => setFormData({ ...formData, id_gender: 2 })}
                                style={{ accentColor: 'var(--primary-dark)', width: '16px', height: '16px' }} />
                            Mme
                        </label>
                    </div>
                </div>

                {/* Prénom & Nom */}
                <Field label="Prénom" hint="Seules les lettres et le point (.), suivi d'un espace, sont autorisés.">
                    <input type="text" value={formData.firstname} required onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                        style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={(e) => e.target.style.borderColor = '#D1D5DB'} />
                </Field>

                <Field label="Nom" hint="Seules les lettres et le point (.), suivi d'un espace, sont autorisés.">
                    <input type="text" value={formData.lastname} required onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                        style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={(e) => e.target.style.borderColor = '#D1D5DB'} />
                </Field>

                {/* Société & SIRET */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <Field label="Société" optional>
                        <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={(e) => e.target.style.borderColor = '#D1D5DB'} />
                    </Field>
                    <Field label="Numéro d'identification fiscale" optional hint="N° SIRET / TVA">
                        <input type="text" value={formData.siret} onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                            style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={(e) => e.target.style.borderColor = '#D1D5DB'} />
                    </Field>
                </div>

                {/* Email Read-only */}
                <Field label="E-mail">
                    <input type="email" value={user?.email || ''} disabled
                        style={{ ...inputStyle, background: '#F9FAFB', color: '#9CA3AF', cursor: 'not-allowed' }} />
                </Field>

                {/* Password Fields */}
                <Field label="Mot de passe">
                    <div style={{ position: 'relative' }}>
                        <input type={showOldPwd ? "text" : "password"} value={formData.oldPassword} onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                            style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={(e) => e.target.style.borderColor = '#D1D5DB'} />
                        <button type="button" onClick={() => setShowOldPwd(!showOldPwd)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}>
                            {showOldPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </Field>

                <Field label="Nouveau mot de passe" optional>
                    <div style={{ position: 'relative' }}>
                        <input type={showNewPwd ? "text" : "password"} value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={(e) => e.target.style.borderColor = '#D1D5DB'} />
                        <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}>
                            {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </Field>

                {/* Birthday */}
                <Field label="Date de naissance" optional>
                    <input type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                        style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                    />
                </Field>

                {/* Privacy Checkbox */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginTop: '10px', padding: '12px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <input type="checkbox" required checked={formData.privacyAccepted} onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                        style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: 'var(--primary-dark)', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: '1.5' }}>
                        En cochant cette case, j'accepte la politique de confidentialité et je consens au traitement de mes données personnelles conformément aux conditions décrites.
                    </span>
                </label>

                {/* Submit */}
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button type="submit" disabled={isSaving}
                        style={{
                            background: 'var(--primary-dark)', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(31, 75, 64, 0.2)', opacity: isSaving ? 0.8 : 1
                        }}
                        onMouseEnter={(e) => { if (!isSaving) e.target.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { if (!isSaving) e.target.style.transform = 'translateY(0)'; }}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Enregistrer
                    </button>

                    {message.text && (
                        <div style={{ color: message.type === 'error' ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '600', animation: 'fadeIn 0.3s ease', background: message.type === 'error' ? '#FEF2F2' : '#F0FDF4', padding: '12px 16px', borderRadius: '10px' }}>
                            {message.type === 'success' && <CheckCircle size={18} />}
                            {message.text}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
