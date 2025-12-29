// src/context/AIContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export const AIContext = createContext(null);

const BASE_URL = "http://127.0.0.1:5000";

export const AIProvider = ({ children }) => {
  // 🔴 anomaly status per camera
  const [anomalies, setAnomalies] = useState({
    cam1: false,
    cam2: false,
    cam3: false,
    cam4: false,
  });

  // 🔥 latest abnormal clip per camera
  const [latestClip, setLatestClip] = useState({});

  // dashboard related states
  const [anomalyLogs, setAnomalyLogs] = useState([]);
  const [anomalyHistory, setAnomalyHistory] = useState([]);
  const [actionRequired, setActionRequired] = useState(false);

  const [camFrequency, setCamFrequency] = useState({
    cam1: 0,
    cam2: 0,
    cam3: 0,
    cam4: 0,
  });

  // ------------------------------------------------
  // 🔥 Set anomaly (called after upload success)
  // ------------------------------------------------
  const setAnomaly = useCallback((camId, clip) => {
    setAnomalies((prev) => ({ ...prev, [camId]: true }));

    if (clip) {
      setLatestClip((prev) => ({ ...prev, [camId]: clip }));
    }

    setCamFrequency((prev) => ({
      ...prev,
      [camId]: (prev[camId] || 0) + 1,
    }));

    setActionRequired(true);
  }, []);

  // ------------------------------------------------
  // 🔄 Poll backend ONLY for logs/history
  // ------------------------------------------------
  const fetchAnomalies = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/abnormal_clips`);
      if (!res.ok) return;

      const data = await res.json();
      if (!Array.isArray(data)) return;

      const logs = [];
      const frequency = { cam1: 0, cam2: 0, cam3: 0, cam4: 0 };
      const clipMap = {};

      data.forEach((clip) => {
        const camId = clip.camId;
        if (!camId) return;

        frequency[camId] = (frequency[camId] || 0) + 1;

        logs.push({
          camId,
          time: new Date().toLocaleString(),
          message: "Abnormal behavior detected",
          filename: clip.filename,
        });

        // keep latest clip reference
        clipMap[camId] = clip;
      });

      setCamFrequency(frequency);
      setAnomalyLogs(logs);
      setLatestClip((prev) => ({ ...prev, ...clipMap }));

      setActionRequired(Object.values(frequency).some((v) => v > 0));

      setAnomalyHistory((prev) => [
        ...prev.slice(-20),
        {
          time: new Date().toLocaleTimeString(),
          count: logs.length,
        },
      ]);
    } catch (err) {
      console.error("Failed to fetch anomalies:", err);
    }
  }, []);

  // polling interval
  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 5000);
    return () => clearInterval(interval);
  }, [fetchAnomalies]);

  // ------------------------------------------------
  // 🔄 Reset anomaly per camera
  // ------------------------------------------------
  const resetAnomaly = useCallback((camId) => {
    setAnomalies((prev) => ({ ...prev, [camId]: false }));
    setLatestClip((prev) => {
      const copy = { ...prev };
      delete copy[camId];
      return copy;
    });
  }, []);

  // ------------------------------------------------
  // ❌ Clear everything
  // ------------------------------------------------
  const clearAllAnomalies = useCallback(() => {
    setAnomalies({
      cam1: false,
      cam2: false,
      cam3: false,
      cam4: false,
    });
    setLatestClip({});
    setCamFrequency({
      cam1: 0,
      cam2: 0,
      cam3: 0,
      cam4: 0,
    });
    setActionRequired(false);
    setAnomalyLogs([]);
    setAnomalyHistory([]);
  }, []);

  return (
    <AIContext.Provider
      value={{
        anomalies,
        latestClip,
        anomalyLogs,
        anomalyHistory,
        camFrequency,
        actionRequired,

        // actions
        setAnomaly,
        resetAnomaly,
        clearAllAnomalies,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};
