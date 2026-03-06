'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, Loader2, MapPin, ArrowLeft } from 'lucide-react';

const COUNTRIES = [
    { code: 'DE', name: 'Allemagne' },
    { code: 'AD', name: 'Andorre' },
    { code: 'AT', name: 'Autriche' },
    { code: 'BE', name: 'Belgique' },
    { code: 'BG', name: 'Bulgarie' },
    { code: 'CY', name: 'Chypre' },
    { code: 'HR', name: 'Croatie' },
    { code: 'DK', name: 'Danemark' },
    { code: 'ES', name: 'Espagne' },
    { code: 'EE', name: 'Estonie' },
    { code: 'FI', name: 'Finlande' },
    { code: 'FR', name: 'France' },
    { code: 'GR', name: 'Grèce' },
    { code: 'HU', name: 'Hongrie' },
    { code: 'IE', name: 'Irlande' },
    { code: 'IS', name: 'Islande' },
    { code: 'IT', name: 'Italie' },
    { code: 'LV', name: 'Lettonie' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lituanie' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MT', name: 'Malte' },
    { code: 'MC', name: 'Monaco' },
    { code: 'NO', name: 'Norvège' },
    { code: 'NL', name: 'Pays-Bas' },
    { code: 'PL', name: 'Pologne' },
    { code: 'PT', name: 'Portugal' },
    { code: 'RO', name: 'Roumanie' },
    { code: 'GB', name: 'Royaume-Uni' },
    { code: 'SM', name: 'Saint-Marin' },
    { code: 'VA', name: 'Saint-Siège' },
    { code: 'SK', name: 'Slovaquie' },
    { code: 'SI', name: 'Slovénie' },
    { code: 'SE', name: 'Suède' },
    { code: 'CH', name: 'Suisse' },
    { code: 'CZ', name: 'Tchéquie' },
];

const defaultForm = {
    alias: 'Domicile',
    firstname: '',
    lastname: '',
    company: '',
    vat_number: '',
    address1: '',
    address2: '',
    postcode: '',
    city: '',
    country_code: 'FR',
    phone: '',
};

