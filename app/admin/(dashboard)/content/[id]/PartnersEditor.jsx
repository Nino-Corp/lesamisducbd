'use client';
import { useState } from 'react';
import styles from './Editor.module.css';
import WysiwygEditor from '../../builder/WysiwygEditor';

export default function PartnersEditor({ section, onSave }) {
    const [title, setTitle] = useState(section.props.title || '');
    const [subtitle, setSubtitle] = useState(section.props.subtitle || '');
    const [partners, setPartners] = useState(section.props.partners || []);
    const [isVisible, setIsVisible] = useState(section.props.isVisible !== false);
    const [saving, setSaving] = useState(false);
    const [uploadingImageFor, setUploadingImageFor] = useState(null);

    const handlePartnerChange = (index, field, value) => {
        const newPartners = [...partners];
        newPartners[index][field] = value;
        setPartners(newPartners);
    };

    const addItem = () => {
        setPartners([...partners, { name: "Nouveau Tabac", role: "Gérant", quote: "Super produits !" }]);
    };

    const removeItem = (index) => {
        if (confirm('Supprimer ce témoignage ?')) {
            const newPartners = partners.filter((_, i) => i !== index);
            setPartners(newPartners);
        }
    };

    const handleImageUpload = async (index, file) => {
        if (!file) return;

        setUploadingImageFor(index);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            handlePartnerChange(index, 'imageLogo', data.url);
        } catch (error) {
            console.error("Erreur lors de l'upload de l'image:", error);
            alert("Erreur lors de l'upload de l'image.");
        } finally {
            setUploadingImageFor(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(section.id, { title, subtitle, partners, isVisible });
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form} style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #1F4B40' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={(e) => setIsVisible(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                    />
                    Afficher cette section sur le site web
                </label>
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Décochez cette case pour masquer cette partie au public.</small>
            </div>

            <div className={styles.fieldGroup}>
                <label>Titre (Chiffre '300' animé automatiquement)</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.fieldGroup}>
                <label>Sous-titre (HTML accepté)</label>
                <WysiwygEditor
                    value={subtitle || ''}
                    onChange={(val) => setSubtitle(val)}
                />
            </div>

            <div className={styles.fieldGroup}>
                <label>Témoignages ({partners.length})</label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {partners.map((partner, index) => (
                        <div key={index} style={{
                            border: '1px solid #eee',
                            padding: '15px',
                            borderRadius: '8px',
                            background: '#fafafa'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    value={partner.name}
                                    onChange={(e) => handlePartnerChange(index, 'name', e.target.value)}
                                    className={styles.input}
                                    placeholder="Nom du Tabac"
                                />
                                <input
                                    type="text"
                                    value={partner.role}
                                    onChange={(e) => handlePartnerChange(index, 'role', e.target.value)}
                                    className={styles.input}
                                    placeholder="Rôle (ex: Gérant)"
                                />
                            </div>

                            <WysiwygEditor
                                value={partner.quote || ''}
                                onChange={(val) => handlePartnerChange(index, 'quote', val)}
                            />

                            <div style={{ marginTop: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Logo du Partenaire</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {partner.imageLogo && (
                                        <img src={partner.imageLogo} alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(index, e.target.files[0])}
                                        disabled={uploadingImageFor === index}
                                        style={{ fontSize: '0.9rem' }}
                                    />
                                    {uploadingImageFor === index && <span style={{ fontSize: '0.8rem', color: '#666' }}>Upload en cours...</span>}
                                </div>
                            </div>

                            <button type="button" onClick={() => removeItem(index)} style={{
                                marginTop: '10px',
                                color: 'red',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                textDecoration: 'underline'
                            }}>
                                Supprimer ce témoignage
                            </button>
                        </div>
                    ))}
                </div>

                <button type="button" onClick={addItem} style={{
                    padding: '10px',
                    background: '#e0fbf4',
                    border: '1px dashed #1F4B40',
                    color: '#1F4B40',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    fontWeight: 'bold'
                }}>
                    + Ajouter un témoignage
                </button>
            </div>

            <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? 'Sauvegarde...' : 'Sauvegarder tout'}
            </button>
        </form>
    );
}
