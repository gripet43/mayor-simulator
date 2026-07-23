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
import { NavTab } from "../components/BottomNav";

interface Props {
  state: GameState;
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onSelectPolicyCard: (policy: PolicyDefinition) => void;
  onExecuteResolution: () => void;
  onUpdateState: (nextState: GameState) => void;
  onOpenHelp: () => void;
}

export const DecisionPage: React.FC<Props> = ({
  state,
  currentTab,
  onSelectTab,
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
        currentTab={currentTab}
        onSelectTab={onSelectTab}
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
              <PolicyCard key={policy.id} policy={policy} state={state} onSelect={onSelectPolicyCard} />
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
      {/* Bottom Floating Action Dock (Draft Cart) */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        backgroundColor: draft ? "#FFFDF6" : "#F4F4F5",
        borderTop: draft ? "2px solid #B98425" : "1px solid #E4E4E7",
        padding: "8px 12px calc(8px + env(safe-area-inset-bottom, 0px)) 12px",
        boxShadow: draft ? "0 -4px 16px rgba(185,132,37,0.18)" : "0 -2px 10px rgba(0,0,0,0.06)",
        zIndex: 90,
        transition: "all 0.2s ease"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <div style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle2 size={13} color={draft ? "#2E7D32" : "#8E8E93"} />
            {draftPolicy ? (
              <span
                onClick={() => onSelectPolicyCard(draftPolicy)}
                style={{ fontWeight: "bold", color: "#1C1C1E", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}
                title="点击调整运行模式与投入强度"
              >
                本季拟定: 【{draftPolicy.name}】({draft?.intensity === "pilot" ? "试点" : draft?.intensity === "intensive" ? "攻坚" : "全市推行"}) ⚙️
              </span>
            ) : (
              <span style={{ fontWeight: draft ? "bold" : "normal", color: draft ? "#1C1C1E" : "#8E8E93" }}>
                {draft?.type === "repay"
                  ? "本季拟定: 【优先偿还债务】"
                  : draft?.type === "skip"
                  ? "本季拟定: 【暂缓投资，周转财政】"
                  : "请添加要执行的草案"}
              </span>
            )}
          </div>

          {draft && (
            <button
              onClick={() => onUpdateState(setDraftAction(state, undefined))}
              style={{
                background: "none",
                border: "none",
                fontSize: "11px",
                color: "#C62828",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                padding: "2px 6px",
                borderRadius: "3px",
                backgroundColor: "#FDE8E7"
              }}
            >
              <RotateCcw size={10} /> 撤回草案
            </button>
          )}
        </div>

        <button
          className="btn"
          disabled={!draft}
          style={{
            width: "100%",
            height: "42px",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            backgroundColor: draft ? "#B98425" : "#A1A1AA",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            boxShadow: draft ? "0 2px 10px rgba(185,132,37,0.35)" : "none",
            transition: "all 0.2s ease",
            cursor: draft ? "pointer" : "not-allowed",
            opacity: draft ? 1 : 0.7
          }}
          onClick={draft ? onExecuteResolution : undefined}
        >
          <span>{draft ? "提交本季方案" : "请添加要执行的草案"}</span>
          <ArrowRight size={16} color={draft ? "#FFF" : "rgba(255,255,255,0.6)"} />
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
