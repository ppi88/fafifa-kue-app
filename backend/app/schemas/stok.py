from pydantic import BaseModel, Field
from datetime import date

class StokInput(BaseModel):
    tanggal: date
    bolu_kukus: int = Field(..., alias="boluKukus")
    roti_gabin: int = Field(..., alias="rotiGabin")
    pastel: int = Field(..., alias="pastel")
    martabak_telur: int = Field(..., alias="martabakTelur")
    moci: int = Field(..., alias="moci")

    class Config:
        validate_by_name = True  # Pydantic v2
        populate_by_name = True  # Agar alias bisa dipakai saat parsing
