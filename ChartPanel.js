import React, { useEffect, useState, useContext } from "react";
import { Line, Bar } from "react-chartjs-2";
import { AIContext } from "../context/AIContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartPanel = () => {
  const { anomalyHistory = [], camFrequency = {} } = useContext(AIContext);
  const [lineData, setLineData] = useState({ datasets: [] });
  const [barData, setBarData] = useState({ datasets: [] });

  useEffect(() => {
    const interval = setInterval(() => {
      setLineData({
        labels: anomalyHistory.map((entry) => entry.time || ""),
        datasets: [
          {
            label: "Anomalies Over Time",
            data: anomalyHistory.map((entry) => entry.count || 0),
            borderColor: "red",
            backgroundColor: "rgba(255,0,0,0.3)",
            tension: 0.3
          }
        ]
      });

      setBarData({
        labels: Object.keys(camFrequency),
        datasets: [
          {
            label: "Camera-wise Anomaly Frequency",
            data: Object.values(camFrequency),
            backgroundColor: "rgba(255,99,132,0.6)"
          }
        ]
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [anomalyHistory, camFrequency]);

  return (
    <div className="chart-panel">
      <h2>Analytics</h2>
      <div className="charts-grid">
        <div className="chart-box">
          <Line data={lineData} />
        </div>
        <div className="chart-box">
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;
