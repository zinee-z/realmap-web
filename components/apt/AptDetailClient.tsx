"use client";
import { useState, useEffect, useMemo } from "react";
import { Trade, ChartData, TradeSummary } from "@/types";
import { colors, fonts } from "@/styles/tokens";
import { formatPrice, formatYearMonth } from "./utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AptHeader from "./AptHeader";
import AptSummary from "./AptSummary";
import AptChart from "./AptChart";
import AptTable from "./AptTable";
import AdBanner from "@/components/ui/AdBanner";

interface Props {
  aptNm: string;
  trades: Trade[];
}

export default function AptDetailClient({ aptNm, trades }: Props) {
  const [selectedArea, setSelectedArea] = useState<string>("전체");
  const [loaded, setLoaded]             = useState<boolean>(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // 면적 목록 동적 생성
  const areas = useMemo(() =>
    [...new Set(trades.map(t => `${Math.round(t.area)}㎡`))].sort(),
    [trades]
  );

  // 필터링된 거래
  const filtered = useMemo(() =>
    selectedArea === "전체"
      ? trades
      : trades.filter(t => `${Math.round(t.area)}㎡` === selectedArea),
    [trades, selectedArea]
  );

  // 차트 데이터 (월별 평균)
  const chartData: ChartData[] = useMemo(() => {
    const grouped = filtered.reduce<Record<string, { total: number; count: number }>>((acc, t) => {
      const month = formatYearMonth(t.contract_yyyymmdd);
      if (!acc[month]) acc[month] = { total: 0, count: 0 };
      acc[month].total += t.price_man;
      acc[month].count += 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { total, count }]) => ({
        date,
        price: Math.round(total / count),
      }));
  }, [filtered]);

  // 통계 요약
  const summary: TradeSummary = useMemo(() => {
    const latest = chartData[chartData.length - 1] ?? null;
    const prev   = chartData[chartData.length - 2] ?? null;
    return {
      avg:   filtered.length ? Math.round(filtered.reduce((s, t) => s + t.price_man, 0) / filtered.length) : 0,
      max:   filtered.length ? Math.max(...filtered.map(t => t.price_man)) : 0,
      count: filtered.length,
      latest, prev,
      diff:  latest && prev ? latest.price - prev.price : 0,
    };
  }, [filtered, chartData]);

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

      <div style={{
        maxWidth: 760, margin: "0 auto", padding: "0 20px",
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* 아파트 헤더 + 같은 지역 버튼 */}
        <AptHeader aptNm={aptNm} trades={trades} summary={summary} areas={areas} />

        {/* 요약 카드 */}
        {filtered.length > 0 && <AptSummary summary={summary} />}

        {/* 데이터 없을 때 */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: colors.text.secondary }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <div>거래 데이터가 없어요</div>
          </div>
        )}

        {/* 면적 필터 */}
        {filtered.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {["전체", ...areas].map(a => (
              <button key={a} onClick={() => setSelectedArea(a)} style={{
                background: selectedArea === a ? "#1f6feb" : colors.bg.secondary,
                border: `1px solid ${selectedArea === a ? colors.border.active : colors.border.subtle}`,
                borderRadius: 20, padding: "6px 14px", fontSize: 13,
                color: selectedArea === a ? "#fff" : colors.text.secondary,
                cursor: "pointer", transition: "all 0.15s",
                fontWeight: selectedArea === a ? 600 : 400,
              }}>{a}</button>
            ))}
          </div>
        )}

        {/* 차트 */}
        {chartData.length > 0 && <AptChart chartData={chartData} avg={summary.avg} />}

        {/* 거래 이력 테이블 */}
        {filtered.length > 0 && <AptTable trades={filtered} />}

        <AdBanner />

        {/* SEO 텍스트 */}
        <div style={{
          marginTop: 24, padding: "20px",
          background: colors.bg.secondary,
          border: `1px solid ${colors.border.default}`,
          borderRadius: 16, fontSize: 13,
          lineHeight: 1.8, color: colors.text.secondary,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: colors.text.primary, marginTop: 0, marginBottom: 12 }}>
            {aptNm} 실거래가 분석
          </h2>
          <p style={{ margin: 0 }}>
            {aptNm}의 최근 평균 거래가는{" "}
            <strong style={{ color: colors.text.accent }}>
              {summary.latest ? formatPrice(summary.latest.price) : "-"}
            </strong>이며,
            전체 평균 거래가는{" "}
            <strong style={{ color: colors.text.primary }}>{formatPrice(summary.avg)}</strong>입니다.
            총 <strong style={{ color: colors.text.primary }}>{summary.count}건</strong>의
            실거래 데이터를 기반으로 합니다.
            국토교통부 실거래가 공개시스템 기준 데이터를 매월 업데이트합니다.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
