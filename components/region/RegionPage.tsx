"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { colors, fonts, radius } from "@/styles/tokens";
import { RegionStat } from "@/types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdBanner from "@/components/ui/AdBanner";
import RegionSelector from "./RegionSelector";
import { SGG_NAMES } from "./constants";

// ─── 유틸 ────────────────────────────────────────────────────
const formatPrice = (val: number): string => {
  if (!val) return "-";
  if (val >= 10000) return `${(val / 10000).toFixed(1)}억`;
  return `${val.toLocaleString()}만`;
};

const formatDate = (val: number): string => {
  const s = String(val);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};

// ─── 정렬 옵션 ───────────────────────────────────────────────
const SORT_OPTIONS = [
  { key: "avg_price",   label: "평균가 순" },
  { key: "trade_count", label: "거래량 순" },
  { key: "max_price",   label: "최고가 순" },
] as const;

type SortKey = typeof SORT_OPTIONS[number]["key"];

// ─── 컴포넌트 ────────────────────────────────────────────────
interface Props {
  sggCd: string;
  stats: RegionStat[];
}

export default function RegionPage({ sggCd, stats }: Props) {
  const [sortBy, setSortBy]         = useState<SortKey>("avg_price");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const router = useRouter();

  const regionName  = SGG_NAMES[sggCd] || sggCd;
  const sorted      = [...stats].sort((a, b) => b[sortBy] - a[sortBy]);
  const totalTrades = stats.reduce((s, r) => s + r.trade_count, 0);
  const avgPrice    = stats.length
    ? Math.round(stats.reduce((s, r) => s + r.avg_price, 0) / stats.length)
    : 0;
  const maxPrice = stats.length ? Math.max(...stats.map(r => r.max_price)) : 0;

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
          <span>지역별 시세</span>
          <span>›</span>
          <span>{regionName}</span>
        </div>

        {/* 헤더 + 지역 선택 */}
        <div style={{ padding: "16px 0 24px", borderBottom: `1px solid ${colors.border.default}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
                {regionName} 아파트 시세
              </h1>
              <p style={{ margin: "6px 0 0", color: colors.text.secondary, fontSize: 13 }}>
                동별 평균 실거래가 · 국토교통부 공식 데이터
              </p>
            </div>

            {/* 2단계 지역 선택 */}
            <RegionSelector currentCode={sggCd} />
          </div>
        </div>

        {/* 요약 카드 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "24px 0" }}>
          {[
            { label: "총 거래 건수", value: `${totalTrades.toLocaleString()}건` },
            { label: "지역 평균가",  value: formatPrice(avgPrice) },
            { label: "최고 거래가",  value: formatPrice(maxPrice) },
          ].map(card => (
            <div key={card.label} style={{
              background: colors.bg.secondary,
              border: `1px solid ${colors.border.default}`,
              borderRadius: radius.md, padding: "16px",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = colors.border.active)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border.default)}
            >
              <div style={{ fontSize: 11, color: colors.text.secondary, marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* 데이터 없을 때 */}
        {stats.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: colors.text.secondary }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <div>해당 지역 데이터가 없어요</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>다른 지역을 선택해보세요</div>
          </div>
        )}

        {/* 정렬 필터 */}
        {stats.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {SORT_OPTIONS.map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)} style={{
                background: sortBy === s.key ? "#1f6feb" : colors.bg.secondary,
                border: `1px solid ${sortBy === s.key ? colors.border.active : colors.border.subtle}`,
                borderRadius: 20, padding: "6px 14px", fontSize: 13,
                color: sortBy === s.key ? "#fff" : colors.text.secondary,
                cursor: "pointer", transition: "all 0.15s",
                fontWeight: sortBy === s.key ? 600 : 400,
              }}>{s.label}</button>
            ))}
          </div>
        )}

        {/* 동별 시세 테이블 */}
        {stats.length > 0 && (
          <div style={{
            background: colors.bg.secondary,
            border: `1px solid ${colors.border.default}`,
            borderRadius: radius.lg, overflow: "hidden",
          }}>
            <div style={{ padding: "20px 20px 12px", fontSize: 13, fontWeight: 600 }}>
              동별 시세 ({stats.length}개 동)
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderTop: `1px solid ${colors.border.default}`, borderBottom: `1px solid ${colors.border.default}` }}>
                  {["동명", "평균가", "최고가", "최저가", "거래건수", "최근거래"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px",
                      textAlign: h === "동명" ? "left" : "right",
                      color: colors.text.secondary, fontWeight: 500, fontSize: 12,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr key={i}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: `1px solid ${colors.border.default}`,
                      background: hoveredRow === i ? colors.bg.hover : "transparent",
                      transition: "background 0.1s",
                      cursor: "pointer",
                    }}>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>{row.umd_nm}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: colors.text.accent }}>
                      {formatPrice(row.avg_price)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: colors.status.up }}>
                      {formatPrice(row.max_price)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: colors.text.secondary }}>
                      {formatPrice(row.min_price)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: colors.text.secondary }}>
                      {row.trade_count.toLocaleString()}건
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: colors.text.secondary, fontSize: 12 }}>
                      {formatDate(row.last_trade_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdBanner />

        {/* SEO 텍스트 */}
        {stats.length > 0 && (
          <div style={{
            marginTop: 24, padding: "20px",
            background: colors.bg.secondary,
            border: `1px solid ${colors.border.default}`,
            borderRadius: radius.lg, fontSize: 13,
            lineHeight: 1.8, color: colors.text.secondary,
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: colors.text.primary, marginTop: 0, marginBottom: 12 }}>
              {regionName} 아파트 실거래가 분석
            </h2>
            <p style={{ margin: 0 }}>
              {regionName}의 아파트 평균 거래가는{" "}
              <strong style={{ color: colors.text.accent }}>{formatPrice(avgPrice)}</strong>이며,
              총 <strong style={{ color: colors.text.primary }}>{totalTrades.toLocaleString()}건</strong>의
              실거래 데이터를 기반으로 합니다.
              국토교통부 실거래가 공개시스템 기준 데이터를 매월 업데이트합니다.
            </p>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
