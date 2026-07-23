import React, { useState, useEffect } from "react";
import { GameState, PolicyDefinition } from "../types/game";
import { HeaderStatus } from "../components/HeaderStatus";
import { MetricGrid } from "../components/MetricGrid";
import { MarqueeNewsTicker } from "../components/MarqueeNewsTicker";
import { OpportunityEntryCard } from "../components/OpportunityEntryCard";
import { PolicyCard } from "../components/PolicyCard";
import { DebtManagementSheet } from "../components/DebtManagementSheet";
import { POLICIES_DATA } from "../data/policiesData";
import { calculateRecurringBalance } from "../engine/finance";
import { setDraftAction } from "../engine/gameEngine";
import { HardHat, CheckCircle2, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";

interface Props {
  state: GameState;
  onSelectPolicyCard: (policy: PolicyDefinition) => void;
  onExecuteResolution: () => void;
  onUpdateState: (nextState: GameState) => void;
  onOpenHelp: () => void;
}

export const DecisionPage: React.FC<Props> = ({
  state,
  onSelectPolicyCard,
  onExecuteResolution,
  onUpdateState,
  onOpenHelp
}) => {
  const [showDebtSheet, setShowDebtSheet] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const pageEls = document.querySelectorAll(".page-content, .app-container, div[style*='overflow']");
    pageEls.forEach((el) => {
      el.scrollTop = 0;
    });
  }, [state.quarter]);

  const candidateDefs = state.candidatePolicies
    .map((id) => POLICIES_DATA.find((p) => p.id === id))
    .filter(Boolean) as PolicyDefinition[];

  const recBalance = calculateRecurringBalance(state);

  const draft = state.draftAction;
  const draftPolicy = draft?.type === "policy" && draft.policyId ? POLICIES_DATA.find(p => p.id === draft.policyId) : null;

  const handleSelectPolicyAsDraft = (policy: PolicyDefinition) => {
    if (draft?.type === "policy" && draft.policyId === policy.id) {
      // Toggle off draft if clicked again
      onUpdateState(setDraftAction(state, undefined));
    } else {
      onUpdateState(setDraftAction(state, { type: "policy", policyId: policy.id }));
    }
  };

  const handleSelectSkipDraft = (prioritizeRepay: boolean) => {
    onUpdateState(setDraftAction(state, { type: prioritizeRepay ? "repay" : "skip" }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Top Header with Debt Management Entry */}
      <HeaderStatus
        state={state}
        onOpenHelp={onOpenHelp}
        onOpenDebtManagement={() => setShowDebtSheet(true)}
      />

      <div
        className="page-content"
        style={{
          padding: "8px 10px",
          paddingBottom: "calc(var(--nav-height) + env(safe-area-inset-bottom, 16px) + 120px)"
        }}
      >
        {/* Compact Metric Strip */}
        <MetricGrid state={state} compact={true} />

        {/* Marquee News Ticker Component */}
        <MarqueeNewsTicker state={state} />

        {/* New Energy Opportunity Entry Card (Q2+) */}
        <OpportunityEntryCard state={state} onUpdateState={onUpdateState} />

        {/* Active Construction Projects Bar (if any) */}
        {state.activeProjects.length > 0 && (
          <div style={{
            backgroundColor: "#FAF9F5",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "4px 8px",
            marginBottom: "6px",
            fontSize: "11px"
          }}>
            <div style={{ fontWeight: "bold", color: "var(--text-sub)", marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
              <HardHat size={12} /> 在建项目 ({state.activeProjects.length}/3)
            </div>
            {state.activeProjects.map((p) => {
              const progressPct = Math.round(((p.stageIndex + 1) / p.totalDuration) * 100);
              return (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", margin: "1px 0" }}>
                  <span>• <strong>{p.name}</strong> ({p.status === "halted" ? "⚠️ 因负债红线停工" : `${progressPct}%`})</span>
                  <span className={`badge ${p.status === "halted" ? "badge-red" : "badge-yellow"}`} style={{ fontSize: "9px", padding: "1px 3px" }}>
                    {p.status === "halted" ? "待资金恢复" : `还需 ${p.remainingDuration} 季`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Policy Candidate Cards Section */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "4px", fontFamily: "var(--font-serif)" }}>
            本季度政策提案 (选择拟定一项草案)
          </div>

          {candidateDefs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-sub)", padding: "14px" }}>
              本季度暂无合适投资政策，请拟定暂缓本季度草案。
            </div>
          ) : (
            candidateDefs.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} state={state} onSelect={handleSelectPolicyAsDraft} />
            ))
          )}
        </div>

        {/* Permanent Skip Investment Card */}
        <div className="card" style={{
          padding: "10px",
          backgroundColor: draft?.type === "skip" || draft?.type === "repay" ? "#F4F9F4" : "#FAF9F5",
          borderColor: draft?.type === "skip" || draft?.type === "repay" ? "#2E7D32" : "var(--border-color)",
          borderWidth: draft?.type === "skip" || draft?.type === "repay" ? "2px" : "1px",
          marginBottom: "16px"
        }}>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "2px" }}>
            休整或暂缓投资草案
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-sub)", marginBottom: "8px" }}>
            不批准新项目，保留财政用于周转或优先偿还城投债务。
          </p>

          {recBalance.isStructuralDeficit && (
            <div style={{ fontSize: "11px", color: "var(--color-red)", marginBottom: "6px" }}>
              ⚠️ 注意：受项目维护费与利息影响，暂缓后债务仍可能增加。
            </div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`btn ${draft?.type === "skip" ? "btn-secondary" : "btn-outline"}`}
              style={{
                flex: 1,
                height: "36px",
                fontSize: "12px",
                backgroundColor: draft?.type === "skip" ? "#2E7D32" : undefined,
                color: draft?.type === "skip" ? "#FFFFFF" : undefined
              }}
              onClick={() => handleSelectSkipDraft(false)}
            >
              {draft?.type === "skip" ? "已拟定: 暂缓投资 ✓" : "拟定: 暂缓投资"}
            </button>

            {state.treasury > 5 && state.debt > 0 && (
              <button
                className={`btn ${draft?.type === "repay" ? "btn-secondary" : "btn-outline"}`}
                style={{
                  flex: 1,
                  height: "36px",
                  fontSize: "12px",
                  backgroundColor: draft?.type === "repay" ? "#2E7D32" : undefined,
                  color: draft?.type === "repay" ? "#FFFFFF" : undefined
                }}
                onClick={() => handleSelectSkipDraft(true)}
              >
                {draft?.type === "repay" ? `已拟定: 优先偿债 ✓` : `拟定: 优先偿债 (${state.treasury - 5}亿)`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Turn Submission Dock (Fixed at Bottom above BottomNav) */}
      <div style={{
        position: "fixed",
        bottom: "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid var(--border-color)",
        padding: "8px 12px",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.08)",
        zIndex: 90
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-sub)", display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle2 size={12} color={draft ? "#2E7D32" : "#999999"} />
            <span>
              {draftPolicy
                ? `本季拟定: 【${draftPolicy.name}】(${draft?.intensity === "pilot" ? "试点投入" : draft?.intensity === "intensive" ? "攻坚投入" : "全市推行"})`
                : draft?.type === "repay"
                ? "本季拟定: 【休整并优先偿还债务】"
                : draft?.type === "skip"
                ? "本季拟定: 【暂缓投资，周转财政】"
                : "本季草案: 未拟定 (默认暂缓投资)"}
            </span>
          </div>

          {draft && (
            <button
              onClick={() => onUpdateState(setDraftAction(state, undefined))}
              style={{
                background: "none",
                border: "none",
                fontSize: "11px",
                color: "var(--color-red)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                padding: 0
              }}
            >
              <RotateCcw size={10} /> 撤回草案
            </button>
          )}
        </div>

        <button
          className="btn btn-primary"
          style={{
            width: "100%",
            height: "40px",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#B98425"
          }}
          onClick={onExecuteResolution}
        >
          <span>提交本季施政方案 (开启第 {state.quarter} 季结算)</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Debt Management Sheet */}
      {showDebtSheet && (
        <DebtManagementSheet
          state={state}
          onClose={() => setShowDebtSheet(false)}
          onUpdateState={(nextState) => {
            onUpdateState(nextState);
          }}
        />
      )}
    </div>
  );
};
