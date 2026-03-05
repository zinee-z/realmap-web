"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors, fonts } from "@/styles/tokens";
import { useSearch } from "@/hooks/useSearch";
import { getSidoList, getSggList } from "@/lib/queries";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/search/SearchBar";

const STATS = [
  { label: "등록 아파트", value: "3만+", icon: "🏢" },
  { label: "실거래 데이터", value: "500만+", icon: "📊" },
  { label: "데이터 업데이트", value: "매월", icon: "🔄" },
];

export default function MainPage() {
  const [loaded, setLoaded]   = useState<boolean>(false);
  const [sidoList, setSidoList] = useState<{ sido_cd: string; sido_nm: string }[]>([]);
  const [popularRegions, setPopularRegions] = useState<{ sgg_cd: string; sgg_nm: string }[]>([]);
  const search = useSearch();
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    // DB에서 시/도 목록 로드
    getSidoList().then(setSidoList);
    // 서울 구/군 목록 로드 (인기 지역용) - 서울 sido_cd 는 DB에서 첫번째 로드 후 가져옴
    getSidoList().then(list => {
      const seoul = list.find(s => s.sido_nm === "서울");
      if (seoul) getSggList(seoul.sido_cd).then(setPopularRegions);
    });
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg.dark,
      display: "flex",
      flexDirection: "column",
      fontFamily: fonts.base,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .region-card:hover { border-color: #388bfd !important; color: #58a6ff !important; }
        .sido-chip:hover { background: rgba(31,111,235,0.15) !important; border-color: #388bfd !important; color: #58a6ff !important; }
      `}</style>

      {/* 배경 효과 */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(31,111,235,0.12) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "fixed", top: "20%", left: "10%",
        width: 400, height: 400, zIndex: 0,
        background: "radial-gradient(circle, rgba(31,111,235,0.06) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
        animation: "float 8s ease-in-out infinite",
      }} />

      {/* 헤더 */}
      <div style={{ position: "relative", zIndex: 50, opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease" }}>
        <Header showSearch={false} />
      </div>

      {/* 메인 콘텐츠 */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px 80px",
        position: "relative",
        zIndex: 1,
      }}>

        {/* 히어로 섹션 */}
        <div style={{
          width: "100%", maxWidth: 560,
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: 80, paddingBottom: 60,
        }}>
          {/* 타이틀 */}
          <div style={{
            textAlign: "center", marginBottom: 48,
            animation: loaded ? "fadeUp 0.7s ease 0.1s forwards" : "none",
            opacity: loaded ? undefined : 0,
          }}>
            <div style={{
              fontSize: 13, color: colors.text.blue,
              fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 16,
            }}>
              Real Estate Transaction Data
            </div>
            <h1 style={{
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 900, color: colors.text.primary,
              margin: 0, lineHeight: 1.1, letterSpacing: "-1px",
            }}>
              아파트 실거래가<br />
              <span style={{
                background: colors.gradient.text,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                한눈에 확인
              </span>
            </h1>
            <p style={{ marginTop: 16, fontSize: 15, color: colors.text.secondary, lineHeight: 1.6 }}>
              전국 아파트 매매 실거래가를 검색하고<br />시세 트렌드를 분석하세요
            </p>
          </div>

          {/* 검색창 */}
          <div style={{
            width: "100%",
            position: "relative",
            zIndex: 100,
            animation: loaded ? "fadeUp 0.7s ease 0.2s forwards" : "none",
            opacity: loaded ? undefined : 0,
          }}>
            <SearchBar {...search} />
          </div>

          {/* 통계 카드 */}
          <div style={{
            display: "flex", gap: 16, marginTop: 40,
            flexWrap: "wrap", justifyContent: "center",
            position: "relative", zIndex: 1,
            animation: loaded ? "fadeUp 0.7s ease 0.4s forwards" : "none",
            opacity: loaded ? undefined : 0,
          }}>
            {STATS.map((stat) => (
              <div key={stat.label} style={{
                background: "rgba(22,27,34,0.6)",
                border: `1px solid ${colors.border.default}`,
                borderRadius: 12, padding: "14px 24px",
                textAlign: "center", backdropFilter: "blur(8px)",
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: colors.text.primary }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 지역별 시세 섹션 */}
        <div style={{
          width: "100%", maxWidth: 760,
          animation: loaded ? "fadeUp 0.7s ease 0.5s forwards" : "none",
          opacity: loaded ? undefined : 0,
        }}>
          {/* 섹션 헤더 */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20,
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: colors.text.primary }}>
                📍 지역별 시세
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.text.secondary }}>
                지역을 선택해 아파트 시세를 확인하세요
              </p>
            </div>
          </div>

          {/* 시/도 칩 */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24,
          }}>
            {sidoList.map(sido => (
              <div
                key={sido.sido_cd}
                className="sido-chip"
                onClick={() => router.push(`/region/sido/${sido.sido_cd}`)}
                style={{
                  background: "rgba(22,27,34,0.6)",
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: 20, padding: "6px 16px",
                  fontSize: 13, color: colors.text.secondary,
                  cursor: "pointer", transition: "all 0.15s",
                  backdropFilter: "blur(8px)",
                }}
              >
                {sido.sido_nm}
              </div>
            ))}
          </div>

          {/* 인기 지역 카드 (서울 구/군) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}>
            {popularRegions.slice(0, 8).map(region => (
              <div
                key={region.sgg_cd}
                className="region-card"
                onClick={() => router.push(`/region/${region.sgg_cd}`)}
                style={{
                  background: "rgba(22,27,34,0.6)",
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: 12, padding: "16px 20px",
                  cursor: "pointer", transition: "all 0.15s",
                  backdropFilter: "blur(8px)",
                  color: colors.text.primary,
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 8 }}>🏙️</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>서울 {region.sgg_nm}</div>
                <div style={{ fontSize: 11, color: colors.text.secondary, marginTop: 4 }}>
                  시세 보기 →
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
