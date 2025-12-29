import cv2
import numpy as np

# -----------------------------
# Extract frames for MODEL
# -----------------------------
def extract_frames(video_path, resize_dim=(224, 224)):
    cap = cv2.VideoCapture(video_path)
    frames = []

    if not cap.isOpened():
        print(f"❌ Error opening video: {video_path}")
        return np.array(frames), 0

    fps = cap.get(cv2.CAP_PROP_FPS)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, resize_dim)
        gray = gray.astype("float32") / 255.0
        gray = np.expand_dims(gray, axis=-1)

        frames.append(gray)

    cap.release()
    return np.array(frames), fps


# -----------------------------
# Save reconstructed frames (optional)
# -----------------------------
def save_clip(frames, save_path, fps=10):
    if len(frames) == 0:
        print("⚠️ No frames to save.")
        return

    h, w, c = frames[0].shape

    out = cv2.VideoWriter(
        save_path,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (w, h),
    )

    for f in frames:
        frame = (f * 255).astype("uint8")
        if c == 1:
            frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
        out.write(frame)

    out.release()
    print(f"✅ Saved clip: {save_path}")


# -----------------------------
# Save ONLY abnormal segment
# -----------------------------
def save_anomaly_segment(
    video_path,
    save_path,
    start_frame,
    end_frame,
    fps,
):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print("❌ Failed to open video for anomaly segment")
        return

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    out = cv2.VideoWriter(
        save_path,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )

    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

    for _ in range(start_frame, end_frame):
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)

    cap.release()
    out.release()

    print(f"🚨 Abnormal segment saved: {save_path}")
