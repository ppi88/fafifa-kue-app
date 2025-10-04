import os
from dotenv import load_dotenv

load_dotenv()  # otomatis baca file .env di root

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/fafifa_db")