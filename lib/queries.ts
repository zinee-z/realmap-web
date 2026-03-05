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

// ─── 아파트 거래 이력 (deal + dim_apt + dim_region 조인) ─────
export async function getAptTrades(aptNm: string): Promise<Trade[]> {
  const { data, error } = await supabase
    .from("deal")
    .select(`
      contract_yyyymmdd,
      price_man,
      area_x100,
      floor,
      trade_type,
      buyer_type,
      dim_apt!inner (
        apt_nm,
        build_year,
        dim_address!inner (
          dim_region!inner (
            umd_nm,
            sgg_cd
          )
        )
      )
    `)
    .eq("dim_apt.apt_nm", aptNm)
    .is("cancel_yyyymmdd", null)
    .order("contract_yyyymmdd", { ascending: true })
    .limit(500);

  if (error) console.error("getAptTrades error:", error);

  // 중첩 조인 데이터 평탄화
  return (data ?? []).map((d: any) => ({
    contract_yyyymmdd: d.contract_yyyymmdd,
    price_man:         d.price_man,
    area:              d.area_x100 / 100,
    floor:             d.floor,
    trade_type:        d.trade_type,
    buyer_type:        d.buyer_type,
    apt_nm:            d.dim_apt.apt_nm,
    build_year:        d.dim_apt.build_year,
    umd_nm:            d.dim_apt.dim_address.dim_region.umd_nm,
    sgg_cd:            d.dim_apt.dim_address.dim_region.sgg_cd,
  }));
}

// ─── 지역별 동별 통계 (region_stats 뷰) ──────────────────────
export async function getRegionStats(sggCd: string): Promise<RegionStat[]> {
  const { data, error } = await supabase
    .from("region_stats")
    .select("umd_nm, avg_price, max_price, min_price, trade_count, last_trade_date")
    .eq("sgg_cd", sggCd)
    .order("avg_price", { ascending: false });

  if (error) console.error("getRegionStats error:", error);
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
