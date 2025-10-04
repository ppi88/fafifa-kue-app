# Lokasi: app/api/stok/db_service.py

from fastapi import HTTPException
from app.db.database import get_db

# --- FUNGSI simpan_stok (SUDAH DIPERBAIKI) ---
def simpan_stok(data):
    conn = get_db()
    cursor = conn.cursor()
    
    # Hitung mod berdasarkan data
    total = data.bolu_kukus + data.roti_gabin + data.pastel + data.martabak_telur + data.moci
    mod = total % 2
    
    # PERBAIKAN: Variabel 'query' dan 'values' didefinisikan di sini
    query = """
        INSERT INTO stok_harian (tanggal, bolu_kukus, roti_gabin, pastel, martabak_telur, moci, mod)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        data.tanggal, 
        data.bolu_kukus, 
        data.roti_gabin, 
        data.pastel, 
        data.martabak_telur, 
        data.moci, 
        mod
    )
    
    try:
        cursor.execute(query, values)
        conn.commit()
        return {"message": "✅ Data berhasil disimpan"}
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan data: {str(e)}")
        
    finally:
        cursor.close()
        conn.close()

# --- FUNGSI hapus_stok_by_id (tetap sama) ---
def hapus_stok_by_id(stok_id: int):
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        query = "DELETE FROM stok_harian WHERE id = %s RETURNING id;"
        cursor.execute(query, (stok_id,))
        deleted_row = cursor.fetchone()
        conn.commit()
        
        if deleted_row is None:
            raise HTTPException(status_code=404, detail=f"Data stok ID {stok_id} tidak ditemukan.")
            
        return {"message": f"✅ Stok ID {stok_id} berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal menghapus data: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# ==========================================================
# FUNGSI: AMBIL STOK TUNGGAL (Untuk Edit)
# ==========================================================
def get_stok_by_id(stok_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT id, tanggal, bolu_kukus, roti_gabin, pastel, martabak_telur, moci, mod FROM stok_harian WHERE id = %s;"
    cursor.execute(query, (stok_id,))
    row = cursor.fetchone()
    
    cursor.close()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail=f"Stok ID {stok_id} tidak ditemukan.")
    
    # Mapping hasil fetch ke format JSON yang dimengerti frontend
    return {
        "id": row[0],
        "tanggal": row[1].strftime('%Y-%m-%d'), # Format tanggal ke string YYYY-MM-DD
        "boluKukus": row[2],
        "rotiGabin": row[3],
        "pastel": row[4],
        "martabakTelur": row[5],
        "moci": row[6],
        "mod": row[7],
    }

# ==========================================================
# FUNGSI: UPDATE STOK (Untuk Edit)
# ==========================================================
def update_stok(stok_id: int, data):
    conn = get_db()
    cursor = conn.cursor()

    # Hitung ulang mod berdasarkan data baru
    total = data.bolu_kukus + data.roti_gabin + data.pastel + data.martabak_telur + data.moci
    mod = total % 2

    query = """
        UPDATE stok_harian SET
            tanggal=%s, bolu_kukus=%s, roti_gabin=%s, pastel=%s, 
            martabak_telur=%s, moci=%s, mod=%s
        WHERE id=%s RETURNING id;
    """
    values = (
        data.tanggal, data.bolu_kukus, data.roti_gabin, data.pastel, 
        data.martabak_telur, data.moci, mod, stok_id
    )

    try:
        cursor.execute(query, values)
        if cursor.fetchone() is None:
             raise HTTPException(status_code=404, detail=f"Stok ID {stok_id} tidak ditemukan untuk diupdate.")
        
        conn.commit()
        return {"message": f"✅ Stok ID {stok_id} berhasil diperbarui."}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal update stok: {str(e)}")
    finally:
        cursor.close()
        conn.close()