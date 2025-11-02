from flask import Flask, request, jsonify, render_template, Response
import time
import threading

app = Flask(__name__)

# Variables globales
ultimo_gesto = None
ultimo_frame = None
lock = threading.Lock()


@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


@app.route("/gesto", methods=["POST"])
def recibir_gesto():
    """Recibe el gesto desde el reconocedor."""
    global ultimo_gesto
    data = request.json
    gesto = data.get("gesto")
    print(f"Gesto recibido: {gesto}")

    if gesto != ultimo_gesto:
        time.sleep(0.5)
        ultimo_gesto = gesto

    return jsonify({"status": "ok"})


@app.route("/ultimo_gesto", methods=["GET"])
def get_ultimo_gesto():
    """Devuelve el último gesto registrado."""
    return jsonify({"gesto": ultimo_gesto})


@app.route("/frame", methods=["POST"])
def recibir_frame():
    """Recibe el frame JPEG desde el reconocedor."""
    global ultimo_frame
    with lock:
        ultimo_frame = request.data
    return "OK"


@app.route("/video_feed")
def video_feed():
    """Envía el último frame recibido en formato MJPEG."""
    def generar():
        while True:
            with lock:
                frame = ultimo_frame
            if frame:
                yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")
            time.sleep(0.03)  # ~30 FPS
    return Response(generar(), mimetype="multipart/x-mixed-replace; boundary=frame")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
