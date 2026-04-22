'use client';

import { useState, useEffect, useMemo } from 'react';
import { Package, Truck, ExternalLink, Calendar, Loader2, Search, Filter, ChevronDown, ChevronUp, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './OrdersList.module.css';

export default function OrdersList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'last_30', 'last_6_months', 'this_year'

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // UI State
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, dateFilter]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/user/orders');
                const data = await res.json();

                if (data.success) {
                    setOrders(data.orders);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError('Erreur lors du chargement des commandes.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const toggleExpand = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            const res = await fetch('/api/user/orders/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });
            const data = await res.json();
            if (data.success && data.url) {
                window.open(data.url, '_blank');
            } else {
                alert(data.error || 'Erreur lors de la génération de la facture.');
            }
        } catch (err) {
            alert('Erreur réseau. Veuillez réessayer.');
        }
    };

    // Client-side highly optimized filtering
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // 1. Text Search Filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                order.reference.toLowerCase().includes(searchLower) ||
                (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchLower)) ||
                order.products.some(p => p.name.toLowerCase().includes(searchLower));

            // 2. Date Filter
            let matchesDate = true;
            if (dateFilter !== 'all') {
                const orderDate = new Date(order.date);
                const now = new Date();

                if (dateFilter === 'last_30') {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(now.getDate() - 30);
                    matchesDate = orderDate >= thirtyDaysAgo;
                } else if (dateFilter === 'last_6_months') {
                    const sixMonthsAgo = new Date();
                    sixMonthsAgo.setMonth(now.getMonth() - 6);
                    matchesDate = orderDate >= sixMonthsAgo;
                } else if (dateFilter === 'this_year') {
                    matchesDate = orderDate.getFullYear() === now.getFullYear();
                }
            }

            return matchesSearch && matchesDate;
        });
    }, [orders, searchTerm, dateFilter]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.spinner} size={40} />
                <p>Chargement de votre historique...</p>
            </div>
        );
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <Package size={48} className={styles.emptyIcon} />
                <h3>Aucune commande pour le moment</h3>
                <p>Vous n'avez pas encore passé de commande sur notre boutique.</p>
            </div>
        );
    }

    return (
        <div className={styles.ordersList}>
            <div className={styles.header}>
                <h2 className={styles.title}>Mes Commandes</h2>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Rechercher par référence, n° de suivi ou de produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.dateFilterWrapper}>
                    <Calendar size={18} className={styles.filterIcon} />
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className={styles.dateSelect}
                    >
                        <option value="all">Toutes mes commandes</option>
                        <option value="last_30">Les 30 derniers jours</option>
                        <option value="last_6_months">Les 6 derniers mois</option>
                        <option value="this_year">Cette année</option>
                    </select>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className={styles.noResultsContainer}>
                    <Filter size={40} className={styles.emptyIcon} />
                    <h3>Aucun résultat trouvé</h3>
                    <p>Vos critères de recherche ne correspondent à aucune commande.</p>
                    <button onClick={() => { setSearchTerm(''); setDateFilter('all'); }} className={styles.resetBtn}>
                        Réinitialiser les filtres
                    </button>
                </div>
            ) : (
                <>
                <div className={styles.grid}>
                    {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => (
                        <div key={order.id} className={styles.orderCard}>
                            {/* Header: Ref & Date */}
                            <div className={styles.cardHeader}>
                                <div>
                                    <span className={styles.reference}>Commande #{order.reference}</span>
                                    <div className={styles.date}>
                                        <Calendar size={14} /> {formatDate(order.date)}
                                    </div>
                                </div>
                                <div className={styles.total}>{order.total.replace('.', ',')} €</div>
                            </div>

                            {/* Status Badge */}
                            <div
                                className={styles.statusBadge}
                                style={{
                                    backgroundColor: order.statusColor + '20', // 20% opacity background
                                    color: order.statusColor,
                                    border: `1px solid ${order.statusColor}40`
                                }}
                            >
                                <span
                                    className={styles.statusDot}
                                    style={{ backgroundColor: order.statusColor }}
                                ></span>
                                {order.status}
                            </div>

                            {/* Tracking Section (Always visible if exists) */}
                            {order.trackingNumber && (
                                <div className={styles.trackingOverview}>
                                    {order.trackingUrl ? (
                                        <a
                                            href={order.trackingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.trackingBtn}
                                        >
                                            <Truck size={18} />
                                            <span>Suivre mon colis ({order.trackingNumber})</span>
                                            <ExternalLink size={14} className={styles.extIcon} />
                                        </a>
                                    ) : (
                                        <div className={styles.trackingNumberOnly}>
                                            <Truck size={16} />
                                            <span>N° de suivi : <strong>{order.trackingNumber}</strong></span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Details Toggle Button */}
                            <button
                                className={styles.toggleBtn}
                                onClick={() => toggleExpand(order.id)}
                            >
                                {expandedOrderId === order.id ? (
                                    <>Masquer les détails <ChevronUp size={16} /></>
                                ) : (
                                    <>Voir les détails <ChevronDown size={16} /></>
                                )}
                            </button>

                            {/* Expandable Details Section */}
                            {expandedOrderId === order.id && (
                                <div className={styles.expandedDetails}>
                                    <div className={styles.metaGrid}>
                                        <div className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Moyen de paiement</span>
                                            <span className={styles.metaValue}>{order.payment || 'Non spécifié'}</span>
                                        </div>
                                        <div className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Transporteur</span>
                                            <span className={styles.metaValue}>{order.carrierName || 'Standard'}</span>
                                        </div>
                                        <div className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Frais de port</span>
                                            <span className={styles.metaValue}>{order.shippingCost ? order.shippingCost.replace('.', ',') : '0,00'} €</span>
                                        </div>
                                        {/* Addresses */}
                                        {order.deliveryAddress && (
                                            <div className={styles.metaItem}>
                                                <span className={styles.metaLabel}>Livraison</span>
                                                <span className={styles.metaValue} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                                    {order.deliveryAddress}
                                                </span>
                                            </div>
                                        )}
                                        {order.invoiceAddress && (
                                            <div className={styles.metaItem}>
                                                <span className={styles.metaLabel}>Facturation</span>
                                                <span className={styles.metaValue} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                                    {order.invoiceAddress}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '16px', borderTop: '1px solid #F3F4F6', paddingTop: '16px', paddingBottom: '16px' }}>
                                        <button 
                                            onClick={() => handleDownloadInvoice(order.id)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-dark)', color: 'white', padding: '10px 18px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(31, 75, 64, 0.15)' }}
                                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(31, 75, 64, 0.25)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(31, 75, 64, 0.15)'; }}
                                        >
                                            <Download size={18} />
                                            Télécharger la facture PDF
                                        </button>
                                    </div>

                                    <div className={styles.products}>
                                        <p className={styles.productsTitle}>Articles ({order.products.length})</p>
                                        <ul className={styles.productsList}>
                                            {order.products.map((item, idx) => (
                                                <li key={idx} className={styles.productRow}>
                                                    <div className={styles.productInfoRow}>
                                                        <span className={styles.itemQty}>{item.quantity}x</span>
                                                        <span className={styles.itemName}>{item.name.split('-')[0].trim()}</span>
                                                    </div>
                                                    <span className={styles.itemPrice}>
                                                        {item.price ? item.price.replace('.', ',') + ' €' : ''}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
                
                {filteredOrders.length > itemsPerPage && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', background: currentPage === 1 ? '#F3F4F6' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: currentPage === 1 ? '#9CA3AF' : '#374151', transition: 'all 0.2s' }}
                        >
                            <ChevronLeft size={18} /> Précédent
                        </button>
                        <span style={{ fontWeight: '600', color: '#4B5563', fontSize: '0.95rem' }}>
                            Page {currentPage} sur {Math.ceil(filteredOrders.length / itemsPerPage)}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredOrders.length / itemsPerPage), p + 1))}
                            disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', background: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? '#F3F4F6' : 'white', cursor: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? '#9CA3AF' : '#374151', transition: 'all 0.2s' }}
                        >
                            Suivant <ChevronRight size={18} />
                        </button>
                    </div>
                )}
                </>
            )}
        </div>
    );
}
