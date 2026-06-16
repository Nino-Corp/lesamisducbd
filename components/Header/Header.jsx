'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import styles from './Header.module.css';
import { User, ShoppingBag, Menu, X, Search, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import LoginModal from '../LoginModal/LoginModal';
import SearchOverlay from '../SearchBar/SearchOverlay';

import { useCart } from '@/context/CartContext';

export default function Header({ logoText, logoImage, menuItems, bannerVisible }) {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileDropdown, setMobileDropdown] = useState(null);
    const dropdownTimeoutRef = useRef(null);
    // Auth session
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const user = session?.user;

    // Cart Context

    const { setIsCartOpen, cartCount } = useCart();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
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

            {/* Mobile Nav Overlay (Portaled) */}
            {mounted && isMenuOpen && createPortal(
                <nav className={styles.mobileNavOverlay}>
                    <ul>
                        {menuItems && menuItems.map((item, index) => (
                            item.children && item.children.length > 0 ? (
                                <li key={index} className={styles.mobileDropdownWrapper}>
                                    <button 
                                        className={styles.mobileDropdownTrigger}
                                        onClick={() => setMobileDropdown(mobileDropdown === index ? null : index)}
                                    >
                                        {item.label}
                                        <ChevronDown size={18} className={`${styles.chevron} ${mobileDropdown === index ? styles.chevronOpen : ''}`} />
                                    </button>
                                    {mobileDropdown === index && (
                                        <ul className={styles.mobileDropdownList}>
                                            {item.children.map((child, ci) => (
                                                <li key={ci}>
                                                    <Link href={child.href} onClick={() => { setIsMenuOpen(false); setMobileDropdown(null); }}>
                                                        {child.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ) : (
                                <li key={index}>
                                    <Link href={item.href} onClick={() => setIsMenuOpen(false)}>
                                        {item.label}
                                    </Link>
                                </li>
                            )
                        ))}
                    </ul>
                </nav>,
                document.body
            )}

            {/* Login Modal */}
            {!isAuthenticated && <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />}

            {/* Search Overlay */}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

