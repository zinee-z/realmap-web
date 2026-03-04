import { supabase } from "./supabase";

export async function getAptTrades(aptName, area = null) {
  let q = supabase
    .from("apt_trades")
    .select("deal_date, price, price_per_m2, floor, area")
    .eq("apt_name", aptName)
    .order("deal_date", { ascending: true })
    .limit(200);

  if (area) q = q.eq("area", area);
  const { data } = await q;
  return data ?? [];
}

export async function searchApts(keyword) {
  const { data } = await supabase
    .from("apt_trades")
    .select("apt_name, sigungu_code, dong")
    .ilike("apt_name", `%${keyword}%`)
    .limit(10);
  return [...new Map(data?.map(d => [d.apt_name, d])).values()];
}