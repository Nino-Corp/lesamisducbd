'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import styles from './Header.module.css';
import { 
    User, 
    ShoppingBag, 
    Menu, 
    X, 
    Search, 
    ChevronDown, 
    ChevronRight,
    Gift, 
    Sparkles, 
    Compass, 
    Briefcase, 
    LogOut, 
    ArrowRight, 
    ShieldCheck 
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import LoginModal from '../LoginModal/LoginModal';
import SearchOverlay from '../SearchBar/SearchOverlay';

import { useCart } from '@/context/CartContext';

const getItemIcon = (item) => {
    const label = (item?.label || '').toLowerCase();
    const href = (item?.href || '').toLowerCase();
    if (label.includes('produit') || href.includes('produit')) return <ShoppingBag size={18} />;
    if (label.includes('essentiel') || href.includes('essentiel')) return <Sparkles size={18} />;
    if (label.includes('usage') || href.includes('usage') || label.includes('cbd')) return <Compass size={18} />;
    if (label.includes('pro') || href.includes('pro')) return <Briefcase size={18} />;
    return <ChevronRight size={16} />;
};

const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (value === 0) {
            setDisplayValue(0);
            return;
        }

        let startTimestamp = null;
        const duration = 1500; // 1.5 seconds

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutExpo for smooth deceleration
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplayValue(Math.floor(easeOut * value));
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayValue(value);
            }
        };

        window.requestAnimationFrame(step);
    }, [value]);

    return displayValue;
};


