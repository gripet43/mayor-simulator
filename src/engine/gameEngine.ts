import { POLICIES_DATA, computeDirectInitiationCost, computeInstallments } from "../data/policiesData";
import {
  ActiveProject,
  ChronicleEntry,
  CityOpportunityState,
  DraftAction,
  EventRecord,
  GameState,
  Intensity,
  MetricDelta,
  PolicyRecord,
  ProjectProgressNotice,
  QuarterDebtLedger,
  QuarterFinanceBreakdown,
  QuarterSummaryData,
  ScheduledOpportunityReward
} from "../types/game";
import {
  calculateCompletedMaintenance,
  calculateCompletedOperatingIncome,
  calculateDebtInterest,
  calculateDigitalGovMaintenanceDiscount,
  calculateFiscalHealth,
  calculateQuarterTax,
  clamp,
  payExpense,
  repayDebtAction
} from "./finance";
import { resolveEventOptionSelection, rollQuarterEvent } from "./events";
import { generateQuarterlyCandidates, getPolicyDefinition, isPolicyExecutable, previewPolicyCostAndDuration, previewPolicyEffects, INTENSITY_CONFIGS } from "./policies";
import { generateNewSeed, PRNG } from "./prng";
import { generateQuarterlySignal } from "./signals";
import { calculateFinalScore, resolveEnding } from "./scoring";
import { getQuarterInYear, getYearFromQuarter, isNewYearQuarter, rollNextAnnualTrend } from "./trends";
import { deriveOpportunitySeed, getMajorOpportunityDefinition, resolveMajorOpportunitySettlement } from "./cityOpportunity";
import { MAJOR_OPPORTUNITIES_DATA } from "../data/majorOpportunitiesData";
import { getCapabilityName } from "../utils/format";

export function createNewGame(seed?: number): GameState {
  const finalSeed = seed ?? generateNewSeed();
  const prng = new PRNG(finalSeed);

  const initialTrend = rollNextAnnualTrend(prng);
  const initialSignal = generateQuarterlySignal(prng, 1);

  // Derive follow-up opportunity shuffle using a derived seed
  const orderSeed = deriveOpportunitySeed(finalSeed, "global", "followup_order");
  const orderPrng = new PRNG(orderSeed);

  const followUpOpportunityOrder = ["freight_hub", "regional_medical", "cultural_expo"];
  for (let i = followUpOpportunityOrder.length - 1; i > 0; i--) {
    const j = Math.floor(orderPrng.nextFloat() * (i + 1));
    [followUpOpportunityOrder[i], followUpOpportunityOrder[j]] = [followUpOpportunityOrder[j], followUpOpportunityOrder[i]];
  }

  // Initialize base fit for New Energy (26-34)
  const baseFitSeed = deriveOpportunitySeed(finalSeed, "new_energy_base", "base_fit");
  const nePrng = new PRNG(baseFitSeed);
  const neBaseFit = 26 + Math.floor(nePrng.nextFloat() * 9);

  const opportunityBaseFits: Record<string, number> = {
    new_energy_base: neBaseFit
  };

  // Derive base fits for follow-up opportunities
  followUpOpportunityOrder.forEach((oppId) => {
    const oppSeed = deriveOpportunitySeed(finalSeed, oppId, "base_fit");
    const oppPrng = new PRNG(oppSeed);
    opportunityBaseFits[oppId] = 26 + Math.floor(oppPrng.nextFloat() * 9);
  });

  const neOppState: CityOpportunityState = {
    id: "new_energy_base",
    title: MAJOR_OPPORTUNITIES_DATA.new_energy_base.name,
    startQuarter: 2,
    settleQuarter: 5,
    hasResearched: false,
    status: "announced",
    opportunitySynergyIds: []
  };

  const opportunityStates: Record<string, CityOpportunityState> = {
    new_energy_base: neOppState
  };

  const initialState: GameState = {
    version: 1,
    saveVersion: 4,
    seed: finalSeed,
    rngIndex: 0,
    quarter: 1,

    actionUsedThisQuarter: false,

    treasury: 48,
    debt: 32,
    economy: 42,
    livelihood: 40,
    environment: 38,
    morale: 55,
    resilience: 20,

    capabilities: {
      skillTalent: 0,
      cleanEnergy: 0,
      industrialSpace: 0,
      administrativeEfficiency: 0,
      trafficConnectivity: 0,
      freightCapacity: 0,
      tradeService: 0,
      clinicalCapability: 0,
      medicalResearch: 0,
      culturalAttraction: 0,
      touristReception: 0,
      eventOperation: 0
    },
    industrialTaxBase: 0,
    temporaryTaxBonuses: [],
    cumulativeSocialInvestment: 0,

    activeMajorOpportunityId: "new_energy_base",
    followUpOpportunityOrder,
    nextOpportunityStartQuarter: 8,
    opportunityStates,
    opportunityBaseFits,
    quartersWithoutRelevantPolicyMap: {
      new_energy_base: 0
    },
    scheduledOpportunityRewards: [],
    permanentOpportunityOperatingCosts: 0,
    healthEventLossMultiplier: 1.0,

    // Legacy fields
    baseFit: neBaseFit,
    cityOpportunityState: neOppState,
    quartersWithoutRelevantPolicy: 0,

    currentTrend: initialTrend,
    trendHistory: [{ year: 1, trendId: initialTrend, trendTitle: "" }],
    currentSignal: initialSignal,

    candidatePolicies: [],
    activeProjects: [],
    completedPolicies: [],
    completedPolicyIds: [],
    policyCooldowns: {},
    policyUseCount: {},

    temporaryBuffs: [],
    eventHistory: [],
    quarterHistory: [],
    repaymentHistory: [],
    chronicle: [
      {
        id: "chron_init",
        quarter: 1,
        year: 1,
        quarterInYear: 1,
        type: "milestone",
        title: "五年任期正式开启",
        body: "临州市发展站在新的历史起点，上级寄予厚望，四项指标与财政债务等待你的掌舵。"
      }
    ],

    openingDebtThisQuarter: 32,
    voluntaryRepaymentThisQuarter: 0,
    policyBorrowingThisQuarter: 0,
    eventBorrowingThisQuarter: 0,

    consecutiveLowMorale: 0,
    gameStatus: "playing"
  };

  initialState.candidatePolicies = generateQuarterlyCandidates(initialState, prng);
  initialState.currentEvent = rollQuarterEvent(initialState, prng) ?? undefined;

  return initialState;
}

