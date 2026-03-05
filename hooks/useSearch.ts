import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { searchApts } from "@/lib/queries";
import { AptResult } from "@/types";

const RECENT_KEY = "recentSearches";

export function useSearch() {
  const [query, setQuery]           = useState<string>("");
  const [results, setResults]       = useState<AptResult[]>([]);
  const [loading, setLoading]       = useState<boolean>(false);
  const [focused, setFocused]       = useState<boolean>(false);
  const [recentSearches, setRecent] = useState<string[]>([]);
  const router = useRouter();

  // 최근 검색어 로드
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      setRecent(saved);
    } catch {}
  }, []);

  // 자동완성 검색
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

  // 아파트 페이지 이동 + 최근 검색 저장
  const goToApt = (aptNm: string) => {
    const updated = [aptNm, ...recentSearches.filter((r) => r !== aptNm)].slice(0, 5);
    setRecent(updated);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch {}
    router.push(`/apt/${encodeURIComponent(aptNm)}`);
  };

  const showDropdown = focused && (results.length > 0 || (!query && recentSearches.length > 0));

  return {
    query, setQuery,
    results,
    loading,
    focused, setFocused,
    recentSearches,
    showDropdown,
    goToApt,
  };
}
