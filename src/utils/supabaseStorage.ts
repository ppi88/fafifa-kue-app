import { supabase } from "../lib/supabaseClient";

export async function addStokCloud(entry: any) {
  const { error } = await supabase.from("fafifa_costing").insert([
    {
      id: entry.id,
      tanggal: entry.tanggal,
      items: entry.items,
      sisa: {},
      auto_filled_items: entry.auto_filled_items || {},
      items_metadata: entry.items_metadata || {},
      created_at: entry.createdAt,
    },
  ]);
  if (error) throw error;
}

export async function getAllStokCloud() {
  const { data, error } = await supabase
    .from("fafifa_costing")
    .select("*")
    .order("tanggal", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteStokCloud(id: number) {
  const { error } = await supabase.from("fafifa_costing").delete().eq("id", id);
  if (error) throw error;
}

export async function updateSisaCloud(
  tanggal: string,
  sisaItems: Record<string, number>
) {
  const { error } = await supabase
    .from("fafifa_costing")
    .update({ sisa: sisaItems })
    .eq("tanggal", tanggal);
  if (error) throw error;
}