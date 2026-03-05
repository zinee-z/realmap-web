import { getRecentTrades } from "@/lib/queries";
import RecentClient from "@/components/recent/RecentClient";

export const metadata = {
  title: "최근 실거래 | 실거래맵",
  description: "전국 아파트 최근 실거래 내역을 실시간으로 확인하세요.",
};

export const revalidate = 3600; // 1시간마다 갱신

export default async function RecentPage() {
  const trades = await getRecentTrades(100);
  return <RecentClient trades={trades} />;
}
