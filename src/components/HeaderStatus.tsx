import React from "react";
import { GameState } from "../types/game";
import { getQuarterInYear, getYearFromQuarter } from "../engine/trends";
import { HelpCircle, ChevronRight } from "lucide-react";

interface Props {
  state: GameState;
  onOpenHelp?: () => void;
  onOpenDebtManagement?: () => void;
}

export const HeaderStatus: React.FC<Props> = ({ state, onOpenHelp, onOpenDebtManagement }) => {
  const year = getYearFromQuarter(state.quarter);
  const qInYear = getQuarterInYear(state.quarter);

  const getDebtBadge = () => {
    if (state.debt >= 100) return <span className="badge badge-red" style={{ fontSize: "10px", padding: "1px 4px" }}>危险</span>;
    if (state.debt >= 80) return <span className="badge badge-yellow" style={{ fontSize: "10px", padding: "1px 4px" }}>偏高</span>;
    return null;
  };

  return (
    <header style={{
      backgroundColor: "#242424",
      color: "#F4F3EF",
      padding: "6px 12px",
      borderBottom: "2px solid #B7352C",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      zIndex: 10
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Left Quarter Progress */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", fontFamily: "var(--font-serif)" }}>
            第 {state.quarter} / 20 季度
          </span>
          <span style={{ fontSize: "11px", color: "#A8A59C" }}>
            · 第 {year} 年第 {qInYear} 季度
          </span>
        </div>

        {/* Right Financial & Debt Entry */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ fontSize: "12px" }}>
            <span style={{ color: "#A8A59C" }}>财政: </span>
            <strong style={{ color: "#B98425" }}>{state.treasury}亿</strong>
          </div>

          {/* Interactive Debt Entry */}
          <div
            onClick={onOpenDebtManagement}
            style={{
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "2px",
              backgroundColor: "rgba(255,255,255,0.08)",
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid rgba(255,255,255,0.15)"
            }}
            title="点击管理与主动偿还债务"
          >
            <span style={{ color: "#A8A59C" }}>债务: </span>
            <strong style={{
              color: state.debt >= 100 ? "#B7352C" : state.debt >= 80 ? "#B98425" : "#D8D5CE"
            }}>
              {state.debt}/120亿
            </strong>
            {getDebtBadge()}
            <ChevronRight size={14} color="#A8A59C" />
          </div>

          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              style={{
                background: "transparent",
                border: "none",
                color: "#A8A59C",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "2px"
              }}
              title="查看规则"
            >
              <HelpCircle size={16} />
            </button>
          )}
        </div>
      </div>

      {(state.debt >= 100 || state.morale < 10) && (
        <div style={{
          marginTop: "3px",
          backgroundColor: "#B7352C",
          color: "#FFF",
          fontSize: "11px",
          padding: "1px 6px",
          borderRadius: "3px",
          textAlign: "center",
          fontWeight: "bold"
        }}>
          {state.debt >= 100 && "债务达到危险红线！"} {state.morale < 10 && "民心低迷连续告警！"}
        </div>
      )}
    </header>
  );
};
