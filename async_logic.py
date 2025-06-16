from werkzeug.utils import secure_filename
from prisma import Prisma
import bcrypt
import json
import os

db = Prisma()

async def connect_db():
    await db.connect()

async def disconnect_db():
    await db.disconnect()

async def create_user_in_db(username: str, password: str):
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')  # decode here
    res = await db.users.create(
        data={
            'username': username,
            'password': hashed_password,
            'pfppath': 'resources/userpfps/userPfp.png'
        }
    )
    return 200

async def verify_user(username: str, password: str):
    user = await db.users.find_first(
        where={
            "username": username
        }
    )

    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return 200, user.id
    else:
        return 404

async def get_user_by_uuid(id: str):
    user = await db.users.find_first(
        where={
            "id": id
        }
    )
    
    if user:
        return user
    else:
        return None

async def view_by_uuid(uuid: str, view: str):
    data = await db.users.find_first(
        where={
            "id": uuid
        }
    )

    if data and hasattr(data, view):
        return getattr(data, view), 200
    else:
        return 'An unknown value has been provided to be viewed', 404

async def delete_user_by_uuid(id: str):
    deleted_user = await db.users.delete(
        where={
            "id": id
        }
    )

    if deleted_user:
        return 200
    else:
        return 404

async def edit_username_by_uuid(id: str, new_username: str):
    user = await db.users.update(
        where={
            "id": id
        },
        data={
            "username": new_username
        }
    )
    
    if user:
        return 200
    else:
        return 404
    

async def edit_password_by_uuid(id: str, new_password: str):
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    password = await db.users.update(
        where={
            "id": id
        },
        data={
            "username": hashed_password
        }
    )

    if password:
        return 200
    else:
        return 404

async def upload_pfp_logic(uuid: str, file_storage) -> tuple:
    if not file_storage or not file_storage.filename or not uuid:
        return 400, 'Missing file or user id'
    filename = secure_filename(file_storage.filename)
    upload_folder = os.path.join(os.path.dirname(__file__), 'templates', 'userpfps')
    os.makedirs(upload_folder, exist_ok=True)
    save_path = os.path.join(upload_folder, filename)
    file_storage.save(save_path)
    rel_path = f'templates/userpfps/{filename}'
    update_path = await db.users.update(
        where={
            "id": uuid
        },
        data={
            "pfppath": rel_path
        }
    )

    if update_path:
        return 200, rel_path
    else:
        return 500, 'An error occoured'

async def add_chat(current_user_uuid: str, other_user_uuid: str):
    # Verify both users exist
    current_user = await get_user_by_uuid(current_user_uuid)
    other_user = await get_user_by_uuid(other_user_uuid)
    if current_user is not None or other_user is not None:
        return 404, 'One or both users not found'

    other_username, _ = await view_by_uuid(other_user_uuid, 'username')
    other_pfp, _ = await view_by_uuid(other_user_uuid, 'pfppath')
    other_role, _ = await view_by_uuid(other_user_uuid, 'role')

    # Ensure friendList is a list (JSON field)
    try:
        current_friends = json.loads(current_user.friendList) if current_user.friendList else []
    except Exception:
        current_friends = []
    try:
        other_friends = json.loads(other_user.friendList) if other_user.friendList else []
    except Exception:
        other_friends = []

    if other_user_uuid not in current_friends:
        current_friends.append(other_user_uuid)
    if current_user_uuid not in other_friends:
        other_friends.append(current_user_uuid)

    await db.users.update(
        where={"id": current_user_uuid},
        data={"friendList": json.dumps(current_friends)}
    )
    await db.users.update(
        where={"id": other_user_uuid},
        data={"friendList": json.dumps(other_friends)}
    )

    return 200, other_username, other_pfp, other_role