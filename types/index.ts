// 아파트 검색 결과
export interface AptResult {
  apt_id: number;
  apt_nm: string;
  umd_nm: string;
  sgg_cd: string;
  build_year: number;
}

// 실거래 데이터
export interface Trade {
  contract_yyyymmdd: number;
  price_man: number;
  area: number;
  floor: number;
  trade_type: number;
  buyer_type: number;
  apt_nm: string;
  build_year: number;
  umd_nm: string;
  sgg_cd: string;
}

// 차트 데이터
export interface ChartData {
  date: string;
  price: number;
}

// 통계 요약
export interface TradeSummary {
  avg: number;
  max: number;
  count: number;
  latest: ChartData | null;
  prev: ChartData | null;
  diff: number;
}

// 지역별 통계 (region_stats, sido_stats 공용)
export interface RegionStat {
  umd_nm?: string;   // 동별 (region_stats)
  sgg_cd?: string;   // 구/군별 (sido_stats)
  avg_price: number;
  max_price: number;
  min_price: number;
  trade_count: number;
  last_trade_date: number;
}
