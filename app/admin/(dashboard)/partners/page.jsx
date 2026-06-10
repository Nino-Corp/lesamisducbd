'use client';

import { useState, useEffect, useMemo, useDeferredValue } from 'react';
import styles from './Partners.module.css';
import { MapPin, Trash2, Edit2, Search, Loader2, Save, X, Upload, Download, RefreshCw, ExternalLink } from 'lucide-react';
import * as XLSX from 'xlsx';
import Fuse from 'fuse.js';
import Link from 'next/link';

export default function PartnersAdmin() {
    const [partners, setPartners] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const deferredSearchQuery = useDeferredValue(searchQuery);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [formData, setFormData] = useState({ name: '', address: '', zip: '', city: '', lat: '', lng: '' });

    // Bulk import state
    const [importRows, setImportRows] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [exactSync, setExactSync] = useState(false);

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

    // 1. Initialiser Fuse.js UNE SEULE FOIS quand la liste des partenaires change
    const fuse = useMemo(() => {
        return new Fuse(partners, {
            keys: ['name', 'city', 'zip', 'address'],
            threshold: 0.4,
            ignoreLocation: true,
            minMatchCharLength: 2
        });
    }, [partners]);

    // 2. Filtrer avec la valeur "différée" (useDeferredValue) pour ne pas bloquer la saisie au clavier
    const filteredPartners = useMemo(() => {
        if (!deferredSearchQuery) return partners;
        return fuse.search(deferredSearchQuery).map(result => result.item);
    }, [deferredSearchQuery, fuse, partners]);

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

    const toSmartTitleCase = (str) => {
        if (!str) return '';
        const minorWords = new Set(['de', 'la', 'le', 'les', 'des', 'du', 'd', 'l', 'et', 'à', 'au', 'aux', 'en', 'un', 'une']);
        return str.toLowerCase().replace(/[\p{L}\p{N}]+/gu, (word, offset) => {
            if (offset === 0 || !minorWords.has(word)) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formattedName = toSmartTitleCase(formData.name.trim());
            const res = await fetch('/api/admin/partners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, name: formattedName, id: editingPartner?.id, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) })
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
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la récupération depuis PrestaShop.');
        } finally {
            setIsExportingPresta(false);
        }
    };

    const handleDownloadPrestaExcel = () => {
        if (!prestaRows.length) return;
        const ws = XLSX.utils.json_to_sheet(prestaRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Partenaires');
        XLSX.writeFile(wb, 'partenaires-presta.xlsx');
    };

    const handleImportPrestaDirectly = async () => {
        if (!prestaRows.length) return;
        if (!confirm(`Importer et géocoder ${prestaRows.length} adresses ? (~${Math.ceil(prestaRows.length * 0.05 / 60)} min)`)) return;
        await runBulkImport(prestaRows, exactSync);
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
                    name: toSmartTitleCase(r['name'] || r['nom'] || r['commerce'] || r['nom du commerce'] || ''),
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
            { name: 'Partenaire Dupont', address: '3 avenue Victor Hugo', zip: '13001', city: 'Marseille' },
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'template-import-professionnels.xlsx');
    };

    const runBulkImport = async (rows, syncExact = false) => {
        setIsImporting(true);
        setImportResult(null);
        try {
            const res = await fetch('/api/admin/partners/bulk-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows, exactSync: syncExact }),
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
        if (!confirm(`Importer et géocoder ${importRows.length} lignes ? (~${Math.ceil(importRows.length * 0.05 / 60)} min)`)) return;
        await runBulkImport(importRows, exactSync);
    };

    const handleDownloadErrors = () => {
        if (!importResult || !importResult.failedRows || importResult.failedRows.length === 0) return;

        const errorData = importResult.failedRows.map(f => ({
            "Nom": f.row?.name || '',
            "Adresse": f.row?.address || '',
            "Code Postal": f.row?.zip || '',
            "Ville": f.row?.city || '',
            "Raison de l'échec": f.reason || 'Erreur inconnue'
        }));

        const ws = XLSX.utils.json_to_sheet(errorData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Erreurs Géocodage');
        XLSX.writeFile(wb, 'partenaires-erreurs.xlsx');
    };

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <div className={styles.titleGroup} style={{ flexGrow: 1 }}>
                    <MapPin className={styles.titleIcon} />
                    <div>
                        <h1>Gestion des Professionnels Partenaires</h1>
                        <p>Ajoutez et gérez les points de vente sur la carte</p>
                    </div>
                </div>
                <Link
                    href="/professionnels"
                    target="_blank"
                    className={styles.submitBtn}
                    style={{ marginTop: "24px", textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', marginLeft: 'auto' }}
                >
                    <ExternalLink size={18} />
                    Voir la carte publique
                </Link>
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
                        Récupère toutes les adresses des professionnels directement depuis votre boutique.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={handleExportPresta} disabled={isExportingPresta} className={styles.geocodeBtn}>
                            {isExportingPresta ? <><Loader2 size={16} className="animate-spin" /> Récupération...</> : <><RefreshCw size={16} /> Récupérer depuis PrestaShop</>}
                        </button>
                        {prestaExportDone && prestaRows.length > 0 && (
                            <>
                                <button onClick={handleImportPrestaDirectly} disabled={isImporting} className={styles.submitBtn}>
                                    {isImporting ? <><Loader2 size={16} className="animate-spin" /> En cours...</> : <><MapPin size={16} /> Géocoder & Importer ({prestaRows.length})</>}
                                </button>
                                <button onClick={handleDownloadPrestaExcel} className={styles.geocodeBtn} style={{ background: 'transparent', border: '1px solid #10B981', color: '#10B981' }}>
                                    <Download size={16} /> Télécharger en Excel
                                </button>
                            </>
                        )}
                    </div>
                    {prestaExportDone && (
                        <p style={{ marginTop: '10px', fontSize: '13px', color: '#10B981' }}>
                            ✅ {prestaRows.length} adresses récupérées et prêtes à être géocodées.
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
                </div>

                {/* Options globales d'import */}
                <div style={{ padding: '16px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        id="exactSync"
                        checked={exactSync}
                        onChange={(e) => setExactSync(e.target.checked)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="exactSync" style={{ fontSize: '14px', cursor: 'pointer', color: '#4b5563' }}>
                        <strong>Synchronisation "Miroir"</strong> : Supprimer de la carte les professionnels qui ne sont <u>pas</u> dans ce fichier importé.
                    </label>
                </div>

                {/* Résultat global de l'import (PrestaShop ou Excel) */}
                {isImporting && (
                    <p style={{ marginTop: '0', fontSize: '13px', color: '#f59e0b', fontStyle: 'italic', padding: '0 16px' }}>
                        ⏳ Ne fermez pas cette page — géocodage en cours...
                    </p>
                )}
                {importResult && (
                    <div style={{ margin: '0 16px 16px', fontSize: '13px', padding: '16px', borderRadius: '8px', background: importResult.failed > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)' }}>
                        <p>✅ <strong>{importResult.imported || 0}</strong> nouveaux ajoutés.</p>
                        <p>🔄 <strong>{importResult.updated || 0}</strong> mis à jour (nouvelle adresse).</p>
                        <p>⏭️ <strong>{importResult.skipped || 0}</strong> ignorés (déjà à jour).</p>
                        {importResult.deleted > 0 && <p style={{ color: '#dc2626' }}>🗑️ <strong>{importResult.deleted}</strong> obsolètes supprimés de la carte.</p>}

                        {importResult.failed > 0 && (
                            <div style={{ marginTop: '12px', background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                                <p style={{ color: '#b45309', marginBottom: '8px' }}>⚠️ <strong>{importResult.failed}</strong> échec(s) de géocodage.</p>
                                <button
                                    onClick={handleDownloadErrors}
                                    style={{ background: '#fff', border: '1px solid #d1d5db', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <Download size={14} /> Télécharger le rapport d'erreurs
                                </button>
                            </div>
                        )}
                        <p style={{ marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '12px' }}>📍 Total en base : <strong>{importResult.total}</strong></p>
                    </div>
                )}
            </div>

            <div className={styles.grid}>
                {/* Formulaire */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>{editingPartner ? 'Modifier le partenaire' : 'Ajouter un professionnel'}</h2>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>
                            Liste des Partenaires ({filteredPartners.length}/{partners.length})
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '8px', padding: '6px 12px', gap: '8px', width: '300px', maxWidth: '100%' }}>
                            <Search size={16} color="#6b7280" />
                            <input
                                type="text"
                                placeholder="Rechercher (nom, ville, CP)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className={styles.loader}><Loader2 className="animate-spin" /></div>
                    ) : filteredPartners.length === 0 ? (
                        <div className={styles.empty}>Aucun partenaire trouvé.</div>
                    ) : (
                        <div className={styles.list}>
                            {filteredPartners.map(partner => (
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
