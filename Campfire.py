from flask import Flask, send_file, request, jsonify
from async_logic import create_user_in_db, verify_user, connect_db, disconnect_db
import asyncio
import webview
import time

app = Flask(__name__)

# Create a global loop once and stick with it
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
loop.run_until_complete(connect_db())

@app.route('/')
def index():
    return send_file('templates/index.html')

@app.route('/resources/<path:filename>')
def resources(filename):
    return send_file(f'templates/{filename}')

@app.route('/login')
def login():
    return send_file('templates/login.html')

@app.route('/verify_login', methods=['POST'])
def verify_login_route():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = loop.run_until_complete(verify_user(username, password))

    if user == 200:
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error", "message": "Invalid username or password"}), 404

@app.route('/signup')
def signup():
    return send_file('templates/signup.html')

@app.route('/create_user', methods=['POST'])
def create_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = loop.run_until_complete(create_user_in_db(username, password))

    if user == 200:
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error", "message": "User creation failed"}), 400

if __name__ == '__main__':
    print("\033[38;5;208mLighting the Campfire...\033[0m")
    time.sleep(1)
    print("\033[94mCampfire lit at https://localhost:3000\033[0m")

    window = webview.create_window("Campfire", app, fullscreen=True, resizable=True, frameless=True, http_port=3000)
    webview.start(http_port=3000)
    loop.run_until_complete(disconnect_db())
    loop.close()
    print("\033[38;5;208mCampfire extinguished!\033[0m")