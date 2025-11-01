import json

with open("gestures/gestures.json", "r") as f:
    data = json.load(f)

new_data = data.copy()

for name, landmarks in data.items():
    if "derecha" in name:
        left_name = name.replace("derecha", "izquierda")
        mirrored = [[-x, y, z] for x, y, z in landmarks]
        new_data[left_name] = mirrored

with open("gestures/gestures.json", "w") as f:
    json.dump(new_data, f, indent=4)

print("✅ Gestos de mano izquierda generados automáticamente.")
