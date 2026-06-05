'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

/* ─────────────────────────────────────────────────────────
   1. Register Quill attributors (style-based for inline CSS output)
   ───────────────────────────────────────────────────────── */

const FontStyle = Quill.import('attributors/style/font');
FontStyle.whitelist = [
    'Bricolage Grotesque', 'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato',
    'Poppins', 'Playfair Display', 'Oswald', 'Raleway',
    'Nunito', 'Source Sans Pro', 'Merriweather',
    'sans-serif', 'serif', 'monospace',
];
Quill.register(FontStyle, true);

const SizeStyle = Quill.import('attributors/style/size');
SizeStyle.whitelist = [
    '10px', '11px', '12px', '13px', '14px', '15px', '16px',
    '18px', '20px', '22px', '24px', '28px', '32px', '36px',
    '42px', '48px', '56px', '64px', '72px',
];
Quill.register(SizeStyle, true);

// Use style-based align so output is style="text-align:center" not class="ql-align-center"
const AlignStyle = Quill.import('attributors/style/align');
Quill.register(AlignStyle, true);

/* ─────────────────────────────────────────────────────────
   2. Build global <style> string ONCE (outside component)
      This makes sure each picker item shows its real name.
   ───────────────────────────────────────────────────────── */

const FONT_DISPLAY_NAMES = {
    'Bricolage Grotesque': 'Bricolage Grotesque',
    'Inter': 'Inter',
    'Roboto': 'Roboto',
    'Open Sans': 'Open Sans',
    'Montserrat': 'Montserrat',
    'Lato': 'Lato',
    'Poppins': 'Poppins',
    'Playfair Display': 'Playfair Display',
    'Oswald': 'Oswald',
    'Raleway': 'Raleway',
    'Nunito': 'Nunito',
    'Source Sans Pro': 'Source Sans Pro',
    'Merriweather': 'Merriweather',
    'sans-serif': 'Sans Serif',
    'serif': 'Serif',
    'monospace': 'Monospace',
};

function buildPickerCSS() {
    let css = '';

    // Font picker: default label (no value selected)
    css += `.ql-snow .ql-picker.ql-font > .ql-picker-label:not([data-value])::before { content: "Police" !important; }
.ql-snow .ql-picker.ql-font .ql-picker-options .ql-picker-item:not([data-value])::before { content: "Par défaut" !important; }\n`;

    // Font picker: per-value labels
    FontStyle.whitelist.forEach(font => {
        const label = FONT_DISPLAY_NAMES[font] || font;
        css += `.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="${font}"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="${font}"]::before {
    content: "${label}" !important;
    font-family: "${font}", sans-serif !important;
}\n`;
    });

    // Size picker: default label (no value selected)
    css += `.ql-snow .ql-picker.ql-size > .ql-picker-label:not([data-value])::before { content: "Taille" !important; }
.ql-snow .ql-picker.ql-size .ql-picker-options .ql-picker-item:not([data-value])::before { content: "Par défaut" !important; }\n`;

    // Size picker: per-value labels
    SizeStyle.whitelist.forEach(size => {
        css += `.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="${size}"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="${size}"]::before {
    content: "${size}" !important;
}\n`;
    });

    // Header picker
    css += `.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before { content: "Titre" !important; }
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before { content: "Sous-titre" !important; }
.ql-snow .ql-picker.ql-header .ql-picker-label:not([data-value])::before,
.ql-snow .ql-picker.ql-header .ql-picker-item:not([data-value])::before { content: "Normal" !important; }\n`;

    return css;
}

const PICKER_CSS = buildPickerCSS();
let styleInjected = false;

function injectPickerStyles() {
    if (styleInjected) return;
    if (typeof document === 'undefined') return;

    // 1. Inject picker label CSS
    const tag = document.createElement('style');
    tag.setAttribute('data-quill-custom', 'true');
    tag.textContent = PICKER_CSS;
    document.head.appendChild(tag);

    // 2. Load Google Fonts for the picker preview
    if (!document.querySelector('link[data-quill-fonts]')) {
        const families = [
            'Inter', 'Roboto', 'Open+Sans', 'Montserrat', 'Lato',
            'Poppins', 'Playfair+Display', 'Oswald', 'Raleway',
            'Nunito', 'Source+Sans+Pro', 'Merriweather',
        ].map(f => `family=${f}:wght@400;600;700`).join('&');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
        link.setAttribute('data-quill-fonts', 'true');
        document.head.appendChild(link);
    }

    styleInjected = true;
}

/* ─────────────────────────────────────────────────────────
   3. Component
   ───────────────────────────────────────────────────────── */

export default function QuillEditorInner({ value, onChange, placeholder }) {
    const quillRef = useRef(null);

    // Inject styles once on mount
    useEffect(() => { injectPickerStyles(); }, []);

    const PROJECT_COLORS = [
        // DA du site
        "#1F4B40", // primary-dark
        "#00FF94", // accent-neon
        "#E3FFF8", // background-light
        "#FFFFFF", // surface-white
        "#000000", // black
        // Gris et textes
        "#1e293b", // Slate 800 (texte sombre)
        "#475569", // Slate 600 (texte secondaire)
        "#94a3b8", // Slate 400 (texte gris)
        "#f8fafc", // Slate 50 (fond léger)
        // Couleurs de statut/utilité
        "#dc2626", // Rouge
        "#ea580c", // Orange
        "#16a34a", // Vert classique
        "#2563eb", // Bleu
    ];

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [2, 3, false] }],
                [{ font: FontStyle.whitelist }, { size: SizeStyle.whitelist }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: PROJECT_COLORS }, { background: PROJECT_COLORS }],
                [{ align: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'clean'],
            ],
        },
        clipboard: { matchVisual: false },
    }), []);

    const formats = useMemo(() => [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'align',
        'list',
        'link',
    ], []);

    return (
        <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value || ''}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
        />
    );
}
