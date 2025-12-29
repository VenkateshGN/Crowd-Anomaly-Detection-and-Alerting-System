import React, { useContext, useEffect, useRef, useState } from "react";
import { AIContext } from "../context/AIContext";
import "../styles.css";

const BASE_URL = "http://192.168.43.50:5000";

const CameraUnit = ({ camId }) => {
  const { anomalies, resetAnomaly } = useContext(AIContext);

  const [clip, setClip] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const isAnomaly = anomalies[camId];

  const downloadedRef = useRef(null);
  const fileInputRef = useRef(null);

  // 🔥 Fetch abnormal clips
  useEffect(() => {
    const fetchClip = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/abnormal_clips`);
        const data = await res.json();

        const latest = data
          .filter(c => c.camId === camId)
          .sort(
            (a, b) =>
              parseInt(b.filename.split("_")[1]) -
              parseInt(a.filename.split("_")[1])
          )[0];

        setClip(latest || null);
      } catch (err) {
        console.error("Failed to fetch clips", err);
      }
    };

    fetchClip();
    const interval = setInterval(fetchClip, 10000);
    return () => clearInterval(interval);
  }, [camId]);

  // 🔥 Auto-download once
  useEffect(() => {
    if (clip?.url && downloadedRef.current !== clip.filename) {
      downloadedRef.current = clip.filename;

      const a = document.createElement("a");
      a.href = `${BASE_URL}${clip.url}`;
      a.download = clip.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [clip]);

  // 📤 Upload with progress
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("camId", camId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/api/analyze`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(
          Math.round((event.loaded / event.total) * 100)
        );
      }
    };

    xhr.onload = () => {
      setUploading(false);

      const res = JSON.parse(xhr.responseText || "{}");

      if (xhr.status === 200) {
        alert(res.anomaly
          ? "Upload successful! Anomaly detected."
          : "Upload successful! No anomaly detected."
        );
      } else {
        alert(`Upload failed! ${res.error || "Unknown error"}`);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      alert("Upload failed due to network error");
    };

    xhr.send(formData);
  };

  // 🔁 Reset
  const handleReset = () => {
    resetAnomaly(camId);
    setClip(null);
    setUploadProgress(0);
    setUploading(false);
    downloadedRef.current = null;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`camera-box ${isAnomaly ? "danger" : ""}`}>
      <div className="camera-header">
        <span>📷 {camId.toUpperCase()}</span>
        <span className={`status-dot ${isAnomaly ? "red" : "green"}`} />
      </div>

      <div className="camera-feed">
        {isAnomaly && clip?.url ? (
          <video
            key={clip.filename}        // 🔥 force reload
            src={`${BASE_URL}${clip.url}`}
            controls
            autoPlay
            muted
            loop
            playsInline               // 🔥 IMPORTANT
            className="anomaly-video"
          />
        ) : (
          <p>Live Drone Feed</p>
        )}
      </div>

      {uploading && (
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${uploadProgress}%` }}
          />
          <span>{uploadProgress}%</span>
        </div>
      )}

      <div className="camera-footer">
        <strong>Status: {isAnomaly ? "ANOMALY" : "NORMAL"}</strong>
      </div>

      <div className="camera-actions">
        <input
          type="file"
          accept="video/*"
          ref={fileInputRef}
          hidden
          onChange={handleUpload}
        />
        <button onClick={() => fileInputRef.current.click()} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Video"}
        </button>

        {isAnomaly && (
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraUnit;
