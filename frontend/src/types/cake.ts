export type CakeType =
  | "BOLU_KUKUS"
  | "ROTI_GABIN"
  | "PASTEL"
  | "MARTABAK_TELUR"
  | "MOCI";

export interface Cake {
  type: CakeType;
  name: string;
  icon: string; // path ke public/icons
  unit: string;
  buyPrice: number;
  sellPrice: number;
}

export const CakeRegistry: Record<CakeType, Cake> = {
  BOLU_KUKUS: { type: "BOLU_KUKUS", name: "Bolu Kukus", icon: "/icons/bolu.png", unit: "pcs", buyPrice: 2000, sellPrice: 5000 },
  ROTI_GABIN: { type: "ROTI_GABIN", name: "Roti Gabin", icon: "/icons/gabin.png", unit: "pcs", buyPrice: 1500, sellPrice: 4000 },
  PASTEL: { type: "PASTEL", name: "Pastel", icon: "/icons/pastel.png", unit: "pcs", buyPrice: 2500, sellPrice: 6000 },
  MARTABAK_TELUR: { type: "MARTABAK_TELUR", name: "Martabak Telur", icon: "/icons/martabak.png", unit: "pcs", buyPrice: 5000, sellPrice: 12000 },
  MOCI: { type: "MOCI", name: "Moci", icon: "/icons/moci.png", unit: "pcs", buyPrice: 1000, sellPrice: 3000 },
};