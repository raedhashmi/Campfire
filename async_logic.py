from src.generated import Prisma

db = Prisma()

async def connect_db():
    await db.connect()

async def disconnect_db():
    await db.disconnect()

async def create_user_in_db(username: str, password: str):
    res = await db.user.create(
        data={
            'username': username,
            'password': password,
        }
    )

    return 200

async def verify_user(username: str, password: str):
    user = await db.user.find_first(
        where={
            "username": username,
            "password": password
        }
    )

    if user:
        return 200
    else:
        return 404