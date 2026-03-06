'use client';

import { useState, useEffect } from 'react';
import styles from './Partners.module.css';
import { MapPin, Trash2, Edit2, Search, Loader2, Save, X, Upload, Download, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function PartnersAdmin() {
    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [formData, setFormData] = useState({ name: '', address: '', zip: '', city: '', lat: '', lng: '' });

    // Bulk import state
    const [importRows, setImportRows] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    // PrestaShop export state
    const [isExportingPresta, setIsExportingPresta] = useState(false);
    const [prestaRows, setPrestaRows] = useState([]);
    const [prestaExportDone, setPrestaExportDone] = useState(false);

    useEffect(() => { fetchPartners(); }, []);

    const fetchPartners = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/partners');
            const data = await res.json();
            setPartners(data);
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGeocode = async () => {
        if (!formData.address || !formData.city) { alert("Veuillez saisir une adresse et une ville."); return; }
        setIsGeocoding(true);
        try {
            const query = `${formData.address}, ${formData.zip} ${formData.city}, France`;
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                setFormData(prev => ({ ...prev, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }));
            } else {
                alert("Adresse introuvable. Saisissez les coordonnées manuellement.");
            }
        } catch (err) {
            console.error('Geocoding error:', err);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/partners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, id: editingPartner?.id, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) })
            });
            if (res.ok) {
                setEditingPartner(null);
                setFormData({ name: '', address: '', zip: '', city: '', lat: '', lng: '' });
                fetchPartners();
            } else {
                const data = await res.json();
                alert(`Erreur: ${data.error}`);
            }
        } catch (err) { console.error('Save error:', err); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce partenaire ?')) return;
        try {
            const res = await fetch(`/api/admin/partners?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchPartners();
        } catch (err) { console.error('Delete error:', err); }
    };

    const startEdit = (partner) => { setEditingPartner(partner); setFormData(partner); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const cancelEdit = () => { setEditingPartner(null); setFormData({ name: '', address: '', zip: '', city: '', lat: '', lng: '' }); };

    // ─── PrestaShop Export ──────────────────────────────────────────────────
    const handleExportPresta = async () => {
        setIsExportingPresta(true);
        setPrestaExportDone(false);
        setPrestaRows([]);
        try {
            const res = await fetch('/api/admin/partners/export-presta');
            const data = await res.json();
            if (!res.ok) { alert(`Erreur: ${data.error}`); return; }
            setPrestaRows(data);
            setPrestaExportDone(true);
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Partenaires');
            XLSX.writeFile(wb, 'partenaires-presta-export.xlsx');
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la récupération depuis PrestaShop.');
        } finally {
            setIsExportingPresta(false);
        }
    };

    const handleImportPrestaDirectly = async () => {
        if (!prestaRows.length) return;
        if (!confirm(`Importer et géocoder ${prestaRows.length} adresses ? (~${Math.ceil(prestaRows.length * 1.5 / 60)} min)`)) return;
        await runBulkImport(prestaRows);
    };

    // ─── Excel / CSV Upload ─────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImportResult(null);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const wb = XLSX.read(evt.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
            const normalised = rows.map(row => {
                const r = {};
                for (const k of Object.keys(row)) r[k.toLowerCase().trim()] = String(row[k]).trim();
                return {
                    name: r['name'] || r['nom'] || r['commerce'] || r['nom du commerce'] || '',
                    address: r['address'] || r['adresse'] || r['address1'] || '',
                    zip: r['zip'] || r['code postal'] || r['postcode'] || '',
                    city: r['city'] || r['ville'] || '',
                };
            }).filter(r => r.name || r.address);
            setImportRows(normalised);
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const template = [
            { name: 'Tabac de la Place', address: '12 rue de la Paix', zip: '75001', city: 'Paris' },
            { name: 'Buraliste Dupont', address: '3 avenue Victor Hugo', zip: '13001', city: 'Marseille' },
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'template-import-buralistes.xlsx');
    };

    const runBulkImport = async (rows) => {
        setIsImporting(true);
        setImportResult(null);
        try {
            const res = await fetch('/api/admin/partners/bulk-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rows),
            });
            const data = await res.json();
            setImportResult(data);
            if (data.success) fetchPartners();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'import.");
        } finally {
            setIsImporting(false);
        }
    };

    const handleImportFile = async () => {
        if (!importRows.length) return;
        if (!confirm(`Importer et géocoder ${importRows.length} lignes ? (~${Math.ceil(importRows.length * 1.5 / 60)} min)`)) return;
        await runBulkImport(importRows);
    };

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <MapPin className={styles.titleIcon} />
                    <div>
                        <h1>Gestion des Buralistes Partenaires</h1>
                        <p>Ajoutez et gérez les points de vente sur la carte</p>
                    </div>
                </div>
            </div>

            {/* ── SECTION: Import en masse ───── */}
            <div className={styles.card} style={{ marginBottom: '24px' }}>
                <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={20} /> Import en masse
                </h2>

                {/* Sous-section 1: PrestaShop */}
                <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px' }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#10B981' }}>1. Depuis PrestaShop (clients Professionnels)</h3>
                    <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#aaa' }}>
                        Récupère toutes les adresses des pros et télécharge un fichier Excel de sauvegarde.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={handleExportPresta} disabled={isExportingPresta} className={styles.geocodeBtn}>
                            {isExportingPresta ? <><Loader2 size={16} className="animate-spin" /> Récupération...</> : <><RefreshCw size={16} /> Récupérer depuis PrestaShop</>}
                        </button>
                        {prestaExportDone && prestaRows.length > 0 && (
                            <button onClick={handleImportPrestaDirectly} disabled={isImporting} className={styles.submitBtn}>
                                {isImporting ? <><Loader2 size={16} className="animate-spin" /> En cours...</> : <><MapPin size={16} /> Géocoder & Importer ({prestaRows.length})</>}
                            </button>
                        )}
                    </div>
                    {prestaExportDone && (
                        <p style={{ marginTop: '10px', fontSize: '13px', color: '#10B981' }}>
                            ✅ {prestaRows.length} adresses récupérées. Fichier Excel téléchargé.
                        </p>
                    )}
                </div>

                {/* Sous-section 2: Fichier Excel/CSV */}
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px' }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#10B981' }}>2. Depuis un fichier Excel / CSV</h3>
                    <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#aaa' }}>
                        Colonnes requises : <strong>name</strong>, <strong>address</strong>, <strong>zip</strong>, <strong>city</strong>
                    </p>
                    <button onClick={handleDownloadTemplate} className={styles.geocodeBtn} style={{ marginBottom: '14px' }}>
                        <Download size={16} /> Télécharger le modèle Excel
                    </button>
                    <br />
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} style={{ marginBottom: '12px', fontSize: '14px', color: '#ccc' }} />
                    {importRows.length > 0 && (
                        <div>
                            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '10px' }}>
                                📄 {importRows.length} lignes. Aperçu : <em>{importRows.slice(0, 3).map(r => r.name || r.city).join(', ')}…</em>
                            </p>
                            <button onClick={handleImportFile} disabled={isImporting} className={styles.submitBtn}>
                                {isImporting ? <><Loader2 size={16} className="animate-spin" /> En cours...</> : <><MapPin size={16} /> Géocoder & Importer ({importRows.length})</>}
                            </button>
                        </div>
                    )}
                    {isImporting && (
                        <p style={{ marginTop: '12px', fontSize: '13px', color: '#f59e0b', fontStyle: 'italic' }}>
                            ⏳ Ne fermez pas cette page — durée estimée ~{Math.ceil(importRows.length * 1.5 / 60)} min
                        </p>
                    )}
                    {importResult && (
                        <div style={{ marginTop: '12px', fontSize: '13px', padding: '12px', borderRadius: '8px', background: importResult.failed > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)' }}>
                            <p>✅ <strong>{importResult.imported}</strong> importés avec succès.</p>
                            {importResult.failed > 0 && <p>⚠️ <strong>{importResult.failed}</strong> adresse(s) non géocodée(s).</p>}
                            <p>📍 Total en base : <strong>{importResult.total}</strong></p>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.grid}>
                {/* Formulaire */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>{editingPartner ? 'Modifier le partenaire' : 'Ajouter un buraliste'}</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <label>Nom du commerce</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="ex: Tabac de la Place" required />
                        </div>
                        <div className={styles.field}>
                            <label>Adresse</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="12 rue de la Paix" required />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label>Code Postal</label>
                                <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} placeholder="75000" required />
                            </div>
                            <div className={styles.field}>
                                <label>Ville</label>
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Paris" required />
                            </div>
                        </div>
                        <button type="button" onClick={handleGeocode} disabled={isGeocoding} className={styles.geocodeBtn}>
                            {isGeocoding ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            Géocoder l&apos;adresse (Lat/Lng)
                        </button>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label>Latitude</label>
                                <input type="number" step="any" name="lat" value={formData.lat} onChange={handleInputChange} placeholder="48.8566" required />
                            </div>
                            <div className={styles.field}>
                                <label>Longitude</label>
                                <input type="number" step="any" name="lng" value={formData.lng} onChange={handleInputChange} placeholder="2.3522" required />
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            {editingPartner && (
                                <button type="button" onClick={cancelEdit} className={styles.cancelBtn}>
                                    <X size={18} /> Annuler
                                </button>
                            )}
                            <button type="submit" disabled={isSaving} className={styles.submitBtn}>
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {editingPartner ? 'Mettre à jour' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Liste */}
                <div className={styles.listContainer}>
                    <h2 className={styles.cardTitle}>Liste des Partenaires ({partners.length})</h2>
                    {isLoading ? (
                        <div className={styles.loader}><Loader2 className="animate-spin" /></div>
                    ) : partners.length === 0 ? (
                        <div className={styles.empty}>Aucun partenaire enregistré.</div>
                    ) : (
                        <div className={styles.list}>
                            {partners.map(partner => (
                                <div key={partner.id} className={styles.partnerItem}>
                                    <div className={styles.partnerInfo}>
                                        <h3>{partner.name}</h3>
                                        <p>{partner.address}, {partner.zip} {partner.city}</p>
                                        <span className={styles.coords}>{partner.lat.toFixed(4)}, {partner.lng.toFixed(4)}</span>
                                    </div>
                                    <div className={styles.actions}>
                                        <button onClick={() => startEdit(partner)} className={styles.editBtn}><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(partner.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
