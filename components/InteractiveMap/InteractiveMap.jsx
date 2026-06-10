'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import styles from './InteractiveMap.module.css';

// France GeoJSON URL (Local file in public folder)
const GEO_URL = "/france-departments.geojson";

// Seeded random number generator for deterministic stability
function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Major French cities coordinates [lon, lat]
// Used as seeds for clustering
const CITIES = [
    { name: "Paris", coords: [2.3522, 48.8566], weight: 60 },
    { name: "Lyon", coords: [4.8357, 45.7640], weight: 30 },
    { name: "Marseille", coords: [5.3698, 43.2965], weight: 30 },
    { name: "Toulouse", coords: [1.4442, 43.6047], weight: 20 },
    { name: "Nice", coords: [7.2690, 43.7102], weight: 15 },
    { name: "Nantes", coords: [-1.5536, 47.2184], weight: 20 },
    { name: "Strasbourg", coords: [7.7521, 48.5734], weight: 15 },
    { name: "Montpellier", coords: [3.8767, 43.6108], weight: 15 },
    { name: "Bordeaux", coords: [-0.5792, 44.8378], weight: 25 },
    { name: "Lille", coords: [3.0573, 50.6292], weight: 20 },
    { name: "Rennes", coords: [-1.6778, 48.1173], weight: 15 },
    { name: "Reims", coords: [4.0317, 49.2583], weight: 10 },
    { name: "Le Havre", coords: [0.1079, 49.4944], weight: 10 },
    { name: "Saint-Étienne", coords: [4.3871, 45.4397], weight: 10 },
    { name: "Toulon", coords: [5.9304, 43.1242], weight: 10 },
    { name: "Grenoble", coords: [5.7245, 45.1885], weight: 10 },
    { name: "Dijon", coords: [5.0415, 47.3220], weight: 8 },
    { name: "Angers", coords: [-0.56, 47.47], weight: 8 },
    { name: "Nîmes", coords: [4.36, 43.83], weight: 8 },
    { name: "Clermont-Ferrand", coords: [3.08, 45.77], weight: 10 },
    { name: "Le Mans", coords: [0.19, 48.00], weight: 8 },
    { name: "Aix-en-Provence", coords: [5.44, 43.52], weight: 8 },
    { name: "Brest", coords: [-4.48, 48.39], weight: 8 },
    { name: "Tours", coords: [0.68, 47.39], weight: 8 },
    { name: "Amiens", coords: [2.29, 49.89], weight: 8 },
    { name: "Limoges", coords: [1.26, 45.83], weight: 5 },
    { name: "Annecy", coords: [6.12, 45.89], weight: 8 },
    { name: "Perpignan", coords: [2.89, 42.68], weight: 8 },
    { name: "Metz", coords: [6.17, 49.11], weight: 10 },
    { name: "Besançon", coords: [6.02, 47.23], weight: 8 },
    { name: "Orléans", coords: [1.90, 47.90], weight: 8 },
    { name: "Mulhouse", coords: [7.33, 47.75], weight: 8 },
    { name: "Rouen", coords: [1.09, 49.44], weight: 10 },
    { name: "Caen", coords: [-0.37, 49.18], weight: 10 },
    { name: "Nancy", coords: [6.18, 48.69], weight: 10 },
    { name: "Pau", coords: [-0.37, 43.30], weight: 5 },
    { name: "La Rochelle", coords: [-1.15, 46.16], weight: 5 },
    { name: "Calais", coords: [1.85, 50.95], weight: 5 }
];

// Helper to check if a point is strictly inside France's main hexagonal shape
const isWithinFrance = (lon, lat) => {
    // Basic bounds (Metropolitan France)
    if (lon < -4.8 || lon > 8.2 || lat < 41.3 || lat > 51.1) return false;

    // -- Detailed Coastline Trimming --

    // North West (Bretagne / Normandie / Manche)
    if (lon < -2.0 && lat > 48.8) return false; // North of Bretagne
    if (lon < -3.0 && lat < 47.7) return false; // South of Bretagne
    if (lon > -2.0 && lon < 1.0 && lat > 49.8) return false; // Manche coast
    if (lon > 1.0 && lon < 2.5 && lat > 50.3) return false; // Hauts de France coast

    // West (Vendée / Aquitaine / Golfe de Gascogne)
    if (lon < -1.5 && lat > 46.0 && lat < 47.5) return false; // Vendée coast
    if (lon < -1.1 && lat > 44.0 && lat <= 46.0) return false; // Gironde/Landes coast
    if (lon < -1.7 && lat <= 44.0) return false; // Pays Basque coast

    // South (Pyrénées / Spain border)
    if (lat < 43.0 && lon < 1.0) return false;
    if (lat < 42.5 && lon < 3.0) return false;

    // South East & Mediterranean Coast
    if (lon > 3.0 && lon < 4.5 && lat < 43.4) return false; // Golfe du Lion
    if (lon >= 4.5 && lon < 7.0 && lat < 43.1) return false; // Marseille/Toulon coast
    if (lon >= 7.0 && lat < 43.5) return false; // Nice/Monaco coast

    // East (Alps / Jura / Rhine border)
    if (lon > 7.5 && lat < 48.0) return false; // Alsace/Jura border
    if (lon > 6.5 && lat < 46.0) return false; // Alps border (Italy/Swiss)
    if (lon > 7.0 && lat < 44.5) return false; // Southern Alps border

    return true;
};

