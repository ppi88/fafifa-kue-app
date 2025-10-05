from app.db.database import get_db
from app.schemas.stok import StokInput
from fastapi import HTTPException

def simpan_stok(data: StokInput):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO stok_harian (
                tanggal, bolu_kukus, roti_gabin, pastel, martabak_telur, moci
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data.tanggal,
            data.bolu_kukus,
            data.roti_gabin,
            data.pastel,
            data.martabak_telur,
            data.moci
        ))
        conn.commit()
        return {"message": "Data berhasil disimpan"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan data: {str(e)}")
    finally:
        cursor.close()
        conn.close()

def get_stok_by_id(stok_id: int):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM stok_harian WHERE id = %s", (stok_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan")

        return {
            "id": row[0],
            "tanggal": row[1],
            "boluKukus": row[2],
            "rotiGabin": row[3],
            "pastel": row[4],
            "martabakTelur": row[5],
            "moci": row[6],
            "mod": row[7] if len(row) > 7 else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data: {str(e)}")
    finally:
        cursor.close()
        conn.close()

def update_stok(stok_id: int, data: StokInput):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE stok_harian SET
                tanggal = %s,
                bolu_kukus = %s,
                roti_gabin = %s,
                pastel = %s,
                martabak_telur = %s,
                moci = %s
            WHERE id = %s
        """, (
            data.tanggal,
            data.bolu_kukus,
            data.roti_gabin,
            data.pastel,
            data.martabak_telur,
            data.moci,
            stok_id
        ))
        conn.commit()
        return {"message": "Data berhasil diperbarui"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal update data: {str(e)}")
    finally:
        cursor.close()
        conn.close()

def hapus_stok_by_id(stok_id: int):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM stok_harian WHERE id = %s", (stok_id,))
        conn.commit()
        return {"message": "Data berhasil dihapus"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal menghapus data: {str(e)}")
    finally:
        cursor.close()
        conn.close()
