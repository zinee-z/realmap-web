"use client";
import { useState, useEffect } from "react";
import { colors, fonts } from "@/styles/tokens";
import { useSearch } from "@/hooks/useSearch";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/search/SearchBar";

const STATS = [
  { label: "등록 아파트", value: "3만+", icon: "🏢" },
  { label: "실거래 데이터", value: "500만+", icon: "📊" },
  { label: "데이터 업데이트", value: "매월", icon: "🔄" },
];

export default function MainPage() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const search = useSearch();

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
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
        justifyContent: "center",
        padding: "0 20px 80px",
        position: "relative",
        zIndex: 1,
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

        {/* 검색창 - z-index 높게 */}
        <div style={{
          width: "100%", maxWidth: 560,
          position: "relative",
          zIndex: 100,
          animation: loaded ? "fadeUp 0.7s ease 0.2s forwards" : "none",
          opacity: loaded ? undefined : 0,
        }}>
          <SearchBar {...search} />
        </div>

        {/* 통계 카드 - z-index 낮게 */}
        <div style={{
          display: "flex", gap: 16, marginTop: 48,
          flexWrap: "wrap", justifyContent: "center",
          position: "relative",
          zIndex: 1,
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
      </main>

      <Footer />
    </div>
  );
}
