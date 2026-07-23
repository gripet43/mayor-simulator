import {
  ActiveProject,
  BidTier,
  CityCapabilities,
  CityOpportunityState,
  GameState,
  MajorOpportunityDefinition,
  OpportunityResultTier,
  ScheduledOpportunityReward,
  TemporaryTaxBonus
} from "../types/game";
import { MAJOR_OPPORTUNITIES_DATA } from "../data/majorOpportunitiesData";
import { POLICIES_DATA } from "../data/policiesData";
import { PRNG } from "./prng";

/**
 * 派生独立随机种子 (不污染公共主随机序列)
 */
export function deriveOpportunitySeed(saveSeed: number, opportunityId: string, purpose: string): number {
  let hash = 0;
  const str = `${opportunityId}_${purpose}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(saveSeed ^ hash);
}

export function getMajorOpportunityDefinition(id: string): MajorOpportunityDefinition {
  const def = MAJOR_OPPORTUNITIES_DATA[id];
  if (!def) throw new Error(`Major opportunity ${id} not found`);
  return def;
}

/**
 * 预测截止到结算季度 (settleQuarter)，已有工程推进后的各项城市能力
 */
export function projectCapabilitiesAtSettle(
  currentCaps: CityCapabilities,
  activeProjects: ActiveProject[],
  currentQuarter: number,
  settleQuarter: number,
  oppDef: MajorOpportunityDefinition
): CityCapabilities {
  const projected: CityCapabilities = { ...currentCaps };

  if (currentQuarter >= settleQuarter) return projected;

  const quartersRemaining = settleQuarter - currentQuarter;

  activeProjects.forEach((proj) => {
    if (proj.status === "halted") return;
    const def = POLICIES_DATA.find((p) => p.id === proj.policyId);
    if (!def || !def.stageCapabilityBoost) return;

    const stagesToAdvance = Math.min(quartersRemaining, proj.totalDuration - 1 - proj.stageIndex);
    if (stagesToAdvance <= 0) return;

    Object.entries(def.stageCapabilityBoost).forEach(([k, v]) => {
      if (v !== undefined) {
        projected[k] = (projected[k] ?? 0) + v * stagesToAdvance;
      }
    });
  });

  return projected;
}

/**
 * 校验正常成功保底 (三大核心能力均≥1级且合计≥8级，并选择标准或全力申报)
 */
export function checkOpportunityGuaranteedSuccess(
  caps: CityCapabilities,
  bidTier: BidTier,
  oppDef: MajorOpportunityDefinition
): { isMet: boolean; missingReasons: string[] } {
  const coreKeys = oppDef.coreCapabilityKeys;
  const valA = caps[coreKeys[0]] ?? 0;
  const valB = caps[coreKeys[1]] ?? 0;
  const valC = caps[coreKeys[2]] ?? 0;
  const totalCore = valA + valB + valC;

  const nameA = oppDef.capabilityNames[coreKeys[0]] ?? String(coreKeys[0]);
  const nameB = oppDef.capabilityNames[coreKeys[1]] ?? String(coreKeys[1]);
  const nameC = oppDef.capabilityNames[coreKeys[2]] ?? String(coreKeys[2]);

  const missingReasons: string[] = [];

  if (valA < 1) missingReasons.push(`${nameA}未达到1级`);
  if (valB < 1) missingReasons.push(`${nameB}未达到1级`);
  if (valC < 1) missingReasons.push(`${nameC}未达到1级`);
  if (totalCore < 8) missingReasons.push(`三大核心能力合计仅${totalCore}级(需至少8级)`);
  if (bidTier !== "standard" && bidTier !== "full") missingReasons.push("未选择标准申报或全力申报");

  return { isMet: missingReasons.length === 0, missingReasons };
}

/**
 * 校验超级成功条件
 */
export function checkOpportunitySuperSuccess(
  rawScore: number,
  caps: CityCapabilities,
  bidTier: BidTier,
  hasSynergyTag: boolean,
  oppDef: MajorOpportunityDefinition
): boolean {
  if (rawScore < 110) return false;

  const coreKeys = oppDef.coreCapabilityKeys;
  const auxKey = oppDef.auxiliaryCapabilityKey;

  const valA = caps[coreKeys[0]] ?? 0;
  const valB = caps[coreKeys[1]] ?? 0;
  const valC = caps[coreKeys[2]] ?? 0;
  const valAux = caps[auxKey] ?? 0;

  if (valA < 1 || valB < 1 || valC < 1 || valAux < 1) return false;
  if (valA + valB + valC + valAux < 10) return false;
  if (bidTier !== "full") return false;
  if (!hasSynergyTag) return false;

  return true;
}

/**
 * 通用结果判定算法 (4步严格结算顺序)
 */
export function resolveOpportunityResultTier(
  rawScore: number,
  caps: CityCapabilities,
  bidTier: BidTier,
  hasSynergyTag: boolean,
  oppDef: MajorOpportunityDefinition
): OpportunityResultTier {
  let tier: OpportunityResultTier = "failed";
  if (rawScore >= 90) {
    tier = "success";
  } else if (rawScore >= 75) {
    tier = "partial_success";
  }

  const guaranteed = checkOpportunityGuaranteedSuccess(caps, bidTier, oppDef);
  if (guaranteed.isMet && (tier === "failed" || tier === "partial_success")) {
    tier = "success";
  }

  if (rawScore >= 110) {
    const isSuperMet = checkOpportunitySuperSuccess(rawScore, caps, bidTier, hasSynergyTag, oppDef);
    if (isSuperMet) {
      tier = "super_success";
    } else {
      tier = "success";
    }
  }

  return tier;
}

/**
 * 通用竞争力计算公式
 */
export function calculateOpportunityScore(
  baseFit: number,
  caps: CityCapabilities,
  bidTier: BidTier = "none",
  oppDef: MajorOpportunityDefinition
): {
  baseFitScore: number;
  coreAScore: number;
  coreBScore: number;
  coreCScore: number;
  auxScore: number;
  bidBonus: number;
  baseCompetitiveness: number;
} {
  const coreKeys = oppDef.coreCapabilityKeys;
  const auxKey = oppDef.auxiliaryCapabilityKey;

  const valA = caps[coreKeys[0]] ?? 0;
  const valB = caps[coreKeys[1]] ?? 0;
  const valC = caps[coreKeys[2]] ?? 0;
  const valAux = caps[auxKey] ?? 0;

  const coreAScore = valA * 7;
  const coreBScore = valB * 7;
  const coreCScore = valC * 7;
  const auxScore = valAux * 4;
  const bidBonus = oppDef.biddingTiers[bidTier]?.scoreBonus ?? 0;

  const baseCompetitiveness = baseFit + coreAScore + coreBScore + coreCScore + auxScore + bidBonus;

  return {
    baseFitScore: baseFit,
    coreAScore,
    coreBScore,
    coreCScore,
    auxScore,
    bidBonus,
    baseCompetitiveness
  };
}

export function evaluateShortfalls(caps: CityCapabilities, oppDef: MajorOpportunityDefinition): string[] {
  const coreKeys = oppDef.coreCapabilityKeys;
  const shortfalls = coreKeys.map((k) => ({
    name: oppDef.capabilityNames[k] ?? String(k),
    val: caps[k] ?? 0
  }));

  shortfalls.sort((a, b) => a.val - b.val);
  return shortfalls.filter((s) => s.val < 3).map((s) => `${s.name}不足 (当前${s.val})`);
}

export function performResearchAction(state: GameState, oppId: string): GameState {
  if (state.treasury < 1) return state;

  const oppState = state.opportunityStates[oppId] ?? state.cityOpportunityState;
  if (!oppState || oppState.hasResearched) return state;

  const updatedOppState: CityOpportunityState = {
    ...oppState,
    hasResearched: true
  };

  return {
    ...state,
    treasury: Math.round((state.treasury - 1) * 10) / 10,
    opportunityStates: {
      ...state.opportunityStates,
      [oppId]: updatedOppState
    },
    cityOpportunityState: state.activeMajorOpportunityId === oppId ? updatedOppState : state.cityOpportunityState
  };
}

/**
 * 结算指定重大机遇结果并分配奖励
 */
export function resolveMajorOpportunitySettlement(
  state: GameState,
  oppId: string
): {
  nextState: GameState;
  resultModalData: GameState["opportunityResultModal"];
} {
  const oppDef = getMajorOpportunityDefinition(oppId);
  const oppState = state.opportunityStates[oppId] ?? state.cityOpportunityState;
  const bidTier = oppState.selectedBidTier ?? "none";
  const bidCost = oppDef.biddingTiers[bidTier]?.cost ?? 0;

  // 派生独立随机数 (-3 到 +3)
  const derivedSeed = deriveOpportunitySeed(state.seed, oppId, "settlement_fluctuation");
  const prng = new PRNG(derivedSeed);
  const fluctuation = Math.floor(prng.nextFloat() * 7) - 3;

  const capsAtSettle = projectCapabilitiesAtSettle(
    state.capabilities,
    state.activeProjects,
    state.quarter,
    oppState.settleQuarter,
    oppDef
  );

  const baseFit = state.opportunityBaseFits[oppId] ?? state.baseFit ?? 30;
  const { baseCompetitiveness } = calculateOpportunityScore(baseFit, capsAtSettle, bidTier, oppDef);
  const finalScore = baseCompetitiveness + fluctuation;

  const hasSynergyTag = (oppState.opportunitySynergyIds ?? []).length > 0;
  const resultTier = resolveOpportunityResultTier(finalScore, capsAtSettle, bidTier, hasSynergyTag, oppDef);

  const rewards = oppDef.rewards[resultTier];
  const leverageRatio = bidCost > 0 ? Math.round(((rewards.grant + rewards.socialInvestment) / bidCost) * 10) / 10 : 0;

  let nextState: GameState = { ...state };

  // 1. 专项扶持资金 (立即到账)
  if (rewards.grant > 0) {
    nextState.treasury = Math.round((nextState.treasury + rewards.grant) * 10) / 10;
  }

  // 2. 撬动社会投资 (计入统计)
  if (rewards.socialInvestment > 0) {
    nextState.cumulativeSocialInvestment = (nextState.cumulativeSocialInvestment ?? 0) + rewards.socialInvestment;
  }

  // 3. 计划发放：建设期/活动期临时税收 (下个季度开始连续2季)
  if (rewards.constructionTaxBonus > 0) {
    const scheduledReward: ScheduledOpportunityReward = {
      id: `reward_temp_${oppId}_${state.quarter}`,
      opportunityId: oppId,
      opportunityName: oppDef.shortTitle,
      resultTier,
      type: "temp_tax",
      amount: rewards.constructionTaxBonus,
      activateQuarter: state.quarter + 1,
      remainingQuarters: 2
    };
    nextState.scheduledOpportunityRewards = [...(nextState.scheduledOpportunityRewards ?? []), scheduledReward];
  }

  // 4. 计划发放：永久产业税基 (两个完整建设季度后，即 settleQuarter + 3 生效)
  if (rewards.permanentBaseBonus > 0) {
    const scheduledReward: ScheduledOpportunityReward = {
      id: `reward_perm_${oppId}_${state.quarter}`,
      opportunityId: oppId,
      opportunityName: oppDef.shortTitle,
      resultTier,
      type: "perm_base",
      amount: rewards.permanentBaseBonus,
      activateQuarter: state.quarter + 3
    };
    nextState.scheduledOpportunityRewards = [...(nextState.scheduledOpportunityRewards ?? []), scheduledReward];
  }

  // 5. 永久运营费 (结算后立即生效，独立账目)
  if (rewards.permanentOperatingFee > 0) {
    nextState.permanentOpportunityOperatingCosts = (nextState.permanentOpportunityOperatingCosts ?? 0) + rewards.permanentOperatingFee;
  }

  // 6. 其他直接指标加成/环境负向影响
  if (rewards.metricEffects) {
    if (rewards.metricEffects.environment) nextState.environment = Math.max(0, Math.min(100, nextState.environment + rewards.metricEffects.environment));
    if (rewards.metricEffects.livelihood) nextState.livelihood = Math.max(0, Math.min(100, nextState.livelihood + rewards.metricEffects.livelihood));
    if (rewards.metricEffects.morale) nextState.morale = Math.max(0, Math.min(100, nextState.morale + rewards.metricEffects.morale));
  }

  // 7. 健康事件减损比例 (国家区域医学中心特有)
  if (rewards.healthLossReduction) {
    nextState.healthEventLossMultiplier = 1.0 - rewards.healthLossReduction;
  }

  // 更新机遇状态
  const updatedOppState: CityOpportunityState = {
    ...oppState,
    status: "settled",
    resultTier,
    grantReceived: rewards.grant,
    socialInvestment: rewards.socialInvestment,
    leverageRatio,
    constructionTaxBonus: rewards.constructionTaxBonus,
    permanentBaseBonus: rewards.permanentBaseBonus,
    permanentOperatingFee: rewards.permanentOperatingFee,
    settledQuarter: state.quarter
  };

  nextState.opportunityStates = {
    ...nextState.opportunityStates,
    [oppId]: updatedOppState
  };

  if (nextState.activeMajorOpportunityId === oppId) {
    nextState.cityOpportunityState = updatedOppState;
  }

  const chronicleEntry = {
    id: `chron_opp_${oppId}_${state.quarter}`,
    quarter: state.quarter,
    year: Math.ceil(state.quarter / 4),
    quarterInYear: ((state.quarter - 1) % 4) + 1,
    type: "opportunity_result" as const,
    title: `${oppDef.name}竞逐结果：${rewards.label}`,
    body: resultTier === "failed"
      ? `未达 75 分申报门槛，申报投入 ${bidCost} 亿未能换取专项补助。`
      : `以最终竞争力 ${finalScore} 分成功竞逐！获得专项资金 ${rewards.grant} 亿，撬动社会投资 ${rewards.socialInvestment} 亿。`
  };

  nextState.chronicle = [chronicleEntry, ...nextState.chronicle];

  const resultModalData = {
    opportunityId: oppId,
    opportunityName: oppDef.name,
    resultTier,
    bidCost,
    grant: rewards.grant,
    socialInvestment: rewards.socialInvestment,
    leverageRatio,
    constructionTaxBonus: rewards.constructionTaxBonus,
    permanentBaseBonus: rewards.permanentBaseBonus,
    permanentOperatingFee: rewards.permanentOperatingFee,
    healthLossReduction: rewards.healthLossReduction
  };

  nextState.opportunityResultModal = resultModalData;

  return { nextState, resultModalData };
}