// Generate deterministic points clustered around cities
const generateStablePoints = (totalPoints = 350) => {
    const random = mulberry32(123456); // Fixed seed for identical results every render
    const points = [];

    // Distribute points based on weights
    const totalWeight = CITIES.reduce((acc, city) => acc + city.weight, 0);

    CITIES.forEach(city => {
        // Calculate number of points for this city
        const count = Math.floor((city.weight / totalWeight) * totalPoints) + 1;

        let added = 0;
        let attempts = 0;

        while (added < count && attempts < count * 10) {
            attempts++;
            const spread = 0.45; // Tighter spread to prevent spilling into water

            const u = random();
            const v = random();
            const offsetX = (u - 0.5) * spread * 2;
            const offsetY = (v - 0.5) * spread * 1.5;

            const lon = city.coords[0] + offsetX;
            const lat = city.coords[1] + offsetY;

            // Only add if it falls roughly inside land (France)
            if (isWithinFrance(lon, lat)) {
                points.push({ coordinates: [lon, lat] });
                added++;
            }
        }
    });

    return points;
};

// Markers generated ONCE
// We use 320 points to look dense but stay performing (SVG handles < 500 nodes easily at 120fps)
const STABLE_MARKERS = generateStablePoints(320);

export default function InteractiveMap({ 
    title = "Où nous retrouver ?", 
    description = "Retrouvez nos produits dans une sélection de points de vente partenaires partout en France : <span class=\"highlight\">plus de 300 bureaux de tabac, shops spécialisés et adresses de confiance.</span>",
    partnerCount = "300+"
}) {
    const [center, setCenter] = useState([2.83, 46.5]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                // Mobile: lower latitude to move map higher on screen
                setCenter([2.83, 45.2]);
            } else {
                // Desktop: standard center
                setCenter([2.83, 46.5]);
            }
        };

        handleResize(); // Init on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Memoize the marker elements to prevent re-rendering during zoom/pan
    const markers = useMemo(() => (
        STABLE_MARKERS.map((point, index) => (
            <Marker key={index} coordinates={point.coordinates}>
                <circle
                    r={2}
                    fill="#F5A623"
                    className={styles.marker}
                />
            </Marker>
        ))
    ), []);

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    {description && (
                        <div 
                            className={styles.subtitle} 
                            dangerouslySetInnerHTML={{ __html: description }} 
                        />
                    )}
                </div>

                <div className={styles.mapMapWrapper}>
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{
                            scale: 2200,
                            center: [2.5, 46.5]
                        }}
                        className={styles.mapSvg}
                    >
                        <ZoomableGroup center={center} zoom={1} minZoom={1} maxZoom={4}>
                            <Geographies geography={GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            className={styles.department}
                                            style={{
                                                default: { outline: "none" },
                                                hover: { outline: "none" },
                                                pressed: { outline: "none" },
                                            }}
                                        />
                                    ))
                                }
                            </Geographies>

                            {markers}
                        </ZoomableGroup>
                    </ComposableMap>

                    <div className={styles.infoCard}>
                        <div className={styles.liveIndicator}>
                            <span className={styles.dot}></span>
                            EN DIRECT
                        </div>
                        <p className={styles.infoText}>{partnerCount} Partenaires</p>
                    </div>
                </div>

                <div className={styles.footerAction}>
                    <p>Vous cherchez un point de vente proche de chez vous ?</p>
                    <a href="/professionnels" className={styles.ctaButton}>
                        Cliquez ici
                    </a>
                </div>
            </div>
        </section>
    );
}
