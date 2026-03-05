"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { colors, fonts, radius } from "@/styles/tokens";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdBanner from "@/components/ui/AdBanner";
import { RankingItem } from "@/lib/queries";

// ─── 유틸 ────────────────────────────────────────────────────
const formatPrice = (val: number): string => {
  if (!val) return "-";
  if (val >= 10000) return `${(val / 10000).toFixed(1)}억`;
  return `${val.toLocaleString()}만`;
};

const SGG_NAMES: Record<string, string> = {
  "11110": "서울 종로구",   "11140": "서울 중구",      "11170": "서울 용산구",
  "11200": "서울 성동구",   "11215": "서울 광진구",    "11230": "서울 동대문구",
  "11260": "서울 중랑구",   "11290": "서울 성북구",    "11305": "서울 강북구",
  "11320": "서울 도봉구",   "11350": "서울 노원구",    "11380": "서울 은평구",
  "11410": "서울 서대문구", "11440": "서울 마포구",    "11470": "서울 양천구",
  "11500": "서울 강서구",   "11530": "서울 구로구",    "11545": "서울 금천구",
  "11560": "서울 영등포구", "11590": "서울 동작구",    "11620": "서울 관악구",
  "11650": "서울 서초구",   "11680": "서울 강남구",    "11710": "서울 송파구",
  "11740": "서울 강동구",
};

// ─── 탭 정의 ─────────────────────────────────────────────────
const TABS = [
  { key: "trade",  label: "🔥 거래량 TOP",   desc: "이번달 거래 많은 아파트" },
  { key: "max",    label: "💰 최고가 TOP",    desc: "이번달 최고가 거래 아파트" },
  { key: "rise",   label: "📈 급등 TOP",      desc: "전월 대비 가격 상승률 TOP" },
  { key: "corp",   label: "🏛️ 법인매수 TOP",  desc: "법인 매수 비율 높은 아파트" },
] as const;

type TabKey = typeof TABS[number]["key"];

interface Props {
  byTrade: RankingItem[];
  byMax:   RankingItem[];
  byRise:  RankingItem[];
  byCorp:  RankingItem[];
}

// ─── 랭킹 뱃지 ───────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  const medals: Record<number, { bg: string; color: string; text: string }> = {
    1: { bg: "rgba(255,215,0,0.15)",  color: "#FFD700", text: "🥇" },
    2: { bg: "rgba(192,192,192,0.15)",color: "#C0C0C0", text: "🥈" },
    3: { bg: "rgba(205,127,50,0.15)", color: "#CD7F32", text: "🥉" },
  };
  const medal = medals[rank];
  if (medal) {
    return (
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: medal.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>{medal.text}</div>
    );
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: colors.bg.hover,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, color: colors.text.secondary,
      fontWeight: 700, flexShrink: 0,
    }}>{rank}</div>
  );
}

