'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from './WysiwygEditor.module.css';

// Dynamic import with ssr: false is required because Quill depends on the DOM
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function WysiwygEditor({ value, onChange, placeholder = 'Tapez votre texte ici...' }) {
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [2, 3, 4, false] }],
            ['bold', 'italic', 'underline', 'strike', 'link'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }]
        ],
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'link',
        'color', 'background',
        'list'
    ];

    return (
        <div className={styles.editorWrapper}>
            <ReactQuill 
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    );
}
