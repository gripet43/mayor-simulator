import React, { useState } from "react";
import { GameState } from "../types/game";
import { calculateOpportunityScore, evaluateShortfalls, getMajorOpportunityDefinition } from "../engine/cityOpportunity";
import { MAJOR_OPPORTUNITIES_DATA } from "../data/majorOpportunitiesData";
import { OpportunityDetailSheet } from "./OpportunityDetailSheet";
import { Zap, AlertCircle, Calendar } from "lucide-react";

interface Props {
  state: GameState;
  onUpdateState: (nextState: GameState) => void;
}

export const OpportunityEntryCard: React.FC<Props> = ({ state, onUpdateState }) => {
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const activeOppId = state.activeMajorOpportunityId ?? "new_energy_base";
  const oppState = state.opportunityStates?.[activeOppId] ?? state.cityOpportunityState;

  if (!oppState || state.quarter < oppState.startQuarter) return null;

  const oppDef = getMajorOpportunityDefinition(activeOppId);
  const caps = state.capabilities ?? {};
  const baseFit = state.opportunityBaseFits?.[activeOppId] ?? state.baseFit ?? 30;

  const scoreInfo = calculateOpportunityScore(baseFit, caps, oppState.selectedBidTier ?? "none", oppDef);
  const shortfalls = evaluateShortfalls(caps, oppDef);

  const quartersRemaining = Math.max(0, oppState.settleQuarter - state.quarter);

  // Find next unstarted opportunity preview
  const nextOppId = (state.followUpOpportunityOrder ?? []).find(
    (id) => !state.opportunityStates[id] || (state.opportunityStates[id].status !== "settled" && id !== activeOppId)
  );

  const nextOppDef = nextOppId ? MAJOR_OPPORTUNITIES_DATA[nextOppId] : null;

  return (
    <>
      <div
        className="card"
        onClick={() => setShowDetail(true)}
        style={{
          backgroundColor: "#FFFDF6",
          borderColor: "#F6E2B3",
          padding: "10px 12px",
          marginBottom: "8px",
          cursor: "pointer"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Zap size={14} color="#B98425" />
            <strong style={{ fontSize: "13px", color: "var(--text-main)", fontFamily: "var(--font-serif)" }}>
              {oppDef.name}
            </strong>
          </div>

          <span className={`badge ${oppState.status === "settled" ? "badge-green" : "badge-yellow"}`} style={{ fontSize: "10px" }}>
            {oppState.status === "settled"
              ? "竞逐已落幕"
              : state.quarter === oppState.settleQuarter
              ? `第 ${state.quarter} 季 · 终极申报中`
              : `还剩 ${quartersRemaining} 季申报`}
          </span>
        </div>

        {/* Competitiveness Info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-sub)" }}>
            {oppState.hasResearched ? "精确评估竞争力:" : "预估竞争力范围:"}
          </span>
          <span style={{ fontSize: "18px", fontWeight: "900", color: "#B98425", fontFamily: "var(--font-serif)" }}>
            {oppState.hasResearched
              ? `${scoreInfo.baseCompetitiveness} 分`
              : `${scoreInfo.baseCompetitiveness - 4} — ${scoreInfo.baseCompetitiveness + 4} 分`}
          </span>
        </div>

        {/* 4 Capabilities Grid */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${oppDef.coreCapabilityKeys.length + 1}, 1fr)`, gap: "4px", textAlign: "center", fontSize: "10px", marginBottom: "6px" }}>
          {oppDef.coreCapabilityKeys.map((k) => (
            <div key={k} style={{ backgroundColor: "#FEF7E6", padding: "3px 2px", borderRadius: "3px" }}>
              <div style={{ color: "var(--text-sub)" }}>{oppDef.capabilityNames[k] ?? k}</div>
              <strong style={{ fontSize: "12px", color: "var(--text-main)" }}>{caps[k] ?? 0}</strong>
            </div>
          ))}
          <div style={{ backgroundColor: "#FEF7E6", padding: "3px 2px", borderRadius: "3px" }}>
            <div style={{ color: "var(--text-sub)" }}>{oppDef.capabilityNames[oppDef.auxiliaryCapabilityKey] ?? oppDef.auxiliaryCapabilityKey}</div>
            <strong style={{ fontSize: "12px", color: "var(--text-main)" }}>{caps[oppDef.auxiliaryCapabilityKey] ?? 0}</strong>
          </div>
        </div>

        {/* Shortfalls Prompt */}
        {shortfalls.length > 0 && oppState.status !== "settled" && (
          <div style={{ fontSize: "11px", color: "var(--color-orange)", display: "flex", alignItems: "center", gap: "4px" }}>
            <AlertCircle size={12} /> 短板预警: {shortfalls.join("、")} (点击展开调研与申报)
          </div>
        )}

        {/* Next Opportunity Preview Prompt */}
        {oppState.status === "settled" && nextOppDef && (
          <div style={{
            fontSize: "11px",
            color: "var(--color-blue)",
            backgroundColor: "#EBF3F8",
            padding: "4px 8px",
            borderRadius: "4px",
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <Calendar size={12} /> 下一场预告: 【{nextOppDef.name}】将在第 {state.nextOpportunityStartQuarter} 季度开启！
          </div>
        )}
      </div>

      {showDetail && (
        <OpportunityDetailSheet
          state={state}
          onClose={() => setShowDetail(false)}
          onUpdateState={onUpdateState}
        />
      )}
    </>
  );
};
