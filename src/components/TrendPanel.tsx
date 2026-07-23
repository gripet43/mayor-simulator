import React from "react";
import { TRENDS_DATA } from "../data/trendsData";
import { GameState } from "../types/game";

interface Props {
  state: GameState;
}

export const TrendPanel: React.FC<Props> = ({ state }) => {
  const trend = TRENDS_DATA[state.currentTrend];
  if (!trend) return null;

  return (
    <div className="card" style={{
      backgroundColor: "#FEF7E6",
      borderColor: "#F6E2B3",
      padding: "12px 14px",
      marginBottom: "10px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--color-yellow)", letterSpacing: "0.5px" }}>
          📊 当前年度形势趋势
        </span>
        <span className="badge badge-yellow" style={{ fontSize: "11px" }}>
          持续4个季度
        </span>
      </div>

      <div style={{ fontSize: "15px", fontWeight: "bold", fontFamily: "var(--font-serif)", color: "var(--text-main)", marginBottom: "2px" }}>
        {trend.title}
      </div>

      <p style={{ fontSize: "12px", color: "var(--text-sub)", marginBottom: "6px" }}>
        {trend.subtitle}
      </p>

      <div style={{ fontSize: "12px", color: "#664D03", backgroundColor: "rgba(185, 132, 37, 0.1)", padding: "6px 8px", borderRadius: "4px" }}>
        <div>💡 <strong>正面提示:</strong> {trend.positivePrompt}</div>
        <div>⚠️ <strong>风险提示:</strong> {trend.riskPrompt}</div>
      </div>
    </div>
  );
};
