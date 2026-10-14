'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './LoyaltyIconModal.module.css';
import { 
    X, Search, UploadCloud, Loader2, Sparkles, Image as ImageIcon, Trash2 
} from 'lucide-react';
import { 
    LOYALTY_LUCIDE_ICONS, 
    LOYALTY_ICON_MAP, 
    LOYALTY_ICON_CATEGORIES 
} from '@/components/Loyalty/LoyaltyTierIcon';

export default function LoyaltyIconModal({
    isOpen,
    onClose,
    tierName = 'Palier',
    currentIcon = '',
    onSelectIcon
}) {
    // Initial tab based on whether currentIcon is an image or lucide icon
    const isImage = useMemo(() => {
        return typeof currentIcon === 'string' && (
            currentIcon.startsWith('http://') || 
            currentIcon.startsWith('https://') || 
            currentIcon.startsWith('/') || 
            currentIcon.startsWith('data:image/')
        );
    }, [currentIcon]);

    const [activeTab, setActiveTab] = useState('lucide');
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    // Sync tab when opening
    useEffect(() => {
        if (isOpen) {
            setActiveTab(isImage ? 'upload' : 'lucide');
            setSearch('');
            setSelectedCategory('all');
            setUploadError('');
        }
    }, [isOpen, isImage]);

    // Keyboard Escape to close
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Current Lucide icon name without prefix
    const currentLucideName = useMemo(() => {
        if (!currentIcon || isImage) return '';
        let name = currentIcon.trim();
        if (name.startsWith('lucide:')) name = name.slice(7);
        if (name.startsWith('Icon') && name.length > 4) name = name.slice(4);
        return name;
    }, [currentIcon, isImage]);

    // Filter icons by category and search
    const filteredIcons = useMemo(() => {
        const query = search.trim().toLowerCase();
        return Object.entries(LOYALTY_LUCIDE_ICONS).filter(([name, data]) => {
            const matchesCategory = selectedCategory === 'all' || data.category === selectedCategory;
            if (!matchesCategory) return false;
            if (!query) return true;
            return name.toLowerCase().includes(query) || data.label.toLowerCase().includes(query);
        });
    }, [search, selectedCategory]);

    const handleSelectLucide = (name) => {
        onSelectIcon(`lucide:${name}`);
        onClose();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 200 * 1024) {
            setUploadError('Le fichier est trop volumineux (maximum 200 Ko).');
            return;
        }

        setIsUploading(true);
        setUploadError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                onSelectIcon(data.url);
                onClose();
            } else {
                throw new Error(data.error || "Erreur lors de l'upload.");
            }
        } catch (err) {
            console.error(err);
            setUploadError(err.message || "Erreur lors de l'envoi de l'image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleResetIcon = () => {
        onSelectIcon('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={styles.modal} role="dialog" aria-modal="true">
                {/* Header */}
                <div className={styles.header}>
                    <h3 className={styles.headerTitle}>
                        Choisir une icône
                        <span className={styles.tierBadge}>{tierName}</span>
                    </h3>
                    <button className={styles.closeButton} onClick={onClose} title="Fermer">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className={styles.tabBar}>
                    <button
                        type="button"
                        className={`${styles.tabButton} ${activeTab === 'lucide' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('lucide')}
                    >
                        <Sparkles size={16} />
                        Icônes Lucide React
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabButton} ${activeTab === 'upload' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        <ImageIcon size={16} />
                        Déposer une image
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {activeTab === 'lucide' ? (
                        <>
                            {/* Search */}
                            <div className={styles.searchArea}>
                                <div className={styles.searchInputWrapper}>
                                    <Search size={16} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Rechercher une icône (ex: Sprout, Crown, Star, Gem...)"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className={styles.searchInput}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Category Filter Pills */}
                            <div className={styles.categoryPills}>
                                {LOYALTY_ICON_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`${styles.pill} ${selectedCategory === cat.id ? styles.pillActive : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Icon Grid */}
                            {filteredIcons.length > 0 ? (
                                <div className={styles.grid}>
                                    {filteredIcons.map(([name, data]) => {
                                        const IconComponent = LOYALTY_ICON_MAP[name];
                                        const isSelected = currentLucideName === name;
                                        if (!IconComponent) return null;

                                        return (
                                            <button
                                                key={name}
                                                type="button"
                                                className={`${styles.iconCard} ${isSelected ? styles.iconCardSelected : ''}`}
                                                onClick={() => handleSelectLucide(name)}
                                                title={data.label}
                                            >
                                                <IconComponent size={26} color={isSelected ? '#1F4B40' : '#334155'} />
                                                <span className={styles.iconCardLabel}>{name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    Aucune icône ne correspond à votre recherche "{search}".
                                </div>
                            )}
                        </>
                    ) : (
                        <div>
                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                onChange={handleFileUpload}
                            />

                            {/* Dropzone */}
                            <div
                                className={styles.uploadDropzone}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                <div className={styles.uploadIconCircle}>
                                    {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
                                </div>
                                <div>
                                    <p className={styles.uploadTitle}>
                                        {isUploading ? 'Téléversement en cours...' : 'Cliquez pour choisir une image'}
                                    </p>
                                    <p className={styles.uploadSubtitle}>
                                        Formats acceptés : PNG, SVG, WEBP, JPG (taille max 200 Ko)
                                    </p>
                                </div>
                            </div>

                            {uploadError && (
                                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '10px' }}>
                                    {uploadError}
                                </p>
                            )}

                            {/* Current Image preview */}
                            {isImage && (
                                <div className={styles.currentImageCard}>
                                    <img src={currentIcon} alt="Actuelle" className={styles.previewImage} />
                                    <div className={styles.imageInfo}>
                                        <div className={styles.imageTitle}>Image actuellement active</div>
                                        <div className={styles.imageUrl}>{currentIcon}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResetIcon}
                                        className={styles.resetBtn}
                                        title="Supprimer l'image"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    {currentIcon ? (
                        <button type="button" className={styles.resetBtn} onClick={handleResetIcon}>
                            Retirer l'icône
                        </button>
                    ) : (
                        <div />
                    )}
                    <button type="button" className={styles.confirmBtn} onClick={onClose}>
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
