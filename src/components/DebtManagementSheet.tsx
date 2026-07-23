import React, { useState } from "react";
import { GameState } from "../types/game";
import { calculateDebtInterest, calculateRecurringBalance, getDebtInterestRate, repayDebtAction } from "../engine/finance";
import { Coins, AlertOctagon, ArrowRight, ShieldAlert } from "lucide-react";

interface Props {
  state: GameState;
  onClose: () => void;
  onUpdateState: (nextState: GameState) => void;
}

export const DebtManagementSheet: React.FC<Props> = ({ state, onClose, onUpdateState }) => {
  const [customRepayInput, setCustomRepayInput] = useState<string>("");
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [pendingRepayAmount, setPendingRepayAmount] = useState<number | null>(null);

  const ratePercent = Math.round(getDebtInterestRate(state.debt) * 100);
  const nextInterest = calculateDebtInterest(state.debt);
  const recBalance = calculateRecurringBalance(state);

  const openingDebt = state.openingDebtThisQuarter ?? state.debt;
  const policyBorrowing = state.policyBorrowingThisQuarter ?? 0;
  const eventBorrowing = state.eventBorrowingThisQuarter ?? 0;
  const voluntaryRepayment = state.voluntaryRepaymentThisQuarter ?? 0;
  const deficitBorrowing = recBalance.recurringBalance < 0 ? Math.abs(recBalance.recurringBalance) : 0;
  const projectedEndingDebt = Math.max(0, openingDebt + policyBorrowing + deficitBorrowing + eventBorrowing - voluntaryRepayment);

  // Compute "Repay to Next Interest Tier" target amount
  let tierTargetAmount = 0;
  if (state.debt >= 90) {
    tierTargetAmount = state.debt - 89; // Repay down to 89 (3%)
  } else if (state.debt >= 60) {
    tierTargetAmount = state.debt - 59; // Repay down to 59 (2%)
  } else {
    tierTargetAmount = state.debt;
  }
  const tierRepayAmount = Math.min(tierTargetAmount, state.treasury, state.debt);

  const handleConfirmRepay = (amount: number) => {
    const nextState = repayDebtAction(state, amount);
    onUpdateState(nextState);
    setPendingRepayAmount(null);
    setShowCustomModal(false);
  };

  const handleCustomSubmit = () => {
    const parsed = parseInt(customRepayInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      const validAmount = Math.min(parsed, state.treasury, state.debt);
      setPendingRepayAmount(validAmount);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drag Handle Bar */}
        <div style={{
          width: "36px",
          height: "4px",
          backgroundColor: "#D1D1D6",
          borderRadius: "2px",
          margin: "0 auto 10px auto",
          flexShrink: 0
        }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <span className="badge badge-yellow" style={{ marginBottom: "2px", display: "inline-block" }}>城市债务管理与偿还</span>
            <h2 style={{ fontSize: "18px", lineHeight: "1.3" }}>城市债务账本</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#E5E5EA",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              color: "#636366",
              marginLeft: "12px",
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* Debt Overview Card */}
        <div className="card" style={{ padding: "12px", backgroundColor: "#FFF", marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>当前债务</span>
            <span style={{
              fontSize: "20px",
              fontWeight: "900",
              fontFamily: "var(--font-serif)",
              color: state.debt >= 100 ? "var(--color-red)" : state.debt >= 80 ? "var(--color-yellow)" : "var(--text-main)"
            }}>
              {state.debt} <span style={{ fontSize: "12px", fontWeight: "normal" }}>/ 120 亿元</span>
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px" }}>
            <div>当前适用利率: <strong>{ratePercent}%</strong></div>
            <div>下季度预计利息: <strong>{nextInterest} 亿元</strong></div>
            <div>可用财政余额: <strong style={{ color: "#B98425" }}>{state.treasury} 亿元</strong></div>
            <div>
              经常性结余:{" "}
              <span className={`badge ${recBalance.statusBadgeClass}`}>
                {recBalance.recurringBalance >= 0 ? `+${recBalance.recurringBalance}` : recBalance.recurringBalance} 亿 ({recBalance.statusText})
              </span>
            </div>
          </div>

          {recBalance.isStructuralDeficit && (
            <div style={{ fontSize: "11px", color: "var(--color-red)", backgroundColor: "#FDE8E7", padding: "6px", borderRadius: "4px", marginTop: "8px" }}>
              ⚠️ 结构性赤字预警：即使本季度不批准新政策，债务仍将继续增加！
            </div>
          )}
        </div>

        {/* Quarterly Debt Breakdown Table */}
        <div className="card" style={{ padding: "10px 12px", backgroundColor: "#FAF9F5", marginBottom: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "6px" }}>
            本季度债务变化预测明细
          </div>
          <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "3px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>期初债务:</span>
              <span>{openingDebt} 亿元</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: policyBorrowing > 0 ? "var(--color-red)" : "var(--text-sub)" }}>
              <span>政策资金缺口 (借贷):</span>
              <span>+{policyBorrowing} 亿元</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: deficitBorrowing > 0 ? "var(--color-red)" : "var(--text-sub)" }}>
              <span>经常性财政缺口:</span>
              <span>+{deficitBorrowing} 亿元</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: eventBorrowing > 0 ? "var(--color-red)" : "var(--text-sub)" }}>
              <span>事件融资借款:</span>
              <span>+{eventBorrowing} 亿元</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: voluntaryRepayment > 0 ? "var(--color-green)" : "var(--text-sub)" }}>
              <span>本季主动偿还:</span>
              <span>-{voluntaryRepayment} 亿元</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderTop: "1px dashed var(--border-color)", paddingTop: "4px", marginTop: "2px" }}>
              <span>预计期末债务:</span>
              <span>{projectedEndingDebt} 亿元</span>
            </div>
          </div>
        </div>

        {/* Active Debt Repayment Actions */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "6px", fontFamily: "var(--font-serif)" }}>
            💸 主动偿还债务 (不消耗政策审批名额)
          </div>

          {state.treasury <= 0 || state.debt <= 0 ? (
            <div style={{ fontSize: "12px", color: "var(--text-sub)", textAlign: "center", padding: "10px", backgroundColor: "#FFF", borderRadius: "6px" }}>
              {state.debt <= 0 ? "城市目前没有债务，无需偿还。" : "可用财政资金不足，无法进行主动偿债。"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                <button
                  className="btn btn-secondary"
                  disabled={state.treasury < 1 || state.debt < 1}
                  onClick={() => setPendingRepayAmount(Math.min(1, state.treasury, state.debt))}
                  style={{ fontSize: "12px", padding: "6px" }}
                >
                  偿还 1 亿
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={state.treasury < 3 || state.debt < 3}
                  onClick={() => setPendingRepayAmount(Math.min(3, state.treasury, state.debt))}
                  style={{ fontSize: "12px", padding: "6px" }}
                >
                  偿还 3 亿
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCustomModal(true)}
                  style={{ fontSize: "12px", padding: "6px" }}
                >
                  自定义金额
                </button>
              </div>

              {tierRepayAmount > 0 && tierRepayAmount !== 1 && tierRepayAmount !== 3 && (
                <button
                  className="btn btn-outline"
                  onClick={() => setPendingRepayAmount(tierRepayAmount)}
                  style={{ width: "100%", height: "36px", fontSize: "12px" }}
                >
                  偿还至下一利率档 ({tierRepayAmount} 亿)
                </button>
              )}

              {state.treasury > 0 && state.debt > 0 && (
                <button
                  className="btn btn-outline"
                  onClick={() => setPendingRepayAmount(Math.min(state.treasury, state.debt))}
                  style={{ width: "100%", height: "36px", fontSize: "12px" }}
                >
                  投入全部可用财政 ({Math.min(state.treasury, state.debt)} 亿)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Repayment Confirmation Modal */}
        {pendingRepayAmount && (
          <div className="modal-overlay" onClick={() => setPendingRepayAmount(null)}>
            <div className="modal-center" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: "8px" }}>确认主动偿还债务</h3>
              <p style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "12px", lineHeight: "1.6" }}>
                确定从财政拨付 <strong>{pendingRepayAmount} 亿元</strong> 偿还城市债务吗？
              </p>

              <div style={{ backgroundColor: "#FAF9F5", padding: "10px", borderRadius: "6px", fontSize: "12px", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div>财政: {state.treasury}亿 &rarr; <strong>{state.treasury - pendingRepayAmount}亿</strong></div>
                <div>债务: {state.debt}亿 &rarr; <strong>{state.debt - pendingRepayAmount}亿</strong></div>
                <div>下季度预计利息: <strong>{calculateDebtInterest(state.debt - pendingRepayAmount)} 亿元</strong></div>
              </div>

              {state.treasury - pendingRepayAmount === 0 && (
                <div style={{ fontSize: "11px", color: "var(--color-orange)", marginBottom: "14px" }}>
                  ⚠️ 偿债后将没有可用财政余额。继续批准新政策可能重新产生借款。
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPendingRepayAmount(null)}>
                  取消
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleConfirmRepay(pendingRepayAmount)}>
                  确认偿债
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Amount Modal */}
        {showCustomModal && (
          <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
            <div className="modal-center" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: "8px" }}>输入偿还金额</h3>
              <p style={{ fontSize: "12px", color: "var(--text-sub)", marginBottom: "12px" }}>
                请输入希望偿还的整数亿元金额 (最多 {Math.min(state.treasury, state.debt)} 亿):
              </p>
              <input
                type="number"
                min="1"
                max={Math.min(state.treasury, state.debt)}
                value={customRepayInput}
                onChange={(e) => setCustomRepayInput(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 10px",
                  fontSize: "16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  marginBottom: "14px"
                }}
                placeholder="例如: 5"
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCustomModal(false)}>
                  取消
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCustomSubmit}>
                  下一步
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
