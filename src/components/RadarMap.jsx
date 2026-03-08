"use client";
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix missing default styles mapping in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Aircraft Icon using DivIcon
const createAircraftIcon = (heading, altitude) => {
    // Map altitude to color (e.g., lower altitude = red/yellow, higher = green/blue)
    let color = '#22c55e'; // default green
    if (altitude < 5000) color = '#ef4444'; // red
    else if (altitude < 15000) color = '#eab308'; // yellow
    else if (altitude > 30000) color = '#3b82f6'; // blue

    return L.divIcon({
        className: 'custom-aircraft-icon',
        html: `<div style="transform: rotate(${heading}deg); color: ${color}; font-size: 28px; text-shadow: 0 0 5px rgba(0,0,0,0.5); line-height: 1;">✈</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
};

const RadarMap = ({ flights = [] }) => {
    // Center map approximately around India as fallback (where seeded flights are)
    const defaultCenter = [20.5937, 78.9629];
    const [mapCenter, setMapCenter] = React.useState(defaultCenter);
    const [hasLocation, setHasLocation] = React.useState(false);

    React.useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setHasLocation(true);
                },
                (error) => {
                    console.warn("Geolocation Error:", error.message);
                }
            );
        }
    }, []);

    // Also center on first flight if no user location is set yet
    React.useEffect(() => {
        if (!hasLocation && flights.length > 0) {
            const firstFlight = flights[0];
            const lat = firstFlight.lat || firstFlight.latitude;
            const lon = firstFlight.lon || firstFlight.longitude;
            if (lat && lon) {
                setMapCenter([lat, lon]);
            }
        }
    }, [flights, hasLocation]);

    return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden">
            <MapContainer
                key={mapCenter.join(',')} // Force re-render when center changes
                center={mapCenter}
                zoom={6}
                style={{ width: '100%', height: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {flights.map((flight, index) => {
                    const lat = flight.lat || flight.latitude;
                    const lon = flight.lon || flight.longitude;
                    if (!lat || !lon) return null;

                    return (
                        <Marker
                            key={flight._id || flight.callsign || index}
                            position={[lat, lon]}
                            icon={createAircraftIcon(flight.heading, flight.altitude)}
                        >
                            <Popup className="bg-slate-800 text-slate-100 rounded border border-slate-700 shadow-xl">
                                <div className="font-bold text-lg border-b border-slate-600 pb-1 mb-1 text-green-400">
                                    {flight.callsign || 'UNKNOWN'}
                                </div>
                                <div className="text-sm">
                                    <div><span className="text-slate-400">Alt:</span> {Math.round(flight.altitude || 0)} ft</div>
                                    <div><span className="text-slate-400">Speed:</span> {Math.round(flight.speed || 0)} kt</div>
                                    <div><span className="text-slate-400">Hdg:</span> {Math.round(flight.heading || 0)}°</div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Target/Radar aesthetic overlay */}
            <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden">
                <div className="radar-sweep-container"></div>
            </div>

            {/* Simple concentric rings */}
            <div className="absolute inset-0 pointer-events-none z-[401] flex items-center justify-center overflow-hidden">
                <div className="w-[80vw] h-[80vw] border-2 border-green-500/20 rounded-full absolute mix-blend-screen"></div>
                <div className="w-[60vw] h-[60vw] border-2 border-green-500/30 rounded-full absolute mix-blend-screen"></div>
                <div className="w-[40vw] h-[40vw] border-2 border-green-500/40 rounded-full absolute mix-blend-screen"></div>
                <div className="w-[20vw] h-[20vw] border-2 border-green-500/50 rounded-full absolute mix-blend-screen"></div>
                {/* Crosshairs */}
                <div className="w-[100vw] h-[1px] bg-green-500/30 absolute shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <div className="h-[100vh] w-[1px] bg-green-500/30 absolute shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            </div>
        </div>
    );
};

export default RadarMap;
