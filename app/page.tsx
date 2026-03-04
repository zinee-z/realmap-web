"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchApts } from "@/lib/queries";

const RECENT_SEARCHES_KEY = "recentSearches";

export default function MainPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
      setRecentSearches(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await searchApts(query);
      setResults(data);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const goToApt = (aptName) => {
    // 최근 검색 저장
    const updated = [aptName, ...recentSearches.filter(r => r !== aptName)].slice(0, 5);
    setRecentSearches(updated);
    try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)); } catch {}
    router.push(`/apt/${encodeURIComponent(aptName)}`);
  };

  const showDropdown = focused && (results.length > 0 || (!query && recentSearches.length > 0));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c12",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* 배경 효과 */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(31,111,235,0.12) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", top: "20%", left: "10%",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(31,111,235,0.06) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
        animation: "float 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "30%", right: "5%",
        width: 300, height: 300,
        background: "radial-gradient(circle, rgba(56,139,253,0.05) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
        animation: "float 10s ease-in-out infinite reverse",
      }} />

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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .search-item:hover { background: rgba(31,111,235,0.1) !important; }
        .search-input:focus { outline: none; }
      `}</style>

      {/* 헤더 */}
      <header style={{
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #1f6feb, #388bfd)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900, color: "#fff",
            boxShadow: "0 4px 16px rgba(31,111,235,0.4)",
          }}>실</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#e6edf3", letterSpacing: "-0.3px" }}>
            실거래맵
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#8b949e" }}>
          국토교통부 공식 데이터
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px 80px",
        gap: 0,
      }}>

        {/* 타이틀 */}
        <div style={{
          textAlign: "center",
          marginBottom: 48,
          animation: loaded ? "fadeUp 0.7s ease 0.1s forwards" : "none",
          opacity: loaded ? undefined : 0,
        }}>
          <div style={{
            fontSize: 13,
            color: "#388bfd",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            Real Estate Transaction Data
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 6vw, 56px)",
            fontWeight: 900,
            color: "#e6edf3",
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "-1px",
          }}>
            아파트 실거래가<br />
            <span style={{
              background: "linear-gradient(90deg, #388bfd, #58a6ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              한눈에 확인
            </span>
          </h1>
          <p style={{
            marginTop: 16,
            fontSize: 15,
            color: "#8b949e",
            lineHeight: 1.6,
          }}>
            전국 아파트 매매 실거래가를 검색하고<br />
            시세 트렌드를 분석하세요
          </p>
        </div>

        {/* 검색창 */}
        <div style={{
          width: "100%",
          maxWidth: 560,
          position: "relative",
        }}>
          {/* 검색 input + 버튼 */}
          <div style={{
            background: focused ? "rgba(31,111,235,0.08)" : "rgba(22,27,34,0.9)",
            border: `1.5px solid ${focused ? "#388bfd" : "#30363d"}`,
            borderRadius: 16,
            transition: "all 0.2s ease",
            boxShadow: focused ? "0 0 0 4px rgba(31,111,235,0.1), 0 8px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            padding: "4px 8px 4px 20px",
            gap: 8,
          }}>
            <span style={{ fontSize: 18, opacity: 0.5 }}>🔍</span>
            <input
              ref={inputRef}
              className="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={e => {
                if (e.key === "Enter" && results.length > 0) goToApt(results[0].apt_name);
              }}
              placeholder="아파트 이름을 입력하세요"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                fontSize: 15,
                color: "#e6edf3",
                padding: "14px 0",
                caretColor: "#388bfd",
              }}
            />
            {loading && (
              <div style={{
                width: 16, height: 16,
                border: "2px solid #30363d",
                borderTopColor: "#388bfd",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }} />
            )}
            {query && (
              <button onClick={() => setQuery("")} style={{
                background: "none", border: "none",
                color: "#8b949e", cursor: "pointer",
                padding: "4px 8px", fontSize: 18, flexShrink: 0,
              }}>×</button>
            )}
            <button
              onClick={() => results.length > 0 && goToApt(results[0].apt_name)}
              style={{
                background: "linear-gradient(135deg, #1f6feb, #388bfd)",
                border: "none", borderRadius: 10,
                padding: "10px 20px", color: "#fff",
                fontSize: 14, fontWeight: 600,
                cursor: "pointer", flexShrink: 0,
                boxShadow: "0 2px 8px rgba(31,111,235,0.4)",
              }}>
              검색
            </button>
          </div>

          {/* 드롭다운 - 검색창 바로 아래 */}
          {showDropdown && (
            <div style={{
              position: "absolute",  // ← 변경
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "#161b22",
              border: "1.5px solid #388bfd",
              borderRadius: 12,
              overflow: "hidden",
              maxHeight: 320,
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              zIndex: 999,  // ← 추가
            }}>
              {!query && recentSearches.length > 0 && (
                <>
                  <div style={{ padding: "10px 20px 6px", fontSize: 11, color: "#8b949e", fontWeight: 600 }}>
                    최근 검색
                  </div>
                  {recentSearches.map((name, i) => (
                    <div key={i} className="search-item"
                      onClick={() => goToApt(name)}
                      style={{
                        padding: "12px 20px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 10,
                        color: "#e6edf3", fontSize: 14, transition: "background 0.1s",
                      }}>
                      <span style={{ fontSize: 14, opacity: 0.5 }}>🕐</span>
                      {name}
                    </div>
                  ))}
                </>
              )}
              {query && results.map((apt, i) => (
                <div key={i} className="search-item"
                  onClick={() => goToApt(apt.apt_name)}
                  style={{
                    padding: "12px 20px", cursor: "pointer",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", transition: "background 0.1s",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>🏢</span>
                    <div>
                      <div style={{ fontSize: 14, color: "#e6edf3", fontWeight: 500 }}>
                        {apt.apt_name}
                      </div>
                      <div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>
                        {apt.dong}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "#8b949e" }}>→</span>
                </div>
              ))}
              {query && !loading && results.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#8b949e", fontSize: 13 }}>
                  검색 결과가 없어요
                </div>
              )}
            </div>
          )}
        </div>

        {/* 통계 카드 */}
        <div style={{
          display: "flex",
          gap: 16,
          marginTop: 48,
          flexWrap: "wrap",
          justifyContent: "center",
          animation: loaded ? "fadeUp 0.7s ease 0.4s forwards" : "none",
          opacity: loaded ? undefined : 0,
        }}>
          {[
            { label: "등록 아파트", value: "3만+", icon: "🏢" },
            { label: "실거래 데이터", value: "500만+", icon: "📊" },
            { label: "데이터 업데이트", value: "매월", icon: "🔄" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "rgba(22,27,34,0.6)",
              border: "1px solid #21262d",
              borderRadius: 12,
              padding: "14px 24px",
              textAlign: "center",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#e6edf3" }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* 푸터 */}
      <footer style={{
        textAlign: "center",
        padding: "20px",
        fontSize: 11,
        color: "#8b949e",
        borderTop: "1px solid #21262d",
      }}>
        데이터 출처: 국토교통부 실거래가 공개시스템 · © 2025 실거래맵
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
