import { ENDINGS_DATA } from "../data/endingsData";
import { EndingDefinition, EndingId, FinalScore, GameState } from "../types/game";
import { calculateFiscalHealth, clamp } from "./finance";

export function calculateFinalScore(state: GameState): FinalScore {
  const fiscalHealth = calculateFiscalHealth(state.treasury, state.debt);

  const baseScore =
    state.economy * 0.25 +
    state.livelihood * 0.25 +
    state.environment * 0.15 +
    state.morale * 0.15 +
    state.resilience * 0.10 +
    fiscalHealth * 0.10;

  const unfinishedPenalty = state.activeProjects.length * 3;
  const finalScoreVal = clamp(baseScore - unfinishedPenalty, 0, 100);

  const ending = resolveEnding(state, finalScoreVal);

  return {
    fiscalHealth,
    baseScore: Math.round(baseScore),
    unfinishedProjectsPenalty: unfinishedPenalty,
    finalScore: finalScoreVal,
    ending
  };
}

export function resolveEnding(state: GameState, calculatedScore?: number): EndingDefinition {
  // 1. Defeat: Fiscal Takeover (debt > 120)
  if (state.debt > 120) {
    return ENDINGS_DATA.fiscal_takeover;
  }

  // 2. Defeat: Gloomy Resignation (consecutive low morale >= 2)
  if (state.consecutiveLowMorale >= 2) {
    return ENDINGS_DATA.gloomy_resignation;
  }

  const score = calculatedScore ?? calculateFinalScore(state).finalScore;

  // 3. Model City (示范城市)
  if (
    score >= 85 &&
    state.debt <= 50 &&
    state.economy >= 70 &&
    state.livelihood >= 70 &&
    state.environment >= 70 &&
    state.morale >= 70
  ) {
    return ENDINGS_DATA.model_city;
  }

  // 4. Green Transformation (绿色转型样本)
  const executedGreen =
    state.completedPolicyIds.includes("pollution_control") || state.completedPolicyIds.includes("green_fund");
  if (state.environment >= 75 && state.economy >= 60 && executedGreen) {
    return ENDINGS_DATA.green_transformation;
  }

  // 5. Livable Builder (宜居城市建设者)
  if (state.livelihood >= 75 && state.morale >= 65 && state.debt < 90) {
    return ENDINGS_DATA.livable_builder;
  }

  // 6. Internet Famous Experience (网红城市短期体验官)
  const tourismCount =
    (state.policyUseCount["tourism_festival"] ?? 0) +
    (state.policyUseCount["night_market"] ?? 0) +
    (state.policyUseCount["consumption_coupon"] ?? 0);
  if (tourismCount >= 3 && state.economy >= 65 && (state.environment < 55 || state.debt >= 70)) {
    return ENDINGS_DATA.internet_famous_exp;
  }

  // 7. High Debt (债务高企)
  if (state.debt >= 95) {
    return ENDINGS_DATA.high_debt;
  }

  // 8. Steady Reformer (稳健改革者)
  return ENDINGS_DATA.steady_reformer;
}

export function generateEndingSummaryText(state: GameState, score: FinalScore): string {
  const econDiff = state.economy - 42;
  const debtDiff = state.debt - 32;

  let summary = `你把临州市从一个财政尚可、环境欠账严重的传统工业城市，带成了`;

  if (econDiff > 15 && debtDiff > 20) {
    summary += `经济增长明显但债务偏高的城市。`;
  } else if (econDiff > 15 && debtDiff <= 10) {
    summary += `经济迅猛跃升且财政健康度优良的模范城市。`;
  } else if (state.environment >= 70) {
    summary += `绿水青山与低碳发展相得益彰的生态宜居城市。`;
  } else if (state.livelihood >= 70) {
    summary += `公共服务完善、市民幸福感极高的高品质城市。`;
  } else {
    summary += `在多方矛盾中稳健求索的转型城市。`;
  }

  if (state.completedPolicyIds.includes("industrial_park")) {
    summary += `工业园招商带来了源源不断的税收，但也阶段性带来了环保与用工考验。`;
  }

  if (state.eventHistory.some((e) => e.eventId === "rainstorm_waterlogging" && !e.isSuccess)) {
    summary += `你遗憾的失误，是在暴雨来临时缺少足够的防灾基础设施与应急准备。`;
  } else if (state.completedPolicyIds.includes("flood_control")) {
    summary += `你在任期内提前兴修水利，成功化解了多起极端灾害风险。`;
  }

  return summary;
}
