"use client";
import { useRouter } from "next/navigation";
import { Trade, TradeSummary } from "@/types";
import { colors, radius } from "@/styles/tokens";
import { formatPrice } from "./utils";

interface AptHeaderProps {
  aptNm: string;
  trades: Trade[];
  summary: TradeSummary;
  areas: string[];
}

export default function AptHeader({ aptNm, trades, summary, areas }: AptHeaderProps) {
  const router = useRouter();
  const firstTrade = trades[0];

  return (
    <div style={{ paddingTop: 16, paddingBottom: 24, borderBottom: `1px solid ${colors.border.default}` }}>
      {/* 브레드크럼 */}
      <div style={{ paddingBottom: 12, fontSize: 12, color: colors.text.secondary, display: "flex", gap: 6 }}>
        <span onClick={() => router.push("/")} style={{ cursor: "pointer", color: colors.text.accent }}>홈</span>
        <span>›</span>
        {firstTrade?.sgg_cd && (
          <>
            <span
              onClick={() => router.push(`/region/${firstTrade.sgg_cd}`)}
              style={{ cursor: "pointer", color: colors.text.accent }}>
              {firstTrade.umd_nm}
            </span>
            <span>›</span>
          </>
        )}
        <span>{aptNm}</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>{aptNm}</h1>
          {firstTrade && (
            <p style={{ margin: "6px 0 0", color: colors.text.secondary, fontSize: 13 }}>
              {firstTrade.umd_nm} · {firstTrade.build_year}년 준공
            </p>
          )}
        </div>
        {summary.latest && (
          <div style={{
            background: colors.bg.secondary, border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.md, padding: "12px 18px",
            textAlign: "right", minWidth: 140,
          }}>
            <div style={{ fontSize: 11, color: colors.text.secondary, marginBottom: 4 }}>최근 평균 거래가</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.text.accent }}>
              {formatPrice(summary.latest.price)}
            </div>
            {summary.diff !== 0 && (
              <div style={{ fontSize: 12, color: summary.diff >= 0 ? colors.status.up : colors.status.down, marginTop: 2 }}>
                {summary.diff >= 0 ? "▲" : "▼"} {formatPrice(Math.abs(summary.diff))} 전월比
              </div>
            )}
          </div>
        )}
      </div>

      {/* 태그 */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
        {[`거래 ${summary.count}건`, ...areas].map(tag => (
          <span key={tag} style={{
            background: colors.bg.secondary, border: `1px solid ${colors.border.subtle}`,
            borderRadius: 20, padding: "4px 10px", fontSize: 12, color: colors.text.secondary,
          }}>{tag}</span>
        ))}

        {/* 같은 지역 보기 버튼 */}
        {firstTrade?.sgg_cd && (
          <button
            onClick={() => router.push(`/region/${firstTrade.sgg_cd}`)}
            style={{
              background: "transparent",
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 20, padding: "4px 12px",
              fontSize: 12, color: colors.text.secondary,
              cursor: "pointer", transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 4,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = colors.border.active;
              e.currentTarget.style.color = colors.text.accent;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = colors.border.subtle;
              e.currentTarget.style.color = colors.text.secondary;
            }}
          >
            📍 같은 지역 시세 보기
          </button>
        )}
      </div>
    </div>
  );
}
