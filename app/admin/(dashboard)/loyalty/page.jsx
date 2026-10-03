'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './LoyaltySettings.module.css';
import { Save, Plus, Trash2, Loader2, Sparkles, Droplet, Star, Leaf, Award, Palette, Layers, CreditCard, ChevronDown, Check } from 'lucide-react';
import rewardsStyles from '../../../account/Tabs/RewardsTab.module.css';



export default function LoyaltySettings() {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activePreviewTier, setActivePreviewTier] = useState(0);
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
    const renderUserName = (name) => {
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.2' }}>
                    <span>{parts[0]}</span>
                    <span>{parts.slice(1).join(' ')}</span>
                </div>
            );
        }
        return <div style={{ textAlign: 'left' }}>{name}</div>;
    };

    // Card Tilt State
    const [tilt, setTilt] = useState({ x: 0, y: 0, mouseX: 50, mouseY: 50 });
    const cardRef = useRef(null);
    const [psGroups, setPsGroups] = useState([]);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/loyalty-settings').then(res => res.json()),
            fetch('/api/admin/groups').then(res => res.json().catch(() => ({ groups: [] })))
        ]).then(([settingsData, groupsData]) => {
            setSettings(settingsData);
            if (groupsData && groupsData.groups) {
                setPsGroups(groupsData.groups);
            }
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/loyalty-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Erreur de sauvegarde: ${res.status} ${text}`);
            }
            setTimeout(() => setIsSaving(false), 500);
        } catch (error) {
            console.error(error);
            alert(error.message);
            setIsSaving(false);
        }
    };

    const updateTier = (index, field, value) => {
        const newTiers = [...settings.tiers];
        newTiers[index][field] = field === 'minSpent' ? Number(value) : value;
        setSettings({ ...settings, tiers: newTiers });
    };

    const addTier = () => {
        setSettings({
            ...settings,
            tiers: [
                ...settings.tiers,
                { id: Date.now().toString(), name: "Nouveau Palier", minSpent: 0, icon: "IconStar" }
            ]
        });
    };

    const removeTier = (index) => {
        const newTiers = [...settings.tiers];
        newTiers.splice(index, 1);
        setSettings({ ...settings, tiers: newTiers });
        if (activePreviewTier >= newTiers.length) {
            setActivePreviewTier(Math.max(0, newTiers.length - 1));
        }
    };

    const handleFileUpload = async (e, index) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 200 * 1024) {
            alert('Le fichier est trop volumineux (max 200Ko)');
            return;
        }

        const newTiers = [...settings.tiers];
        newTiers[index].isUploading = true;
        setSettings({ ...settings, tiers: newTiers });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                updateTier(index, 'icon', data.url);
            } else {
                throw new Error(data.error || 'Erreur upload');
            }
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'upload');
        } finally {
            setSettings(prev => {
                const finalTiers = [...prev.tiers];
                if (finalTiers[index]) finalTiers[index].isUploading = false;
                return { ...prev, tiers: finalTiers };
            });
        }
    };

    const updateCardStyle = (field, value) => {
        setSettings({
            ...settings,
            cardStyle: { ...settings.cardStyle, [field]: value }
        });
    };

    const updateSetting = (field, value) => {
        setSettings({
            ...settings,
            [field]: value
        });
    };

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -15;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 15;

        const mouseX = (x / rect.width) * 100;
        const mouseY = (y / rect.height) * 100;

        setTilt({ x: rotateX, y: rotateY, mouseX, mouseY });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0, mouseX: 50, mouseY: 50 });
    };

    if (isLoading || !settings) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
                <Loader2 className={styles.spinner} size={40} color="#111827" />
            </div>
        );
    }

    const previewTier = settings.tiers[activePreviewTier] || settings.tiers[0];
    const IconComponent = previewTier?.icon ? <img src={previewTier.icon} alt={previewTier?.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : null;

    let nextTierName = "Max";
    let euroToNext = 0;
    if (previewTier) {
        const sortedTiers = [...settings.tiers].sort((a, b) => a.minSpent - b.minSpent);
        const currentIndex = sortedTiers.findIndex(t => t.id === previewTier.id);
        if (currentIndex < sortedTiers.length - 1) {
            nextTierName = sortedTiers[currentIndex + 1].name;
            euroToNext = sortedTiers[currentIndex + 1].minSpent - previewTier.minSpent;
        }
    }

    const cardStyle = {
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        '--mouseX': `${tilt.mouseX}%`,
        '--mouseY': `${tilt.mouseY}%`,
        '--bg1': settings.cardStyle.cardBackground1 || '#112924',
        '--bg2': settings.cardStyle.cardBackground2 || '#1F4B40',
        '--text-color': settings.cardStyle.textColor || '#ffffff'
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h1 className={styles.title}>Programme Fidélité & VIP</h1>
                    <p className={styles.subtitle}>Gérez vos paliers et l'apparence de la carte VIP de vos clients de manière fluide.</p>
                </div>
                <button 
                    className={styles.saveBtn} 
                    onClick={handleSave} 
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
            </div>

            <div className={styles.grid}>
                
                <div className={styles.columnLeft}>
                    {/* Tiers Settings */}
                    <div className={styles.card}>
                        <div className={styles.cardHeaderArea}>
                            <div className={styles.cardIconBox}><Layers size={20} /></div>
                            <div>
                                <h2 className={styles.cardTitle}>Paliers VIP</h2>
                                <p className={styles.cardDesc}>Définissez les seuils d'achat et les noms de chaque rang.</p>
                            </div>
                        </div>
                        
                        <div className={styles.tiersList}>
                            {settings.tiers.map((tier, index) => (
                                <div 
                                    key={tier.id} 
                                    className={`${styles.tierRow} ${activePreviewTier === index ? styles.tierRowActive : ''}`}
                                    onClick={() => setActivePreviewTier(index)}
                                >
                                    <div className={styles.formGroup}>
                                        <label>Nom du palier</label>
                                        <input 
                                            className={styles.input} 
                                            value={tier.name}
                                            onChange={(e) => updateTier(index, 'name', e.target.value)}
                                            placeholder="Ex: La Graine"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Seuil (€)</label>
                                        <input 
                                            className={styles.input} 
                                            type="number"
                                            value={tier.minSpent}
                                            onChange={(e) => updateTier(index, 'minSpent', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Icône (max 200Ko)</label>
                                        <div className={styles.iconUploadWrapper}>
                                            <input 
                                                type="file" 
                                                id={`iconUpload-${index}`}
                                                className={styles.hiddenFileInput}
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, index)}
                                            />
                                            <label htmlFor={`iconUpload-${index}`} className={styles.uploadButton}>
                                                {tier.isUploading ? <Loader2 className={styles.spinner} size={18} /> : 
                                                    (tier.icon?.startsWith('http') || tier.icon?.startsWith('/') ? 
                                                        <img src={tier.icon} alt="Icon" className={styles.uploadedIcon} /> : 
                                                        <div className={styles.uploadPlaceholder}>+</div>
                                                    )
                                                }
                                            </label>
                                        </div>
                                    </div>
                                    <button 
                                        className={styles.removeBtn} 
                                        onClick={(e) => { e.stopPropagation(); removeTier(index); }}
                                        title="Supprimer ce palier"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            <button className={styles.addBtn} onClick={addTier}>
                                <Plus size={18} /> Ajouter un nouveau palier
                            </button>
                        </div>
                    </div>

                    {/* Design Settings */}
                    <div className={styles.card}>
                        <div className={styles.cardHeaderArea}>
                            <div className={styles.cardIconBox}><Palette size={20} /></div>
                            <div>
                                <h2 className={styles.cardTitle}>Configuration Globale & Design de la Carte</h2>
                                <p className={styles.cardDesc}>Personnalisez les accès et l'apparence holographique de la carte.</p>
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                            <label>Groupes autorisés à rejoindre le programme de fidélité VIP</label>
                            {psGroups && psGroups.length > 0 ? (
                                <div style={{ position: 'relative', marginTop: '10px' }}>
                                    <div 
                                        onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '12px 15px', backgroundColor: '#111827', border: '1px solid #374151',
                                            borderRadius: '8px', cursor: 'pointer', color: '#f3f4f6'
                                        }}
                                    >
                                        <span>
                                            {settings.enabledGroups?.length 
                                                ? `${settings.enabledGroups.length} groupe(s) sélectionné(s)` 
                                                : "Sélectionner des groupes"}
                                        </span>
                                        <ChevronDown size={18} style={{ transform: isGroupDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </div>
                                    
                                    {isGroupDropdownOpen && (
                                        <div style={{ 
                                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                                            marginTop: '4px', backgroundColor: '#1f2937', border: '1px solid #374151',
                                            borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                            maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column'
                                        }}>
                                            {psGroups.map(group => {
                                                const isChecked = settings.enabledGroups && settings.enabledGroups.includes(group.id);
                                                return (
                                                    <div 
                                                        key={group.id}
                                                        onClick={() => {
                                                            const current = settings.enabledGroups || [];
                                                            if (!isChecked) {
                                                                updateSetting('enabledGroups', [...current, group.id]);
                                                            } else {
                                                                updateSetting('enabledGroups', current.filter(id => id !== group.id));
                                                            }
                                                        }}
                                                        style={{ 
                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                            padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #374151',
                                                            backgroundColor: isChecked ? '#374151' : 'transparent',
                                                            color: isChecked ? '#10b981' : '#d1d5db',
                                                            transition: 'background-color 0.15s'
                                                        }}
                                                        onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#273242'; }}
                                                        onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                    >
                                                        <span>{group.name} <span style={{ fontSize: '0.8em', opacity: 0.7 }}>(ID: {group.id})</span></span>
                                                        {isChecked && <Check size={16} color="#10b981" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Chargement des groupes depuis PrestaShop...</p>
                            )}
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '8px' }}>
                                (Sélectionnez les groupes qui doivent voir et participer au programme de fidélité).
                            </p>
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                            <label>Ratio de calcul des paliers VIP (Combien d'euros dépensés = 1 point ?)</label>
                            <input 
                                className={styles.input} 
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={settings.ratio || 1}
                                onChange={(e) => updateSetting('ratio', parseFloat(e.target.value))}
                            />
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                                Par exemple : Si vos clients gagnent 10% en points, et que 1 point = 0.10€, alors ils gagnent 1 point par euro dépensé. Mettez "1".
                                Si 1 point = 10 euros dépensés, mettez "10".
                            </p>
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                            <label>Texte du logo</label>
                            <input 
                                className={styles.input} 
                                value={settings.cardStyle.logoText}
                                onChange={(e) => updateCardStyle('logoText', e.target.value)}
                                placeholder="Ex: CBD Club VIP"
                            />
                        </div>
                        
                        <div className={styles.colorGrid}>
                            <div className={styles.formGroup}>
                                <label>Dégradé Début</label>
                                <div className={styles.colorInputWrapper}>
                                    <input 
                                        className={styles.input} 
                                        value={settings.cardStyle.cardBackground1}
                                        onChange={(e) => updateCardStyle('cardBackground1', e.target.value)}
                                    />
                                    <input 
                                        type="color"
                                        className={styles.colorPicker}
                                        value={settings.cardStyle.cardBackground1.startsWith('#') ? settings.cardStyle.cardBackground1.slice(0, 7) : '#ffffff'}
                                        onChange={(e) => updateCardStyle('cardBackground1', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Dégradé Fin</label>
                                <div className={styles.colorInputWrapper}>
                                    <input 
                                        className={styles.input} 
                                        value={settings.cardStyle.cardBackground2}
                                        onChange={(e) => updateCardStyle('cardBackground2', e.target.value)}
                                    />
                                    <input 
                                        type="color"
                                        className={styles.colorPicker}
                                        value={settings.cardStyle.cardBackground2.startsWith('#') ? settings.cardStyle.cardBackground2.slice(0, 7) : '#ffffff'}
                                        onChange={(e) => updateCardStyle('cardBackground2', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Couleur du texte</label>
                                <div className={styles.colorInputWrapper}>
                                    <input 
                                        className={styles.input} 
                                        value={settings.cardStyle.textColor}
                                        onChange={(e) => updateCardStyle('textColor', e.target.value)}
                                    />
                                    <input 
                                        type="color"
                                        className={styles.colorPicker}
                                        value={settings.cardStyle.textColor.startsWith('#') ? settings.cardStyle.textColor.slice(0, 7) : '#ffffff'}
                                        onChange={(e) => updateCardStyle('textColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className={styles.columnRight}>
                    <div className={styles.previewSticky}>
                        <div className={styles.previewHeader}>
                            <CreditCard size={18} />
                            <span>Aperçu interactif de la carte</span>
                        </div>
                        
                        <div className={rewardsStyles.cardPerspective} style={{ margin: '0 auto', maxWidth: '420px', width: '100%' }}>
                            <div
                                ref={cardRef}
                                className={rewardsStyles.holoCard}
                                style={cardStyle}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className={rewardsStyles.holoCardContent}>
                                    <div className={rewardsStyles.cardHeader}>
                                        <span className={rewardsStyles.cardLogo}>{settings.cardStyle.logoText}</span>
                                        <span className={rewardsStyles.cardEmoji}>
                                            {IconComponent}
                                        </span>
                                    </div>
                                    <div className={rewardsStyles.cardBody}>
                                        <div className={rewardsStyles.cardChip}></div>
                                    </div>
                                    <div className={rewardsStyles.cardFooter}>
                                        <div className={rewardsStyles.cardHolder}>
                                            {renderUserName('PRÉNOM NOM')}
                                        </div>
                                        <div className={rewardsStyles.cardRankInfo}>
                                            <div className={rewardsStyles.cardRank}>{previewTier?.name || 'Nom du palier'}</div>
                                            {euroToNext > 0 ? (
                                                <div className={rewardsStyles.cardNext}>
                                                    Plus que {Math.ceil(euroToNext)}€ d'achats pour {nextTierName}
                                                </div>
                                            ) : (
                                                <div className={rewardsStyles.cardNext}>Rang Maximum</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.previewHelper}>
                            Survolez la carte avec votre souris pour voir l'effet holographique 3D.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
