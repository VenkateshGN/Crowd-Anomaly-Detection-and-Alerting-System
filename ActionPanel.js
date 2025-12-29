import React, { useContext } from "react";
import { AIContext } from "../context/AIContext";

const ActionPanel = () => {
  const { camFrequency = {} } = useContext(AIContext);

  return (
    <div className="action-panel">
      <h2>Camera Anomaly Summary</h2>
      {Object.keys(camFrequency).length === 0 ? (
        <p>No actions required.</p>
      ) : (
        Object.entries(camFrequency).map(([camId, count]) => (
          <div key={camId}>
            {camId}: {count} anomaly(s)
          </div>
        ))
      )}
    </div>
  );
};

export default ActionPanel;
