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

// Create a custom style attributor for alignment that works on LI
const DefaultAlignStyle = Quill.import('attributors/style/align');
const StyleAttributor = Object.getPrototypeOf(DefaultAlignStyle).constructor;

class CustomAlignStyle extends StyleAttributor {
    canAdd(node, value) {
        return super.canAdd(node, value) || node.tagName === 'LI';
    }
}
const AlignStyle = new CustomAlignStyle('align', 'text-align', {
    whitelist: ['left', 'center', 'right', 'justify']
});
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

    // Color and Background "none" option (red cross)
    css += `.ql-snow .ql-color-picker .ql-picker-item:not([data-value]) {
    background: linear-gradient(to top left, transparent 45%, #ef4444 45%, #ef4444 55%, transparent 55%), linear-gradient(to top right, transparent 45%, #ef4444 45%, #ef4444 55%, transparent 55%) !important;
    background-color: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
}\n`;

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
    const boundsId = useMemo(() => 'quill-bounds-' + Math.random().toString(36).substr(2, 9), []);

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
                [{ color: [false, ...PROJECT_COLORS] }, { background: [false, ...PROJECT_COLORS] }],
                [{ align: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                ['link', 'clean'],
            ],
            handlers: {
                align: function(value) {
                    const quill = this.quill;
                    const range = quill.getSelection();
                    if (!range) return;

                    // Check if cursor is inside a list item
                    const [line] = quill.getLine(range.index);
                    const domNode = line?.domNode;

                    if (domNode && domNode.tagName === 'LI') {
                        // Get all selected lines
                        const lines = quill.getLines(range.index, range.length || 1);
                        lines.forEach(l => {
                            if (l.domNode && l.domNode.tagName === 'LI') {
                                l.domNode.style.textAlign = value || '';
                            }
                        });
                        // Trigger content change so it gets saved
                        quill.update('user');
                    } else {
                        // Default Quill behavior for non-list elements
                        quill.format('align', value, 'user');
                    }
                }
            }
        },
        clipboard: { matchVisual: false },
    }), []);

    // Removed broken ListBlot patch

    // Inject native color pickers into the Quill color/background dropdowns
    useEffect(() => {
        if (!quillRef.current) return;
        
        // Use a short timeout to ensure the toolbar DOM is fully rendered
        const timer = setTimeout(() => {
            const quill = quillRef.current.getEditor();
            const toolbar = quill.getModule('toolbar').container;
            if (!toolbar) return;

            ['color', 'background'].forEach(formatType => {
                const pickers = toolbar.querySelectorAll(`.ql-${formatType} .ql-picker-options`);
                
                pickers.forEach(picker => {
                    if (picker.querySelector('.custom-color-picker-wrapper')) return;

                    const wrapper = document.createElement('div');
                    wrapper.className = 'custom-color-picker-wrapper';
                    wrapper.style.padding = '8px 4px 4px 4px';
                    wrapper.style.borderTop = '1px solid #e2e8f0';
                    wrapper.style.marginTop = '6px';
                    wrapper.style.display = 'flex';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.justifyContent = 'space-between';
                    wrapper.style.gap = '8px';
                    wrapper.style.cursor = 'default';
                    wrapper.style.width = '100%';
                    wrapper.style.boxSizing = 'border-box';

                    let savedSelection = null;

                    // Prevent click from bubbling to Quill's picker which would close it prematurely
                    // Also save the text selection because opening the OS picker will steal focus
                    wrapper.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        savedSelection = quill.getSelection();
                    });
                    wrapper.addEventListener('click', (e) => e.stopPropagation());

                    const label = document.createElement('span');
                    label.innerText = 'Perso :';
                    label.style.fontSize = '12px';
                    label.style.color = '#475569';
                    label.style.fontFamily = 'sans-serif';
                    label.style.whiteSpace = 'nowrap';

                    const input = document.createElement('input');
                    input.type = 'color';
                    input.style.width = '28px';
                    input.style.height = '28px';
                    input.style.padding = '0';
                    input.style.border = '1px solid #cbd5e1';
                    input.style.borderRadius = '4px';
                    input.style.cursor = 'pointer';
                    input.style.flexShrink = '0';
                    input.style.background = 'none';

                    wrapper.appendChild(label);
                    wrapper.appendChild(input);

                    // Apply color when it changes
                    input.addEventListener('change', (e) => {
                        const val = e.target.value;
                        
                        // Restore the selection that was lost when the OS picker opened
                        if (savedSelection) {
                            quill.setSelection(savedSelection);
                        }
                        
                        // Format the text
                        quill.format(formatType, val, 'user');
                        
                        // Close the Quill dropdown
                        const pickerElement = picker.closest('.ql-picker');
                        if (pickerElement) {
                            pickerElement.classList.remove('ql-expanded');
                        }
                    });

                    picker.appendChild(wrapper);
                });
            });
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const formats = useMemo(() => [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'align',
        'list', 'indent',
        'link',
    ], []);

    return (
        <div id={boundsId} className="quill-bounds-wrapper" style={{ position: 'relative' }}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value || ''}
                onChange={(content, delta, source, editor) => {
                    if (source === 'user') {
                        onChange(content);
                    }
                }}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                bounds={`#${boundsId}`}
            />
        </div>
    );
}
