'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import Map, { Source, Layer, Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './StoreLocator.module.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

// --- Modern Apple-style SVG Pin Generator ---
const createPinIcon = () => {
    const svg = `<svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#000" flood-opacity="0.15"/>
        </filter>
        <path filter="url(#shadow)" d="M22 6C11.5 6 3 14.5 3 25C3 39.25 22 50 22 50C22 50 41 39.25 41 25C41 14.5 32.5 6 22 6Z" fill="#112924" stroke="#ffffff" stroke-width="3"/>
        <circle cx="22" cy="24" r="6" fill="#00FF94"/>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// --- Cluster Styles ---
const clusterShadowLayer = {
    id: 'cluster-shadow',
    type: 'circle',
    source: 'partners',
    filter: ['has', 'point_count'],
    paint: {
        'circle-color': '#000000',
        'circle-radius': ['step', ['get', 'point_count'], 22, 10, 26, 50, 32],
        'circle-blur': 1,
        'circle-opacity': 0.15,
        'circle-translate': [0, 6]
    }
};

const clusterLayer = {
    id: 'clusters',
    type: 'circle',
    source: 'partners',
    filter: ['has', 'point_count'],
    paint: {
        'circle-color': '#ffffff',
        'circle-radius': ['step', ['get', 'point_count'], 22, 10, 26, 50, 32],
        'circle-stroke-width': 4,
        'circle-stroke-color': '#112924',
    }
};

const clusterInnerLayer = {
    id: 'clusters-inner',
    type: 'circle',
    source: 'partners',
    filter: ['has', 'point_count'],
    paint: {
        'circle-color': '#00FF94',
        'circle-radius': ['step', ['get', 'point_count'], 14, 10, 18, 50, 22],
        'circle-opacity': 0.2
    }
};

const clusterCountLayer = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'partners',
    filter: ['has', 'point_count'],
    layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 14,
    },
    paint: {
        'text-color': '#112924'
    }
};

// --- Single Pin Layer ---
const unclusteredHitLayer = {
    id: 'unclustered-hit',
    type: 'circle',
    source: 'partners',
    filter: ['!', ['has', 'point_count']],
    paint: {
        'circle-color': '#10B981',
        'circle-radius': 20,
        'circle-opacity': 0 // Keep invisible but clickable
    }
};

const pinIconLayer = {
    id: 'pin-icon',
    type: 'symbol',
    source: 'partners',
    filter: ['!', ['has', 'point_count']],
    layout: {
        'icon-image': 'custom-pin',
        'icon-size': 1,
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom' // Anchor at the tip of the pin
    }
};

export default function StoreMap({ partners, activePartner, onPartnerClick, onMapEmptyClick }) {
    const mapRef = useRef();

    // Convert partners to GeoJSON for clustering
    const geojsonData = useMemo(() => ({
        type: 'FeatureCollection',
        features: partners.map(p => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [p.lng, p.lat]
            },
            properties: {
                id: p.id
            }
        }))
    }), [partners]);

    // Fly to active partner
    useEffect(() => {
        if (activePartner && mapRef.current) {
            const map = mapRef.current.getMap();
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

            map.flyTo({
                center: [activePartner.lng, activePartner.lat],
                zoom: 14,
                duration: 1500,
                essential: true,
                padding: { bottom: isMobile ? window.innerHeight * 0.45 : 0 }
            });
        }
    }, [activePartner]);

    const handleMapLoad = (e) => {
        const map = e.target;
        map.resize();

        // Load custom SVG pin
        const pinImage = new Image();
        pinImage.crossOrigin = "anonymous";
        pinImage.onload = () => {
            if (mapRef.current) {
                const currentMap = mapRef.current.getMap();
                if (currentMap && currentMap.hasImage && !currentMap.hasImage('custom-pin')) {
                    // Try/catch to be absolutely safe against Mapbox internal destroyed state
                    try {
                        currentMap.addImage('custom-pin', pinImage);
                    } catch (err) {
                        console.warn("Could not add pin image to map:", err);
                    }
                }
            }
        };
        pinImage.src = createPinIcon();
    };

    const onMapClick = useCallback((event) => {
        const feature = event.features && event.features[0];
        if (!feature) {
            if (onMapEmptyClick) onMapEmptyClick();
            return;
        }

        if (feature.layer.id === 'clusters') {
            if (onMapEmptyClick) onMapEmptyClick();
            const clusterId = feature.properties.cluster_id;
            const source = mapRef.current.getMap().getSource('partners');

            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;
                mapRef.current.getMap().easeTo({
                    center: feature.geometry.coordinates,
                    zoom: zoom,
                    duration: 500
                });
            });
        } else if (feature.layer.id === 'unclustered-hit') {
            const partnerId = feature.properties.id;
            const partner = partners.find(p => p.id == partnerId);
            if (partner) {
                onPartnerClick(partner);
                if (onMapEmptyClick) onMapEmptyClick();
            }
        }
    }, [partners, onPartnerClick, onMapEmptyClick]);

    return (
        <Map
            ref={mapRef}
            mapLib={maplibregl}
            reuseMaps
            initialViewState={{
                longitude: 2.5,
                latitude: 46.5,
                zoom: 5.2,
                bearing: 0,
                pitch: 0
            }}
            onLoad={handleMapLoad}
            mapStyle={MAP_STYLE}
            style={{ width: '100%', height: '100%', padding: 0, margin: 0 }}
            onClick={onMapClick}
            interactiveLayerIds={['clusters', 'unclustered-hit']}
            maxZoom={18}
            minZoom={4}
        >
            <NavigationControl position="bottom-right" showCompass={false} />

            <Source
                id="partners"
                type="geojson"
                data={geojsonData}
                cluster={true}
                clusterMaxZoom={14}
                clusterRadius={50}
            />

            {/* Render layers in proper z-order */}
            <Layer {...clusterShadowLayer} />
            <Layer {...clusterLayer} />
            <Layer {...clusterInnerLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredHitLayer} filter={
                activePartner
                    ? ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'id'], activePartner.id]]
                    : ['!', ['has', 'point_count']]
            } />
            <Layer {...pinIconLayer} filter={
                activePartner
                    ? ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'id'], activePartner.id]]
                    : ['!', ['has', 'point_count']]
            } />

            {/* Premium Active Marker - Modern Pulsing Dot */}
            {activePartner && (
                <>
                    <Marker
                        longitude={activePartner.lng}
                        latitude={activePartner.lat}
                        anchor="center"
                        onClick={() => onPartnerClick(activePartner)}
                    >
                        <div className={styles.activeMarkerPulse} />
                    </Marker>

                    <Popup
                        longitude={activePartner.lng}
                        latitude={activePartner.lat}
                        anchor="bottom"
                        offset={24}
                        closeButton={true}
                        closeOnClick={false}
                        onClose={() => onPartnerClick(null)}
                        maxWidth="280px"
                        style={{ zIndex: 100 }}
                    >
                        <div style={{ padding: '16px', backgroundColor: 'white' }}>
                            <h4 style={{ margin: '0 0 6px 0', color: '#112924', fontSize: '1.05rem', fontWeight: 800, textTransform: 'capitalize' }}>{activePartner.name}</h4>
                            <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'capitalize' }}>{activePartner.address}</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', fontWeight: 700, textTransform: 'capitalize' }}>{activePartner.zip} {activePartner.city}</p>
                        </div>
                    </Popup>
                </>
            )}
        </Map>
    );
}
