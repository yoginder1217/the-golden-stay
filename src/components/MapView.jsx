import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const CITY_COORDS = {
  'Noida': [28.5355, 77.3910],
  'Ghaziabad': [28.6692, 77.4538],
  'Greater Noida': [28.4744, 77.5040],
  'Delhi': [28.6139, 77.2090],
  'Gurugram': [28.4595, 77.0266],
  'Mumbai': [19.0760, 72.8777],
  'Jaipur': [26.9124, 75.7873],
  'Goa': [15.2993, 74.1240],
  'Chandigarh': [30.7333, 76.7794],
  'Manali': [32.2396, 77.1887],
  'Udaipur': [24.5854, 73.7125],
  'Kovalam': [8.4004, 76.9787],
};

const priceIcon = (price) => new L.DivIcon({
  html: `<div style="background:#D4AF37;color:white;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,.35);white-space:nowrap;border:2px solid white;cursor:pointer">₹${(price / 1000).toFixed(0)}k</div>`,
  className: '',
  iconSize: [72, 28],
  iconAnchor: [36, 14],
  popupAnchor: [0, -20],
});

const MapView = ({ properties }) => {
  const mapped = properties
    .map(p => ({ ...p, coords: CITY_COORDS[p.city] }))
    .filter(p => p.coords);

  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '560px' }}>
      <MapContainer center={[22.5, 80.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapped.map(p => (
          <Marker key={p.id} position={p.coords} icon={priceIcon(p.price)}>
            <Popup>
              <div style={{ width: '210px' }}>
                <img
                  src={p.image}
                  alt={p.title}
                  style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                />
                <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px', color: '#1a1a1a' }}>{p.title}</p>
                <p style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>{p.location}</p>
                <p style={{ color: '#D4AF37', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                  ₹{p.price.toLocaleString('en-IN')}/night
                </p>
                <a
                  href={`/property/${p.id}`}
                  style={{ display: 'block', background: '#D4AF37', color: 'white', textAlign: 'center', padding: '6px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}
                >
                  View Details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
