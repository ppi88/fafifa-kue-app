from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.stok import stok_route

app = FastAPI(
    title="Inventory Management API",
    version="1.0.0"
)

# ✅ CORS middleware agar frontend bisa akses backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Bisa diganti dengan domain Vercel kamu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routing untuk stok
app.include_router(stok_route.router, prefix="/api")

# ✅ Endpoint root untuk tes koneksi
@app.get("/")
def read_root():
    return {"message": "Backend aktif dan siap menerima permintaan"}

# ✅ Optional: startup log
@app.on_event("startup")
def startup_event():
    print("✅ FastAPI backend sudah berjalan")
