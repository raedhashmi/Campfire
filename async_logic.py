from werkzeug.utils import secure_filename
from prisma import Prisma
from flask import jsonify
import bcrypt
import os

db = Prisma()

async def connect_db():
    await db.connect()

async def disconnect_db():
    await db.disconnect()

async def create_user_in_db(username: str, password: str):
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
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
        return 200, { "id": user.id, "pfppath": user.pfppath }
    else:
        return 404, 'An error occoured'

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
            "password": hashed_password
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
    current_user = await get_user_by_uuid(current_user_uuid)
    other_user = await get_user_by_uuid(other_user_uuid)
    if not current_user or not other_user:
        return 404, 'One or both users not found'

    async def update_friend_list(user_uuid, friend_uuid):
        user = await db.users.find_first(where={"id": user_uuid})
        friend_list_str = user.friendList if user and user.friendList else ""
        friends = [f.strip() for f in friend_list_str.split(",") if f.strip()]
        if friend_uuid not in friends:
            friends.append(friend_uuid)
        new_friend_list_str = ", ".join(friends)
        await db.users.update(
            where={"id": user_uuid},
            data={"friendList": new_friend_list_str}
        )

    await update_friend_list(current_user_uuid, other_user_uuid)
    await update_friend_list(other_user_uuid, current_user_uuid)

    other_username, _ = await view_by_uuid(other_user_uuid, 'username')
    other_pfp, _ = await view_by_uuid(other_user_uuid, 'pfppath')
    other_role, _ = await view_by_uuid(other_user_uuid, 'role')

    return 200, other_username, other_pfp, other_role

async def send_message(from_user: str, to_user: str, content: str):
    message = await db.messages.create(
        data={
            "fromUser": from_user,
            "toUser": to_user,
            "content": content
        }
    )
    if message:
        return 200
    else:
        return 500
    
async def view_messages(currentUser: str, otherUser: str):
    messages = await db.messages.find_many(
        where={
            "OR": [
                {"fromUser": currentUser, "toUser": otherUser},
                {"fromUser": otherUser, "toUser": currentUser}
            ]
        },
        order={"createdAt": "asc"}
    )
    if messages:
        return 200, [
            {
                'messageID': msg.id,
                'msgFrom': msg.fromUser,
                'msgTo': msg.toUser,
                'content': msg.content
            }
            for msg in messages
        ]
    else:
        return 200, []