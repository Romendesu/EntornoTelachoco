from flask import Flask, request, jsonify, render_template
import requests
import time

app = Flask(__name__)

# URL opcional para reenviar gestos a otro servidor
DESTINO_URL = "http://127.0.0.1:6000/recibir"  # Cambia si tienes otro destino

# Último gesto recibido
ultimo_gesto = None

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

@app.route("/gesto", methods=["POST"])
def recibir_gesto():
    global ultimo_gesto
    data = request.json
    gesto = data.get("gesto")
    print(f"Gesto recibido: {gesto}")

    # Enviar solo si cambia el gesto
    if gesto != ultimo_gesto:
        time.sleep(1)  # Delay de 1 segundo
        try:
            requests.post(DESTINO_URL, json={"gesto": gesto})  # Opcional
        except Exception as e:
            print(f"Error enviando gesto a {DESTINO_URL}: {e}")
        ultimo_gesto = gesto

    return jsonify({"status": "ok", "mensaje": f"Gesto {gesto} recibido"})

@app.route("/ultimo_gesto", methods=["GET"])
def get_ultimo_gesto():
    return jsonify({"gesto": ultimo_gesto})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
