import React, { useState } from "react";
import { GameState } from "../types/game";
import { formatMetricDelta } from "../utils/format";

interface Props {
  state: GameState;
  compact?: boolean;
}

export const MetricGrid: React.FC<Props> = ({ state, compact = true }) => {
  const [activeDesc, setActiveDesc] = useState<{ title: string; text: string } | null>(null);

  const prevSummary = state.quarterHistory.length > 0 ? state.quarterHistory[state.quarterHistory.length - 1] : null;

  const items = [
    {
      id: "economy",
      name: "经济",
      value: state.economy,
      color: "var(--color-green)",
      desc: "反映产业产值、商业活力与就业实力。经济越高，季度税收收入越高。",
      diff: prevSummary ? prevSummary.metricChanges.economy : undefined
    },
    {
      id: "livelihood",
      name: "民生",
      value: state.livelihood,
      color: "var(--color-blue)",
      desc: "反映教育、医疗、住房与交通等公共服务保障水平。",
      diff: prevSummary ? prevSummary.metricChanges.livelihood : undefined
    },
    {
      id: "environment",
      name: "环境",
      value: state.environment,
      color: "var(--color-cyan)",
      desc: "反映空气、水质与生态承载力。影响文旅收益与污染突发事件风险。",
      diff: prevSummary ? prevSummary.metricChanges.environment : undefined
    },
    {
      id: "morale",
      name: "民心",
      value: state.morale,
      color: state.morale < 20 ? "var(--color-red)" : "var(--text-main)", // Red ONLY when in crisis <20!
      desc: "反映市民对城市治理的满意度。连续两个季度低于10直接触发黯然离任结局。",
      diff: prevSummary ? prevSummary.metricChanges.morale : undefined
    }
  ];

  const renderDiff = (diff?: number) => {
    if (diff === undefined || diff === 0) return null;
    if (diff > 0) return <span style={{ color: "var(--color-green)", fontSize: "11px", fontWeight: "bold" }}>+{diff}</span>;
    return <span style={{ color: "var(--color-red)", fontSize: "11px", fontWeight: "bold" }}>{diff}</span>;
  };

  return (
    <div style={{ marginBottom: "8px" }}>
      {/* Compact 4-metric strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "6px",
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "6px 8px"
      }}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveDesc({ title: item.name, text: item.desc })}
            style={{
              textAlign: "center",
              cursor: "pointer",
              padding: "2px"
            }}
          >
            <div style={{ fontSize: "11px", color: "var(--text-sub)", fontWeight: "500" }}>
              {item.name}
            </div>
            <div style={{ fontSize: "16px", fontWeight: "900", fontFamily: "var(--font-serif)", color: item.color }}>
              {item.value}
            </div>
            {renderDiff(item.diff)}
          </div>
        ))}
      </div>

      {/* Description Modal */}
      {activeDesc && (
        <div className="modal-overlay" onClick={() => setActiveDesc(null)}>
          <div className="modal-center" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "8px" }}>{activeDesc.title}</h3>
            <p style={{ color: "var(--text-sub)", marginBottom: "16px" }}>{activeDesc.text}</p>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setActiveDesc(null)}>
              明白
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
