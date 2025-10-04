# Lokasi: backend/app/main.py

from dotenv import load_dotenv
from pathlib import Path 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.stok.stok_route import router as stok_router

# --- PASTIKAN INI ADA DI BAGIAN ATAS ---
# Memuat variabel lingkungan dari backend/app/.env
load_dotenv(dotenv_path=Path(__file__).resolve().parent / '.env') 
# ------------------------------------

app = FastAPI(
    title="FAFIFA KUE API",
    version="1.0.0",
)

# Konfigurasi CORS agar frontend bisa akses backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti dengan URL frontend saat deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrasi router stok
app.include_router(stok_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Selamat datang di API Stok Fafifa Kue. Dokumentasi API ada di /docs"
    }