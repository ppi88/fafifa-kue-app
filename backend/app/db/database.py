# --- LOKASI FILE ANDA (misalnya: database.py) ---

import os
import urllib.parse as urlparse
from dotenv import load_dotenv
import psycopg2

# Pastikan Anda sudah menginstal: pip install python-dotenv psycopg2-binary

# 1. Muat variabel lingkungan dari file .env (penting agar POSTGRES_URL terbaca)
load_dotenv() 

# 2. Ambil URL Supabase dari .env
POSTGRES_URL = os.environ.get("POSTGRES_URL")

if not POSTGRES_URL:
    # Jika variabel tidak ditemukan, tampilkan error yang jelas.
    raise Exception("Variabel lingkungan 'POSTGRES_URL' tidak ditemukan. Pastikan sudah diatur di file .env.")

# 3. Pisahkan komponen URL Supabase
# Python perlu memecah URL Supabase (postgresql://user:password@host:port/dbname)
# menjadi komponen yang berbeda.
url = urlparse.urlparse(POSTGRES_URL)

# path[1:] menghilangkan '/' di awal nama database
DB_NAME = url.path[1:]
DB_USER = url.username
DB_PASSWORD = url.password
DB_HOST = url.hostname
DB_PORT = url.port


def get_db():
    """
    Mengembalikan objek koneksi database (psycopg2) ke server Supabase,
    menggunakan variabel lingkungan POSTGRES_URL.
    """
    # 4. Gunakan komponen yang sudah dipecah untuk koneksi Supabase
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )