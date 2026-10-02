import { useState, useEffect, useRef } from 'react';
import { Gift, Coins, Copy, Check, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Sparkles, Droplet, Star, Leaf, Award } from 'lucide-react';
import styles from './RewardsTab.module.css';



export default function RewardsTab() {
    const { data: session } = useSession();
    const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'MEMBRE VIP';
    const userGroup = session?.user?.id_default_group || 3;

    const [data, setData] = useState(null);
    const [settingsConfig, setSettingsConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConverting, setIsConverting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState(null);

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

    // VIP Card 3D Tilt Logic
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0, mouseX: 50, mouseY: 50 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [dashRes, settingsRes, loyaltyConfigRes] = await Promise.all([
                fetch('/api/rewards?action=get_dashboard'),
                fetch('/api/rewards?action=get_settings'),
                fetch('/api/admin/loyalty-settings')
            ]);
            
            const json = await dashRes.json();
            const settingsJson = await settingsRes.json();
            const configJson = await loyaltyConfigRes.json();
            
            setSettingsConfig(configJson);

            // If it successfully loads but points is 0 and no vouchers, it's normal.
            if (json.success || typeof json.points_available !== 'undefined') {
                const combinedData = { ...json };
                if (settingsJson.success) {
                    combinedData.ratio = settingsJson.ratio || 1;
                    combinedData.value = settingsJson.value || 1;
                }
                setData(combinedData);
            } else if (json.error) {
                // Si l'erreur vient de notre backend (ex: pas de legacy_ps_id), on gère silencieusement
                setData({
                    points_available: 0,
                    value_available: 0,
                    sponsorship_code: '',
                    vouchers: [],
                    ratio: settingsJson.success ? settingsJson.ratio : 1,
                    value: settingsJson.success ? settingsJson.value : 1
                });
            } else {
                setMessage({ type: 'error', text: 'Impossible de charger vos points.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Une erreur est survenue.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConvert = async () => {
        setIsConverting(true);
        setMessage(null);
        try {
            const res = await fetch('/api/rewards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'convert_points' })
            });
            const json = await res.json();

            if (json.success) {
                setMessage({ type: 'success', text: 'Points convertis avec succès ! Vous pouvez retrouver votre bon de réduction dans votre panier.' });
                // Refresh dashboard to show 0 points
                loadData();
            } else {
                setMessage({ type: 'error', text: json.error || 'Erreur lors de la conversion.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Une erreur réseau est survenue.' });
        } finally {
            setIsConverting(false);
        }
    };


    const handleCopy = () => {
        if (!data?.sponsorship_link) return;

        // We modify the link to point to our Next.js frontend instead of the PrestaShop backend
        const url = new URL(data.sponsorship_link);
        const code = url.searchParams.get('sponsorship') || data.sponsorship_code;
        const nextJsLink = `${window.location.origin}/?sponsorship=${code}`;

        navigator.clipboard.writeText(nextJsLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading && !data) {
        return (
            <div className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={40} />
                <p>Synchronisation avec votre programme de fidélité...</p>
            </div>
        );
    }

    // Enable/Disable logic
    const isLoyaltyEnabled = settingsConfig?.enabledGroups 
        ? settingsConfig.enabledGroups.includes(userGroup)
        : userGroup !== 4;

    // VIP Logic Calculation (L'Arbre à CBD)
    const ratio = data?.ratio || 1;
    const lifetimePoints = data?.lifetime_points || 0;

    // Valeur théorique dépensée à vie (pour atteindre ces points)
    const lifetimeSpent = lifetimePoints * ratio;

    let tierName = "La Graine";
    let Icon = null;
    let nextTier = "Le Bourgeon";
    let progress = 0;
    let euroToNext = 0;


    if (settingsConfig && settingsConfig.tiers) {
        // Tiers should be sorted by minSpent ascending, but let's reverse to check highest first
        const sortedTiers = [...settingsConfig.tiers].sort((a, b) => b.minSpent - a.minSpent);
        let currentTierIndex = sortedTiers.findIndex(t => lifetimeSpent >= t.minSpent);
        if (currentTierIndex === -1) currentTierIndex = sortedTiers.length - 1;

        const currentTier = sortedTiers[currentTierIndex] || sortedTiers[sortedTiers.length - 1];
        const prevTierInSorted = sortedTiers[currentTierIndex - 1]; // which is actually the NEXT tier in progression

        tierName = currentTier.name;
        
        Icon = currentTier.icon ? () => <img src={currentTier.icon} alt={currentTier.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> : null;

        if (prevTierInSorted) {
            nextTier = prevTierInSorted.name;
            const diff = prevTierInSorted.minSpent - currentTier.minSpent;
            const spentInTier = lifetimeSpent - currentTier.minSpent;
            progress = (spentInTier / diff) * 100;
            euroToNext = prevTierInSorted.minSpent - lifetimeSpent;
        } else {
            nextTier = "Max";
            progress = 100;
            euroToNext = 0;
        }
    }

    const safeProgress = Math.min(100, Math.max(0, progress));

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

    const cardStyleParams = settingsConfig?.cardStyle || {};
    const cardStyle = {
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        '--mouseX': `${tilt.mouseX}%`,
        '--mouseY': `${tilt.mouseY}%`,
        '--bg1': cardStyleParams.cardBackground1 || 'rgba(255, 255, 255, 0.22)',
        '--bg2': cardStyleParams.cardBackground2 || 'rgba(255, 255, 255, 0.05)',
        '--text-color': cardStyleParams.textColor || '#ffffff'
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Mon Programme Fidélité</h2>
                <p>Cumulez des points à chaque achat et parrainez vos amis pour obtenir des réductions exclusives.</p>
            </div>

            {/* VIP Dashboard Card */}
            {isLoyaltyEnabled && (
                <div className={styles.cardPerspective}>
                    <div
                        ref={cardRef}
                        className={styles.holoCard}
                        style={cardStyle}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className={styles.holoCardContent}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardLogo}>{settingsConfig?.cardStyle?.logoText || 'Les Amis du CBD Club'}</span>
                                <span className={styles.cardEmoji}>
                                    {Icon && <Icon />}
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.cardChip}></div>
                            </div>
                            <div className={styles.cardFooter}>
                                <div className={styles.cardHolder}>
                                    {renderUserName(userName)}
                                </div>
                                <div className={styles.cardRankInfo}>
                                    <div className={styles.cardRank}>{tierName}</div>
                                    {euroToNext > 0 ? (
                                        <div className={styles.cardNext}>
                                            Plus que {Math.ceil(euroToNext)}€ d'achats pour {nextTier}
                                        </div>
                                    ) : (
                                        <div className={styles.cardNext}>Rang Maximum</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.vipProgressContainer}>
                        <div className={styles.vipProgressTrack}>
                            <div className={styles.vipProgressBar} style={{ width: `${safeProgress}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            {isLoyaltyEnabled && (
                <div className={styles.cardsGrid}>
                    {/* Points Card */}
                    <div className={styles.card}>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper}>
                                    <Coins size={20} />
                                </div>
                                Mes Points Fidélité
                            </div>
                            <div className={styles.valueArea}>
                                <div className={styles.points}>
                                    {data?.points_available || 0} <span>pts</span>
                                </div>
                                <div className={styles.money}>
                                    Valeur : {data?.value_available?.toFixed(2) || '0.00'} €
                                </div>
                            </div>
                            <button
                                className={styles.actionButton}
                                disabled={!data?.points_available || data.points_available <= 0 || isConverting}
                                onClick={handleConvert}
                            >
                                {isConverting ? <Loader2 size={18} className={styles.spinner} /> : <Gift size={18} />}
                                Convertir en bon de réduction
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            {/* Vouchers Section */}
            {data?.vouchers && data.vouchers.length > 0 && (
                <div className={styles.vouchersCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                            <Gift size={20} />
                        </div>
                        Mes bons de réduction
                    </div>
                    <div className={styles.vouchersList}>
                        {data.vouchers.map(voucher => (
                            <div key={voucher.id} className={styles.voucherItem}>
                                <div className={styles.voucherInfo}>
                                    <h4>{voucher.name || 'Réduction'}</h4>
                                    <span className={styles.voucherAmount}>{voucher.amount_formatted}</span>
                                </div>
                                <div className={styles.voucherAction}>
                                    <div className={styles.voucherCode}>{voucher.code}</div>
                                    <span className={styles.voucherDate}>Valable jusqu'au {voucher.date_to}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sponsorship Section */}
            <div className={styles.sponsorshipCard}>
                <Users size={120} className={styles.sponsorshipIcon} />
                <div className={styles.sponsorshipContent}>
                    <h3>
                        <Users size={20} color="#10b981" />
                        {session?.user?.id_default_group === 4 ? "Parrainez un confrère PRO" : "Parrainez un ami"}
                    </h3>
                    <p>
                        {session?.user?.id_default_group === 4 
                            ? "Partagez votre lien de parrainage. Vous et votre filleul recevrez chacun 200€ de produits offerts en valeur marchande une fois sa première commande validée !" 
                            : "Partagez votre lien de parrainage. Votre ami recevra un bon de réduction de 5€ sur sa première commande, et vous recevrez également 5€ une fois sa commande livrée !"}
                    </p>
                    <div className={styles.linkContainer}>
                        <input
                            type="text"
                            className={styles.linkInput}
                            value={data?.sponsorship_code ? `${window.location.origin}/?sponsorship=${data.sponsorship_code}` : ''}
                            readOnly
                        />
                        <button
                            className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                            onClick={handleCopy}
                        >
                            {copied ? <><Check size={16} /> Copié</> : <><Copy size={16} /> Copier le lien</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
