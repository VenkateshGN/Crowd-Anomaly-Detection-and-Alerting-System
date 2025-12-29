import numpy as np

def detect_anomaly(model, frames, threshold=0.003):
    """
    Detect anomalies using reconstruction error (MSE)

    frames shape: (N, 224, 224, 1)
    Returns:
        anomaly_indices : list
        mse_scores : list
    """

    mse_scores = []
    anomaly_indices = []

    for i in range(len(frames)):
        frame = frames[i]  # already (224,224,1), normalized

        # add batch dimension only
        frame = np.expand_dims(frame, axis=0)  # (1,224,224,1)

        reconstructed = model.predict(frame, verbose=0)

        mse = np.mean((frame - reconstructed) ** 2)
        mse_scores.append(float(mse))

        if mse > threshold:
            anomaly_indices.append(i)

    return anomaly_indices, mse_scores
