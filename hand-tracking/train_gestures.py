import json
import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import joblib

DATA_FILE = os.path.join(os.path.dirname(__file__), "gestures", "gestures_data.json")
MODEL_FILE = os.path.join(os.path.dirname(__file__), "gestures", "gestures_model.pkl")

def main():
    if not os.path.exists(DATA_FILE):
        print("❌ No hay datos para entrenar.")
        return

    with open(DATA_FILE, "r") as f:
        data = json.load(f)

    X = np.array([d["landmarks"] for d in data])
    y = [d["name"] for d in data]

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    clf = RandomForestClassifier(n_estimators=200)
    clf.fit(X_train, y_train)

    acc = clf.score(X_test, y_test)
    print(f"✅ Modelo entrenado con precisión: {acc*100:.2f}%")

    os.makedirs(os.path.dirname(MODEL_FILE), exist_ok=True)
    joblib.dump({"model": clf, "label_encoder": le}, MODEL_FILE)
    print("💾 Modelo guardado en", MODEL_FILE)

if __name__ == "__main__":
    main()
