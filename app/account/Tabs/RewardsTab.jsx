import { useState, useEffect, useRef } from 'react';
import { Gift, Coins, Copy, Check, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import styles from './RewardsTab.module.css';

// -- CUSTOM VECTOR ICONS (D.A. Neo-Bank / Minimalist) --
const IconGraine = ({ className }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2c0 0-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z" />
    <circle cx="12" cy="15" r="2" />
  </svg>
);

const IconBourgeon = ({ className }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22v-6" />
    <path d="M12 16c0 0-4-2-4-8s4-6 4-6 4 0 4 6-4 8-4 8z" />
    <path d="M12 16c0 0 6 1 6-5s-3-4-3-4" />
    <path d="M12 16c0 0-6 1-6-5s3-4 3-4" />
  </svg>
);

const IconFloraison = ({ className }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22v-7" />
    <path d="M12 15c0 0 0-13 0-13s4 3 4 8-4 5-4 5z" />
    <path d="M12 15c0 0 0-13 0-13s-4 3-4 8 4 5 4 5z" />
    <path d="M12 15c0 0 8-9 8-9s3 4-1 8-7 1-7 1z" />
    <path d="M12 15c0 0-8-9-8-9s-3 4 1 8 7 1 7 1z" />
    <path d="M12 15c0 0 8-2 8-2s1 5-4 5-4-3-4-3z" />
    <path d="M12 15c0 0-8-2-8-2s-1 5 4 5 4-3 4-3z" />
  </svg>
);

const IconRecolteur = ({ className }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
    <path d="M2 9h20" />
    <path d="M12 22V9" />
    <path d="M6 3l6 6" />
    <path d="M18 3l-6 6" />
  </svg>
);
// ---------------------------------------------------

export default function RewardsTab() {
    const { data: session } = useSession();
    const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'MEMBRE VIP';

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConverting, setIsConverting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState(null);

    // VIP Card 3D Tilt Logic
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0, mouseX: 50, mouseY: 50 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await fetch('/api/rewards?action=get_dashboard');
            const json = await res.json();
            
            // If it successfully loads but points is 0 and no vouchers, it's normal.
            if (json.success || typeof json.points_available !== 'undefined') {
                setData(json);
            } else if (json.error) {
                // Si l'erreur vient de notre backend (ex: pas de legacy_ps_id), on gère silencieusement
                setData({
                    points_available: 0,
                    value_available: 0,
                    sponsorship_code: '',
                    vouchers: []
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

    // VIP Logic Calculation (L'Arbre à CBD)
    const ratio = data?.ratio || 1;
    const lifetimePoints = data?.lifetime_points || 0;
    
    // Valeur théorique dépensée à vie (pour atteindre ces points)
    const lifetimeSpent = lifetimePoints * ratio;

    let tierName = "La Graine";
    let Icon = IconGraine;
    let nextTier = "Le Bourgeon";
    let progress = 0;
    let euroToNext = 0;

    if (lifetimeSpent >= 800) {
        tierName = "Maître Récolteur";
        Icon = IconRecolteur;
        nextTier = "Max";
        progress = 100;
        euroToNext = 0;
    } else if (lifetimeSpent >= 300) {
        tierName = "La Floraison";
        Icon = IconFloraison;
        nextTier = "Maître Récolteur";
        progress = ((lifetimeSpent - 300) / 500) * 100;
        euroToNext = 800 - lifetimeSpent;
    } else if (lifetimeSpent >= 100) {
        tierName = "Le Bourgeon";
        Icon = IconBourgeon;
        nextTier = "La Floraison";
        progress = ((lifetimeSpent - 100) / 200) * 100;
        euroToNext = 300 - lifetimeSpent;
    } else {
        progress = (lifetimeSpent / 100) * 100;
        euroToNext = 100 - lifetimeSpent;
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

    const cardStyle = {
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        '--mouseX': `${tilt.mouseX}%`,
        '--mouseY': `${tilt.mouseY}%`
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Mon Programme Fidélité</h2>
                <p>Cumulez des points à chaque achat et parrainez vos amis pour obtenir des réductions exclusives.</p>
            </div>

            {/* VIP Dashboard Card */}
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
                            <span className={styles.cardLogo}>Les Amis du CBD Club</span>
                            <span className={styles.cardEmoji}>
                                <Icon />
                            </span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.cardChip}></div>
                        </div>
                        <div className={styles.cardFooter}>
                            <div className={styles.cardHolder}>
                                {userName}
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
                        Parrainez un ami
                    </h3>
                    <p>
                        Partagez votre lien de parrainage. Votre ami recevra un bon de réduction de 5€ sur sa première commande, 
                        et vous recevrez également 5€ une fois sa commande livrée !
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
