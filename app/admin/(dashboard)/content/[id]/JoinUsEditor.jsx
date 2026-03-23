import React, { useState } from 'react';
import styles from './Editor.module.css';

export default function JoinUsEditor({ section, onSave }) {
    const [title, setTitle] = useState(section.props.title || '');
    const [text, setText] = useState(section.props.text || '');
    const [buttonLabel, setButtonLabel] = useState(section.props.buttonLabel || '');
    const [buttonLink, setButtonLink] = useState(section.props.buttonLink || '/recrutement');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(section.id, { title, text, buttonLabel, buttonLink });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
                <label>Titre</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.input}
                    placeholder="Nous rejoindre"
                    required
                />
            </div>
            <div className={styles.fieldGroup}>
                <label>Texte principal</label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={styles.textarea}
                    placeholder="Aucun poste ouvert pour le moment..."
                    rows={4}
                    required
                />
            </div>
            
            <div style={{ display: 'flex', gap: '20px' }}>
                <div className={styles.fieldGroup} style={{ flex: 1 }}>
                    <label>Texte du bouton</label>
                    <input
                        type="text"
                        value={buttonLabel}
                        onChange={(e) => setButtonLabel(e.target.value)}
                        className={styles.input}
                        placeholder="Venez par ici"
                        required
                    />
                </div>
                <div className={styles.fieldGroup} style={{ flex: 1 }}>
                    <label>Lien du bouton</label>
                    <input
                        type="text"
                        value={buttonLink}
                        onChange={(e) => setButtonLink(e.target.value)}
                        className={styles.input}
                        placeholder="/recrutement"
                        required
                    />
                </div>
            </div>

            <button type="submit" className={styles.saveBtn}>Enregistrer les modifications</button>
        </form>
    );
}
