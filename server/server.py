import json
import os
import time
import threading
from flask import Flask, jsonify, render_template, request, Response

app = Flask(__name__)

# Variables globales
ultimo_gesto = None
ultimo_frame = None
lock = threading.Lock()


# ------------------------
# Rutas principales
# ------------------------
@app.route("/")
def home():
    """Página principal del menú."""
    return render_template("menu.html")


@app.route("/prueba")
def prueba():
    """Escena de prueba (A-Frame con cámara y gesto)."""
    return render_template("prueba.html")


@app.route("/minijuego")
def minijuego():
    """Escena del minijuego principal."""
    return render_template("index.html")


# ------------------------
# Comunicación con el reconocedor
# ------------------------
@app.route("/gesto", methods=["POST"])
def recibir_gesto():
    """Recibe el gesto detectado por el reconocedor."""
    global ultimo_gesto
    data = request.json
    gesto = data.get("gesto")
    print(f"Gesto recibido: {gesto}")

    if gesto != ultimo_gesto:
        time.sleep(0.3)  # Pequeño retardo opcional
        ultimo_gesto = gesto

    return jsonify({"status": "ok"})


@app.route("/ultimo_gesto")
def get_ultimo_gesto():
    """Devuelve el último gesto detectado."""
    return jsonify({"gesto": ultimo_gesto})


@app.route("/frame", methods=["POST"])
def recibir_frame():
    """Recibe el frame JPEG enviado desde el reconocedor."""
    global ultimo_frame
    with lock:
        ultimo_frame = request.data
    return "OK"


@app.route("/video_feed")
def video_feed():
    """Envía el último frame recibido en formato MJPEG (~60 FPS simulados)."""
    def generar():
        while True:
            with lock:
                frame = ultimo_frame
            if frame:
                yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")
            time.sleep(0.02)  # ~50 FPS
    return Response(generar(), mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/gestures_json")
def gestures_json():
    """Devuelve los datos del archivo gestures_data.json."""
    # El archivo de gestos está en la carpeta hand-tracking/gestures situada
    # en el directorio superior al de este servidor. Construir ruta relativa.
    base = os.path.dirname(__file__)
    ruta = os.path.normpath(os.path.join(base, "..", "hand-tracking", "gestures", "gestures_data.json"))
    try:
        with open(ruta, "r", encoding="utf-8") as f:
            data = json.load(f)
        return jsonify(data)
    except FileNotFoundError:
        # Devolver una lista vacía si no existe el archivo para no romper la UI
        app.logger.warning(f"gestures_data.json no encontrado en: {ruta}")
        return jsonify([])
    except Exception as e:
        app.logger.exception("Error leyendo gestures_data.json")
        return jsonify([]), 500


# ------------------------
# Ejecución
# ------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
