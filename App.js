import React from "react";
import { AIProvider } from "./context/AIContext";
import CameraUnit from "./components/CameraUnit";
import StatusPanel from "./components/StatusPanel";
import ChartPanel from "./components/ChartPanel";
import ActionPanel from "./components/ActionPanel";
import MapPanel from "./components/MapPanel";
import "./styles.css";

function App() {
  return (
    <AIProvider>
      <div className="app-container">
        <h1>Crowd Anomaly Detection Dashboard</h1>
        <div className="camera-grid">
          <CameraUnit camId="cam1" />
          <CameraUnit camId="cam2" />
          <CameraUnit camId="cam3" />
          <CameraUnit camId="cam4" />
        </div>
        <div className="dashboard-panels">
          <StatusPanel />
          <ChartPanel />
          <ActionPanel />
        </div>
        <MapPanel />
      </div>
    </AIProvider>
  );
}

export default App;
