import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths (which break in Vite/Astro bundles)
const icon = L.divIcon({
  className: 'pf-leaflet-pin',
  html: `
    <span class="pf-pin">
      <span class="pf-pin__dot"></span>
      <span class="pf-pin__pulse"></span>
    </span>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  company: string;
  address: string;
  phone: string;
  phoneHref: string;
}

export default function OfficeMap({
  lat,
  lng,
  zoom = 15,
  company,
  address,
  phone,
  phoneHref,
}: Props) {
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <>
      <style>{`
        .pf-leaflet-pin { background: transparent !important; border: none !important; }
        .pf-pin { position: relative; display: block; width: 32px; height: 32px; }
        .pf-pin__dot {
          position: absolute; inset: 0; margin: auto;
          width: 18px; height: 18px; border-radius: 9999px;
          background: #ED1C24; box-shadow: 0 0 0 4px #fff, 0 8px 16px -4px rgba(0,0,0,.35);
          z-index: 2;
        }
        .pf-pin__pulse {
          position: absolute; inset: 0; margin: auto;
          width: 18px; height: 18px; border-radius: 9999px;
          background: #ED1C24; opacity: .6;
          animation: pf-pulse 2s ease-out infinite;
        }
        @keyframes pf-pulse {
          0%   { transform: scale(1);   opacity: .55; }
          80%  { transform: scale(2.6); opacity: 0; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .leaflet-container {
          width: 100%; height: 100%;
          background: #e8f0e3;
          font-family: inherit;
          position: relative;
          z-index: 0;
          isolation: isolate;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 12px 32px -8px rgba(0,0,0,.25);
        }
        .leaflet-popup-content { margin: 14px 16px; font-size: 13px; line-height: 1.4; }
        .leaflet-popup-tip { box-shadow: 0 4px 8px -2px rgba(0,0,0,.15); }
        .pf-popup-title { font-weight: 700; color: #16181f; margin-bottom: 4px; }
        .pf-popup-addr  { color: #525a70; margin-bottom: 6px; }
        .pf-popup-link  {
          display: inline-flex; align-items: center; gap: 4px;
          color: #44881d; font-weight: 600; text-decoration: none;
        }
        .pf-popup-link:hover { color: #2d5a1c; }
        .pf-popup-link + .pf-popup-link { margin-left: 10px; }
        /* Subtle dark-mode tile darkening using CSS filter */
        .dark .leaflet-tile {
          filter: invert(1) hue-rotate(180deg) brightness(.95) contrast(.9) saturate(.8);
        }
        .dark .leaflet-container { background: #14171f; }
      `}</style>

      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={icon}>
          <Popup>
            <div className="pf-popup-title">{company}</div>
            <div className="pf-popup-addr">{address}</div>
            <a className="pf-popup-link" href={phoneHref}>
              <i className="fa-solid fa-phone" /> {phone}
            </a>
            <a
              className="pf-popup-link"
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-diamond-turn-right" /> Directions
            </a>
          </Popup>
        </Marker>
      </MapContainer>
    </>
  );
}
