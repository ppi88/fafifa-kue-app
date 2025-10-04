# Lokasi: app/api/stok/stok_route.py

from fastapi import APIRouter, HTTPException
from app.schemas.stok import StokInput
# Impor fungsi service baru
from app.api.stok.db_service import (
    simpan_stok, 
    hapus_stok_by_id, 
    get_stok_by_id, 
    update_stok 
) 
from app.db.database import get_db

router = APIRouter(
    prefix="/stok",
    tags=["Stok Harian"]
)

# --- Endpoint POST /input ---
@router.post("/input")
async def input_stok(data: StokInput):
    return simpan_stok(data)

# --- Endpoint GET / ---
@router.get("/")
async def get_all_stok():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stok_harian ORDER BY tanggal DESC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    result = [
        {
            "id": row[0],
            "tanggal": row[1],
            "boluKukus": row[2],
            "rotiGabin": row[3],
            "pastel": row[4],
            "martabakTelur": row[5],
            "moci": row[6],
            "mod": row[7],
        }
        for row in rows
    ]

    return {"data": result}

# ==========================================================
# ENDPOINT: GET STOK TUNGGAL (/api/stok/{stok_id})
# ==========================================================
@router.get("/{stok_id}")
async def get_stok_detail(stok_id: int):
    # Mengambil detail stok tunggal
    return get_stok_by_id(stok_id)

# ==========================================================
# ENDPOINT: UPDATE STOK (PUT /api/stok/{stok_id})
# ==========================================================
@router.put("/{stok_id}")
async def update_stok_endpoint(stok_id: int, data: StokInput):
    # Memperbarui data stok
    try:
        return update_stok(stok_id, data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal update data: {str(e)}")

# --- Endpoint DELETE /{stok_id} ---
@router.delete("/{stok_id}") 
async def hapus_stok(stok_id: int):
    try:
        return hapus_stok_by_id(stok_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menghapus data: {str(e)}")