export function approvePolicyAction(
  state: GameState,
  policyId: string,
  intensity: Intensity,
  isDirectInitiation = false
): { nextState: GameState; summary: QuarterSummaryData } {
  if (state.actionUsedThisQuarter) {
    throw new Error("本季度政策行动已使用");
  }

  const prng = new PRNG(state.seed + state.quarter * 997 + state.activeProjects.length * 13);

  const policy = getPolicyDefinition(policyId);
  if (!policy) throw new Error(`Policy ${policyId} not found`);

  const executable = isPolicyExecutable(state, policy, isDirectInitiation);
  if (!executable.executable) throw new Error(executable.reason ?? "Policy not executable");

  let nextState: GameState = { ...state };
  nextState.actionUsedThisQuarter = true;

  const { cost, duration, maintenance } = previewPolicyCostAndDuration(state, policy, intensity, isDirectInitiation);
  const installments = computeInstallments(cost, duration);
  const firstInstallment = installments[0] ?? cost;

  // Pay 1st installment immediately
  const payRes = payExpense(nextState.treasury, nextState.debt, firstInstallment);
  nextState.treasury = payRes.treasury;
  nextState.debt = payRes.debt;
  nextState.policyBorrowingThisQuarter = payRes.debtAdded;

  const efficiency = Math.round((0.85 + prng.nextFloat() * 0.30) * 100) / 100;

  nextState.policyCooldowns = { ...nextState.policyCooldowns, [policyId]: policy.cooldown };
  nextState.policyUseCount = { ...nextState.policyUseCount, [policyId]: (nextState.policyUseCount[policyId] ?? 0) + 1 };

  // If policy is a synergy policy, collect its synergy ID for the corresponding opportunity
  if (policy.isOpportunitySynergy) {
    const oppId = policy.synergyOpportunityId ?? nextState.activeMajorOpportunityId ?? "new_energy_base";
    const currentOppState = nextState.opportunityStates[oppId] ?? nextState.cityOpportunityState;
    const oppSynergy = currentOppState.opportunitySynergyIds ?? [];

    if (!oppSynergy.includes(policy.id)) {
      const updatedOppState: CityOpportunityState = {
        ...currentOppState,
        opportunitySynergyIds: [...oppSynergy, policy.id]
      };
      nextState.opportunityStates = {
        ...nextState.opportunityStates,
        [oppId]: updatedOppState
      };
      if (nextState.activeMajorOpportunityId === oppId) {
        nextState.cityOpportunityState = updatedOppState;
      }
    }
  }

  const { positiveEffects, negativeEffects } = previewPolicyEffects(nextState, policy, intensity, efficiency);

  const year = getYearFromQuarter(nextState.quarter);
  const qInYear = getQuarterInYear(nextState.quarter);

  let instantCompletedName: string | undefined;

  if (policy.isInstant) {
    if (positiveEffects.economy) nextState.economy = clamp(nextState.economy + positiveEffects.economy);
    if (positiveEffects.livelihood) nextState.livelihood = clamp(nextState.livelihood + positiveEffects.livelihood);
    if (positiveEffects.environment) nextState.environment = clamp(nextState.environment + positiveEffects.environment);
    if (positiveEffects.morale) nextState.morale = clamp(nextState.morale + positiveEffects.morale);
    if (positiveEffects.resilience) nextState.resilience = clamp(nextState.resilience + positiveEffects.resilience);
    if (positiveEffects.treasury) nextState.treasury = Math.max(0, nextState.treasury + positiveEffects.treasury);

    if (negativeEffects.economy) nextState.economy = clamp(nextState.economy + negativeEffects.economy);
    if (negativeEffects.livelihood) nextState.livelihood = clamp(nextState.livelihood + negativeEffects.livelihood);
    if (negativeEffects.environment) nextState.environment = clamp(nextState.environment + negativeEffects.environment);
    if (negativeEffects.morale) nextState.morale = clamp(nextState.morale + negativeEffects.morale);

    if (policy.id === "consumption_coupon") {
      nextState.couponNextQuarterTaxBonus = true;
    }

    let tourismBonus = 0;
    if (policy.id === "tourism_festival") {
      tourismBonus = 2;
    }

    instantCompletedName = policy.name;
    nextState.completedPolicyIds = [...nextState.completedPolicyIds, policy.id];
    nextState.completedPolicies = [
      ...nextState.completedPolicies,
      {
        policyId: policy.id,
        policyName: policy.name,
        quarter: nextState.quarter,
        intensity,
        cost,
        efficiency,
        completedQuarter: nextState.quarter,
        maintenanceCost: 0,
        operatingIncome: policy.operatingIncome,
        tourismBonusQuarters: tourismBonus
      }
    ];
  } else {
    // Stage 1 creation
    const stageEffectId = `${policyId}_stage_0_${nextState.quarter}`;

    // Apply Stage 1 capability boost immediately
    if (policy.stageCapabilityBoost) {
      const updatedCaps = { ...nextState.capabilities };
      Object.entries(policy.stageCapabilityBoost).forEach(([k, v]) => {
        if (v !== undefined) {
          updatedCaps[k] = (updatedCaps[k] ?? 0) + v;
        }
      });
      nextState.capabilities = updatedCaps;
    }

    const newProject: ActiveProject = {
      id: `proj_${nextState.quarter}_${policyId}`,
      policyId: policy.id,
      name: policy.name,
      quarterStarted: nextState.quarter,
      remainingDuration: duration - 1,
      totalDuration: duration,
      stageIndex: 0,
      totalCost: cost,
      paidAmount: firstInstallment,
      installments,
      status: "in_progress",
      appliedStageEffectIds: [stageEffectId],
      isDirectInitiation,
      intensity,
      maintenance,
      operatingIncome: policy.operatingIncome,
      positiveEffects,
      negativeEffects,
      efficiency
    };

    nextState.activeProjects = [...nextState.activeProjects, newProject];
  }

  const approveChronicle: ChronicleEntry = {
    id: `chron_app_${nextState.quarter}_${policyId}`,
    quarter: nextState.quarter,
    year,
    quarterInYear: qInYear,
    type: isDirectInitiation ? "direct_initiation" : "policy_approve",
    title: isDirectInitiation ? `专项筹备立项：${policy.name}` : `批准政策：${policy.name}`,
    body: isDirectInitiation
      ? `通过专项筹备主动立项 (成本 115% 为 ${cost} 亿)，首期支付 ${firstInstallment} 亿元，项目进度达到 ${Math.round((1 / duration) * 100)}%${policy.stageCapabilityBoost ? "，城市能力同步提升" : ""}。`
      : `首期支付 ${firstInstallment} 亿元 (总投资 ${cost} 亿)，项目进度达到 ${Math.round((1 / duration) * 100)}%${policy.stageCapabilityBoost ? "，城市能力同步提升" : ""}。`
  };
  nextState.chronicle = [approveChronicle, ...nextState.chronicle];

  return advanceQuarterFlow(nextState, firstInstallment, instantCompletedName);
}

