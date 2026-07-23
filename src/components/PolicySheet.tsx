import React, { useState } from "react";
import { GameState, Intensity, PolicyDefinition } from "../types/game";
import { INTENSITY_CONFIGS, previewPolicyCostAndDuration, previewPolicyEffects } from "../engine/policies";
import { calculateRecurringBalance } from "../engine/finance";
import { computeInstallments } from "../data/policiesData";
import { formatEffectsMap } from "../utils/format";

interface Props {
  policy: PolicyDefinition;
  state: GameState;
  onClose: () => void;
  onConfirmApprove: (policyId: string, intensity: Intensity) => void;
}

export const PolicySheet: React.FC<Props> = ({ policy, state, onClose, onConfirmApprove }) => {
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>("full");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const intensities: { id: Intensity; label: string }[] = [
    { id: "pilot", label: "试点" },
    { id: "full", label: "全市推行" },
    { id: "intensive", label: "攻坚投入" }
  ];

  const config = INTENSITY_CONFIGS[selectedIntensity];
  const { cost, duration, maintenance } = previewPolicyCostAndDuration(state, policy, selectedIntensity);
  const { positiveEffects, negativeEffects, notes } = previewPolicyEffects(state, policy, selectedIntensity);

  const installments = computeInstallments(cost, duration);
  const firstPay = installments[0] ?? cost;

  // Funding Breakdown for 1st installment
  const useTreasury = Math.min(firstPay, state.treasury);
  const newBorrowing = Math.max(0, firstPay - state.treasury);
  const postTreasury = Math.max(0, state.treasury - firstPay);
  const postDebt = state.debt + newBorrowing;

  const exceedsLimit = postDebt > 120;

  // Recurring balance check
  const recBalance = calculateRecurringBalance(state);

  const posFormatted = formatEffectsMap(positiveEffects);
  const negFormatted = formatEffectsMap(negativeEffects);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div>
            <h2 style={{ fontSize: "18px" }}>{policy.name}</h2>
            <span style={{ fontSize: "12px", color: "var(--text-sub)" }}>
              在建工程: {state.activeProjects.length} / 3
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-sub)" }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: "13px", color: "var(--text-sub)", marginBottom: "12px" }}>
          {policy.description}
        </p>

        {/* Segmented Control for Intensity Selection */}
        <div className="segmented-control">
          {intensities.map((item) => (
            <button
              key={item.id}
              className={`segmented-option ${selectedIntensity === item.id ? "active" : ""}`}
              onClick={() => setSelectedIntensity(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dynamic Detail & Funding Source Card */}
        <div className="card" style={{ backgroundColor: "#FFF", padding: "12px", marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "6px" }}>
            💰 资金来源与本期财务变动
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "12px", marginBottom: "8px" }}>
            <div>总投资 (分期): <strong>{cost} 亿元</strong></div>
            <div>本期首付款: <strong style={{ color: "#B98425" }}>{firstPay} 亿元</strong></div>
            <div>从财政余额支出: <strong>{useTreasury} 亿元</strong></div>
            <div style={{ color: newBorrowing > 0 ? "var(--color-red)" : "var(--color-green)", fontWeight: "bold" }}>
              需新增城投借债: {newBorrowing > 0 ? `+${newBorrowing} 亿元` : "0 亿元"}
            </div>
            <div>执行后剩余财政: <strong>{postTreasury} 亿元</strong></div>
            <div>
              执行后城投债务: <strong style={{ color: postDebt >= 100 ? "var(--color-red)" : "var(--text-main)" }}>{postDebt} / 120 亿元</strong>
            </div>
            <div>完工后维护费: <strong>+{maintenance} 亿/季</strong></div>
          </div>

          <p style={{ fontSize: "12px", color: "var(--text-sub)", marginBottom: "6px", borderTop: "1px dashed var(--border-color)", paddingTop: "6px" }}>
            {config.description}
          </p>

          <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "3px" }}>
            {posFormatted.length > 0 && (
              <div style={{ color: "var(--color-green)" }}>
                🟢 预计收益: {posFormatted.join("、")}
              </div>
            )}
            {negFormatted.length > 0 && (
              <div style={{ color: "var(--color-red)" }}>
                ⚠️ 副作用/代价: {negFormatted.join("、")}
              </div>
            )}
          </div>

          {notes.length > 0 && (
            <div style={{ fontSize: "11px", color: "#664D03", backgroundColor: "#FEF7E6", padding: "6px", borderRadius: "4px", marginTop: "8px" }}>
              {notes.map((n, idx) => <div key={idx}>✨ {n}</div>)}
            </div>
          )}
        </div>

        {/* Warning if structural deficit will cause debt overflow in ~2 quarters */}
        {!exceedsLimit && recBalance.recurringBalance < 0 && postDebt + Math.abs(recBalance.recurringBalance) * 2 >= 120 && (
          <div style={{ fontSize: "11px", color: "var(--color-red)", backgroundColor: "#FDE8E7", padding: "6px 8px", borderRadius: "4px", marginBottom: "10px" }}>
            ⚠️ 风险预警：按照当前经常性赤字结构，预计 2 个季度后将触发财政托管红线。
          </div>
        )}

        {/* Single Main Action Button with Dynamic Label */}
        {exceedsLimit ? (
          <button className="btn btn-disabled" disabled style={{ width: "100%", height: "46px", fontSize: "13px" }}>
            无法批准：执行后债务将达到 {postDebt} 亿，超过财政托管线
          </button>
        ) : (
          <button
            className="btn btn-primary"
            style={{ width: "100%", height: "46px", fontSize: "15px" }}
            onClick={() => setShowConfirm(true)}
          >
            {newBorrowing > 0 ? `批准方案 · 新增借债 ${newBorrowing} 亿` : "批准方案 · 无需借债"}
          </button>
        )}

        {/* Secondary Confirmation Modal */}
        {showConfirm && (
          <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
            <div className="modal-center" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: "8px" }}>确认批准政策</h3>
              <p style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "14px", lineHeight: "1.6" }}>
                确定批准“<strong>{policy.name}</strong>”并采用“<strong>{config.label}</strong>”方案吗？
                <br /><br />
                本期首付款将从财政余额支出 <strong>{useTreasury} 亿元</strong>
                {newBorrowing > 0 ? `，并产生 **${newBorrowing} 亿元** 新增城投借债` : "，无需新增借债"}。
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>
                  取消
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setShowConfirm(false);
                    onConfirmApprove(policy.id, selectedIntensity);
                  }}
                >
                  批准执行
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
