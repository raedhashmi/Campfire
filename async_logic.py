from prisma import Prisma
import bcrypt

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
        return 200
    else:
        return 404