export function skipQuarterAction(state: GameState, prioritizeRepay = false): { nextState: GameState; summary: QuarterSummaryData } {
  let nextState: GameState = { ...state };

  if (prioritizeRepay && nextState.treasury > 5 && nextState.debt > 0) {
    const repayAmount = Math.min(nextState.treasury - 5, nextState.debt);
    if (repayAmount > 0) {
      nextState = repayDebtAction(nextState, repayAmount);
    }
  }

  const year = getYearFromQuarter(nextState.quarter);
  const qInYear = getQuarterInYear(nextState.quarter);

  const skipChronicle: ChronicleEntry = {
    id: `chron_skip_${nextState.quarter}`,
    quarter: nextState.quarter,
    year,
    quarterInYear: qInYear,
    type: "skip",
    title: prioritizeRepay ? "休整并优先偿债" : "暂缓本季度新投资",
    body: prioritizeRepay
      ? `本季度暂停新投资，保留 5 亿周转资金，将其余 ${state.treasury > 5 ? state.treasury - 5 : 0} 亿财政自动用于偿还债务。`
      : "本季度不批准新项目，保留财政资金用于应对经常性开支与债务利息。"
  };

  nextState.chronicle = [skipChronicle, ...nextState.chronicle];

  return advanceQuarterFlow(nextState, 0);
}

