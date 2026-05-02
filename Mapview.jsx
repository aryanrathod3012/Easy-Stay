import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Star, Users, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const genderColors = { boys: '#3b82f6', girls: '#ec4899', unisex: '#8b5cf6' };

function createPriceIcon(pg) {
  const color = genderColors[pg.gender_type] || '#6366f1';
  const price = pg.price_per_month
    ? `₹${Math.round(pg.price_per_month / 1000)}k`
    : '?';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="36" viewBox="0 0 64 36">
      <rect x="1" y="1" width="62" height="28" rx="8" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="32" y="19" font-family="Inter,sans-serif" font-size="12" font-weight="700"
            fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
      <polygon points="28,29 36,29 32,35" fill="${color}"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [64, 36],
    iconAnchor: [32, 36],
    popupAnchor: [0, -38],
  });
}

const defaultImg = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=300&h=180&fit=crop';

// Default center: India
const INDIA_CENTER = [20.5937, 78.9629];

export default function PGMapView({ pgs }) {
  const [selectedPg, setSelectedPg] = useState(null);

  const pgsWithCoords = pgs.filter(pg => pg.latitude && pg.longitude);

  // Compute center from listings or fallback to India
  const center = pgsWithCoords.length > 0
    ? [
        pgsWithCoords.reduce((s, p) => s + p.latitude, 0) / pgsWithCoords.length,
        pgsWithCoords.reduce((s, p) => s + p.longitude, 0) / pgsWithCoords.length,
      ]
    : INDIA_CENTER;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: 520 }}>
      <MapContainer
        center={center}
        zoom={pgsWithCoords.length > 0 ? 12 : 5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pgsWithCoords.map(pg => (
          <Marker
            key={pg.id}
            position={[pg.latitude, pg.longitude]}
            icon={createPriceIcon(pg)}
            eventHandlers={{ click: () => setSelectedPg(pg) }}
 
