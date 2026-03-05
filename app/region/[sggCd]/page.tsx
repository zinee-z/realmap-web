import { getRegionStats } from "@/lib/queries";
import RegionPage from "@/components/region/RegionPage";

export async function generateMetadata({ params }: { params: Promise<{ sggCd: string }> }) {
  const { sggCd } = await params;
  return {
    title: `${sggCd} 아파트 시세 | 실거래맵`,
    description: `${sggCd} 동별 아파트 평균 실거래가, 거래량, 최고가를 확인하세요.`,
  };
}

export default async function RegionPageRoute({ params }: { params: Promise<{ sggCd: string }> }) {
  const { sggCd } = await params;
  const stats = await getRegionStats(sggCd);
  return <RegionPage sggCd={sggCd} stats={stats} />;
}