function advanceQuarterFlow(
  state: GameState,
  policySpendingThisQuarter: number,
  instantCompletedName?: string
): { nextState: GameState; summary: QuarterSummaryData } {
  let nextState: GameState = { ...state };
  const prng = new PRNG(nextState.seed + nextState.quarter * 883);

  // Process scheduled opportunity rewards (temporary tax / permanent tax base)
  const activeRewards: ScheduledOpportunityReward[] = [];
  (nextState.scheduledOpportunityRewards ?? []).forEach((reward) => {
    if (nextState.quarter >= reward.activateQuarter) {
      if (reward.type === "temp_tax") {
        const remaining = reward.remainingQuarters !== undefined ? reward.remainingQuarters - 1 : 0;
        const tempBonus = {
          id: reward.id,
          name: `${reward.opportunityName}活动期/建设期税收加成`,
          amount: reward.amount,
          remainingQuarters: remaining > 0 ? remaining : 1
        };
        nextState.temporaryTaxBonuses = [...(nextState.temporaryTaxBonuses ?? []), tempBonus];
        if (remaining > 0) {
          activeRewards.push({ ...reward, remainingQuarters: remaining });
        }
      } else if (reward.type === "perm_base") {
        nextState.industrialTaxBase = (nextState.industrialTaxBase ?? 0) + reward.amount;
      }
    } else {
      activeRewards.push(reward);
    }
  });

  nextState.scheduledOpportunityRewards = activeRewards;

  // Decrement temporary tax bonuses
  nextState.temporaryTaxBonuses = (nextState.temporaryTaxBonuses ?? [])
    .map((b) => ({ ...b, remainingQuarters: b.remainingQuarters - 1 }))
    .filter((b) => b.remainingQuarters > 0);

  // Decrement tourism bonus quarters
  nextState.completedPolicies = nextState.completedPolicies.map((p) => {
    if (p.tourismBonusQuarters && p.tourismBonusQuarters > 0) {
      return { ...p, tourismBonusQuarters: p.tourismBonusQuarters - 1 };
    }
    return p;
  });

  // 1. 经常性财政结算
  const taxInfo = calculateQuarterTax(nextState);
  const operatingIncomeTotal = calculateCompletedOperatingIncome(nextState);

  const rawMaintenance = calculateCompletedMaintenance(nextState);
  const maintenanceDiscount = calculateDigitalGovMaintenanceDiscount(nextState);
  const maintenanceExpense = Math.max(0, rawMaintenance - maintenanceDiscount);
  const opportunityOperatingCosts = nextState.permanentOpportunityOperatingCosts ?? 0;

  const isDigitalGovDone = nextState.completedPolicyIds.includes("digital_government");
  const baseExpense = isDigitalGovDone ? 3 : 4;
  const debtInterest = calculateDebtInterest(nextState.debt);
  const necessaryExpense = baseExpense + maintenanceExpense + opportunityOperatingCosts + debtInterest;
  const totalQuarterRevenue = taxInfo.taxIncome + operatingIncomeTotal;

  // Add revenue to treasury
  nextState.treasury = Math.round((nextState.treasury + totalQuarterRevenue) * 10) / 10;

  // Deduct necessary expense
  let debtAddedFromDeficit = 0;
  if (nextState.treasury >= necessaryExpense) {
    nextState.treasury = Math.round((nextState.treasury - necessaryExpense) * 10) / 10;
  } else {
    const deficit = Math.round((necessaryExpense - nextState.treasury) * 10) / 10;
    nextState.treasury = 0;
    nextState.debt = Math.round((nextState.debt + deficit) * 10) / 10;
    debtAddedFromDeficit = deficit;
  }

  nextState.couponNextQuarterTaxBonus = false;

  // 2. 支付到期建设款 & 3. 推进项目阶段
  const projectProgressNotices: ProjectProgressNotice[] = [];
  const completedNames: string[] = [];
  if (instantCompletedName) completedNames.push(instantCompletedName);

  const remainingProjects: ActiveProject[] = [];

  const initialEcon = state.economy;
  const initialLive = state.livelihood;
  const initialEnv = state.environment;
  const initialMorale = state.morale;
  const initialRes = state.resilience;

  nextState.activeProjects.forEach((proj) => {
    let updatedProj = { ...proj };

    if (proj.quarterStarted === nextState.quarter) {
      remainingProjects.push(updatedProj);
      return;
    }

    const nextStageIndex = proj.stageIndex + 1;
    const dueInstallment = proj.installments[nextStageIndex] ?? 0;

    if (dueInstallment > 0 && nextState.debt >= 120) {
      updatedProj.status = "halted";
      remainingProjects.push(updatedProj);
      return;
    }

    if (dueInstallment > 0) {
      const payRes = payExpense(nextState.treasury, nextState.debt, dueInstallment);
      nextState.treasury = payRes.treasury;
      nextState.debt = payRes.debt;
      updatedProj.paidAmount += dueInstallment;
    }

    updatedProj.status = "in_progress";
    updatedProj.stageIndex = nextStageIndex;

    const oldProgress = Math.round(((proj.stageIndex + 1) / proj.totalDuration) * 100);
    const newProgress = Math.round(((nextStageIndex + 1) / proj.totalDuration) * 100);

    const def = POLICIES_DATA.find((p) => p.id === proj.policyId);

    const stageEffectId = `${proj.policyId}_stage_${nextStageIndex}_${nextState.quarter}`;
    let capNoticeText = "";

    if (!updatedProj.appliedStageEffectIds.includes(stageEffectId)) {
      updatedProj.appliedStageEffectIds = [...updatedProj.appliedStageEffectIds, stageEffectId];

      if (def?.stageCapabilityBoost) {
        const updatedCaps = { ...nextState.capabilities };
        Object.entries(def.stageCapabilityBoost).forEach(([k, v]) => {
          if (v !== undefined) {
            updatedCaps[k] = (updatedCaps[k] ?? 0) + v;
          }
        });
        nextState.capabilities = updatedCaps;

        const capKey = Object.keys(def.stageCapabilityBoost)[0];
        capNoticeText = `${getCapabilityName(capKey)}+1`;
      }
    }

    projectProgressNotices.push({
      projectName: proj.name,
      oldProgress,
      newProgress,
      capabilityChange: capNoticeText || undefined
    });

    if (nextStageIndex >= proj.totalDuration - 1) {
      completedNames.push(proj.name);
      nextState.completedPolicyIds = [...nextState.completedPolicyIds, proj.policyId];
      nextState.completedPolicies = [
        ...nextState.completedPolicies,
        {
          policyId: proj.policyId,
          policyName: proj.name,
          quarter: nextState.quarter,
          intensity: proj.intensity,
          cost: proj.totalCost,
          efficiency: proj.efficiency,
          completedQuarter: nextState.quarter,
          maintenanceCost: proj.maintenance,
          operatingIncome: proj.operatingIncome
        }
      ];

      if (proj.positiveEffects.economy) nextState.economy = clamp(nextState.economy + proj.positiveEffects.economy);
      if (proj.positiveEffects.livelihood) nextState.livelihood = clamp(nextState.livelihood + proj.positiveEffects.livelihood);
      if (proj.positiveEffects.environment) nextState.environment = clamp(nextState.environment + proj.positiveEffects.environment);
      if (proj.positiveEffects.morale) nextState.morale = clamp(nextState.morale + proj.positiveEffects.morale);
      if (proj.positiveEffects.resilience) nextState.resilience = clamp(nextState.resilience + proj.positiveEffects.resilience);

      if (proj.policyId === "industrial_park" || proj.policyId === "multimodal_hub") {
        nextState.industrialTaxBase = (nextState.industrialTaxBase ?? 0) + 1;
      }
      if (proj.policyId === "translational_med" || proj.policyId === "expo_center_renovation") {
        nextState.industrialTaxBase = (nextState.industrialTaxBase ?? 0) + 0.5;
      }

      const year = getYearFromQuarter(nextState.quarter);
      const qInYear = getQuarterInYear(nextState.quarter);
      nextState.chronicle = [
        {
          id: `chron_comp_${nextState.quarter}_${proj.id}`,
          quarter: nextState.quarter,
          year,
          quarterInYear: qInYear,
          type: "project_complete",
          title: `项目竣工：${proj.name}`,
          body: `经过 ${proj.totalDuration} 个季度的建设，${proj.name}正式完工投入运行！`
        },
        ...nextState.chronicle
      ];
    } else {
      updatedProj.remainingDuration = proj.totalDuration - 1 - nextStageIndex;
      remainingProjects.push(updatedProj);
    }
  });

  nextState.activeProjects = remainingProjects;

  // 4. 结算当前活动重大机遇 (在 settleQuarter 季度末提交方案时结算)
  let opportunityNotice = "";
  let opportunityGrantIncome = 0;
  const activeOppId = nextState.activeMajorOpportunityId;
  if (activeOppId) {
    const oppState = nextState.opportunityStates[activeOppId];
    if (oppState && oppState.status !== "settled" && state.quarter === oppState.settleQuarter) {
      const oppRes = resolveMajorOpportunitySettlement(nextState, activeOppId);
      nextState = oppRes.nextState;

      if (oppRes.resultModalData?.grant) {
        opportunityGrantIncome = oppRes.resultModalData.grant;
      }

      const oppDef = MAJOR_OPPORTUNITIES_DATA[activeOppId];
      const tierLabel = oppRes.resultModalData?.resultTier === "super_success"
        ? "超级成功"
        : oppRes.resultModalData?.resultTier === "success"
        ? "成功"
        : oppRes.resultModalData?.resultTier === "partial_success"
        ? "部分成功"
        : "未达门槛";

      opportunityNotice = `第 ${state.quarter} 季度【${oppDef.shortTitle}】竞逐揭晓：【${tierLabel}】！` +
        (oppRes.resultModalData?.grant ? `获得专项资金 ${oppRes.resultModalData.grant} 亿元。` : "");

      // 调度下一个机遇的时间
      nextState.nextOpportunityStartQuarter = state.quarter + 3; // 经过 2 个完整休息季度后在 Q+3 开始
    }
  }

  // 5. 扣除政策冷却时间
  const updatedCooldowns: Record<string, number> = {};
  Object.entries(nextState.policyCooldowns).forEach(([id, cd]) => {
    if (cd > 1) {
      updatedCooldowns[id] = cd - 1;
    }
  });
  nextState.policyCooldowns = updatedCooldowns;

  // 6. Roll Quarter Event
  const activeEvent = rollQuarterEvent(nextState, prng);

  // Financial Ledger calculations
  const openingDebt = state.openingDebtThisQuarter ?? state.debt;
  const policyBorrowing = state.policyBorrowingThisQuarter ?? 0;
  const eventBorrowing = state.eventBorrowingThisQuarter ?? 0;
  const voluntaryRepayment = state.voluntaryRepaymentThisQuarter ?? 0;
  const netChange = nextState.debt - openingDebt;

  let explanation = "";
  if (netChange > 0) {
    if (policyBorrowing > 0) {
      explanation = `本季度债务增加 ${netChange} 亿元，主要原因是工程建设与政策投入超过可用财政。`;
    } else {
      explanation = `本季度未批准新项目，但维护费 (${maintenanceExpense}亿)、机遇运营费 (${opportunityOperatingCosts}亿) 与债务利息 (${debtInterest}亿) 造成 ${debtAddedFromDeficit} 亿元经常性财政赤字。`;
    }
  } else if (netChange < 0) {
    explanation = `本季度债务净减少 ${Math.abs(netChange)} 亿元，财政运行平稳并进行了主动偿债。`;
  } else {
    explanation = "本季度收支平衡，债务未发生变化。";
  }

  const debtLedger: QuarterDebtLedger = {
    openingDebt,
    policyBorrowing,
    recurringDeficitBorrowing: debtAddedFromDeficit,
    eventBorrowing,
    voluntaryRepayment,
    netChange,
    endingDebt: nextState.debt,
    explanation
  };

  const financeBreakdown: QuarterFinanceBreakdown = {
    taxBaseEconomy: taxInfo.taxBaseEconomy,
    industrialTaxBase: taxInfo.industrialTaxBase,
    temporaryTaxBonus: taxInfo.temporaryTaxBonus,
    taxIncome: taxInfo.taxIncome,
    taxModifier: taxInfo.taxModifier,
    operatingIncomeTotal,
    opportunityGrantIncome,
    baseExpense,
    maintenanceExpense,
    opportunityOperatingCosts,
    maintenanceDiscount,
    debtInterest,
    recurringBalance: Math.round((totalQuarterRevenue + opportunityGrantIncome - necessaryExpense) * 10) / 10,
    policySpending: policySpendingThisQuarter,
    eventSpending: 0,
    debtAdded: debtAddedFromDeficit,
    debtLedger
  };

  const metricChanges: Partial<MetricDelta> = {
    economy: nextState.economy - initialEcon,
    livelihood: nextState.livelihood - initialLive,
    environment: nextState.environment - initialEnv,
    morale: nextState.morale - initialMorale,
    resilience: nextState.resilience - initialRes,
    treasury: nextState.treasury - state.treasury,
    debt: nextState.debt - state.debt
  };

  const headline = generateQuarterNewsHeadline(nextState, completedNames);

  const summary: QuarterSummaryData = {
    quarter: nextState.quarter,
    finance: financeBreakdown,
    completedProjectNames: completedNames,
    projectProgressNotices,
    opportunityNotice,
    metricChanges,
    newsHeadline: headline
  };

  nextState.lastQuarterSummary = summary;

  return { nextState, summary };
}

