import React from "react";
import { BidTier, GameState, OpportunityResultTier } from "../types/game";
import {
  calculateOpportunityScore,
  checkOpportunityGuaranteedSuccess,
  getMajorOpportunityDefinition,
  performResearchAction,
  projectCapabilitiesAtSettle,
  resolveOpportunityResultTier
} from "../engine/cityOpportunity";
import { POLICIES_DATA, computeDirectInitiationCost, computeInstallments } from "../data/policiesData";
import { setDraftAction } from "../engine/gameEngine";
import { Search, HardHat, CheckCircle2 } from "lucide-react";

interface Props {
  state: GameState;
  onClose: () => void;
  onUpdateState: (nextState: GameState) => void;
}

export const OpportunityDetailSheet: React.FC<Props> = ({ state, onClose, onUpdateState }) => {
  const activeOppId = state.activeMajorOpportunityId ?? "new_energy_base";
  const oppDef = getMajorOpportunityDefinition(activeOppId);

  const oppState = state.opportunityStates?.[activeOppId] ?? state.cityOpportunityState;
  const caps = state.capabilities ?? {};
  const currentBid = oppState.selectedBidTier ?? "none";
  const baseFit = state.opportunityBaseFits?.[activeOppId] ?? state.baseFit ?? 30;

  // Reachability Forecast at settleQuarter
  const capsAtSettle = projectCapabilitiesAtSettle(caps, state.activeProjects, state.quarter, oppState.settleQuarter, oppDef);
  const scoreInfoSettle = calculateOpportunityScore(baseFit, capsAtSettle, currentBid, oppDef);
  const guaranteedSettle = checkOpportunityGuaranteedSuccess(capsAtSettle, currentBid, oppDef);
  const hasSynergyTag = (oppState.opportunitySynergyIds ?? []).length > 0;

  const predictedTier = resolveOpportunityResultTier(
    scoreInfoSettle.baseCompetitiveness,
    capsAtSettle,
    currentBid,
    hasSynergyTag,
    oppDef
  );

  const getPredictedTierMeta = (tier: OpportunityResultTier) => {
    const rewardConf = oppDef.rewards[tier];
    switch (tier) {
      case "super_success":
        return { title: rewardConf.label, color: "var(--color-green)" };
      case "success":
        return { title: rewardConf.label, color: "var(--color-green)" };
      case "partial_success":
        return { title: rewardConf.label, color: "#B98425" };
      case "failed":
        return { title: rewardConf.label, color: "var(--color-red)" };
    }
  };

  const predMeta = getPredictedTierMeta(predictedTier);

  const handleSelectBid = (tier: BidTier) => {
    const updatedOppState = {
      ...oppState,
      selectedBidTier: tier
    };

    const nextState: GameState = {
      ...state,
      opportunityStates: {
        ...state.opportunityStates,
        [activeOppId]: updatedOppState
      },
      cityOpportunityState: state.activeMajorOpportunityId === activeOppId ? updatedOppState : state.cityOpportunityState
    };
    onUpdateState(nextState);
  };

  const handlePerformResearch = () => {
    const nextState = performResearchAction(state, activeOppId);
    onUpdateState(nextState);
  };

  const handleDirectInitiate = (policyId: string) => {
    onUpdateState(setDraftAction(state, { type: "policy", policyId }));
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div>
            <span className="badge badge-yellow" style={{ marginBottom: "2px" }}>重大城市机遇</span>
            <h2 style={{ fontSize: "18px" }}>{oppDef.name}</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-sub)" }}
          >
            ✕
          </button>
        </div>

        {/* Reachability Forecast Header Card */}
        <div className="card" style={{ padding: "12px", backgroundColor: "#FFF", marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-sub)" }}>第 {oppState.settleQuarter} 季截止预测</span>
              <div style={{ fontSize: "15px", fontWeight: "bold", color: predMeta.color, marginTop: "2px" }}>
                预计结果：{predMeta.title}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "20px", fontWeight: "900", color: "#B98425", fontFamily: "var(--font-serif)" }}>
                {oppState.hasResearched ? `${scoreInfoSettle.baseCompetitiveness} 分` : `${scoreInfoSettle.baseCompetitiveness - 3}—${scoreInfoSettle.baseCompetitiveness + 3} 分`}
              </span>
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "var(--text-sub)", marginBottom: "8px", borderBottom: "1px dashed var(--border-color)", paddingBottom: "6px" }}>
            预测能力 (截至第{oppState.settleQuarter}季): {oppDef.coreCapabilityKeys.map((k) => `${oppDef.capabilityNames[k]}: ${capsAtSettle[k] ?? 0}`).join(" | ")} | {oppDef.capabilityNames[oppDef.auxiliaryCapabilityKey]}: {capsAtSettle[oppDef.auxiliaryCapabilityKey] ?? 0}
          </div>

          {/* Logic Explanation Box */}
          <div style={{
            fontSize: "12px",
            padding: "8px 10px",
            borderRadius: "6px",
            backgroundColor: predictedTier === "success" || predictedTier === "super_success" ? "#E8F4EE" : predictedTier === "partial_success" ? "#FEF7E6" : "#FDE8E7",
            color: predictedTier === "success" || predictedTier === "super_success" ? "var(--color-green)" : predictedTier === "partial_success" ? "#B98425" : "var(--color-red)",
            fontWeight: "500",
            lineHeight: "1.5"
          }}>
            {predictedTier === "success" || predictedTier === "super_success" ? (
              scoreInfoSettle.baseCompetitiveness >= 90 ? (
                <div>✅ 预测得分达到 90 分成功门槛，已锁定【竞逐成功】！</div>
              ) : (
                <div>🛡️ 已触发【核心能力保底机制】（三大核心能力合计8级），锁定【竞逐成功】！</div>
              )
            ) : predictedTier === "partial_success" ? (
              <div>
                <div>⚠️ 当前预测竞争力 75—89 分 (部分成功)。</div>
                {guaranteedSettle.missingReasons.length === 1 && guaranteedSettle.missingReasons[0].includes("未选择标准申报") ? (
                  <div style={{ marginTop: "2px", fontWeight: "bold" }}>💡 核心能力已达标！只需将下方申报档位切换至【标准】或【全力】即可提升至【成功】！</div>
                ) : (
                  <div style={{ marginTop: "2px" }}>距触发【成功保底】缺少: {guaranteedSettle.missingReasons.join("；")}</div>
                )}
              </div>
            ) : (
              <div>
                <div>❌ 预测得分低于 75 分门槛。</div>
                <div style={{ marginTop: "2px" }}>距触发【成功保底】缺少: {guaranteedSettle.missingReasons.join("；")}</div>
              </div>
            )}
          </div>

          {!oppState.hasResearched && (
            <button
              className="btn btn-primary"
              disabled={state.treasury < 1}
              onClick={handlePerformResearch}
              style={{ width: "100%", height: "34px", fontSize: "12px", marginTop: "8px" }}
            >
              <Search size={14} style={{ marginRight: "4px" }} />
              深度产业调研 (花费 1 亿元财政)
            </button>
          )}
        </div>

        {/* 专项筹备区域 */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "4px", fontFamily: "var(--font-serif)", display: "flex", alignItems: "center", gap: "4px" }}>
            <HardHat size={14} color="#B98425" /> 战略项目专项筹备 (可直接主动立项)
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {oppDef.strategicProjects.map((sp) => {
              const def = POLICIES_DATA.find((p) => p.id === sp.id);
              if (!def) return null;

              const activeProj = state.activeProjects.find((p) => p.policyId === sp.id);
              const isCompleted = state.completedPolicyIds.includes(sp.id);

              const directCost = computeDirectInitiationCost(def.baseCost);
              const installments = computeInstallments(directCost, def.duration);
              const firstPay = installments[0] ?? directCost;

              let statusText = "未启动";
              let badgeClass = "badge-yellow";
              if (isCompleted) {
                statusText = "已完成";
                badgeClass = "badge-green";
              } else if (activeProj) {
                const pct = Math.round(((activeProj.stageIndex + 1) / activeProj.totalDuration) * 100);
                statusText = activeProj.status === "halted" ? "停工中" : `在建 ${pct}%`;
                badgeClass = activeProj.status === "halted" ? "badge-red" : "badge-yellow";
              }

              const canInitiate = !state.actionUsedThisQuarter && !activeProj && !isCompleted;

              const isDraft = state.draftAction?.type === "policy" && state.draftAction?.policyId === def.id;

              return (
                <div
                  key={sp.id}
                  style={{
                    backgroundColor: isDraft ? "#F4F9F4" : "#FFF",
                    border: isDraft ? "2px solid #2E7D32" : "1px solid var(--border-color)",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    fontSize: "12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                    <strong>{def.name} <span style={{ fontSize: "11px", color: "var(--text-sub)" }}>({sp.capName})</span></strong>
                    <span className={`badge ${badgeClass}`} style={{ fontSize: "10px" }}>{statusText}</span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: "var(--text-sub)", marginBottom: "4px" }}>
                    <span>抽卡成本: <strong>{def.baseCost}亿</strong></span>
                    <span>主动成本(115%): <strong style={{ color: "#B98425" }}>{directCost}亿</strong></span>
                    <span>首期: <strong>{firstPay}亿</strong></span>
                  </div>

                  {canInitiate ? (
                    <button
                      className={`btn ${isDraft ? "btn-secondary" : "btn-primary"}`}
                      style={{
                        width: "100%",
                        height: "32px",
                        fontSize: "12px",
                        padding: "0",
                        backgroundColor: isDraft ? "#2E7D32" : undefined,
                        color: isDraft ? "#FFFFFF" : undefined
                      }}
                      onClick={() => handleDirectInitiate(def.id)}
                    >
                      {isDraft ? `已拟定为本季草案 (首期 ${firstPay} 亿) ✓` : `拟定为本季草案 (首期 ${firstPay} 亿)`}
                    </button>
                  ) : (
                    <div style={{ fontSize: "11px", color: "var(--text-sub)", fontStyle: "italic", textAlign: "right" }}>
                      {activeProj || isCompleted ? "工程已在建或已完工" : "本季度已选择其他草案"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bidding Tier Selector */}
        {oppState.status !== "settled" && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "6px", fontFamily: "var(--font-serif)" }}>
              🏛️ 地方申报投入档位 (第 {oppState.settleQuarter} 季结算扣除)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {(["none", "conservative", "standard", "full"] as BidTier[]).map((tier) => {
                const conf = oppDef.biddingTiers[tier];
                const isSelected = currentBid === tier;

                return (
                  <div
                    key={tier}
                    onClick={() => handleSelectBid(tier)}
                    style={{
                      border: isSelected ? "2px solid #B98425" : "1px solid var(--border-color)",
                      backgroundColor: isSelected ? "#FFFDF6" : "#FFF",
                      borderRadius: "6px",
                      padding: "8px 10px",
                      cursor: "pointer",
                      textAlign: "center"
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-main)" }}>
                      {conf.label}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-sub)", marginTop: "2px" }}>
                      财政投入: <strong>{conf.cost > 0 ? `${conf.cost} 亿` : "0 亿"}</strong>
                    </div>
                    <div style={{ fontSize: "11px", color: "#B98425", fontWeight: "bold" }}>
                      竞争力: +{conf.scoreBonus} 分
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button className="btn btn-primary" style={{ width: "100%", height: "42px", fontSize: "14px", marginBottom: "16px" }} onClick={onClose}>
          确定
        </button>
      </div>
    </div>
  );
};
