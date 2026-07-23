import { EVENTS_DATA } from "../data/eventsData";
import { ActiveEvent, EventDefinition, EventOption, EventRecord, GameState, MetricDelta } from "../types/game";
import { clamp, payExpense } from "./finance";
import { PRNG } from "./prng";

export function getEventDefinition(id: string): EventDefinition | undefined {
  return EVENTS_DATA.find((e) => e.id === id);
}

export function calculateEventTriggerProbability(state: GameState): number {
  let prob = 0.25;

  if (state.currentTrend === "manufacturing_recovery") prob += 0.10;
  if (state.currentTrend === "heavy_rain") prob += 0.15;
  if (state.currentTrend === "population_outflow") prob += 0.10;

  if (state.economy < 30 || state.livelihood < 30 || state.environment < 30 || state.morale < 30) {
    prob += 0.10;
  }

  if (state.currentSignal) {
    prob += 0.10;
  }

  prob = Math.min(0.60, prob);

  let quartersWithoutEvent = 0;
  for (let i = state.quarterHistory.length - 1; i >= 0; i--) {
    if (!state.quarterHistory[i].eventRecord) {
      quartersWithoutEvent++;
    } else {
      break;
    }
  }

  if (quartersWithoutEvent >= 3) {
    prob = Math.max(0.40, prob);
  }

  return prob;
}

export function calculateGambleSuccessRate(
  state: GameState,
  event: EventDefinition,
  option: EventOption
): number {
  if (!option.successRate) return 100;

  let rate = option.successRate;
  const completed = new Set(state.completedPolicyIds);

  if (event.relatedMetrics) {
    event.relatedMetrics.forEach((m) => {
      const val = state[m as keyof GameState] as number;
      if (typeof val === "number") {
        if (val >= 70) rate += 5;
        if (val < 40) rate -= 5;
      }
    });
  }

  if (event.id === "industrial_inspection" && (completed.has("bus_priority") || completed.has("subway_extension"))) {
    rate += 10;
  }
  if (event.id === "youth_rent_complaint" && (completed.has("rental_housing") || completed.has("school_expansion"))) {
    rate += 10;
  }

  return clamp(rate, 35, 75);
}

export function rollQuarterEvent(state: GameState, prng: PRNG): ActiveEvent | null {
  const prob = calculateEventTriggerProbability(state);
  const triggered = prng.rollChance(prob);
  if (!triggered) return null;

  const candidateEvents = EVENTS_DATA.filter((e) => {
    const recent = state.eventHistory.filter((h) => h.eventId === e.id);
    if (recent.length > 0) {
      const lastOccurrence = recent[recent.length - 1].quarter;
      if (state.quarter - lastOccurrence <= e.cooldown) {
        return false;
      }
    }

    if (e.id === "industrial_odor" && (!state.completedPolicyIds.includes("industrial_park") || state.environment >= 55)) {
      return false;
    }
    if (e.id === "financing_cost_rise" && state.debt < 80) {
      return false;
    }

    return true;
  });

  if (candidateEvents.length === 0) return null;

  let totalWeight = 0;
  const weights = candidateEvents.map((e) => {
    let w = e.baseWeight;
    if (state.currentSignal && state.currentSignal.relatedEvents.includes(e.id)) {
      w *= 2.0;
    }
    totalWeight += w;
    return w;
  });

  let rand = prng.nextFloat() * totalWeight;
  let selectedEvent = candidateEvents[candidateEvents.length - 1];
  for (let i = 0; i < candidateEvents.length; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      selectedEvent = candidateEvents[i];
      break;
    }
  }

  const rates: Record<string, number> = {};
  selectedEvent.options.forEach((opt) => {
    rates[opt.id] = calculateGambleSuccessRate(state, selectedEvent, opt);
  });

  const hasSignalHint = state.currentSignal ? state.currentSignal.relatedEvents.includes(selectedEvent.id) : false;

  return {
    event: selectedEvent,
    hasSignalHint,
    calculatedSuccessRates: rates
  };
}

