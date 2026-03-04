"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const AREA_FILTERS = ["전체", "59㎡", "84㎡", "114㎡"];

const formatPrice = (val) => {
  if (!val) return "-";
  if (val >= 10000) return `${(val / 10000).toFixed(1)}억`;
  return `${val.toLocaleString()}만`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#0d1117", border: "1px solid #30363d",
        borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#e6edf3"
      }}>
        <div style={{ color: "#8b949e", marginBottom: 4 }}>{label}</div>
        <div style={{ color: "#58a6ff", fontWeight: 700, fontSize: 15 }}>
          {formatPrice(payload[0].value)}
        </div>
      </div>
    );
  }
  return null;
};

export default function AptDetail({ aptName, trades = [] }) {
  const [selectedArea, setSelectedArea] = useState("전체");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  const MOCK_APT = {
    name: aptName,
    address: "",
    sigungu: "",
    built_year: "",
    total_units: "",
    floors: "",
  };

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  // 면적 필터 목록 동적 생성
  const areas = [...new Set(trades.map(t => `${Math.round(t.area)}㎡`))].sort();
  const areaFilters = ["전체", ...areas];

  const filtered = selectedArea === "전체"
    ? trades
    : trades.filter(t => `${Math.round(t.area)}㎡` === selectedArea);

  // 월별 평균가 집계 (차트용)
  const chartData = Object.entries(
    filtered.reduce((acc, t) => {
      const month = t.deal_date?.slice(0, 7) || "";
      if (!acc[month]) acc[month] = { total: 0, count: 0 };
      acc[month].total += t.price;
      acc[month].count += 1;
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { total, count }]) => ({
      date,
      price: Math.round(total / count),
    }));

  const latest = chartData[chartData.length - 1];
  const prev = chartData[chartData.length - 2];
  const diff = latest && prev ? latest.price - prev.price : 0;
  const avg = filtered.length
    ? Math.round(filtered.reduce((s, t) => s + t.price, 0) / filtered.length)
    : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      color: "#e6edf3",
      fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
      padding: "0 0 80px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
      `}</style>

      {/* 헤더 */}
      <header style={{
        borderBottom: "1px solid #21262d",
        padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0,
        background: "rgba(13,17,23,0.95)",
        backdropFilter: "blur(12px)", zIndex: 100,
      }}>
        <div
          onClick={() => router.push("/")}
          style={{
            width: 28, height: 28,
            background: "linear-gradient(135deg, #1f6feb, #388bfd)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff",
            cursor: "pointer",
          }}>실</div>
        <span
          onClick={() => router.push("/")}
          style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", cursor: "pointer" }}>
          실거래맵
        </span>
        <div style={{ flex: 1 }} />
        <div
          onClick={() => router.push("/")}
          style={{
            background: "#161b22", border: "1px solid #30363d",
            borderRadius: 20, padding: "6px 14px",
            fontSize: 13, color: "#8b949e",
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
          }}>
          <span>🔍</span><span>아파트 검색</span>
        </div>
      </header>

      <div style={{
        maxWidth: 760, margin: "0 auto", padding: "0 20px",
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* 브레드크럼 */}
        <div style={{ padding: "20px 0 0", fontSize: 12, color: "#8b949e", display: "flex", gap: 6 }}>
          <span onClick={() => router.push("/")} style={{ cursor: "pointer", color: "#58a6ff" }}>홈</span>
          <span>›</span>
          <span>{aptName}</span>
        </div>

        {/* 아파트 기본정보 */}
        <div style={{ paddingTop: 16, paddingBottom: 24, borderBottom: "1px solid #21262d" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
                {aptName}
              </h1>
              {trades[0] && (
                <p style={{ margin: "6px 0 0", color: "#8b949e", fontSize: 13 }}>
                  {trades[0].dong}
                </p>
              )}
            </div>
            {latest && (
              <div style={{
                background: "#161b22", border: "1px solid #30363d",
                borderRadius: 12, padding: "12px 18px",
                textAlign: "right", minWidth: 140,
              }}>
                <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 4 }}>최근 평균 거래가</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#58a6ff" }}>
                  {formatPrice(latest.price)}
                </div>
                {diff !== 0 && (
                  <div style={{ fontSize: 12, color: diff >= 0 ? "#3fb950" : "#f85149", marginTop: 2 }}>
                    {diff >= 0 ? "▲" : "▼"} {formatPrice(Math.abs(diff))} 전월比
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 태그 */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {[
              `거래 ${filtered.length}건`,
              ...areas.map(a => a),
            ].map(tag => (
              <span key={tag} style={{
                background: "#161b22", border: "1px solid #30363d",
                borderRadius: 20, padding: "4px 10px",
                fontSize: 12, color: "#8b949e",
              }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* 요약 카드 */}
        {filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "24px 0" }}>
            {[
              { label: "평균 거래가", value: formatPrice(avg), sub: "전체 기간" },
              { label: "거래 건수", value: `${filtered.length}건`, sub: "전체 기간" },
              { label: "최고가", value: formatPrice(Math.max(...filtered.map(t => t.price))), sub: "" },
            ].map(card => (
              <div key={card.label} style={{
                background: "#161b22", border: "1px solid #21262d",
                borderRadius: 12, padding: "16px",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#388bfd"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}
              >
                <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 8 }}>{card.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{card.value}</div>
                <div style={{ fontSize: 11, color: "#8b949e", marginTop: 4 }}>{card.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* 데이터 없을 때 */}
        {filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            color: "#8b949e", fontSize: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <div>거래 데이터가 없어요</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>다른 아파트를 검색해보세요</div>
          </div>
        )}

        {/* 면적 필터 */}
        {filtered.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {areaFilters.map(a => (
              <button key={a} onClick={() => setSelectedArea(a)} style={{
                background: selectedArea === a ? "#1f6feb" : "#161b22",
                border: `1px solid ${selectedArea === a ? "#388bfd" : "#30363d"}`,
                borderRadius: 20, padding: "6px 14px",
                fontSize: 13,
                color: selectedArea === a ? "#fff" : "#8b949e",
                cursor: "pointer", transition: "all 0.15s",
                fontWeight: selectedArea === a ? 600 : 400,
              }}>
                {a}
              </button>
            ))}
          </div>
        )}

        {/* 차트 */}
        {chartData.length > 0 && (
          <div style={{
            background: "#161b22", border: "1px solid #21262d",
            borderRadius: 16, padding: "24px 16px 12px", marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, paddingLeft: 8 }}>
              월별 평균 거래가 추이
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8b949e" }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={v => formatPrice(v)}
                  tick={{ fontSize: 11, fill: "#8b949e" }}
                  axisLine={false} tickLine={false} width={56}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={avg} stroke="#388bfd" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Line
                  type="monotone" dataKey="price"
                  stroke="#58a6ff" strokeWidth={2.5}
                  dot={{ r: 3, fill: "#58a6ff", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#388bfd" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "right", fontSize: 11, color: "#8b949e", marginTop: 8, paddingRight: 8 }}>
              ━ ━ 평균 {formatPrice(avg)}
            </div>
          </div>
        )}

        {/* 거래 이력 테이블 */}
        {filtered.length > 0 && (
          <div style={{
            background: "#161b22", border: "1px solid #21262d",
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{ padding: "20px 20px 12px", fontSize: 13, fontWeight: 600 }}>
              실거래 이력 ({filtered.length}건)
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderTop: "1px solid #21262d", borderBottom: "1px solid #21262d" }}>
                  {["거래일", "면적", "층", "거래가", "㎡당"].map(h => (
                    <th key={h} style={{
                      padding: "10px 20px",
                      textAlign: h === "거래가" || h === "㎡당" ? "right" : "left",
                      color: "#8b949e", fontWeight: 500, fontSize: 12,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...filtered].reverse().slice(0, 50).map((t, i) => (
                  <tr key={i}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: "1px solid #21262d",
                      background: hoveredRow === i ? "#1c2128" : "transparent",
                      transition: "background 0.1s",
                    }}>
                    <td style={{ padding: "12px 20px", color: "#8b949e" }}>{t.deal_date}</td>
                    <td style={{ padding: "12px 20px" }}>{t.area}㎡</td>
                    <td style={{ padding: "12px 20px", color: "#8b949e" }}>{t.floor}층</td>
                    <td style={{ padding: "12px 20px", textAlign: "right", fontWeight: 700, color: "#58a6ff" }}>
                      {formatPrice(t.price)}
                    </td>
                    <td style={{ padding: "12px 20px", textAlign: "right", color: "#8b949e", fontSize: 12 }}>
                      {t.price_per_m2 ? `${t.price_per_m2.toLocaleString()}만` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 광고 영역 */}
        <div style={{
          marginTop: 24,
          background: "#161b22", border: "1px dashed #30363d",
          borderRadius: 12, padding: "20px",
          textAlign: "center", color: "#8b949e", fontSize: 12,
        }}>
          📢 Google AdSense 광고 영역
        </div>

        {/* SEO 텍스트 */}
        <div style={{
          marginTop: 24, padding: "20px",
          background: "#161b22", border: "1px solid #21262d",
          borderRadius: 16, fontSize: 13, lineHeight: 1.8, color: "#8b949e",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e6edf3", marginTop: 0, marginBottom: 12 }}>
            {aptName} 실거래가 분석
          </h2>
          <p style={{ margin: 0 }}>
            {aptName}의 최근 실거래가는{" "}
            <strong style={{ color: "#58a6ff" }}>{formatPrice(latest?.price)}</strong>이며,
            전체 평균 거래가는 <strong style={{ color: "#e6edf3" }}>{formatPrice(avg)}</strong>입니다.
            총 <strong style={{ color: "#e6edf3" }}>{filtered.length}건</strong>의 실거래 데이터를 기반으로 합니다.
            국토교통부 실거래가 공개시스템 기준 데이터를 매월 업데이트합니다.
          </p>
        </div>

      </div>
    </div>
  );
}