export function completeQuarterStep(state: GameState): GameState {
  let nextState: GameState = { ...state };
  const prng = new PRNG(nextState.seed + nextState.quarter * 607);

  if (nextState.lastQuarterSummary) {
    nextState.quarterHistory = [...nextState.quarterHistory, nextState.lastQuarterSummary];
  }
  nextState.lastQuarterSummary = undefined;

  if (nextState.morale < 10) {
    nextState.consecutiveLowMorale += 1;
  } else {
    nextState.consecutiveLowMorale = 0;
  }

  if (nextState.debt > 120) {
    nextState.gameStatus = "failed";
    nextState.endingId = "fiscal_takeover";
    return nextState;
  }

  if (nextState.consecutiveLowMorale >= 2) {
    nextState.gameStatus = "failed";
    nextState.endingId = "gloomy_resignation";
    return nextState;
  }

  if (nextState.quarter >= 20) {
    nextState.gameStatus = "finished";
    nextState.endingId = resolveEnding(nextState).id;
    return nextState;
  }

  nextState.quarter += 1;

  // Reset quarterly action allowance
  nextState.actionUsedThisQuarter = false;

  // Automatically sync/rotate major city opportunities
  nextState = syncMajorOpportunityRotation(nextState);

  // Reset turn transient debt metrics
  nextState.openingDebtThisQuarter = nextState.debt;
  nextState.voluntaryRepaymentThisQuarter = 0;
  nextState.policyBorrowingThisQuarter = 0;
  nextState.eventBorrowingThisQuarter = 0;

  if (isNewYearQuarter(nextState.quarter)) {
    const nextTrend = rollNextAnnualTrend(prng, nextState.currentTrend, nextState.trendHistory);
    nextState.currentTrend = nextTrend;
    const year = getYearFromQuarter(nextState.quarter);
    nextState.trendHistory = [...nextState.trendHistory, { year, trendId: nextTrend, trendTitle: "" }];
  }

  nextState.currentSignal = generateQuarterlySignal(prng, nextState.quarter);
  nextState.candidatePolicies = generateQuarterlyCandidates(nextState, prng);

  // Update pity counter for the active major opportunity
  const currentActiveId = nextState.activeMajorOpportunityId;
  if (currentActiveId) {
    const currentCandidateDefs = nextState.candidatePolicies
      .map((id) => POLICIES_DATA.find((p) => p.id === id))
      .filter(Boolean);

    const hasRelated = currentCandidateDefs.some(
      (p) =>
        (p?.opportunityIds && p.opportunityIds.includes(currentActiveId)) ||
        (p?.isOpportunitySynergy && p?.synergyOpportunityId === currentActiveId)
    );

    const currentPityMap = { ...(nextState.quartersWithoutRelevantPolicyMap ?? {}) };
    const prevCount = currentPityMap[currentActiveId] ?? 0;

    if (hasRelated) {
      currentPityMap[currentActiveId] = 0;
    } else {
      currentPityMap[currentActiveId] = prevCount + 1;
    }
    nextState.quartersWithoutRelevantPolicyMap = currentPityMap;
    nextState.quartersWithoutRelevantPolicy = currentPityMap[currentActiveId];
  }

  // Roll Quarter Event for the new quarter's decision phase
  nextState.currentEvent = rollQuarterEvent(nextState, prng) ?? undefined;

  return nextState;
}

