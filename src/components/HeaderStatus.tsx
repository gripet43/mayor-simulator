import React from "react";
import { GameState } from "../types/game";
import { HelpCircle, ChevronRight, FileText, Building2, Newspaper } from "lucide-react";
import { NavTab } from "./BottomNav";

interface Props {
  state: GameState;
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onOpenHelp?: () => void;
  onOpenDebtManagement?: () => void;
}

export const HeaderStatus: React.FC<Props> = ({
  state,
  currentTab = "decision",
  onSelectTab,
  onOpenHelp,
  onOpenDebtManagement
}) => {
  const getDebtBadge = () => {
    if (state.debt >= 100) return <span className="badge badge-red" style={{ fontSize: "9px", padding: "0 3px" }}>红线</span>;
    if (state.debt >= 80) return <span className="badge badge-yellow" style={{ fontSize: "9px", padding: "0 3px" }}>偏高</span>;
    return null;
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "decision", label: "决策", icon: <FileText size={13} /> },
    { id: "city", label: "城市", icon: <Building2 size={13} /> },
    { id: "chronicle", label: "纪事", icon: <Newspaper size={13} /> }
  ];

  return (
    <header style={{
      backgroundColor: "#1E1E1E",
      color: "#F4F3EF",
      padding: "6px 10px",
      borderBottom: "2px solid #B7352C",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      zIndex: 10,
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Left Quarter Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            backgroundColor: "#2C2C2E",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            color: "#D8D5CE",
            border: "1px solid #3A3A3C",
            fontFamily: "var(--font-serif)"
          }}>
            Q{state.quarter} <span style={{ fontSize: "10px", color: "#8E8E93", fontWeight: "normal" }}>/ 20</span>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        {onSelectTab && (
          <div style={{
            display: "flex",
            backgroundColor: "#2C2C2E",
            borderRadius: "6px",
            padding: "2px",
            gap: "2px",
            border: "1px solid #3A3A3C"
          }}>
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "none",
                    background: isActive ? "#B7352C" : "transparent",
                    color: isActive ? "#FFFFFF" : "#A8A59C",
                    fontSize: "11px",
                    fontWeight: isActive ? "bold" : "normal",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right Financial Metrics & Help */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "11px" }}>
            <span style={{ color: "#8E8E93" }}>财:</span>
            <strong style={{ color: "#B98425", marginLeft: "2px" }}>{state.treasury}亿</strong>
          </div>

          <div
            onClick={onOpenDebtManagement}
            style={{
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "2px",
              backgroundColor: "rgba(255,255,255,0.06)",
              padding: "2px 5px",
              borderRadius: "4px",
              border: "1px solid rgba(255,255,255,0.12)"
            }}
            title="点击管理债务"
          >
            <span style={{ color: "#8E8E93" }}>债:</span>
            <strong style={{
              color: state.debt >= 100 ? "#B7352C" : state.debt >= 80 ? "#B98425" : "#D8D5CE"
            }}>
              {state.debt}/120
            </strong>
            {getDebtBadge()}
            <ChevronRight size={12} color="#8E8E93" />
          </div>

          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              style={{
                background: "transparent",
                border: "none",
                color: "#8E8E93",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "2px"
              }}
              title="帮助"
            >
              <HelpCircle size={15} />
            </button>
          )}
        </div>
      </div>

      {(state.debt >= 100 || state.morale < 10) && (
        <div style={{
          backgroundColor: "#B7352C",
          color: "#FFF",
          fontSize: "10px",
          padding: "1px 6px",
          borderRadius: "3px",
          textAlign: "center",
          fontWeight: "bold"
        }}>
          {state.debt >= 100 && "债务达红线！"} {state.morale < 10 && "民心低迷告警！"}
        </div>
      )}
    </header>
  );
};
