import cv2
import mediapipe as mp
import numpy as np
import json
import os
import tkinter as tk
from tkinter import simpledialog

DATA_DIR = os.path.join(os.path.dirname(__file__), "gestures")
DATA_FILE = os.path.join(DATA_DIR, "gestures_data.json")

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

def normalize_landmarks(landmarks):
    base = landmarks[0]
    landmarks = [(x - base[0], y - base[1], z - base[2]) for x, y, z in landmarks]
    norm = np.linalg.norm(landmarks)
    if norm > 0:
        landmarks = [(x/norm, y/norm, z/norm) for x, y, z in landmarks]
    return np.array(landmarks).flatten().tolist()

def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)
    print("💾 Datos guardados en", DATA_FILE)

def ask_gesture_name():
    root = tk.Tk()
    root.withdraw()
    name = simpledialog.askstring("Nuevo gesto", "Escribe el nombre del gesto:")
    root.destroy()
    return name

def main():
    cap = cv2.VideoCapture(0)
    hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.8, min_tracking_confidence=0.8)
    data = load_data()
    frame_buffer = []
    recording = False

    print("🤖 Aprendizaje ML de gestos iniciado.")
    print("Presiona [ESPACIO] para iniciar/detener grabación de gesto, [Q] para salir.")

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
                if recording:
                    frame_buffer.append(normalize_landmarks(landmarks))

        # Mostrar estado
        if recording:
            cv2.putText(frame, f"Grabando... {len(frame_buffer)} muestras", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        else:
            cv2.putText(frame, "Presiona ESPACIO para grabar", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (200, 200, 200), 2)

        cv2.imshow("Aprendizaje de Gestos ML", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord('q'):
            break
        elif key == ord(' '):
            if not recording:
                print("🟢 Grabando gesto...")
                frame_buffer = []
                recording = True
            else:
                recording = False
                if len(frame_buffer) >= 5:
                    name = ask_gesture_name()
                    if name:
                        for sample in frame_buffer:
                            data.append({"name": name, "landmarks": sample})
                        save_data(data)
                        print(f"✅ Gesto '{name}' grabado con {len(frame_buffer)} muestras.")
                    else:
                        print("❌ Gesto cancelado.")
                else:
                    print("⚠️ Muy pocas muestras, no se guardó el gesto.")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
