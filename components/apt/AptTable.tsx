"use client";
import { useState } from "react";
import { Trade } from "@/types";
import { colors, radius } from "@/styles/tokens";
import { formatPrice, formatDate, tradeTypeLabel, buyerTypeLabel } from "./utils";

export default function AptTable({ trades }: { trades: Trade[] }) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div style={{
      background: colors.bg.secondary, border: `1px solid ${colors.border.default}`,
      borderRadius: radius.lg, overflow: "hidden",
    }}>
      <div style={{ padding: "20px 20px 12px", fontSize: 13, fontWeight: 600 }}>
        실거래 이력 ({trades.length}건)
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderTop: `1px solid ${colors.border.default}`, borderBottom: `1px solid ${colors.border.default}` }}>
            {["거래일", "면적", "층", "거래가", "거래유형", "매수자"].map(h => (
              <th key={h} style={{
                padding: "10px 16px",
                textAlign: h === "거래가" ? "right" : "left",
                color: colors.text.secondary, fontWeight: 500, fontSize: 12,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...trades].reverse().slice(0, 50).map((t, i) => (
            <tr key={i}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                borderBottom: `1px solid ${colors.border.default}`,
                background: hoveredRow === i ? colors.bg.hover : "transparent",
                transition: "background 0.1s",
              }}>
              <td style={{ padding: "12px 16px", color: colors.text.secondary }}>{formatDate(t.contract_yyyymmdd)}</td>
              <td style={{ padding: "12px 16px" }}>{Math.round(t.area)}㎡</td>
              <td style={{ padding: "12px 16px", color: colors.text.secondary }}>{t.floor}층</td>
              <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: colors.text.accent }}>
                {formatPrice(t.price_man)}
              </td>
              <td style={{ padding: "12px 16px" }}>
                <span style={{
                  background: t.trade_type === 0 ? "rgba(63,185,80,0.1)" : "rgba(88,166,255,0.1)",
                  color: t.trade_type === 0 ? colors.status.up : colors.text.accent,
                  borderRadius: 4, padding: "2px 6px", fontSize: 11,
                }}>
                  {tradeTypeLabel(t.trade_type)}
                </span>
              </td>
              <td style={{ padding: "12px 16px", color: colors.text.secondary, fontSize: 12 }}>
                {buyerTypeLabel(t.buyer_type)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
