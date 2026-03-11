'use client';
import { useState } from 'react';

export default function WhyChooseUsEditor({ section, onSave }) {
    const [title, setTitle] = useState(section.props.title || '');
    const [ctaLabel, setCtaLabel] = useState(section.props.ctaLabel || '');
    const [ctaLink, setCtaLink] = useState(section.props.ctaLink || '');
    const [features, setFeatures] = useState(section.props.features || []);

    const handleFeatureChange = (index, field, value) => {
        const newFeatures = [...features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setFeatures(newFeatures);
    };

    const handleAddFeature = () => {
        setFeatures([...features, { title: '', description: '' }]);
    };

    const handleRemoveFeature = (index) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave(section.id, {
            ...section.props,
            title,
            ctaLabel,
            ctaLink,
            features
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Options générales */}
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <h3 style={{ marginTop: 0, marginBottom: 15, fontSize: '1.2rem', color: '#111827' }}>Configuration Générale</h3>

                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: '0.9rem' }}>Titre de la section</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                </div>

                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: '0.9rem' }}>Texte du bouton</label>
                    <input
                        type="text"
                        value={ctaLabel}
                        onChange={(e) => setCtaLabel(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                </div>

                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: '0.9rem' }}>Lien du bouton</label>
                    <input
                        type="text"
                        value={ctaLink}
                        onChange={(e) => setCtaLink(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                </div>
            </div>

            {/* Features (Points forts) */}
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Points Forts (Features)</h3>
                    <button
                        onClick={handleAddFeature}
                        style={{ padding: '8px 12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Ajouter un point fort
                    </button>
                </div>

                {features.map((feature, index) => (
                    <div key={index} style={{ marginBottom: 15, padding: 15, border: '1px solid #f3f4f6', borderRadius: 8, background: '#f9fafb', position: 'relative' }}>
                        <button
                            onClick={() => handleRemoveFeature(index)}
                            style={{ position: 'absolute', top: 10, right: 10, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                        >
                            Supprimer
                        </button>

                        <div style={{ marginBottom: 10 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: '0.85rem' }}>Titre (ex: QUALITÉ CONSTANTE)</label>
                            <input
                                type="text"
                                value={feature.title}
                                onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: '0.85rem' }}>Description</label>
                            <textarea
                                value={feature.description}
                                onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                                rows={2}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', resize: 'vertical' }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSave}
                style={{
                    padding: '14px 24px',
                    background: '#00FF94',
                    color: '#1F4B40',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    alignSelf: 'flex-start'
                }}
            >
                Sauvegarder les modifications
            </button>
        </div>
    );
}
