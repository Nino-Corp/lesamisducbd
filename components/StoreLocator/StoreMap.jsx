'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Using open-source CartoDB "Voyager" clean vector tiles (No API Key required)
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
// Other possible styles:
// 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' (Light/Minimal)
// 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' (Dark Mode)

export default function StoreMap({ partners, activePartner, onPartnerClick }) {
    const mapRef = useRef();
    const [viewState, setViewState] = useState({
        longitude: 2.5,
        latitude: 46.5,
        zoom: 5.2,
        bearing: 0,
        pitch: 0
    });

    // Fly to active partner
    useEffect(() => {
        if (activePartner && mapRef.current) {
            // Check if we are on mobile (where map is at the top but might be partially covered by search)
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

            mapRef.current.flyTo({
                center: [activePartner.lng, activePartner.lat],
                zoom: 14,
                duration: 1500,
                essential: true,
                padding: { top: isMobile ? 150 : 0 } // Push center down on mobile to make room for popup
            });
        }
    }, [activePartner]);

    // Render Markers
    const rawMarkers = partners.map((partner) => {
        const isActive = activePartner?.id === partner.id;
        return (
            <Marker
                key={`marker-${partner.id}`}
                longitude={partner.lng}
                latitude={partner.lat}
                anchor="bottom"
                onClick={e => {
                    e.originalEvent.stopPropagation();
                    onPartnerClick(partner);
                }}
            >
                <div style={{
                    width: isActive ? '36px' : '28px',
                    height: isActive ? '36px' : '28px',
                    backgroundImage: 'url("https://lesamisducbd.fr/img/favicon.ico")', // Custom CBD Favicon as Marker
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundColor: isActive ? '#10B981' : 'white',
                    border: isActive ? '3px solid white' : '2px solid #10B981',
                    borderRadius: '50%',
                    boxShadow: isActive ? '0 0 15px rgba(16, 185, 129, 0.6)' : '0 4px 10px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isActive ? 'scale(1.2)' : 'scale(1)',
                    zIndex: isActive ? 10 : 1
                }} />
            </Marker>
        );
    });

    return (
        <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle={MAP_STYLE}
            style={{ width: '100%', height: '100%' }}
            interactiveLayerIds={['symbols']}
            maxZoom={18}
            minZoom={4}
        >
            <NavigationControl position="top-right" showCompass={false} />

            {rawMarkers}

            {activePartner && (
                <Popup
                    longitude={activePartner.lng}
                    latitude={activePartner.lat}
                    anchor="bottom"
                    offset={40} // Shift above marker
                    closeButton={true}
                    closeOnClick={false}
                    onClose={() => onPartnerClick(null)}
                    maxWidth="280px"
                    style={{
                        padding: 0,
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ padding: '15px 20px', backgroundColor: 'white' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#1F4B40', fontSize: '15px', fontWeight: 700 }}>{activePartner.name}</h4>
                        <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#555' }}>{activePartner.address}</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#777', fontWeight: 600 }}>{activePartner.zip} {activePartner.city}</p>
                    </div>
                </Popup>
            )}
        </Map>
    );
}
