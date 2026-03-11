'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import ImageUpload from '@/components/Admin/ImageUpload';
import styles from './RecrutementEditor.module.css';

export default function RecrutementEditor({ initialData }) {
    const [data, setData] = useState(initialData);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/admin/content/recrutement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Erreur de sauvegarde');

            showToast('success', 'Page Recrutement mise à jour avec succès');
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

    const updateJob = (index, field, value) => {
        const newJobs = [...data.jobs];
        newJobs[index] = { ...newJobs[index], [field]: value };
        setData(prev => ({ ...prev, jobs: newJobs }));
    };

    const removeJob = (index) => {
        const newJobs = [...data.jobs];
        newJobs.splice(index, 1);
        setData(prev => ({ ...prev, jobs: newJobs }));
    };

    const addJob = () => {
        setData(prev => ({
            ...prev,
            jobs: [...prev.jobs, { title: '', location: '', type: 'CDI', description: '' }]
        }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <Link href="/admin/content" className={styles.backLink}>← Retour</Link>
                    <h1 className={styles.title}>Éditeur : Recrutement</h1>
                    <p className={styles.subtitle}>Personnalisez la page de recrutement et publiez vos offres d'emploi.</p>
                </div>
                <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
                    {saving ? <Loader2 size={18} className={styles.spin} /> : <Save size={18} />}
                    Enregistrer
                </button>
            </div>

            <div className={styles.formLayout}>
                {/* ── HERO ── */}
                <div className={styles.panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 className={styles.panelTitle} style={{ margin: 0 }}>Héro & Introduction</h2>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#1F4B40', fontWeight: 'bold' }}>
                            <input type="checkbox" checked={data.hero.isVisible !== false} onChange={e => updateNested('hero', 'isVisible', e.target.checked)} />
                            Afficher le panneau Héro
                        </label>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Image de fond (Héro)</label>
                        <ImageUpload
                            currentImage={data.hero.imageSrc || ''}
                            onImageChange={(url) => updateNested('hero', 'imageSrc', url)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Titre Héro (Image principale)</label>
                        <input type="text" value={data.hero.title} onChange={e => updateNested('hero', 'title', e.target.value)} />
                    </div>

                    <div className={styles.divider}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>Texte de Présentation</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#1F4B40', fontWeight: 'bold' }}>
                            <input type="checkbox" checked={data.content.isVisible !== false} onChange={e => updateNested('content', 'isVisible', e.target.checked)} />
                            Afficher le texte de présentation
                        </label>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Titre du texte de présentation</label>
                        <textarea rows={2} value={data.content.title} onChange={e => updateNested('content', 'title', e.target.value)} />
                        <span className={styles.hint}>Sauts de ligne autorisés pour le style de la maquette.</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Texte de présentation / Philosophie (Paragraphes)</label>
                        <textarea rows={8} value={data.content.text} onChange={e => updateNested('content', 'text', e.target.value)} />
                        <span className={styles.hint}>Chaque saut de ligne créera un nouveau paragraphe espacé.</span>
                    </div>
                </div>

                {/* ── OFFRES D'EMPLOI ── */}
                <div className={styles.panel}>
                    <div className={styles.panelHeaderFlex}>
                        <h2 className={styles.panelTitle}>Offres d'emploi en cours</h2>
                        <button onClick={addJob} className={styles.addBtn}><Plus size={16} /> Nouvelle offre</button>
                    </div>

                    <div className={styles.jobList}>
                        {data.jobs.map((job, i) => (
                            <div key={i} className={styles.jobCard}>
                                <div className={styles.jobHeader}>
                                    <h3 className={styles.jobCardTitle}>Poste #{i + 1}</h3>
                                    <button onClick={() => removeJob(i)} className={styles.deleteBtn} title="Supprimer l'offre">
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className={styles.jobGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Titre du poste</label>
                                        <input type="text" placeholder="Ex: Vendeur(se) Boutique" value={job.title} onChange={e => updateJob(i, 'title', e.target.value)} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Type de contrat</label>
                                        <input type="text" placeholder="Ex: CDI 35h" value={job.type} onChange={e => updateJob(i, 'type', e.target.value)} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Localisation</label>
                                        <input type="text" placeholder="Ex: Paris 15e" value={job.location} onChange={e => updateJob(i, 'location', e.target.value)} />
                                    </div>
                                </div>
                                <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                    <label>Description des missions</label>
                                    <textarea rows={4} placeholder="Description brève de l'offre..." value={job.description} onChange={e => updateJob(i, 'description', e.target.value)} />
                                    <span className={styles.hint}>Les puces (tirets) sont autorisées et formatées automatiquement.</span>
                                </div>
                            </div>
                        ))}

                        {data.jobs.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>Aucune offre en cours.</p>
                                <span>La section "Offres d'emploi" n'apparaîtra pas sur le site public.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── CONTACT CARD ── */}
                <div className={styles.panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 className={styles.panelTitle} style={{ margin: 0 }}>Carte "Candidature / Contact"</h2>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#1F4B40', fontWeight: 'bold' }}>
                            <input type="checkbox" checked={data.contactCard.isVisible !== false} onChange={e => updateNested('contactCard', 'isVisible', e.target.checked)} />
                            Afficher cette carte
                        </label>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Titre de la carte</label>
                        <textarea rows={2} value={data.contactCard.title} onChange={e => updateNested('contactCard', 'title', e.target.value)} />
                        <span className={styles.hint}>Sauts de ligne autorisés pour couper le texte joliment.</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Texte incitatif</label>
                        <textarea rows={4} value={data.contactCard.text} onChange={e => updateNested('contactCard', 'text', e.target.value)} />
                    </div>
                </div>

            </div>
        </div>
    );
}
