from flask import Flask, send_file, request, jsonify
from async_logic import create_user_in_db, verify_user, connect_db, disconnect_db, view_by_uuid, delete_user_by_uuid, edit_username_by_uuid, edit_password_by_uuid, upload_pfp_logic, add_chat
import asyncio
import time
import os

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

    status_code, user_uuid = user
    if status_code == 200 and user_uuid:
        return jsonify({"status": "success", "userUUID": user_uuid}), 200
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

@app.route('/home')
def home():
    return send_file('templates/home.html')

@app.route('/settings')
def settings():
    return send_file('templates/settings.html')

@app.route('/view_by_uuid', methods=['POST'])
def view_by_uuid_route():
    data = request.get_json()
    uuid = data.get('id')
    view = data.get('view')

    res, status = loop.run_until_complete(view_by_uuid(uuid, view))
    if status == 200:
        return jsonify({"status": "success", "data": res}), status
    else:
        return jsonify({"status": "error", "message": 'res'}), status

@app.route('/delete_user', methods=['POST'])
def delete_user():
    data = request.get_json()
    uuid = data.get('id')
    result = loop.run_until_complete(delete_user_by_uuid(uuid))
    if result == 200:
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error", "message": "User not found"}), 404
    
@app.route('/edit_username', methods=['POST'])
def edit_username():
    data = request.get_json()
    uuid = data.get('uuid')
    new_username = data.get('username')
    result = loop.run_until_complete(edit_username_by_uuid(uuid, new_username))
    if result == 200:
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error", "message": "An error occurred."}), 404
    
@app.route('/edit_password', methods=['POST'])
def edit_password():
    data = request.get_json()
    uuid = data.get('uuid')
    new_password = data.get('password')
    result = loop.run_until_complete(edit_password_by_uuid(uuid, new_password))
    if result == 200:
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error", "message": "An error occurred."}), 404
    
@app.route('/upload_pfp', methods=['POST'])
def upload_pfp():
    file = request.files.get('file')
    uuid = request.form.get('uuid')

    status, result = loop.run_until_complete(upload_pfp_logic(uuid, file))
    
    if status == 200:
        return jsonify({'status': 'success', 'pfppath': result}), status
    else:
        return jsonify({'status': 'error', 'message': result}), status

@app.route('/add_chat', methods=['POST'])
def add_chat_route():
    data = request.get_json()
    current_user_uuid = data.get('current_user_uuid')
    other_user_uuid = data.get('other_user_uuid')

    try:
        status, other_username, other_user_pfp, other_users_role = loop.run_until_complete(add_chat(current_user_uuid, other_user_uuid))
    except Exception as e:
        return jsonify({"status": "error", "message": "Invalid user UUID or internal error."}), 404

    if status == 200:
        return jsonify({"status": "success", "other_username": other_username, "other_users_pfp": other_user_pfp, "other_users_role": other_users_role}), 200
    else:
        return jsonify({"status": "error", "message": "An error occurred"}), 404

if __name__ == '__main__':
    print("\033[38;5;208mLighting the Campfire...\033[0m")
    time.sleep(1)
    print("\033[94mCampfire lit at https://localhost:3000\033[0m")
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
    loop.run_until_complete(disconnect_db())
    time.sleep(1)
    loop.close()
    print("\033[38;5;208mCampfire extinguished!\033[0m")