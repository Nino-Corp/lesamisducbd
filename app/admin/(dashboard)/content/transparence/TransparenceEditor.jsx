'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Save, Loader2, Plus, Trash2, GripVertical, AlertTriangle } from 'lucide-react';
import ImageUpload from '@/components/Admin/ImageUpload';
import WysiwygEditor from '../../builder/WysiwygEditor';
import styles from './TransparenceEditor.module.css';

export default function TransparenceEditor({ initialData }) {
    const [data, setData] = useState(initialData);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/admin/content/transparence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Erreur de sauvegarde');

            showToast('success', 'Page Transparence mise à jour avec succès');
            router.refresh();
        } catch (error) {
            console.error(error);
            showToast('error', 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const updateNested = (section, field, value) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const updateRoot = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const updateDeepNested = (section, col, field, value) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [col]: {
                    ...prev[section][col],
                    [field]: value
                }
            }
        }));
    };

    const updateCertificat = (index, field, value) => {
        const newCertifs = [...data.certificats];
        newCertifs[index] = { ...newCertifs[index], [field]: value };
        setData(prev => ({ ...prev, certificats: newCertifs }));
    };

    const removeCertificat = (index) => {
        const newCertifs = [...data.certificats];
        newCertifs.splice(index, 1);
        setData(prev => ({ ...prev, certificats: newCertifs }));
    };

    const addCertificat = () => {
        setData(prev => ({
            ...prev,
            certificats: [...prev.certificats, { src: '', alt: 'Nouvelle Analyse', label: 'NOUVEAU = 0%' }]
        }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <Link href="/admin/content" className={styles.backLink}>← Retour</Link>
                    <h1 className={styles.title}>Éditeur : Transparence</h1>
                    <p className={styles.subtitle}>Modifiez le texte et les certificats de la page Transparence.</p>
                </div>
                <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
                    {saving ? <Loader2 size={18} className={styles.spin} /> : <Save size={18} />}
                    Enregistrer
                </button>
            </div>

            <div className={styles.formLayout}>
                {/* ── HERO & QUOTE ── */}
                <div className={styles.panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 className={styles.panelTitle} style={{ margin: 0 }}>Héro & Introduction</h2>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#1F4B40', fontWeight: 'bold' }}>
                            <input type="checkbox" checked={data.hero.isVisible !== false} onChange={e => updateNested('hero', 'isVisible', e.target.checked)} />
                            Afficher le panneau Héro
                        </label>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Titre de la page</label>
                        <input type="text" value={data.hero.title} onChange={e => updateNested('hero', 'title', e.target.value)} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Sous-titre de la page</label>
                        <input type="text" value={data.hero.subtitle} onChange={e => updateNested('hero', 'subtitle', e.target.value)} />
                    </div>

                    <div className={styles.divider}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>Citation / Manifesto</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#1F4B40', fontWeight: 'bold' }}>
                            <input type="checkbox" checked={data.quote.isVisible !== false} onChange={e => updateNested('quote', 'isVisible', e.target.checked)} />
                            Afficher la Citation
                        </label>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Citation Manifesto (Texte)</label>
                        <WysiwygEditor value={data.quote.text || ''} onChange={val => updateNested('quote', 'text', val)} />
                        <span className={styles.hint}>Sauts de ligne autorisés.</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Auteur Citation</label>
                        <input type="text" value={data.quote.author} onChange={e => updateNested('quote', 'author', e.target.value)} />
                    </div>
                </div>

                {/* ── SECTION 1 : QUALITÉ ── */}
                <div className={styles.panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 className={styles.panelTitle} style={{ margin: 0 }}>Section 1 : Arguments Qualité</h2>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#1F4B40', fontWeight: 'bold' }}>
                            <input type="checkbox" checked={data.section1.isVisible !== false} onChange={e => updateNested('section1', 'isVisible', e.target.checked)} />
                            Afficher cette section
                        </label>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Titre Principal de la section</label>
                        <input type="text" value={data.section1.title} onChange={e => updateNested('section1', 'title', e.target.value)} />
                    </div>

                    <div className={styles.columnsEditor}>
                        <div className={styles.colEditor}>
                            <h4>Colonne Gauche</h4>
                            <label>Titre</label>
                            <input type="text" value={data.section1.col1.title} onChange={e => updateDeepNested('section1', 'col1', 'title', e.target.value)} />
                            <label>Contenu</label>
                            <WysiwygEditor value={data.section1.col1.text || ''} onChange={val => updateDeepNested('section1', 'col1', 'text', val)} />
                            <span className={styles.hint}>Commencez une ligne par "-" ou "*" pour créer une puce de liste.</span>
                        </div>
                        <div className={styles.colEditor}>
                            <h4>Colonne Droite</h4>
                            <label>Titre</label>
                            <input type="text" value={data.section1.col2.title} onChange={e => updateDeepNested('section1', 'col2', 'title', e.target.value)} />
                            <label>Contenu</label>
                            <WysiwygEditor value={data.section1.col2.text || ''} onChange={val => updateDeepNested('section1', 'col2', 'text', val)} />
                        </div>
                    </div>
                </div>

                {/* ── SECTION 2 : PRIX ── */}
                <div className={styles.panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 className={styles.panelTitle} style={{ margin: 0 }}>Section 2 : Arguments Prix</h2>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#1F4B40', fontWeight: 'bold' }}>
                            <input type="checkbox" checked={data.section2.isVisible !== false} onChange={e => updateNested('section2', 'isVisible', e.target.checked)} />
                            Afficher cette section
                        </label>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Titre Principal de la section</label>
                        <input type="text" value={data.section2.title} onChange={e => updateNested('section2', 'title', e.target.value)} />
                    </div>

                    <div className={styles.columnsEditor}>
                        <div className={styles.colEditor}>
                            <h4>Colonne Gauche</h4>
                            <label>Titre</label>
                            <input type="text" value={data.section2.col1.title} onChange={e => updateDeepNested('section2', 'col1', 'title', e.target.value)} />
                            <label>Contenu</label>
                            <WysiwygEditor value={data.section2.col1.text || ''} onChange={val => updateDeepNested('section2', 'col1', 'text', val)} />
                        </div>
                        <div className={styles.colEditor}>
                            <h4>Colonne Droite</h4>
                            <label>Titre</label>
                            <input type="text" value={data.section2.col2.title} onChange={e => updateDeepNested('section2', 'col2', 'title', e.target.value)} />
                            <label>Contenu</label>
                            <WysiwygEditor value={data.section2.col2.text || ''} onChange={val => updateDeepNested('section2', 'col2', 'text', val)} />
                        </div>
                    </div>
                </div>

                {/* ── CERTIFICATS ── */}
                <div className={styles.panel}>
                    <div className={styles.panelHeaderFlex} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <h2 className={styles.panelTitle} style={{ margin: 0 }}>Galerie Certificats (Analyses)</h2>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#1F4B40', fontWeight: 'bold' }}>
                                <input type="checkbox" checked={data.certificatsVisible !== false} onChange={e => updateRoot('certificatsVisible', e.target.checked)} />
                                Afficher la galerie
                            </label>
                        </div>
                        <button onClick={addCertificat} className={styles.addBtn}><Plus size={16} /> Ajouter un certificat</button>
                    </div>

                    <div className={styles.certifList}>
                        {data.certificats.map((cert, i) => (
                            <div key={i} className={styles.certifRow}>
                                <div className={styles.certifContent}>
                                    <div className={styles.certifImageWrapper}>
                                        <ImageUpload
                                            currentImage={cert.src || ''}
                                            onImageChange={url => updateCertificat(i, 'src', url)}
                                        />
                                    </div>
                                    <div className={styles.certifTextInputs}>
                                        <div className={styles.inputStack}>
                                            <label>Label affiché en dessous</label>
                                            <input
                                                type="text"
                                                placeholder="ex: AK-47 CBD = 7,5%"
                                                value={cert.label}
                                                onChange={e => updateCertificat(i, 'label', e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.inputStack}>
                                            <label>Texte alternatif SEO (Alt)</label>
                                            <input
                                                type="text"
                                                placeholder="Pour l'accessibilité Google"
                                                value={cert.alt}
                                                onChange={e => updateCertificat(i, 'alt', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => removeCertificat(i)} className={styles.deleteBtn} title="Supprimer ce certificat">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                        {data.certificats.length === 0 && <p className={styles.hint}>Aucun certificat n'est configuré.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}
