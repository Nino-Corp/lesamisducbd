import React, { useState } from 'react';
import styles from './Editor.module.css';

export default function QualityBannerEditor({ section, onSave }) {
    const [title, setTitle] = useState(section.props.title || '');
    const [subtitle, setSubtitle] = useState(section.props.subtitle || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(section.id, { title, subtitle });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
                <label>Titre principal</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.input}
                    placeholder="Engagement qualité"
                    required
                />
            </div>
            <div className={styles.fieldGroup}>
                <label>Sous-titre / Slogan</label>
                <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className={styles.input}
                    placeholder="100 % satisfait ou remboursé !"
                    required
                />
            </div>

            <button type="submit" className={styles.saveBtn}>Enregistrer les modifications</button>
        </form>
    );
}
