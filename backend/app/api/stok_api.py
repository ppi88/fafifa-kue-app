import os
from dotenv import load_dotenv
import psycopg2
from fastapi import APIRouter, Request, HTTPException

# Load .env dari folder app
load_dotenv(dotenv_path="app/.env")
POSTGRES_URL = os.getenv("POSTGRES_URL")

router = APIRouter()

def save_stok(data):
    required_fields = ['tanggal', 'boluKukus', 'rotiGabin', 'pastel', 'martabakTelur', 'moci']
    for field in required_fields:
        if field not in data:
            raise HTTPException(status_code=400, detail=f"Field '{field}' wajib diisi")

    try:
        conn = psycopg2.connect(POSTGRES_URL)
        cursor = conn.cursor()

        query = """
            INSERT INTO stok_harian (tanggal, bolu_kukus, roti_gabin, pastel, martabak_telur, moci)
            VALUES (%s, %s, %s, %s, %s, %s);
        """
        values = (
            data['tanggal'],
            data['boluKukus'],
            data['rotiGabin'],
            data['pastel'],
            data['martabakTelur'],
            data['moci']
        )

        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()

        return {"message": "Stok berhasil disimpan"}

    except Exception as e:
        print(f"❌ Error PSQL: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal input stok: {str(e)}")

@router.post("/input_stok")
async def input_stok(request: Request):
    data = await request.json()
    return save_stok(data)