import json
import os
from flask import Flask, jsonify, render_template, request, Response
import time
import threading

app = Flask(__name__)

ultimo_gesto = None
ultimo_frame = None
lock = threading.Lock()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/gesto", methods=["POST"])
def recibir_gesto():
    global ultimo_gesto
    data = request.json
    gesto = data.get("gesto")
    print(f"Gesto recibido: {gesto}")

    if gesto != ultimo_gesto:
        time.sleep(0.5)
        ultimo_gesto = gesto

    return jsonify({"status": "ok"})

@app.route("/ultimo_gesto")
def get_ultimo_gesto():
    return jsonify({"gesto": ultimo_gesto})

@app.route("/frame", methods=["POST"])
def recibir_frame():
    global ultimo_frame
    with lock:
        ultimo_frame = request.data
    return "OK"

@app.route("/video_feed")
def video_feed():
    def generar():
        while True:
            with lock:
                frame = ultimo_frame
            if frame:
                yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")
            time.sleep(0.05)
    return Response(generar(), mimetype="multipart/x-mixed-replace; boundary=frame")

# ✅ Nueva ruta para servir gestures_data.json
@app.route("/gestures_json")
def gestures_json():
    ruta = os.path.join(os.path.dirname(__file__), "hand-tracking", "gestures", "gestures_data.json")
    with open(ruta, "r", encoding="utf-8") as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
