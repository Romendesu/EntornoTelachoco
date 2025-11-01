import cv2
import mediapipe as mp
import numpy as np
import os
import joblib
from collections import deque

MODEL_FILE = os.path.join(os.path.dirname(__file__), "gestures", "gestures_model.pkl")

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

def normalize_landmarks(landmarks):
    base = landmarks[0]
    landmarks = [(x - base[0], y - base[1], z - base[2]) for x, y, z in landmarks]
    norm = np.linalg.norm(landmarks)
    if norm > 0:
        landmarks = [(x/norm, y/norm, z/norm) for x, y, z in landmarks]
    return np.array(landmarks).flatten()

def main():
    if not os.path.exists(MODEL_FILE):
        print("❌ No hay modelo entrenado. Ejecuta train_gestures.py primero.")
        return

    data = joblib.load(MODEL_FILE)
    clf = data["model"]
    le = data["label_encoder"]

    cap = cv2.VideoCapture(0)
    hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.8, min_tracking_confidence=0.8)
    last_predictions = deque(maxlen=5)

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                landmarks = [(lm.x, lm.y, lm.z) for lm in hand_landmarks.landmark]
                normalized = normalize_landmarks(landmarks)
                pred_encoded = clf.predict([normalized])[0]
                pred_name = le.inverse_transform([pred_encoded])[0]
                last_predictions.append(pred_name)

        if last_predictions:
            most_common = max(set(last_predictions), key=last_predictions.count)
            cv2.putText(frame, f"{most_common}", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
        else:
            cv2.putText(frame, "Detectando gestos...", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (200, 200, 200), 2)

        cv2.imshow("Reconocimiento ML de Gestos", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
