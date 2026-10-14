'use client';
import { useState } from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import styles from './ImageUpload.module.css';

export default function ImageUpload({ currentImage, onImageChange, accept = "image/*,application/pdf" }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage);
    const [previewType, setPreviewType] = useState(() => {
        if (currentImage?.toLowerCase().endsWith('.pdf')) return 'pdf';
        return 'image';
    });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const MAX_SIZE_MB = 4.5;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`Erreur : Le fichier "${file.name}" est trop volumineux.\nLa taille maximale autorisée est de ${MAX_SIZE_MB} Mo.`);
            e.target.value = ''; // Reset input
            return;
        }

        const isPdf = file.type === 'application/pdf';
        setPreviewType(isPdf ? 'pdf' : 'image');

        // Preview immediate
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            onImageChange(data.url); // Send back the new URL parent
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erreur lors de l\'upload de l\'image');
            setPreview(currentImage); // Revert preview on error
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.previewContainer}>
                {preview ? (
                    previewType === 'pdf' ? (
                        <iframe
                            src={`${preview}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                            title="Aperçu PDF"
                            className={styles.pdfThumbnail}
                            tabIndex={-1}
                        />
                    ) : (
                        <img src={preview} alt="Preview" className={styles.image} />
                    )
                ) : (
                    <div className={styles.placeholder}>Aucun fichier</div>
                )}
                {uploading && <div className={styles.overlay}>Upload...</div>}
            </div>
            <label className={styles.uploadBtn}>
                {uploading ? 'Chargement...' : 'Changer le fichier'}
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={uploading}
                    style={{ display: 'none' }}
                />
            </label>
            <span className={styles.sizeWarning} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={13} /> Poids max. : 4.5 Mo
            </span>
        </div>
    );
}
