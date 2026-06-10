'use client';
import { useState } from 'react';
import styles from './Editor.module.css';
import ImageUpload from '@/components/Admin/ImageUpload';
import WysiwygEditor from '../../builder/WysiwygEditor';

export default function HeroEditor({ section, onSave }) {
    const [props, setProps] = useState(section.props);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProps(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (url) => {
        setProps(prev => ({ ...prev, backgroundImage: url }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(section.id, props);
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #1F4B40' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <input
                        type="checkbox"
                        checked={props.isVisible !== false}
                        onChange={(e) => setProps(prev => ({ ...prev, isVisible: e.target.checked }))}
                        style={{ width: '18px', height: '18px' }}
                    />
                    Afficher cette section sur le site web
                </label>
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Décochez cette case pour masquer cette partie au public.</small>
            </div>

            <div className={styles.fieldGroup}>
                <label>Image de fond</label>
                <ImageUpload
                    currentImage={props.backgroundImage}
                    onImageChange={handleImageChange}
                />
            </div>

            <div className={styles.fieldGroup}>
                <label>Titre Principal (HTML accepté)</label>
                <textarea
                    name="title"
                    value={props.title}
                    onChange={handleChange}
                    rows={3}
                    className={styles.textarea}
                />
                <small className={styles.smallText}>Utilisez &lt;br /&gt; pour les sauts de ligne.</small>
            </div>

            <div className={styles.fieldGroup}>
                <label>Description</label>
                <WysiwygEditor
                    value={props.description || ''}
                    onChange={(val) => setProps(prev => ({ ...prev, description: val }))}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.fieldGroup}>
                    <label>Label Bouton</label>
                    <input
                        type="text"
                        name="ctaLabel"
                        value={props.ctaLabel || ''}
                        onChange={handleChange}
                        className={styles.input}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label>Lien Bouton</label>
                    <input
                        type="text"
                        name="ctaLink"
                        value={props.ctaLink || ''}
                        onChange={handleChange}
                        className={styles.input}
                    />
                </div>
            </div>

            <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </button>
        </form>
    );
}
