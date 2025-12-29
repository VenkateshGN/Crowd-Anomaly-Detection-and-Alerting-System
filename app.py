# app.py

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import tensorflow as tf

from utils.video_utils import extract_frames, save_anomaly_segment
from utils.detector import detect_anomaly

# ------------------------------
# Flask setup
# ------------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ------------------------------
# Configurations
# ------------------------------
MODEL_PATH = "model/crowd_anomaly_model.h5"
STORAGE_DIR = "storage/abnormal_clips"
TEMP_DIR = "temp"
THRESHOLD = 0.003

os.makedirs(STORAGE_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# ------------------------------
# Load Model
# ------------------------------
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("✅ Model loaded successfully")
except Exception as e:
    print("❌ Model load failed:", e)
    model = None

# ------------------------------
# Routes
# ------------------------------
@app.route("/")
def home():
    return jsonify({
        "status": "Crowd Anomaly Detection Backend Running",
        "model": "Loaded" if model else "Not loaded"
    })

@app.route("/api/analyze", methods=["POST"])
def analyze_video():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    cam_id = request.form.get("camId", "cam1")
    video = request.files.get("video")

    if not video:
        return jsonify({"error": "No video uploaded"}), 400

    try:
        # Create cam folder
        cam_storage_path = os.path.join(STORAGE_DIR, cam_id)
        os.makedirs(cam_storage_path, exist_ok=True)

        # Save temp video
        temp_name = f"{int(time.time())}.mp4"
        temp_path = os.path.join(TEMP_DIR, temp_name)
        video.save(temp_path)

        # Extract frames (224×224×1)
        frames, fps = extract_frames(temp_path)

        if len(frames) == 0:
            os.remove(temp_path)
            return jsonify({"error": "Frame extraction failed"}), 400

        # Detect anomaly
        anomaly_idx, mse = detect_anomaly(model, frames, THRESHOLD)

        clip_data = None

        if anomaly_idx:
            # Take continuous abnormal region
            start_frame = max(0, anomaly_idx[0] - 5)
            end_frame = min(len(frames), anomaly_idx[-1] + 5)

            clip_name = f"anomaly_{int(time.time())}.mp4"
            clip_path = os.path.join(cam_storage_path, clip_name)

            save_anomaly_segment(
                video_path=temp_path,
                save_path=clip_path,
                start_frame=start_frame,
                end_frame=end_frame,
                fps=fps
            )

            clip_data = {
                "filename": clip_name,
                "url": f"/api/download/{cam_id}/{clip_name}",
                "start_frame": start_frame,
                "end_frame": end_frame
            }

        os.remove(temp_path)

        return jsonify({
            "anomaly": bool(anomaly_idx),
            "clip": clip_data,
            "num_anomalous_frames": len(anomaly_idx)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/abnormal_clips")
def list_abnormal_clips():
    clips = []
    for cam in os.listdir(STORAGE_DIR):
        cam_path = os.path.join(STORAGE_DIR, cam)
        for file in os.listdir(cam_path):
            clips.append({
                "camId": cam,
                "filename": file,
                "url": f"/api/download/{cam}/{file}"
            })
    return jsonify(clips)


@app.route("/api/download/<cam>/<filename>")
def download_clip(cam, filename):
    cam_path = os.path.join(STORAGE_DIR, cam)
    if not os.path.exists(os.path.join(cam_path, filename)):
        return jsonify({"error": "File not found"}), 404
    return send_from_directory(cam_path, filename, as_attachment=True)


@app.route("/storage/abnormal_clips/<cam>/<filename>")
def stream_clip(cam, filename):
    cam_path = os.path.join(STORAGE_DIR, cam)
    if not os.path.exists(os.path.join(cam_path, filename)):
        return jsonify({"error": "File not found"}), 404
    return send_from_directory(cam_path, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