export default function Header({ logoText, logoImage, menuItems, bannerVisible }) {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileDropdown, setMobileDropdown] = useState(null);
    const dropdownTimeoutRef = useRef(null);
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const user = session?.user;
    
    // Loyalty State
    const [loyaltyData, setLoyaltyData] = useState(null);

    // Cart Context

    const { setIsCartOpen, cartCount } = useCart();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Auto-open search or cart if coming from PrestaShop
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            let urlChanged = false;

            if (urlParams.get('openSearch') === 'true') {
                setIsSearchOpen(true);
                urlParams.delete('openSearch');
                urlChanged = true;
            }

            if (urlParams.get('action') === 'cart') {
                setTimeout(() => setIsCartOpen(true), 100); // Slight delay for hydration/context readiness
                urlParams.delete('action');
                urlChanged = true;
            }

            if (urlChanged) {
                // Clean the URL without reloading
                const newUrl = new URL(window.location.href);
                newUrl.search = urlParams.toString();
                window.history.replaceState({}, '', newUrl.toString());
            }
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll lock and Viewport handling
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen]);

    useEffect(() => {
        if (status === 'authenticated') {
            const cached = localStorage.getItem('loyaltyData');
            if (cached && !loyaltyData) {
                try { setLoyaltyData(JSON.parse(cached)); } catch(e) {}
            }

            fetch('/api/rewards?action=get_dashboard')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setLoyaltyData(data);
                        localStorage.setItem('loyaltyData', JSON.stringify(data));
                    }
                })
                .catch(err => console.error("Header loyalty fetch error:", err));
        }
    }, [status]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
                <div className={styles.container}>
                    {/* Mobile Menu Toggle */}
                    <button
                        className={styles.mobileToggle}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className={styles.logo}>
                        <Link href="/">
                            {logoImage ? (
                                <img src={logoImage} alt={logoText || 'Logo'} className={styles.logoImage} />
                            ) : (
                                logoText
                            )}
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className={styles.desktopNav}>
                        <ul>
                            {menuItems && menuItems.map((item, index) => (
                                item.children && item.children.length > 0 ? (
                                    <li 
                                        key={index} 
                                        className={styles.dropdownWrapper}
                                        onMouseEnter={() => {
                                            if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                                            setOpenDropdown(index);
                                        }}
                                        onMouseLeave={() => {
                                            dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 200);
                                        }}
                                    >
                                        <button className={styles.dropdownTrigger}>
                                            {item.label}
                                            <ChevronDown size={14} className={`${styles.chevron} ${openDropdown === index ? styles.chevronOpen : ''}`} />
                                        </button>
                                        <div className={`${styles.dropdownMenu} ${openDropdown === index ? styles.dropdownOpen : ''}`}>
                                            {item.children.map((child, ci) => (
                                                <Link 
                                                    key={ci} 
                                                    href={child.href} 
                                                    className={styles.dropdownItem}
                                                    onClick={() => setOpenDropdown(null)}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </li>
                                ) : (
                                    <li key={index}>
                                        <Link href={item.href}>{item.label}</Link>
                                    </li>
                                )
                            ))}
                        </ul>
                    </nav>

                    <div className={styles.actions}>
                        {isAuthenticated && mounted && loyaltyData && (
                            <Link href="/account?tab=rewards" className={styles.headerLoyaltyBtn}>
                                <Gift size={18} className={styles.loyaltyIcon} />
                                <span className={styles.loyaltyPts}>
                                    <AnimatedNumber value={loyaltyData.points_available} /> pts
                                </span>
                                <div className={styles.loyaltyTooltip}>
                                    Vos points ont une valeur de <strong>{loyaltyData.value_available.toFixed(2)}€</strong> de réduction !
                                </div>
                            </Link>
                        )}

                        {isAuthenticated && mounted ? (
                            <div className={styles.userMenu}>
                                <Link
                                    href="/account"
                                    className={`${styles.iconBtn} ${styles.loggedInBtn}`}
                                    title={`Mon Compte`}
                                >
                                    <User size={20} />
                                    {user?.name?.split(' ')[0] || user?.email?.split('@')[0] ? (
                                        <span className={styles.userName}>
                                            {user.name?.split(' ')[0] || user.email.split('@')[0]}
                                        </span>
                                    ) : null}
                                </Link>
                            </div>
                        ) : (
                            <button
                                className={styles.iconBtn}
                                aria-label="Compte"
                                onClick={() => setIsLoginOpen(true)}
                            >
                                <User size={20} />
                            </button>
                        )}

                        {/* Loupe — Recherche */}
                        <button
                            className={styles.iconBtn}
                            aria-label="Rechercher"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search size={20} />
                        </button>

                        <button
                            className={`${styles.iconBtn} ${styles.cartBtn}`}
                            aria-label="Panier"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingBag size={20} />
                            {mounted && cartCount > 0 && (
                                <span className={styles.badge}>{cartCount}</span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Nav Sidebar Drawer (Portaled) */}
            {mounted && createPortal(
                <div 
                    className={`${styles.mobileNavOverlay} ${isMenuOpen ? styles.mobileNavOpen : ''}`}
                    aria-hidden={!isMenuOpen}
                >
                    {/* Dark Glass Backdrop (Click to close) */}
                    <div 
                        className={styles.mobileNavBackdrop}
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Fermer le menu"
                    />

                    {/* Sliding Sidebar Drawer */}
                    <aside 
                        className={styles.mobileSidebar}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu principal"
                    >
                        {/* 1. Drawer Header */}
                        <div className={styles.sidebarHeader}>
                            <Link 
                                href="/" 
                                className={styles.sidebarLogoLink}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {logoImage ? (
                                    <img src={logoImage} alt={logoText || 'Logo'} className={styles.sidebarLogoImage} />
                                ) : (
                                    <span className={styles.sidebarLogoText}>{logoText || 'LES AMIS DU CBD'}</span>
                                )}
                            </Link>
                            <button
                                type="button"
                                className={styles.sidebarCloseBtn}
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Fermer le menu"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className={styles.mobileSidebarContent}>
                            {/* 2. Account / Welcome Card */}
                            {isAuthenticated ? (
                                <div className={styles.sidebarAccountCard}>
                                    <div className={styles.accountCardTop}>
                                        <div className={styles.accountAvatar}>
                                            <User size={18} />
                                            <span className={styles.onlineDot} />
                                        </div>
                                        <div className={styles.accountDetails}>
                                            <span className={styles.accountGreeting}>Bonjour,</span>
                                            <span className={styles.accountName}>
                                                {user?.name || user?.email?.split('@')[0]}
                                            </span>
                                        </div>
                                    </div>

                                    {loyaltyData && (
                                        <Link 
                                            href="/account?tab=rewards" 
                                            className={styles.sidebarLoyaltyBadge}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Gift size={15} className={styles.sidebarLoyaltyIcon} />
                                            <span>
                                                <strong>{loyaltyData.points_available ?? 0} pts VIP</strong>
                                                {loyaltyData.value_available ? ` • ${loyaltyData.value_available.toFixed(2)}€` : ''}
                                            </span>
                                            <ArrowRight size={13} className={styles.sidebarLoyaltyArrow} />
                                        </Link>
                                    )}

                                    <Link 
                                        href="/account" 
                                        className={styles.accountActionLink}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>Mon Espace Client</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            ) : (
                                <div className={styles.sidebarGuestCard}>
                                    <div className={styles.guestCardHeader}>
                                        <span className={styles.guestSparkle}>🌿</span>
                                        <div>
                                            <div className={styles.guestTitle}>Bienvenue !</div>
                                            <div className={styles.guestSubtitle}>Rejoignez le club fidélité & gérez vos commandes</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.sidebarLoginBtn}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsLoginOpen(true);
                                        }}
                                    >
                                        <User size={16} />
                                        <span>Connexion / Inscription</span>
                                    </button>
                                </div>
                            )}

                            {/* 3. Search Quick Action */}
                            <button
                                type="button"
                                className={styles.sidebarSearchBtn}
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsSearchOpen(true);
                                }}
                            >
                                <Search size={16} />
                                <span>Rechercher un produit...</span>
                            </button>

                            {/* 4. Navigation Menu List */}
                            <div className={styles.sidebarNavGroup}>
                                <div className={styles.sidebarSectionTitle}>Explorer le catalogue</div>
                                <ul className={styles.sidebarNavList}>
                                    {menuItems && menuItems.map((item, index) => {
                                        const hasChildren = item.children && item.children.length > 0;
                                        const isOpen = mobileDropdown === index;
                                        return (
                                            <li key={index} className={styles.sidebarNavItem}>
                                                {hasChildren ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className={`${styles.sidebarNavLink} ${isOpen ? styles.sidebarNavOpen : ''}`}
                                                            onClick={() => setMobileDropdown(isOpen ? null : index)}
                                                        >
                                                            <span className={styles.sidebarNavLeft}>
                                                                <span className={styles.sidebarNavIcon}>
                                                                    {getItemIcon(item)}
                                                                </span>
                                                                <span className={styles.sidebarNavLabel}>{item.label}</span>
                                                            </span>
                                                            <ChevronDown 
                                                                size={18} 
                                                                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} 
                                                            />
                                                        </button>
                                                        {isOpen && (
                                                            <ul className={styles.sidebarSubmenu}>
                                                                {item.children.map((child, ci) => (
                                                                    <li key={ci}>
                                                                        <Link
                                                                            href={child.href}
                                                                            className={styles.sidebarSublink}
                                                                            onClick={() => {
                                                                                setIsMenuOpen(false);
                                                                                setMobileDropdown(null);
                                                                            }}
                                                                        >
                                                                            <span>{child.label}</span>
                                                                            <ArrowRight size={13} className={styles.sublinkArrow} />
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        className={styles.sidebarNavLink}
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        <span className={styles.sidebarNavLeft}>
                                                            <span className={styles.sidebarNavIcon}>
                                                                {getItemIcon(item)}
                                                            </span>
                                                            <span className={styles.sidebarNavLabel}>{item.label}</span>
                                                        </span>
                                                        <ArrowRight size={15} className={styles.sidebarArrow} />
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* 5. Cart Direct Link */}
                            <button
                                type="button"
                                className={styles.sidebarCartRow}
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsCartOpen(true);
                                }}
                            >
                                <span className={styles.sidebarNavLeft}>
                                    <span className={styles.sidebarNavIcon}>
                                        <ShoppingBag size={18} />
                                    </span>
                                    <span className={styles.sidebarNavLabel}>Mon Panier</span>
                                </span>
                                {mounted && cartCount > 0 ? (
                                    <span className={styles.sidebarCartBadge}>{cartCount} article{cartCount > 1 ? 's' : ''}</span>
                                ) : (
                                    <span className={styles.sidebarCartEmpty}>0 article</span>
                                )}
                            </button>

                            {/* 6. Reassurance Guarantee Pills */}
                            <div className={styles.sidebarReassurance}>
                                <div className={styles.reassuranceItem}>
                                    <ShieldCheck size={16} className={styles.reassuranceIconCheck} />
                                    <span>Produits 100% bio & légaux (&lt; 0.3% THC)</span>
                                </div>
                                <div className={styles.reassuranceItem}>
                                    <Sparkles size={16} className={styles.reassuranceIconSparkle} />
                                    <span>Livraison discrète express 24/48h</span>
                                </div>
                            </div>

                            {/* 7. Log out (if logged in) */}
                            {isAuthenticated && (
                                <button
                                    type="button"
                                    className={styles.sidebarLogoutBtn}
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        signOut();
                                    }}
                                >
                                    <LogOut size={16} />
                                    <span>Se déconnecter</span>
                                </button>
                            )}
                        </div>
                    </aside>
                </div>,
                document.body
            )}

            {/* Login Modal */}
            {!isAuthenticated && <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />}

            {/* Search Overlay */}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