function generateQuarterNewsHeadline(state: GameState, completedNames: string[]): string {
  if (completedNames.length > 0) {
    return `${completedNames.join("与")}完工交付，临州市民喜迎公共利好！`;
  }
  if (state.debt > 90) {
    return `城投负债逼近 120 亿托管警戒线，财政开支收紧调度防范风险。`;
  }
  if (state.economy > 65) {
    return `临州实体经济持续高歌猛进，就业市场呈现两旺局面。`;
  }
  if (state.environment < 40) {
    return `空气质量与河道监测出现波动，市民呼吁加大环保投入。`;
  }
  return `临州市五年规划稳步推进，各项经济与民生建设平稳运行。`;
}

export function setDraftAction(state: GameState, draft: DraftAction | undefined): GameState {
  return {
    ...state,
    draftAction: draft
  };
}

export function executeQuarterResolution(state: GameState): { nextState: GameState; summary: QuarterSummaryData } {
  const draft = state.draftAction;

  let policyName = "";
  if (draft && draft.type === "policy" && draft.policyId) {
    const p = POLICIES_DATA.find((item) => item.id === draft.policyId);
    policyName = p?.name ?? "";
  }

  let res: { nextState: GameState; summary: QuarterSummaryData };
  if (draft && draft.type === "policy" && draft.policyId) {
    res = approvePolicyAction(state, draft.policyId, draft.intensity ?? "full");
  } else if (draft && draft.type === "repay") {
    res = skipQuarterAction(state, true);
  } else {
    res = skipQuarterAction(state, false);
  }

  const finalSummary: QuarterSummaryData = {
    ...res.summary,
    executedDraft: draft,
    draftPolicyName: policyName
  };

  return {
    nextState: { ...res.nextState, draftAction: undefined, lastQuarterSummary: finalSummary },
    summary: finalSummary
  };
}