// ─── 서브값 렌더 ─────────────────────────────────────────────
function SubValue({ tabKey, item }: { tabKey: TabKey; item: RankingItem }) {
  if (tabKey === "trade") return (
    <div style={{ fontSize: 13, color: colors.text.accent, fontWeight: 700 }}>
      {item.trade_count}건
      <span style={{ fontSize: 11, color: colors.text.secondary, marginLeft: 6 }}>
        평균 {formatPrice(item.avg_price)}
      </span>
    </div>
  );
  if (tabKey === "max") return (
    <div style={{ fontSize: 13, color: "#FFD700", fontWeight: 700 }}>
      {formatPrice(item.max_price)}
      <span style={{ fontSize: 11, color: colors.text.secondary, marginLeft: 6 }}>
        거래 {item.trade_count}건
      </span>
    </div>
  );
  if (tabKey === "rise") return (
    <div style={{ fontSize: 13, fontWeight: 700 }}>
      <span style={{ color: item.price_diff_pct >= 0 ? colors.status.up : colors.status.down }}>
        {item.price_diff_pct >= 0 ? "▲" : "▼"} {Math.abs(item.price_diff_pct)}%
      </span>
      <span style={{ fontSize: 11, color: colors.text.secondary, marginLeft: 6 }}>
        {formatPrice(item.prev_avg_price ?? 0)} → {formatPrice(item.avg_price)}
      </span>
    </div>
  );
  if (tabKey === "corp") return (
    <div style={{ fontSize: 13, fontWeight: 700 }}>
      <span style={{ color: colors.status.down }}>법인 {item.corp_ratio}%</span>
      <span style={{ fontSize: 11, color: colors.text.secondary, marginLeft: 6 }}>
        {item.corp_buy_count}/{item.trade_count}건
      </span>
    </div>
  );
  return null;
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export default function RankingClient({ byTrade, byMax, byRise, byCorp }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("trade");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const router = useRouter();

  const dataMap: Record<TabKey, RankingItem[]> = {
    trade: byTrade,
    max:   byMax,
    rise:  byRise,
    corp:  byCorp,
  };

  const currentData = dataMap[activeTab];
  const currentTab  = TABS.find(t => t.key === activeTab)!;

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
          <span>아파트 랭킹</span>
        </div>

        {/* 헤더 */}
        <div style={{ padding: "16px 0 24px", borderBottom: `1px solid ${colors.border.default}` }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            아파트 랭킹
          </h1>
          <p style={{ margin: "6px 0 0", color: colors.text.secondary, fontSize: 13 }}>
            이번달 실거래 기준 · 국토교통부 공식 데이터
          </p>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 8, padding: "20px 0 16px", flexWrap: "wrap" }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: activeTab === tab.key ? "#1f6feb" : colors.bg.secondary,
              border: `1px solid ${activeTab === tab.key ? colors.border.active : colors.border.subtle}`,
              borderRadius: 20, padding: "8px 16px",
              fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? "#fff" : colors.text.secondary,
              cursor: "pointer", transition: "all 0.15s",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* 탭 설명 */}
        <div style={{
          marginBottom: 16, padding: "10px 16px",
          background: "rgba(31,111,235,0.08)",
          border: `1px solid ${colors.border.active}`,
          borderRadius: radius.md, fontSize: 12,
          color: colors.text.accent,
        }}>
          {currentTab.desc}
        </div>

        {/* 랭킹 리스트 */}
        <div style={{
          background: colors.bg.secondary,
          border: `1px solid ${colors.border.default}`,
          borderRadius: radius.lg, overflow: "hidden",
        }}>
          {currentData.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: colors.text.secondary }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              <div>데이터가 없어요</div>
            </div>
          )}
          {currentData.map((item, i) => (
            <div key={i}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => router.push(`/apt/${encodeURIComponent(item.apt_nm)}`)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 20px",
                borderBottom: i < currentData.length - 1 ? `1px solid ${colors.border.default}` : "none",
                background: hoveredRow === i ? colors.bg.hover : "transparent",
                cursor: "pointer", transition: "background 0.1s",
              }}>

              {/* 순위 뱃지 */}
              <RankBadge rank={i + 1} />

              {/* 아파트 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary, marginBottom: 3 }}>
                  {item.apt_nm}
                </div>
                <div style={{ fontSize: 12, color: colors.text.secondary }}>
                  {SGG_NAMES[item.sgg_cd] ? `${SGG_NAMES[item.sgg_cd]} · ${item.umd_nm}` : item.umd_nm}
                </div>
              </div>

              {/* 서브값 */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <SubValue tabKey={activeTab} item={item} />
              </div>

              <span style={{ fontSize: 12, color: colors.text.secondary, flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>

        <AdBanner />

        {/* SEO 텍스트 */}
        <div style={{
          marginTop: 24, padding: "20px",
          background: colors.bg.secondary,
          border: `1px solid ${colors.border.default}`,
          borderRadius: radius.lg, fontSize: 13,
          lineHeight: 1.8, color: colors.text.secondary,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: colors.text.primary, marginTop: 0, marginBottom: 12 }}>
            이번달 아파트 실거래 랭킹
          </h2>
          <p style={{ margin: 0 }}>
            국토교통부 실거래가 공개시스템 기준으로 이번달 거래량, 최고가, 급등, 법인 매수 비율을 기준으로 아파트 랭킹을 제공합니다.
            아파트 이름을 클릭하면 상세 실거래 이력을 확인할 수 있습니다.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
