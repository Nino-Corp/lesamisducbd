'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './WysiwygEditor.module.css';

// Dynamic import — required because Quill accesses `document`
const QuillEditorInner = dynamic(() => import('./QuillEditorInner'), {
    ssr: false,
    loading: () => (
        <div className={styles.loadingPlaceholder}>
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
        </div>
    ),
});

export default function WysiwygEditor({ value, onChange, placeholder = 'Tapez votre texte ici...' }) {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = useCallback((html) => {
        // Quill emits '<p><br></p>' for empty editors — normalize that to ''
        const cleaned = html === '<p><br></p>' ? '' : html;
        onChange(cleaned);
    }, [onChange]);

    return (
        <div
            className={`${styles.editorWrapper} ${isFocused ? styles.focused : ''}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        >
            <QuillEditorInner
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
            />
        </div>
    );
}
