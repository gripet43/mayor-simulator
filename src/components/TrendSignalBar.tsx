import React from "react";
import { TRENDS_DATA } from "../data/trendsData";
import { GameState } from "../types/game";

interface Props {
  state: GameState;
}

export const TrendSignalBar: React.FC<Props> = ({ state }) => {
  const trend = TRENDS_DATA[state.currentTrend];
  const signal = state.currentSignal;

  return (
    <div style={{
      backgroundColor: "#FEF7E6",
      border: "1px solid #F6E2B3",
      borderRadius: "var(--radius-md)",
      padding: "8px 10px",
      marginBottom: "10px",
      fontSize: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }}>
      {/* Annual Trend line */}
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="badge badge-yellow" style={{ fontSize: "10px", padding: "1px 4px" }}>年度形势</span>
          <strong style={{ color: "var(--text-main)" }}>{trend.title}:</strong>
          <span style={{ color: "var(--text-sub)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {trend.description}
          </span>
        </div>
      )}

      {/* Quarterly Signal line */}
      {signal && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="badge badge-blue" style={{ fontSize: "10px", padding: "1px 4px" }}>本季风向</span>
          <strong style={{ color: "var(--text-main)" }}>{signal.title}:</strong>
          <span style={{ color: "var(--text-sub)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {signal.body}
          </span>
        </div>
      )}
    </div>
  );
};
