import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { format } from 'date-fns';

// Create custom marker icons based on status
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  pending: createIcon('red'),
  assigned: createIcon('yellow'),
  in_progress: createIcon('violet'),
  resolved: createIcon('green')
};

const MapView = ({ geojson, height = 'h-[500px]' }) => {
  const [center] = useState([28.6139, 77.2090]); // Default to New Delhi (can be dynamic)

  if (!geojson || !geojson.features) {
    return (
      <div className={`w-full ${height} bg-dark-800 rounded-xl flex items-center justify-center`}>
        <div className="text-slate-400 font-medium">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className={`w-full ${height} rounded-xl overflow-hidden shadow-xl border border-dark-700`}>
      <MapContainer 
        center={center} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles" 
        />
        
        {geojson.features.map((feature) => {
          const [lng, lat] = feature.geometry.coordinates;
          const { id, status, issueType, zone, createdAt } = feature.properties;
          
          return (
            <Marker 
              key={id} 
              position={[lat, lng]} 
              icon={icons[status] || icons.pending}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 uppercase
                    ${status === 'pending' ? 'bg-red-500/20 text-red-400' :
                      status === 'assigned' ? 'bg-yellow-500/20 text-yellow-500' :
                      status === 'resolved' ? 'bg-green-500/20 text-green-400' : 
                      'bg-purple-500/20 text-purple-400'}`}
                  >
                    {status}
                  </span>
                  <h3 className="font-bold text-base capitalize mb-1">{issueType.replace('_', ' ')}</h3>
                  <p className="text-sm text-slate-300 mb-1">Zone: {zone}</p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
