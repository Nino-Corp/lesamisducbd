import React, { useState } from 'react';
import styles from './Editor.module.css';

export default function InteractiveMapEditor({ section, onSave }) {
    const [title, setTitle] = useState(section.props.title || '');
    const [description, setDescription] = useState(section.props.description || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(section.id, { title, description });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
                <label>Titre de la carte</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.input}
                    placeholder="Où nous retrouver ?"
                    required
                />
            </div>
            <div className={styles.fieldGroup}>
                <label>Texte descriptif</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={styles.textarea}
                    placeholder="Explication ou sous-titre..."
                    rows={4}
                    required
                />
            </div>

            <button type="submit" className={styles.saveBtn}>Enregistrer les modifications</button>
        </form>
    );
}
