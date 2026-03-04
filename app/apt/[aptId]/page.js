import { getAptTrades } from "@/lib/queries";
import AptDetail from "@/components/AptDetail";

export async function generateMetadata({ params }) {
  const { aptId } = await params;
  const aptName = decodeURIComponent(aptId);
  return {
    title: `${aptName} 실거래가 조회 | 실거래맵`,
    description: `${aptName} 최신 실거래가, 시세 추이, 평형별 거래 이력을 확인하세요.`,
  };
}

export default async function AptPage({ params }) {
  const { aptId } = await params;
  const aptName = decodeURIComponent(aptId);
  const trades  = await getAptTrades(aptName);

  return <AptDetail aptName={aptName} trades={trades} />;
}