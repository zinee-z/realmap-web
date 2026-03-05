import { getSidoStats } from "@/lib/queries";
import SidoPage from "@/components/region/SidoPage";

const SIDO_NAMES: Record<string, string> = {
  "11": "서울", "21": "부산", "22": "대구", "23": "인천",
  "24": "광주", "25": "대전", "26": "울산", "29": "세종",
  "31": "경기", "32": "강원", "33": "충북", "34": "충남",
  "35": "전북", "36": "전남", "37": "경북", "38": "경남", "39": "제주",
};

export async function generateMetadata({ params }: { params: Promise<{ sidoCd: string }> }) {
  const { sidoCd } = await params;
  const name = SIDO_NAMES[sidoCd] || sidoCd;
  return {
    title: `${name} 아파트 시세 | 실거래맵`,
    description: `${name} 구/군별 아파트 평균 실거래가, 거래량, 최고가를 확인하세요.`,
  };
}

export default async function SidoPageRoute({ params }: { params: Promise<{ sidoCd: string }> }) {
  const { sidoCd } = await params;
  const stats = await getSidoStats(sidoCd);
  return <SidoPage sidoCd={sidoCd} stats={stats} />;
}
