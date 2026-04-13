import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon (Leaflet + bundlers issue)
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface DeliveryMapProps {
  /** Centro inicial del mapa (ubicación del restaurante) */
  center?: [number, number];
  /** Callback cuando el usuario selecciona una ubicación */
  onLocationSelect: (lat: number, lng: number) => void;
  /** Posición inicial del marker */
  initialPosition?: [number, number] | null;
  /** Altura del mapa */
  height?: string;
}

/** Componente interno que maneja clicks en el mapa */
const MapClickHandler: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
  setPosition: (pos: LatLng) => void;
}> = ({ onLocationSelect, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

/**
 * Componente de mapa para selección de dirección de domicilio.
 * Usa Leaflet + OpenStreetMap (gratuito, sin API key).
 */
export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  center = [19.4326, -99.1332], // Default: CDMX
  onLocationSelect,
  initialPosition,
  height = '300px',
}) => {
  const [position, setPosition] = useState<LatLng | null>(
    initialPosition ? new LatLng(initialPosition[0], initialPosition[1]) : null
  );

  useEffect(() => {
    if (initialPosition) {
      setPosition(new LatLng(initialPosition[0], initialPosition[1]));
    }
  }, [initialPosition]);

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler
          onLocationSelect={onLocationSelect}
          setPosition={setPosition}
        />
        {position && <Marker position={position} icon={defaultIcon} />}
      </MapContainer>
    </div>
  );
};
