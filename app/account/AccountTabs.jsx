'use client';
import { useState, useEffect } from 'react';
import { User, MapPin, Package, Loader2, LogOut } from 'lucide-react';
import styles from './AccountTabs.module.css';
import ProfileTab from './Tabs/ProfileTab';
import AddressesTab from './Tabs/AddressesTab';
import OrdersList from '@/components/Account/OrdersList';
import { signOut } from 'next-auth/react';

export default function AccountTabs({ userSession }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Charger les données complètes (avec adresses) depuis KV
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/user/profile');
                const data = await res.json();
                if (data.success) {
                    setUserData(data.user);
                }
            } catch (err) {
                console.error("Erreur chargement profil:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleUpdate = (updatedData) => {
        setUserData({ ...userData, ...updatedData });
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.spinner} size={40} />
                <p>Chargement de vos informations...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Sidebar / Top Navigation */}
            <div className={styles.sidebar}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={20} />
                    <span>Mes Informations</span>
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'addresses' ? styles.active : ''}`}
                    onClick={() => setActiveTab('addresses')}
                >
                    <MapPin size={20} />
                    <span>Carnet d'adresses</span>
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'orders' ? styles.active : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <Package size={20} />
                    <span>Mes Commandes</span>
                </button>
                <button
                    className={`${styles.tabButton} ${styles.logoutBtn}`}
                    onClick={() => signOut({ callbackUrl: '/' })}
                >
                    <LogOut size={20} />
                    <span>Se déconnecter</span>
                </button>
            </div>

            {/* Content Area */}
            <div className={styles.contentArea}>
                {activeTab === 'profile' && userData && (
                    <ProfileTab user={userData} onUpdate={handleUpdate} />
                )}
                {activeTab === 'addresses' && userData && (
                    <AddressesTab user={userData} onUpdate={handleUpdate} />
                )}
                {activeTab === 'orders' && (
                    <OrdersList />
                )}
            </div>
        </div>
    );
}
