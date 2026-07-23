import React, { useState } from "react";
import { GameState, PolicyDefinition } from "../types/game";
import { HeaderStatus } from "../components/HeaderStatus";
import { MetricGrid } from "../components/MetricGrid";
import { MarqueeNewsTicker } from "../components/MarqueeNewsTicker";
import { OpportunityEntryCard } from "../components/OpportunityEntryCard";
import { PolicyCard } from "../components/PolicyCard";
import { DebtManagementSheet } from "../components/DebtManagementSheet";
import { POLICIES_DATA } from "../data/policiesData";
import { calculateRecurringBalance } from "../engine/finance";
import { HardHat } from "lucide-react";

interface Props {
  state: GameState;
  onSelectPolicyCard: (policy: PolicyDefinition) => void;
  onSkipQuarter: (prioritizeRepay?: boolean) => void;
  onUpdateState: (nextState: GameState) => void;
  onOpenHelp: () => void;
}

export const DecisionPage: React.FC<Props> = ({ state, onSelectPolicyCard, onSkipQuarter, onUpdateState, onOpenHelp }) => {
  const [showDebtSheet, setShowDebtSheet] = useState<boolean>(false);

  const candidateDefs = state.candidatePolicies
    .map((id) => POLICIES_DATA.find((p) => p.id === id))
    .filter(Boolean) as PolicyDefinition[];

  const recBalance = calculateRecurringBalance(state);

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
          paddingBottom: "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 60px)"
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
            本季度政策提案 (选择审批一项)
          </div>

          {candidateDefs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-sub)", padding: "14px" }}>
              本季度暂无合适投资政策，请选择暂缓本季度。
            </div>
          ) : (
            candidateDefs.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} state={state} onSelect={onSelectPolicyCard} />
            ))
          )}
        </div>

        {/* Permanent Skip Investment Card */}
        <div className="card" style={{ padding: "10px", backgroundColor: "#FAF9F5", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "2px" }}>
            暂缓本季度投资
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-sub)", marginBottom: "8px" }}>
            不批准新项目，保留财政用于周转或偿还城投债务。
          </p>

          {recBalance.isStructuralDeficit && (
            <div style={{ fontSize: "11px", color: "var(--color-red)", marginBottom: "6px" }}>
              ⚠️ 注意：受项目维护费与利息影响，暂缓后债务仍可能增加。
            </div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, height: "36px", fontSize: "12px" }}
              onClick={() => onSkipQuarter(false)}
            >
              暂缓投资，进入结算
            </button>

            {state.treasury > 5 && state.debt > 0 && (
              <button
                className="btn btn-outline"
                style={{ flex: 1, height: "36px", fontSize: "12px" }}
                onClick={() => onSkipQuarter(true)}
              >
                休整并优先偿债 ({state.treasury - 5}亿)
              </button>
            )}
          </div>
        </div>
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