export function syncMajorOpportunityRotation(state: GameState): GameState {
  let nextState = { ...state };
  if (!nextState.opportunityStates) nextState.opportunityStates = {};
  if (!nextState.followUpOpportunityOrder) {
    nextState.followUpOpportunityOrder = ["freight_hub", "regional_medical", "cultural_expo"];
  }

  const activeOppId = nextState.activeMajorOpportunityId;
  const activeOpp = activeOppId ? nextState.opportunityStates[activeOppId] : null;

  const isCurrentActiveDone = !activeOpp || activeOpp.status === "settled";
  const startQuarterTarget = nextState.nextOpportunityStartQuarter ?? 8;

  if (isCurrentActiveDone && nextState.quarter >= startQuarterTarget) {
    // 寻找下一个未结算 (status !== "settled") 的机遇
    const unstartedId = nextState.followUpOpportunityOrder.find(
      (id) => !nextState.opportunityStates[id] || nextState.opportunityStates[id].status !== "settled"
    );

    if (unstartedId) {
      const oppDef = MAJOR_OPPORTUNITIES_DATA[unstartedId];
      if (oppDef) {
        const existingState = nextState.opportunityStates[unstartedId];
        const startQ = Math.max(startQuarterTarget, nextState.quarter);
        const newOppState: CityOpportunityState = {
          id: unstartedId,
          title: oppDef.name,
          startQuarter: startQ,
          settleQuarter: startQ + 3,
          hasResearched: existingState?.hasResearched ?? false,
          status: "announced",
          opportunitySynergyIds: existingState?.opportunitySynergyIds ?? []
        };
        nextState.opportunityStates = {
          ...nextState.opportunityStates,
          [unstartedId]: newOppState
        };
        nextState.activeMajorOpportunityId = unstartedId;
        nextState.cityOpportunityState = newOppState;
      }
    }
  }

  return nextState;
}

