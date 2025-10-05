import os
import urllib.parse as urlparse
from dotenv import load_dotenv
import psycopg2

# ✅ Muat file .env secara eksplisit dari folder backend
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# ✅ Ambil URL Supabase dari .env
POSTGRES_URL = os.getenv("POSTGRES_URL")

if not POSTGRES_URL:
    raise Exception("Variabel lingkungan 'POSTGRES_URL' tidak ditemukan. Pastikan sudah diatur di file .env.")

# ✅ Pisahkan komponen URL Supabase
url = urlparse.urlparse(POSTGRES_URL)

DB_NAME = url.path[1:]
DB_USER = url.username
DB_PASSWORD = url.password
DB_HOST = url.hostname
DB_PORT = url.port

def get_db():
    """
    Mengembalikan koneksi psycopg2 ke database Supabase.
    """
    try:
        return psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
    except Exception as e:
        raise Exception(f"Gagal koneksi ke database: {str(e)}")
