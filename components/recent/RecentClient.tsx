"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { colors, fonts, radius } from "@/styles/tokens";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdBanner from "@/components/ui/AdBanner";
import { RecentTrade } from "@/lib/queries";

// ─── 유틸 ────────────────────────────────────────────────────
const formatPrice = (val: number): string => {
  if (!val) return "-";
  if (val >= 10000) return `${(val / 10000).toFixed(1)}억`;
  return `${val.toLocaleString()}만`;
};

const formatDate = (val: number): string => {
  const s = String(val);
  return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`;
};

const formatArea = (area: number): string =>
  `${area.toFixed(1)}㎡ (${Math.round(area / 3.305)}평)`;

const tradeTypeLabel = (val: number) =>
  val === 0 ? "직거래" : "중개";

const tradeTypeBg = (val: number) =>
  val === 0 ? "rgba(255,165,0,0.15)" : "rgba(31,111,235,0.12)";

const tradeTypeColor = (val: number) =>
  val === 0 ? "#FFA500" : colors.text.accent;

// ─── 필터 옵션 ───────────────────────────────────────────────
const FILTERS = [
  { key: "all",    label: "전체" },
  { key: "direct", label: "직거래만" },
  { key: "high",   label: "10억 이상" },
] as const;

type FilterKey = typeof FILTERS[number]["key"];

interface Props {
  trades: RecentTrade[];
}

export default function RecentClient({ trades }: Props) {
  const [filter, setFilter]     = useState<FilterKey>("all");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const router = useRouter();

  const filtered = trades.filter(t => {
    if (filter === "direct") return t.trade_type === 0;
    if (filter === "high")   return t.price_man >= 100000;
    return true;
  });

  // 날짜별 그룹핑
  const grouped = filtered.reduce<Record<string, RecentTrade[]>>((acc, t) => {
    const date = formatDate(t.contract_yyyymmdd);
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg.primary,
      color: colors.text.primary,
      fontFamily: fonts.base,
      paddingBottom: 80,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');`}</style>

      <Header showSearch />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px" }}>

        {/* 브레드크럼 */}
        <div style={{ padding: "20px 0 0", fontSize: 12, color: colors.text.secondary, display: "flex", gap: 6 }}>
          <span onClick={() => router.push("/")} style={{ cursor: "pointer", color: colors.text.accent }}>홈</span>
          <span>›</span>
          <span>최근 실거래</span>
        </div>

        {/* 헤더 */}
        <div style={{ padding: "16px 0 24px", borderBottom: `1px solid ${colors.border.default}` }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            최근 실거래
          </h1>
          <p style={{ margin: "6px 0 0", color: colors.text.secondary, fontSize: 13 }}>
            전국 아파트 최신 실거래 내역 · 국토교통부 공식 데이터
          </p>
        </div>

        {/* 필터 */}
        <div style={{ display: "flex", gap: 8, padding: "20px 0 16px" }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              background: filter === f.key ? "#1f6feb" : colors.bg.secondary,
              border: `1px solid ${filter === f.key ? colors.border.active : colors.border.subtle}`,
              borderRadius: 20, padding: "6px 16px", fontSize: 13,
              color: filter === f.key ? "#fff" : colors.text.secondary,
              cursor: "pointer", transition: "all 0.15s",
              fontWeight: filter === f.key ? 600 : 400,
            }}>{f.label}</button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 12, color: colors.text.secondary, alignSelf: "center" }}>
            총 {filtered.length}건
          </span>
        </div>

        {/* 날짜별 피드 */}
        {dates.map(date => (
          <div key={date} style={{ marginBottom: 24 }}>
            {/* 날짜 헤더 */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 12,
            }}>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: colors.text.accent,
                background: "rgba(31,111,235,0.1)",
                border: `1px solid ${colors.border.active}`,
                borderRadius: 20, padding: "4px 12px",
              }}>📅 {date}</div>
              <div style={{ fontSize: 12, color: colors.text.secondary }}>
                {grouped[date].length}건
              </div>
            </div>

            {/* 거래 카드 목록 */}
            <div style={{
              background: colors.bg.secondary,
              border: `1px solid ${colors.border.default}`,
              borderRadius: radius.lg, overflow: "hidden",
            }}>
              {grouped[date].map((trade, i) => (
                <div key={i}
                  onMouseEnter={() => setHoveredRow(Number(`${date.replace(/\./g, "")}${i}`))}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => router.push(`/apt/${encodeURIComponent(trade.apt_nm)}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 20px",
                    borderBottom: i < grouped[date].length - 1
                      ? `1px solid ${colors.border.default}` : "none",
                    background: hoveredRow === Number(`${date.replace(/\./g, "")}${i}`)
                      ? colors.bg.hover : "transparent",
                    cursor: "pointer", transition: "background 0.1s",
                  }}>

                  {/* 거래유형 뱃지 */}
                  <div style={{
                    background: tradeTypeBg(trade.trade_type),
                    color: tradeTypeColor(trade.trade_type),
                    border: `1px solid ${tradeTypeColor(trade.trade_type)}40`,
                    borderRadius: 6, padding: "3px 8px",
                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}>
                    {tradeTypeLabel(trade.trade_type)}
                  </div>

                  {/* 아파트 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600,
                      color: colors.text.primary, marginBottom: 3,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {trade.apt_nm}
                    </div>
                    <div style={{ fontSize: 12, color: colors.text.secondary }}>
                      {trade.sido_nm && trade.sgg_nm
                        ? `${trade.sido_nm} ${trade.sgg_nm} · ${trade.umd_nm}`
                        : trade.umd_nm}
                      {" · "}{formatArea(trade.area)} · {trade.floor}층
                    </div>
                  </div>

                  {/* 가격 */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      fontSize: 15, fontWeight: 800,
                      color: colors.text.accent,
                    }}>
                      {formatPrice(trade.price_man)}
                    </div>
                  </div>

                  <span style={{ fontSize: 12, color: colors.text.secondary, flexShrink: 0 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <AdBanner />

        <div style={{
          marginTop: 24, padding: "20px",
          background: colors.bg.secondary,
          border: `1px solid ${colors.border.default}`,
          borderRadius: radius.lg, fontSize: 13,
          lineHeight: 1.8, color: colors.text.secondary,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: colors.text.primary, marginTop: 0, marginBottom: 12 }}>
            전국 아파트 최근 실거래 내역
          </h2>
          <p style={{ margin: 0 }}>
            국토교통부 실거래가 공개시스템 기준 전국 아파트 최신 거래 내역을 제공합니다.
            직거래 및 고가 거래 필터로 원하는 거래를 빠르게 확인하세요.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
