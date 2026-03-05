"use client";
import { colors, radius, shadows } from "@/styles/tokens";
import { AptResult } from "@/types";

interface SearchDropdownProps {
  query: string;
  results: AptResult[];
  loading: boolean;
  recentSearches: string[];
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

export default function SearchDropdown({
  query, results, loading, recentSearches, goToApt,
}: SearchDropdownProps) {
  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 6px)",
      left: 0, right: 0,
      background: colors.bg.secondary,
      border: `1.5px solid ${colors.border.active}`,
      borderRadius: radius.md,
      maxHeight: 320,
      overflowY: "auto",
      boxShadow: shadows.dropdown,
      zIndex: 999,
    }}>
      {/* 최근 검색 */}
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

      {/* 검색 결과 */}
      {query && results.map((apt, i) => (
        <DropdownItem key={i} onClick={() => goToApt(apt.apt_nm)} justify="space-between">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🏢</span>
            <div>
              <div style={{ fontSize: 14, color: colors.text.primary, fontWeight: 500 }}>
                {apt.apt_nm}
              </div>
              <div style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
                {apt.umd_nm} · {apt.build_year}년
              </div>
            </div>
          </div>
          <span style={{ fontSize: 12, color: colors.text.secondary }}>→</span>
        </DropdownItem>
      ))}

      {/* 결과 없음 */}
      {query && !loading && results.length === 0 && (
        <div style={{ padding: "20px", textAlign: "center", color: colors.text.secondary, fontSize: 13 }}>
          검색 결과가 없어요
        </div>
      )}
    </div>
  );
}