export function resolveEventOptionSelection(
  state: GameState,
  activeEvent: ActiveEvent,
  optionId: string,
  prng: PRNG
): { nextState: GameState; record: EventRecord } {
  const event = activeEvent.event;
  const option = event.options.find((o) => o.id === optionId);
  if (!option) throw new Error(`Event option ${optionId} not found`);

  let isSuccess = true;
  let effects: Partial<MetricDelta> = {};

  if (option.successRate !== undefined) {
    const rate = activeEvent.calculatedSuccessRates[option.id] ?? 50;
    isSuccess = prng.rollChance(rate / 100);
    effects = isSuccess ? { ...option.successEffects } : { ...(option.failureEffects ?? {}) };
  } else {
    isSuccess = true;
    effects = { ...option.successEffects };
  }

  if (event.id === "rainstorm_waterlogging" && optionId === "opt_drain") {
    if (state.resilience >= 50) {
      effects = { debt: 1, morale: -1 };
    } else {
      effects = { debt: 4, livelihood: -3, morale: -4 };
    }
  }

  const completed = new Set(state.completedPolicyIds);
  if ((event.id === "rainstorm_waterlogging" || event.id === "continuous_heatwave") && (completed.has("hospital_expansion") || completed.has("flood_control"))) {
    if (effects.livelihood && effects.livelihood < 0) {
      effects.livelihood = Math.round(effects.livelihood * 0.7);
    }
    if (effects.morale && effects.morale < 0) {
      effects.morale = Math.round(effects.morale * 0.7);
    }
  }

  // Apply Health Event Loss Multiplier from National Regional Medical Center
  const isHealth = event.isHealthRelated || ["food_safety_anomaly", "continuous_heatwave", "rainstorm_waterlogging", "industrial_odor"].includes(event.id);
  const healthMult = state.healthEventLossMultiplier ?? 1.0;

  if (isHealth && healthMult < 1.0) {
    if (effects.livelihood && effects.livelihood < 0) {
      effects.livelihood = Math.round(effects.livelihood * healthMult * 10) / 10;
    }
    if (effects.morale && effects.morale < 0) {
      effects.morale = Math.round(effects.morale * healthMult * 10) / 10;
    }
    if (effects.debt && effects.debt > 0) {
      effects.debt = Math.round(effects.debt * healthMult * 10) / 10;
    }
  }

  const cost = option.cost ?? 0;
  const payRes = payExpense(state.treasury, state.debt, cost);

  const nextState: GameState = {
    ...state,
    treasury: payRes.treasury,
    debt: payRes.debt
  };

  if (effects.treasury) nextState.treasury = Math.max(0, nextState.treasury + effects.treasury);
  if (effects.debt) nextState.debt = Math.max(0, nextState.debt + effects.debt);
  if (effects.economy) nextState.economy = clamp(nextState.economy + effects.economy);
  if (effects.livelihood) nextState.livelihood = clamp(nextState.livelihood + effects.livelihood);
  if (effects.environment) nextState.environment = clamp(nextState.environment + effects.environment);
  if (effects.morale) nextState.morale = clamp(nextState.morale + effects.morale);
  if (effects.resilience) nextState.resilience = clamp(nextState.resilience + effects.resilience);

  if (event.id === "construction_accident" && optionId === "opt_stop_inspect" && nextState.activeProjects.length > 0) {
    const projIdx = prng.nextInt(0, nextState.activeProjects.length - 1);
    nextState.activeProjects[projIdx].remainingDuration += 1;
  }

  const logMessage = isSuccess ? option.successLog : option.failureLog;

  const record: EventRecord = {
    quarter: state.quarter,
    eventId: event.id,
    eventTitle: event.title,
    optionId: option.id,
    optionLabel: option.label,
    isSuccess,
    costPaid: cost,
    effects,
    logMessage,
    hasSignalHint: activeEvent.hasSignalHint
  };

  nextState.eventHistory = [...nextState.eventHistory, record];
  nextState.currentEvent = undefined;

  return { nextState, record };
}
