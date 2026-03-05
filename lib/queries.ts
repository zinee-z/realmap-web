import { supabase } from "./supabase";
import { AptResult, Trade, RegionStat } from "@/types";

// ─── 아파트 검색 자동완성 (apt_search 뷰) ────────────────────
export async function searchApts(keyword: string): Promise<AptResult[]> {
  if (!keyword?.trim()) return [];
  const { data, error } = await supabase
    .from("apt_search")
    .select("apt_id, apt_nm, umd_nm, sgg_cd, build_year")
    .ilike("apt_nm", `%${keyword}%`)
    .limit(10);

  if (error) console.error("searchApts error:", error);
  return data ?? [];
}

// ─── 아파트 거래 이력 (2단계 쿼리) ──────────────────────────
export async function getAptTrades(aptNm: string): Promise<Trade[]> {
  const { data: aptData, error: aptError } = await supabase
    .from("apt_search")
    .select("apt_id, umd_nm, sgg_cd, build_year")
    .eq("apt_nm", aptNm)
    .limit(1)
    .single();

  if (aptError || !aptData) {
    console.error("getAptTrades apt error:", aptError);
    return [];
  }

  const { data, error } = await supabase
    .from("deal")
    .select("contract_yyyymmdd, price_man, area_x100, floor, trade_type, buyer_type")
    .eq("apt_id", aptData.apt_id)
    .is("cancel_yyyymmdd", null)
    .order("contract_yyyymmdd", { ascending: true })
    .limit(500);

  if (error) {
    console.error("getAptTrades deal error:", error);
    return [];
  }

  return (data ?? []).map((d) => ({
    contract_yyyymmdd: d.contract_yyyymmdd,
    price_man:         d.price_man,
    area:              d.area_x100 / 100,
    floor:             d.floor,
    trade_type:        d.trade_type,
    buyer_type:        d.buyer_type,
    apt_nm:            aptNm,
    build_year:        aptData.build_year,
    umd_nm:            aptData.umd_nm,
    sgg_cd:            aptData.sgg_cd,
  }));
}

// ─── 구/군별 동별 통계 (region_stats 뷰) ─────────────────────
export async function getRegionStats(sggCd: string): Promise<RegionStat[]> {
  const { data, error } = await supabase
    .from("region_stats")
    .select("umd_nm, avg_price, max_price, min_price, trade_count, last_trade_date")
    .eq("sgg_cd", sggCd)
    .order("avg_price", { ascending: false });

  if (error) console.error("getRegionStats error:", error);
  return data ?? [];
}

// ─── 시/도 전체 구/군별 통계 (sido_stats 뷰) ─────────────────
export async function getSidoStats(sidoCd: string): Promise<RegionStat[]> {
  const { data, error } = await supabase
    .from("sido_stats")
    .select("sgg_cd, avg_price, max_price, min_price, trade_count, last_trade_date")
    .eq("sido_cd", sidoCd)
    .order("avg_price", { ascending: false });

  if (error) console.error("getSidoStats error:", error);
  return data ?? [];
}

// ─── 아파트 목록 (정적 페이지 생성용) ────────────────────────
export async function getAllAptNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from("apt_search")
    .select("apt_nm")
    .limit(30000);

  if (error) console.error("getAllAptNames error:", error);
  return [...new Set((data ?? []).map((d) => d.apt_nm))];
}
