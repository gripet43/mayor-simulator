import React, { useState } from "react";
import { TRENDS_DATA } from "../data/trendsData";
import { GameState } from "../types/game";
import { getYearFromQuarter } from "../engine/trends";
import { getPolicyName } from "../utils/format";

interface Props {
  state: GameState;
  initialTab?: "trend" | "signal";
  onClose: () => void;
}

export const TrendSignalSheet: React.FC<Props> = ({ state, initialTab = "trend", onClose }) => {
  const [activeTab, setActiveTab] = useState<"trend" | "signal">(initialTab);

  const trend = TRENDS_DATA[state.currentTrend];
  const signal = state.currentSignal;
  const currentYear = getYearFromQuarter(state.quarter);

  const getReliabilityText = (typeStr?: string) => {
    switch (typeStr) {
      case "official": return "85%";
      case "reliable": return "75%";
      case "market": return "55%";
      case "street": return "45%";
      default: return "50%";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h2 style={{ fontSize: "18px" }}>城市情报与风向详情</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-sub)" }}
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="segmented-control" style={{ marginBottom: "12px" }}>
          <button
            className={`segmented-option ${activeTab === "trend" ? "active" : ""}`}
            onClick={() => setActiveTab("trend")}
          >
            年度形势 ({trend?.title ?? "稳定"})
          </button>
          <button
            className={`segmented-option ${activeTab === "signal" ? "active" : ""}`}
            onClick={() => setActiveTab("signal")}
          >
            本季风向 ({signal?.title ?? "平稳"})
          </button>
        </div>

        {/* Tab 1: 年度形势 */}
        {activeTab === "trend" && (
          <div className="card" style={{ padding: "12px", backgroundColor: "#FFF", marginBottom: "12px" }}>
            {trend ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span className="badge badge-yellow">年度形势</span>
                  <span style={{ fontSize: "11px", color: "var(--text-sub)" }}>
                    第 {currentYear} 年至第 {currentYear} 年末 (4个季度)
                  </span>
                </div>

                <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{trend.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "10px", lineHeight: "1.5" }}>
                  {trend.subtitle}
                </p>

                <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px dashed var(--border-color)", paddingTop: "8px" }}>
                  <div>
                    <strong style={{ color: "var(--text-main)" }}>受益与受影响政策:</strong>
                    <div style={{ color: "var(--text-sub)", marginTop: "2px" }}>{trend.affectedPolicyTypes}</div>
                  </div>

                  <div>
                    <strong style={{ color: "var(--color-green)" }}>正面影响:</strong>
                    <div style={{ color: "var(--color-green)", marginTop: "2px" }}>{trend.positivePrompt}</div>
                  </div>

                  <div>
                    <strong style={{ color: "var(--color-orange)" }}>潜在风险:</strong>
                    <div style={{ color: "var(--color-orange)", marginTop: "2px" }}>{trend.riskPrompt}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text-sub)", textAlign: "center", padding: "10px" }}>暂无年度形势数据</div>
            )}
          </div>
        )}

        {/* Tab 2: 本季风向 */}
        {activeTab === "signal" && (
          <div className="card" style={{ padding: "12px", backgroundColor: "#FFF", marginBottom: "12px" }}>
            {signal ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span className="badge badge-blue">本季风向</span>
                  <span style={{ fontSize: "11px", color: "var(--text-sub)" }}>
                    可靠度: <strong>{getReliabilityText(signal.type)}</strong>
                  </span>
                </div>

                <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{signal.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "10px", lineHeight: "1.5" }}>
                  {signal.body}
                </p>

                {signal.relatedPolicies.length > 0 && (
                  <div style={{ fontSize: "12px", color: "var(--color-blue)", backgroundColor: "#EBF3F8", padding: "6px 8px", borderRadius: "4px", marginBottom: "8px" }}>
                    <strong>可能关联政策/事件:</strong> {signal.relatedPolicies.map(getPolicyName).join("、")}
                  </div>
                )}

                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", borderTop: "1px dashed var(--border-color)", paddingTop: "6px" }}>
                  提示：这是一条前瞻风向线索，影响突发事件发生概率，不代表事件必然触发。
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text-sub)", textAlign: "center", padding: "10px" }}>本季度秩序平稳，暂无突发风向警报。</div>
            )}
          </div>
        )}

        <button className="btn btn-primary" style={{ width: "100%" }} onClick={onClose}>
          关闭详情
        </button>
      </div>
    </div>
  );
};
