# backend/create_db.py
# Script untuk membuat tabel stok_harian

import os
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

# --- 1. Konfigurasi Koneksi ---
# Path hanya naik satu tingkat dari backend ke root
DOTENV_PATH = Path(__file__).resolve().parent.parent / '.env.local' 
load_dotenv(DOTENV_PATH) 

POSTGRES_URL = os.getenv("POSTGRES_URL")

if not POSTGRES_URL:
     print("ERROR: POSTGRES_URL tidak ditemukan. Pastikan file .env.local terisi.")
     exit()

# --- 2. Perintah SQL untuk Membuat Tabel ---
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS stok_harian (
    id SERIAL PRIMARY KEY,
    tanggal DATE UNIQUE NOT NULL, 
    bolu_kukus INTEGER NOT NULL,
    roti_gabin INTEGER NOT NULL,
    pastel INTEGER NOT NULL,
    martabak_telur INTEGER NOT NULL,
    moci INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buat fungsi dan trigger jika belum ada
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Hanya buat trigger jika belum ada untuk menghindari error "already exists"
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_stok_harian_updated_at') THEN
        CREATE TRIGGER update_stok_harian_updated_at
        BEFORE UPDATE ON stok_harian
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
"""

def initialize_tables():
    """Menghubungkan ke DB dan menjalankan skrip pembuatan tabel."""
    conn = None
    try:
        print("Menghubungkan ke database 'fafifakuedb'...")
        conn = psycopg2.connect(POSTGRES_URL)
        cursor = conn.cursor()
        
        print("Menjalankan skrip CREATE TABLE stok_harian...")
        cursor.execute(CREATE_TABLE_SQL)
        conn.commit() 
        print("🎉 Sukses! Tabel 'stok_harian' telah disiapkan (tabel dan trigger).")
        
    except psycopg2.Error as e:
        # Error "already exists" sekarang sudah dihindari oleh kode di atas.
        print(f"❌ Kesalahan Database: {e}")
        if conn:
            conn.rollback()
            
    finally:
        if conn:
            conn.close()
            print("Koneksi ditutup.")

if __name__ == "__main__":
    initialize_tables()