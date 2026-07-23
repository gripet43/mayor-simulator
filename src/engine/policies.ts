import { POLICIES_DATA, computeDirectInitiationCost, computeInstallments } from "../data/policiesData";
import { GameState, Intensity, IntensityConfig, PolicyDefinition } from "../types/game";
import { wouldExceedDebtLimit } from "./finance";
import { PRNG } from "./prng";

export const INTENSITY_CONFIGS: Record<Intensity, IntensityConfig> = {
  pilot: {
    intensity: "pilot",
    label: "试点方案",
    costMultiplier: 0.6,
    positiveMultiplier: 0.6,
    negativeMultiplier: 0.35,
    maintenanceMultiplier: 0.5,
    riskMultiplier: 0.5,
    durationReduce: 0,
    description: "小范围试水，成本低、风险小，但正向收益较少。"
  },
  full: {
    intensity: "full",
    label: "全市推行",
    costMultiplier: 1.0,
    positiveMultiplier: 1.0,
    negativeMultiplier: 1.0,
    maintenanceMultiplier: 1.0,
    riskMultiplier: 1.0,
    durationReduce: 0,
    description: "标准投入方案，按设计预期全面推进。"
  },
  intensive: {
    intensity: "intensive",
    label: "攻坚投入",
    costMultiplier: 1.5,
    positiveMultiplier: 1.5,
    negativeMultiplier: 1.5,
    maintenanceMultiplier: 1.2,
    riskMultiplier: 1.8,
    durationReduce: 1,
    description: "倾斜资源强力攻坚，效果与工期优势明显，但非线性副作用与突发风险剧增。"
  }
};

export function getPolicyDefinition(policyId: string): PolicyDefinition | undefined {
  return POLICIES_DATA.find((p) => p.id === policyId);
}

export function isPolicyExecutable(
  state: GameState,
  policy: PolicyDefinition,
  isDirectInitiation = false
): { executable: boolean; reason?: string } {
  if (state.actionUsedThisQuarter) {
    return { executable: false, reason: "本季度政策行动已使用" };
  }

  const baseCost = isDirectInitiation ? computeDirectInitiationCost(policy.baseCost) : policy.baseCost;
  const installments = computeInstallments(baseCost, policy.duration);
  const firstInstallment = installments[0] ?? baseCost;

  if (wouldExceedDebtLimit(state.treasury, state.debt, firstInstallment)) {
    return { executable: false, reason: "首期款将导致债务超过 120 亿上限" };
  }

  const isActive = state.activeProjects.some((p) => p.policyId === policy.id);
  if (isActive) {
    return { executable: false, reason: "同名工程已在建" };
  }

  const uses = state.policyUseCount[policy.id] ?? 0;
  if (uses >= policy.maxUses) {
    return { executable: false, reason: "已达到最大审批次数" };
  }

  const cooldown = state.policyCooldowns[policy.id] ?? 0;
  if (cooldown > 0) {
    return { executable: false, reason: "政策处于冷却中" };
  }

  if (policy.id === "consumption_coupon" && state.economy >= 70) {
    return { executable: false, reason: "仅在经济低于 70 时可用" };
  }

  return { executable: true };
}

export function generateQuarterlyCandidates(state: GameState, prng: PRNG): string[] {
  const activeIds = state.activeProjects.map((p) => p.policyId);

  const available = POLICIES_DATA.filter((p) => {
    if (activeIds.includes(p.id)) return false;
    const uses = state.policyUseCount[p.id] ?? 0;
    if (uses >= p.maxUses) return false;
    return true;
  });

  if (available.length === 0) return [];

  const activeOppId = state.activeMajorOpportunityId ?? "new_energy_base";
  const pityCount = state.quartersWithoutRelevantPolicyMap?.[activeOppId] ?? state.quartersWithoutRelevantPolicy ?? 0;
  const isPityTriggered = pityCount >= 2;

  let chosenIds: string[] = [];

  if (isPityTriggered && activeOppId) {
    const relatedPool = available.filter(
      (p) =>
        (p.opportunityIds && p.opportunityIds.includes(activeOppId)) ||
        (p.isOpportunitySynergy && p.synergyOpportunityId === activeOppId)
    );
    if (relatedPool.length > 0) {
      const injected = relatedPool[Math.floor(prng.nextFloat() * relatedPool.length)];
      chosenIds.push(injected.id);
    }
  }

  const pool = [...available].sort(() => prng.nextFloat() - 0.5);

  for (const item of pool) {
    if (chosenIds.length >= 3) break;
    if (!chosenIds.includes(item.id)) {
      chosenIds.push(item.id);
    }
  }

  return chosenIds;
}

