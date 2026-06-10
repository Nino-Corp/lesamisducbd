'use client';
import { useState } from 'react';
import styles from './Editor.module.css';
import WysiwygEditor from '../../builder/WysiwygEditor';

export default function QuoteEditor({ section, onSave }) {
    const [props, setProps] = useState(section.props);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProps(prev => ({ ...prev, [name]: value }));
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
                <label>Texte de la citation (HTML accepté)</label>
                <WysiwygEditor
                    value={props.text || ''}
                    onChange={(val) => setProps(prev => ({ ...prev, text: val }))}
                />
            </div>

            <div className={styles.fieldGroup}>
                <label>Auteur</label>
                <input
                    type="text"
                    name="author"
                    value={props.author}
                    onChange={handleChange}
                    className={styles.input}
                />
            </div>

            <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
        </form>
    );
}
