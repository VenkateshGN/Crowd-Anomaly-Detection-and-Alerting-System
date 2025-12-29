const API_BASE = "http://127.0.0.1:5000";

export const analyzeVideo = async (camId, file) => {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("camId", camId);

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};

export const getAbnormalClips = async () => {
  const res = await fetch(`${API_BASE}/api/abnormal_clips`);
  return res.json();
};
