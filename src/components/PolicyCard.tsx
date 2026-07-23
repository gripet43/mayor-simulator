import React from "react";
import { GameState, PolicyCategory, PolicyDefinition } from "../types/game";
import { isPolicyExecutable } from "../engine/policies";
import { computeInstallments } from "../data/policiesData";
import { getCapabilityName } from "../utils/format";
import { CheckCircle2, Zap } from "lucide-react";

interface Props {
  policy: PolicyDefinition;
  state: GameState;
  onSelect: (policy: PolicyDefinition) => void;
}

export const PolicyCard: React.FC<Props> = ({ policy, state, onSelect }) => {
  const { executable, reason } = isPolicyExecutable(state, policy);

  const installments = computeInstallments(policy.baseCost, policy.duration);
  const firstPay = installments[0] ?? policy.baseCost;

  const isDraft = state.draftAction?.type === "policy" && state.draftAction?.policyId === policy.id;

  const getCategoryLabel = (cat: PolicyCategory) => {
    switch (cat) {
      case "industry": return { label: "产业发展", badge: "badge-yellow" };
      case "public_service": return { label: "公共服务", badge: "badge-blue" };
      case "governance": return { label: "城市治理", badge: "badge-green" };
      case "risk_transition": return { label: "风险与转型", badge: "badge-red" };
    }
  };

  const catInfo = getCategoryLabel(policy.category);

  const getCapabilityBonusText = () => {
    if (!policy.stageCapabilityBoost) return null;
    const key = Object.keys(policy.stageCapabilityBoost)[0];
    return `${getCapabilityName(key)}+1`;
  };

  const capText = getCapabilityBonusText();

  return (
    <div className="card" style={{
      opacity: executable ? 1 : 0.6,
      borderColor: isDraft ? "#2E7D32" : capText ? "var(--color-yellow)" : "var(--border-color)",
      borderWidth: isDraft ? "2px" : "1px",
      backgroundColor: isDraft ? "#F4F9F4" : capText ? "#FFFDF6" : "#FFFFFF",
      padding: "8px 10px",
      margin: "0 0 8px 0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxShadow: isDraft ? "0 2px 8px rgba(46, 125, 50, 0.15)" : "none",
      transition: "all 0.2s ease"
    }}>
      <div>
        {/* Header Badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <span className={`badge ${catInfo.badge}`}>{catInfo.label}</span>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {isDraft && <span className="badge badge-green" style={{ display: "flex", alignItems: "center", gap: "2px" }}><CheckCircle2 size={10} /> 本季拟定草案</span>}
            {capText && <span className="badge badge-yellow" style={{ fontWeight: "bold" }}>{capText}</span>}
            {policy.isInstant && <span className="badge badge-green">即时生效</span>}
            {policy.isOpportunitySynergy && <span className="badge badge-yellow">专属协同</span>}
          </div>
        </div>

        {/* Policy Name */}
        <h3 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "2px", fontFamily: "var(--font-sans)" }}>
          {policy.name}
        </h3>

        {/* Cost & Duration Row */}
        <div style={{ fontSize: "12px", color: "var(--text-main)", marginBottom: "4px" }}>
          <span>总额 <strong>{policy.baseCost} 亿</strong></span>
          <span style={{ margin: "0 6px" }}>·</span>
          <span>首期 <strong>{firstPay} 亿</strong></span>
          <span style={{ margin: "0 6px" }}>·</span>
          <span>{policy.duration > 0 ? `${policy.duration} 季` : "即时"}</span>
        </div>

        {/* Description Snippet */}
        <p style={{ fontSize: "11px", color: "var(--text-sub)", lineHeight: "1.4", marginBottom: "6px" }}>
          {policy.description}
        </p>
      </div>

      {/* Action Footer */}
      <div>
        {executable ? (
          <button
            className={`btn ${isDraft ? "btn-secondary" : "btn-primary"}`}
            style={{
              width: "100%",
              height: "34px",
              fontSize: "12px",
              padding: "0",
              backgroundColor: isDraft ? "#2E7D32" : undefined,
              color: isDraft ? "#FFFFFF" : undefined
            }}
            onClick={() => onSelect(policy)}
          >
            {isDraft ? `已拟定为草案 (首期 ${firstPay} 亿) ✓` : `拟定为本季草案 (首期 ${firstPay} 亿)`}
          </button>
        ) : (
          <button className="btn btn-disabled" disabled style={{ width: "100%", height: "34px", fontSize: "11px", padding: "0" }}>
            {reason}
          </button>
        )}
      </div>
    </div>
  );
};
