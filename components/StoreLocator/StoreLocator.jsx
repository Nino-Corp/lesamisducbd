'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from './StoreLocator.module.css';
import { Search, MapPin, Loader2, Navigation, Compass } from 'lucide-react';

// Dynamic import for the Map to avoid SSR errors with Leaflet
const StoreMap = dynamic(() => import('./StoreMap'), {
    ssr: false,
    loading: () => (
        <div className={styles.mapLoader}>
            <Loader2 className="animate-spin" size={40} />
            <p>Chargement de la carte interactive...</p>
        </div>
    ),
});

// Helper for Distance Calculation (Haversine Formula)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function StoreLocator({ subtitle = true }) {
    const [partners, setPartners] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activePartner, setActivePartner] = useState(null);
    const [nearbyPartners, setNearbyPartners] = useState([]);
    const [isSearchingNearby, setIsSearchingNearby] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isPanelExpanded, setIsPanelExpanded] = useState(false);

    useEffect(() => {
        const fetchPartners = async () => {
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
        fetchPartners();
    }, []);

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Sort partners by distance
                const withDistance = partners.map(p => ({
                    ...p,
                    distance: getDistance(lat, lon, p.lat, p.lng)
                })).sort((a, b) => a.distance - b.distance);

                setSearchQuery(''); // Clear manual search
                setNearbyPartners(withDistance.slice(0, 10)); // Show 10 closest
                setIsSearchingNearby(false); // Fix: Set to false since the search is done
                setIsLocating(false);

                // Auto-select the absolute closest one if within reasonable distance (e.g. 80km)
                if (withDistance[0] && withDistance[0].distance < 80) {
                    setActivePartner(withDistance[0]);
                }
            },
            (error) => {
                console.error("Geolocation error:", error.code, error.message);
                let msg = "Impossible de récupérer votre position.";
                if (error.code === 1) msg += " Veuillez autoriser la localisation dans vos paramètres.";
                else if (error.code === 3) msg += " Délai d'attente dépassé. Veuillez réessayer.";

                alert(msg);
                setIsLocating(false);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        );
    };

    const triggerNominatimSearch = async (queryOverride) => {
        const query = (queryOverride || searchQuery).toLowerCase().trim();
        if (query.length < 3) return;

        setIsSearchingNearby(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                const withDistance = partners.map(p => ({
                    ...p,
                    distance: getDistance(lat, lon, p.lat, p.lng)
                })).sort((a, b) => a.distance - b.distance);

                setNearbyPartners(withDistance.slice(0, 5));

                if (withDistance[0]) {
                    setActivePartner(withDistance[0]);
                }
            }
        } catch (err) {
            console.error("Geocoding failed", err);
        } finally {
            setIsSearchingNearby(false);
        }
    };

    const filteredPartners = useMemo(() => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase().trim();

        return partners.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(query);
            const cityMatch = p.city.toLowerCase().includes(query);
            const zipMatch = p.zip.includes(query);

            let prefixMatch = false;
            if (query.length >= 2 && /^\d+$/.test(query)) {
                prefixMatch = p.zip.startsWith(query);
                if (query.endsWith('000')) {
                    prefixMatch = p.zip.startsWith(query.substring(0, 2));
                } else if (query.endsWith('00')) {
                    prefixMatch = p.zip.startsWith(query.substring(0, 3));
                }
            }
            return nameMatch || cityMatch || zipMatch || prefixMatch;
        });
    }, [partners, searchQuery]);

    useEffect(() => {
        if (searchQuery.length > 0 && isSearchingNearby && nearbyPartners.length > 0) {
            setNearbyPartners([]);
            setIsSearchingNearby(false);
        }
    }, [searchQuery, isSearchingNearby, nearbyPartners.length]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2 && filteredPartners.length === 0 && !isLocating) {
                setIsSearchingNearby(true);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=fr&limit=1`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);

                        const withDistance = partners.map(p => ({
                            ...p,
                            distance: getDistance(lat, lon, p.lat, p.lng)
                        })).sort((a, b) => a.distance - b.distance);

                        setNearbyPartners(withDistance.slice(0, 5));
                    }
                } catch (err) {
                    console.error("Geocoding fallback failed", err);
                } finally {
                    setIsSearchingNearby(false);
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery, filteredPartners.length, partners, isLocating]);

    const displayList = searchQuery.trim().length > 0 ? (filteredPartners.length > 0 ? filteredPartners : nearbyPartners) : nearbyPartners;

    return (
        <section className={styles.locatorContainer}>
            {/* Map is always visible and covers 100% of the container */}
            <div className={styles.mapLayer} onClick={() => { if (window.innerWidth <= 1024) setIsPanelExpanded(false); }}>
                <StoreMap
                    partners={partners} // Always pass all partners for clustering
                    activePartner={activePartner}
                    onPartnerClick={(p) => {
                        setActivePartner(p);
                        if (window.innerWidth <= 1024) setIsPanelExpanded(false);
                    }}
                    onMapEmptyClick={() => {
                        if (window.innerWidth <= 1024) setIsPanelExpanded(false);
                    }}
                />
            </div>

            {/* Modern Floating Widget */}
            <aside className={`${styles.floatingPanel} ${isPanelExpanded ? styles.expanded : ''}`}>
                <div 
                    className={styles.panelHeader} 
                    onClick={() => {
                        if (window.innerWidth <= 1024) setIsPanelExpanded(!isPanelExpanded);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <h1 className={styles.title}>Nos Partenaires</h1>
                </div>

                <div className={styles.panelBodyWrapper}>
                    <div className={styles.panelBody}>
                        <div className={styles.panelSearchSection}>
                            {subtitle && (
                                <p className={styles.subtitle}>
                                    Trouvez une boutique CBD près de chez vous.
                                </p>
                            )}
                            
                            <div className={styles.searchBox}>
                                <Search className={styles.searchIcon} size={20} />
                                <input
                                    type="text"
                                    placeholder="Ville, code postal..."
                                    className={styles.searchInput}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (filteredPartners.length > 0) {
                                                setActivePartner(filteredPartners[0]);
                                                if (window.innerWidth <= 1024) setIsPanelExpanded(false);
                                            } else {
                                                triggerNominatimSearch();
                                            }
                                            e.target.blur(); 
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    className={styles.locateButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLocateMe();
                                    }}
                                    title="Me géolocaliser"
                                    disabled={isLocating}
                                >
                                    {isLocating ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.resultsScrollArea}>
                            <div className={styles.resultsCount}>
                                {isSearchingNearby ? (
                                    "Recherche en cours..."
                                ) : searchQuery.length > 0 ? (
                                    displayList.length > 0 ? `${displayList.length} boutique(s) trouvée(s)` : "Aucune boutique trouvée"
                                ) : nearbyPartners.length > 0 ? (
                                    "Boutiques autour de vous"
                                ) : (
                                    "Explorez la carte ou lancez une recherche"
                                )}
                            </div>

                    <div className={styles.resultsList}>
                        {isLoading ? (
                            <div className={styles.loader}>
                                <Loader2 className="animate-spin" size={28} />
                            </div>
                        ) : displayList.length > 0 ? (
                            displayList.map(partner => (
                                <div
                                    key={partner.id}
                                    className={`${styles.partnerCard} ${activePartner?.id === partner.id ? styles.active : ''}`}
                                    onClick={() => {
                                        setActivePartner(partner);
                                        if (window.innerWidth <= 1024) setIsPanelExpanded(false);
                                    }}
                                >
                                    <div className={styles.partnerInfo}>
                                        <h3>{partner.name}</h3>
                                        <p>{partner.address}</p>
                                        <p className={styles.cityLine}>{partner.zip} {partner.city}</p>
                                    </div>
                                    {partner.distance && (
                                        <div className={styles.distanceBadge}>{partner.distance.toFixed(1)} km</div>
                                    )}
                                </div>
                            ))
                        ) : !searchQuery && nearbyPartners.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Compass size={40} className={styles.emptyIcon} />
                                <p>Recherchez une ville ou activez la géolocalisation.</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
            </div>
            </aside>
        </section>
    );
}
