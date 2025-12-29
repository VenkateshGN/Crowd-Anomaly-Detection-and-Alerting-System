import React, { useState, useEffect } from "react";

const ActionPanel = () => {
  const [clips, setClips] = useState([]);

  const fetchClips = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/abnormal_clips");
      if (!res.ok) {
        console.warn("Fetch failed:", res.status);
        return;
      }
      const data = await res.json();
      setClips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching clips:", err);
      setClips([]); // fallback to empty
    }
  };

  useEffect(() => {
    fetchClips();
    const interval = setInterval(fetchClips, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="action-panel">
      <h2>Recent Actions</h2>
      {clips.length === 0 ? (
        <p>No actions required.</p>
      ) : (
        clips.map((clip, idx) => (
          <div key={idx} className="clip-item">
            <p>
              <strong>{clip.camId}</strong>: {clip.filename}
            </p>
            <a
              href={`http://127.0.0.1:5000${clip.url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </div>
        ))
      )}
    </div>
  );
};

export default ActionPanel;
