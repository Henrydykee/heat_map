import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Incident } from '../types';
import { NIGERIA_CENTER, NIGERIA_ZOOM } from '../utils/constants';
import IncidentPopup from './IncidentPopup';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconRetinaUrl: markerRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  incidents: Incident[];
  showHeatMap?: boolean;
}

// Heat map layer component
const HeatMapLayer = ({ incidents, showHeatMap }: { incidents: Incident[]; showHeatMap: boolean }) => {
  const map = useMap();

  useEffect(() => {
    if (!showHeatMap || incidents.length === 0) {
      return;
    }

    // Use simple circle markers as heat map alternative if leaflet.heat not available
    // This provides visual density representation
    const markers: any[] = [];
    
    incidents.forEach((incident) => {
      const intensity = incident.casualties.total > 0 ? Math.min(incident.casualties.total, 10) : 1;
      const radius = 5 + (intensity * 3);
      const opacity = 0.3 + (intensity * 0.05);
      
      // Create a circle marker to represent heat
      const circle = (window.L as any).circle(incident.location.coordinates, {
        radius: radius * 1000, // Convert to meters
        fillColor: '#dc2626',
        color: '#991b1b',
        weight: 1,
        opacity: opacity,
        fillOpacity: opacity * 0.5,
      });
      
      circle.addTo(map);
      markers.push(circle);
    });

    return () => {
      markers.forEach((marker) => {
        map.removeLayer(marker);
      });
    };
  }, [map, incidents, showHeatMap]);

  return null;
};

const MapView = ({ incidents, showHeatMap = false }: MapViewProps) => {
  return (
    <div className="map-container">
      <MapContainer
        center={NIGERIA_CENTER}
        zoom={NIGERIA_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatMapLayer incidents={incidents} showHeatMap={showHeatMap} />
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={incident.location.coordinates}
            icon={DefaultIcon}
          >
            <Popup>
              <IncidentPopup incident={incident} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;