export default function AddressesTab({ user }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingPsId, setEditingPsId] = useState(null);
    const [formData, setFormData] = useState(defaultForm);

    // Fetch addresses live from PrestaShop on mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/addresses');
            const data = await res.json();
            if (data.success) setAddresses(data.addresses);
        } catch (err) {
            console.error("Erreur chargement adresses:", err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(defaultForm);
        setEditingPsId(null);
        setIsEditing(false);
    };

    const handleEdit = (addr) => {
        setFormData({
            alias: addr.alias,
            firstname: addr.firstname,
            lastname: addr.lastname,
            company: addr.company || '',
            vat_number: addr.vat_number || '',
            address1: addr.address1,
            address2: addr.address2 || '',
            postcode: addr.postcode,
            city: addr.city,
            country_code: addr.country_code || 'FR',
            phone: addr.phone || '',
        });
        setEditingPsId(addr.ps_id);
        setIsEditing(true);
    };

    const handleDelete = async (psId) => {
        if (!confirm("Voulez-vous vraiment supprimer cette adresse ?")) return;
        try {
            const res = await fetch(`/api/user/addresses?id=${psId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setAddresses(prev => prev.filter(a => a.ps_id !== psId));
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (err) {
            alert("Erreur de connexion.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const nameParts = (user?.name || '').trim().split(' ');
            const payload = {
                ...formData,
                firstname: formData.firstname || nameParts[0] || '',
                lastname: formData.lastname || nameParts.slice(1).join(' ') || '',
            };

            const method = editingPsId ? 'PUT' : 'POST';
            const body = editingPsId ? { ...payload, ps_id: editingPsId } : payload;

            const res = await fetch('/api/user/addresses', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.success) {
                await fetchAddresses(); // Refresh from PrestaShop
                resetForm();
            } else {
                alert(data.error || "Erreur lors de l'enregistrement.");
            }
        } catch (err) {
            alert("Erreur de connexion.");
        } finally {
            setIsSaving(false);
        }
    };

    const Field = ({ label, children, optional }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                {label} {optional && <span style={{ color: '#9CA3AF', fontWeight: '400' }}>(optionnel)</span>}
            </label>
            {children}
        </div>
    );

    const inputStyle = {
        padding: '11px 14px',
        borderRadius: '10px',
        border: '1.5px solid #E5E7EB',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        outline: 'none',
        background: '#fff',
        transition: 'border-color 0.2s',
    };

    // --- FORM VIEW ---
    if (isEditing) {
        return (
            <div style={{ maxWidth: '640px', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                    <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '0.9rem', padding: '0' }}>
                        <ArrowLeft size={18} /> Retour
                    </button>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-dark)', margin: 0 }}>
                        {editingPsId ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <Field label="Alias" optional>
                        <input type="text" value={formData.alias} onChange={e => setFormData({ ...formData, alias: e.target.value })} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} placeholder="Maison, Travail, etc." />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <Field label="Prénom">
                            <input type="text" value={formData.firstname} required onChange={e => setFormData({ ...formData, firstname: e.target.value })} style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} placeholder="Jean" />
                        </Field>
                        <Field label="Nom">
                            <input type="text" value={formData.lastname} required onChange={e => setFormData({ ...formData, lastname: e.target.value })} style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} placeholder="Dupont" />
                        </Field>
                    </div>

                    <Field label="Société" optional>
                        <input type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} placeholder="Ma Société SAS" />
                    </Field>

                    <Field label="Numéro de TVA" optional>
                        <input type="text" value={formData.vat_number} onChange={e => setFormData({ ...formData, vat_number: e.target.value })} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} placeholder="FR00123456789" />
                    </Field>

                    <Field label="Adresse">
                        <input type="text" value={formData.address1} required onChange={e => setFormData({ ...formData, address1: e.target.value })} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} placeholder="10 Rue de la Paix" />
                    </Field>

                    <Field label="Complément d'adresse" optional>
                        <input type="text" value={formData.address2} onChange={e => setFormData({ ...formData, address2: e.target.value })} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} placeholder="Appartement 3B" />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                        <Field label="Code postal">
                            <input type="text" value={formData.postcode} required onChange={e => setFormData({ ...formData, postcode: e.target.value })} style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} placeholder="75001" />
                        </Field>
                        <Field label="Ville">
                            <input type="text" value={formData.city} required onChange={e => setFormData({ ...formData, city: e.target.value })} style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} placeholder="Paris" />
                        </Field>
                    </div>

                    <Field label="Pays">
                        <select value={formData.country_code} onChange={e => setFormData({ ...formData, country_code: e.target.value })}
                            style={{ ...inputStyle, appearance: 'none', backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=%236B7280 height=20 viewBox=0 0 24 24 width=20 xmlns=http://www.w3.org/2000/svg><path d=M7 10l5 5 5-5z/></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                            {COUNTRIES.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Téléphone" optional>
                        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--accent-neon)'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} placeholder="06 12 34 56 78" />
                    </Field>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="button" onClick={resetForm}
                            style={{ padding: '13px 20px', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', flex: 1 }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving}
                            style={{ padding: '13px 20px', background: 'var(--primary-dark)', color: 'white', border: 'none', borderRadius: '10px', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.95rem', flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSaving ? 0.7 : 1 }}>
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Sauvegarder
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-dark)', margin: 0 }}>
                    Carnet d'adresses
                </h2>
                <button onClick={() => setIsEditing(true)}
                    style={{ background: 'var(--primary-dark)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(31, 75, 64, 0.2)' }}>
                    <Plus size={18} /> Ajouter
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <Loader2 size={36} style={{ color: 'var(--primary-dark)', animation: 'spin 1s linear infinite' }} />
                </div>
            ) : addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F9FAFB', borderRadius: '24px', border: '1px dashed #D1D5DB' }}>
                    <MapPin size={48} style={{ color: '#D1D5DB', margin: '0 auto 15px auto' }} />
                    <h3 style={{ color: 'var(--primary-dark)', fontSize: '1.2rem', marginBottom: '8px' }}>Aucune adresse</h3>
                    <p style={{ color: '#6B7280' }}>Vous n'avez pas encore enregistré d'adresse de livraison.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
                    {addresses.map((addr) => (
                        <div key={addr.ps_id} style={{ border: '1px solid #F0F0F0', background: '#fff', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
                                <div style={{ background: 'var(--background-light)', padding: '8px', borderRadius: '10px' }}>
                                    <MapPin size={20} style={{ color: 'var(--primary-dark)' }} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-dark)', margin: 0 }}>
                                    {addr.alias}
                                </h3>
                            </div>

                            <div style={{ fontSize: '0.93rem', color: '#4B5563', lineHeight: '1.65', flex: 1 }}>
                                <div style={{ fontWeight: '700', color: '#1F2937' }}>{addr.firstname} {addr.lastname}</div>
                                {addr.company && <div style={{ color: 'var(--primary-dark)', fontWeight: '600' }}>🏢 {addr.company}</div>}
                                <div>{addr.address1}</div>
                                {addr.address2 && <div>{addr.address2}</div>}
                                <div>{addr.postcode} {addr.city}</div>
                                <div style={{ color: '#6B7280' }}>{COUNTRIES.find(c => c.code === addr.country_code)?.name || addr.country_code}</div>
                                {addr.phone && <div style={{ marginTop: '8px', color: '#6B7280' }}>📞 {addr.phone}</div>}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleEdit(addr)}
                                    style={{ flex: 1, padding: '10px', background: '#F3F4F6', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: '#4B5563', fontWeight: '600', fontSize: '0.9rem' }}>
                                    <Edit2 size={15} /> Modifier
                                </button>
                                <button onClick={() => handleDelete(addr.ps_id)}
                                    style={{ flex: 1, padding: '10px', background: '#FEF2F2', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: '#EF4444', fontWeight: '600', fontSize: '0.9rem' }}>
                                    <Trash2 size={15} /> Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
