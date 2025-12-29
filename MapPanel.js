import React, { useContext } from "react";
import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import { AIContext } from "../context/AIContext";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🔥 FIX: Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const locations = {
  cam1: [12.9716, 77.5946],
  cam2: [12.9726, 77.5846],
  cam3: [12.9816, 77.5946],
  cam4: [12.9616, 77.6046],
};

function MapPanel() {
  const { anomalies } = useContext(AIContext);

  return (
    <div className="map-panel">
      <h2>Camera Locations</h2>

      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={13}
        style={{ height: "250px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Object.entries(locations).map(([camId, coords]) => (
          <CircleMarker
            key={camId}
            center={coords}
            radius={10}
            pathOptions={{
              color: anomalies[camId] ? "red" : "green",
              fillColor: anomalies[camId] ? "red" : "green",
              fillOpacity: 0.8,
            }}
          >
            <Popup>{camId.toUpperCase()}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapPanel;
