import os
import random
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)

state = {"led1": True, "led2": False}

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/sensors")
def sensors():
    return jsonify(
        temperature=round(23 + random.uniform(-0.2, 0.2), 1),
        humidity=round(50 + random.uniform(-1, 1), 1),
    )

@app.route("/led<int:n>", methods=["POST"])
def led(n):
    if n not in (1, 2):
        return jsonify(error="LED inconnue"), 404
    data = request.get_json(silent=True, force=True) or {}
    on = data.get("state") == "on"
    state[f"led{n}"] = on
    print(f"LED{n} -> {'ON' if on else 'OFF'}")
    return jsonify(led=n, state="on" if on else "off")

@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)