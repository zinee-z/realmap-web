"use client";
import { useRef } from "react";
import { colors, shadows, radius } from "@/styles/tokens";
import { AptResult } from "@/types";

interface SearchBarProps {
  query: string;
  setQuery: (v: string) => void;
  results: AptResult[];
  loading: boolean;
  focused: boolean;
  setFocused: (v: boolean) => void;
  recentSearches: string[];
  showDropdown: boolean;
  goToApt: (name: string) => void;
}

function DropdownItem({
  children, onClick, justify = "flex-start",
}: {
  children: React.ReactNode;
  onClick: () => void;
  justify?: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 20px", cursor: "pointer",
        display: "flex", alignItems: "center",
        justifyContent: justify, gap: 10,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(31,111,235,0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </div>
  );
}

export default function SearchBar({
  query, setQuery, results, loading,
  focused, setFocused, recentSearches,
  showDropdown, goToApt,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{
      width: "100%",
      maxWidth: 560,
      position: "relative",
    }}>
      {/* 입력창 */}
      <div style={{
        background: focused ? "rgba(31,111,235,0.08)" : "rgba(22,27,34,0.9)",
        border: `1.5px solid ${focused ? colors.border.active : colors.border.subtle}`,
        borderRadius: radius.lg,
        transition: "all 0.2s ease",
        boxShadow: focused ? shadows.focus : shadows.card,
        display: "flex",
        alignItems: "center",
        padding: "4px 8px 4px 20px",
        gap: 8,
      }}>
        <span style={{ fontSize: 18, opacity: 0.5 }}>🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) goToApt(results[0].apt_nm);
          }}
          placeholder="아파트 이름을 입력하세요 (예: 래미안, 힐스테이트)"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            fontSize: 15,
            color: colors.text.primary,
            padding: "14px 0",
            caretColor: colors.border.active,
            outline: "none",
          }}
        />
        {loading && (
          <div style={{
            width: 16, height: 16,
            border: `2px solid ${colors.border.subtle}`,
            borderTopColor: colors.border.active,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            flexShrink: 0,
          }} />
        )}
        {query && (
          <button onClick={() => setQuery("")} style={{
            background: "none", border: "none",
            color: colors.text.secondary, cursor: "pointer",
            padding: "4px 8px", fontSize: 18, flexShrink: 0,
          }}>×</button>
        )}
        <button
          onClick={() => results.length > 0 && goToApt(results[0].apt_nm)}
          style={{
            background: colors.gradient.blue,
            border: "none", borderRadius: radius.sm,
            padding: "10px 20px", color: "#fff",
            fontSize: 14, fontWeight: 600,
            cursor: "pointer", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(31,111,235,0.4)",
          }}>
          검색
        </button>
      </div>

      {/* 드롭다운 */}
      {showDropdown && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          right: 0,
          zIndex: 999,
          background: colors.bg.secondary,
          border: `1.5px solid ${colors.border.active}`,
          borderRadius: radius.md,
          maxHeight: 320,
          overflowY: "auto",
          boxShadow: shadows.dropdown,
        }}>
          {!query && recentSearches.length > 0 && (
            <>
              <div style={{ padding: "10px 20px 6px", fontSize: 11, color: colors.text.secondary, fontWeight: 600 }}>
                최근 검색
              </div>
              {recentSearches.map((name, i) => (
                <DropdownItem key={i} onClick={() => goToApt(name)}>
                  <span style={{ fontSize: 14, opacity: 0.5 }}>🕐</span>
                  <span style={{ fontSize: 14, color: colors.text.primary }}>{name}</span>
                </DropdownItem>
              ))}
            </>
          )}
          {query && results.map((apt, i) => (
            <DropdownItem key={i} onClick={() => goToApt(apt.apt_nm)} justify="space-between">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>🏢</span>
                <div>
                  <div style={{ fontSize: 14, color: colors.text.primary, fontWeight: 500 }}>
                    {apt.apt_nm}
                  </div>
                  <div style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
                    {apt.umd_nm}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 12, color: colors.text.secondary }}>→</span>
            </DropdownItem>
          ))}
          {query && !loading && results.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", color: colors.text.secondary, fontSize: 13 }}>
              검색 결과가 없어요
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