export function previewPolicyCostAndDuration(
  state: GameState,
  policy: PolicyDefinition,
  intensity: Intensity,
  isDirectInitiation = false
): { cost: number; duration: number; maintenance: number } {
  const config = INTENSITY_CONFIGS[intensity];
  const rawCost = isDirectInitiation ? computeDirectInitiationCost(policy.baseCost) : policy.baseCost;

  let discount = 0;
  const buff = state.temporaryBuffs.find((b) => b.id === "digital_gov_buff" && b.remainingUses > 0);
  if (buff) {
    discount = buff.policyCostDiscount;
  }

  const cost = Math.max(1, Math.ceil((rawCost * config.costMultiplier - discount) * 10) / 10);
  const duration = Math.max(1, policy.duration - config.durationReduce);
  const maintenance = Math.round(policy.maintenance * config.maintenanceMultiplier * 10) / 10;

  return { cost, duration, maintenance };
}

export function previewPolicyEffects(
  state: GameState,
  policy: PolicyDefinition,
  intensity: Intensity,
  efficiency = 1.0
): {
  positiveEffects: Record<string, number>;
  negativeEffects: Record<string, number>;
  notes: string[];
} {
  const config = INTENSITY_CONFIGS[intensity];
  const notes: string[] = [];

  let effBonus = 0;
  const buff = state.temporaryBuffs.find((b) => b.id === "digital_gov_buff" && b.remainingUses > 0);
  if (buff) {
    effBonus = buff.executionEfficiencyBonus / 100;
  }

  const finalEff = efficiency + effBonus;

  const pos: Record<string, number> = {};
  const neg: Record<string, number> = {};

  Object.entries(policy.positiveEffects).forEach(([k, v]) => {
    if (v !== undefined && v !== 0) {
      let multiplier = config.positiveMultiplier * finalEff;

      const tagMatch =
        (state.currentTrend === "manufacturing_recovery" && policy.tags.includes("industrial")) ||
        (state.currentTrend === "consumption_recovery" && policy.tags.includes("consumption")) ||
        (state.currentTrend === "property_cooling" && policy.tags.includes("housing")) ||
        (state.currentTrend === "heavy_rain" && policy.tags.includes("resilience")) ||
        (state.currentTrend === "population_outflow" && (policy.tags.includes("talent") || policy.tags.includes("education"))) ||
        (state.currentTrend === "green_transition" && policy.tags.includes("green"));

      if (tagMatch) {
        multiplier *= 1.25;
      }

      if (policy.id === "land_restructuring" && state.currentTrend === "property_cooling") {
        multiplier *= 0.5;
        notes.push("受【房地产降温】趋势影响，土地变现收益大幅减半");
      }

      pos[k] = Math.round(v * multiplier);
    }
  });

  Object.entries(policy.negativeEffects).forEach(([k, v]) => {
    if (v !== undefined && v !== 0) {
      let negMult = config.negativeMultiplier;
      if (policy.id === "land_restructuring" && intensity === "intensive") {
        negMult *= 1.6;
        notes.push("土地整理强力攻坚加剧搬迁补偿争议与环境损毁");
      }
      neg[k] = Math.round(v * negMult);
    }
  });

  return { positiveEffects: pos, negativeEffects: neg, notes };
}
