import { TrendId } from "../types/game";
import { PRNG } from "./prng";

const ALL_TRENDS: TrendId[] = [
  "manufacturing_recovery",
  "consumption_recovery",
  "property_cooling",
  "heavy_rain",
  "population_outflow",
  "green_transition"
];

export function isNewYearQuarter(quarter: number): boolean {
  return quarter === 1 || quarter === 5 || quarter === 9 || quarter === 13 || quarter === 17;
}

export function getYearFromQuarter(quarter: number): number {
  return Math.floor((quarter - 1) / 4) + 1;
}

export function getQuarterInYear(quarter: number): number {
  return ((quarter - 1) % 4) + 1;
}

export function rollNextAnnualTrend(
  prng: PRNG,
  currentTrend?: TrendId,
  trendHistory: { year: number; trendId: TrendId }[] = []
): TrendId {
  if (!currentTrend || trendHistory.length === 0) {
    // First year: completely random choice
    const idx = prng.nextInt(0, ALL_TRENDS.length - 1);
    return ALL_TRENDS[idx];
  }

  // Check how many consecutive years the current trend has lasted
  let consecutiveYears = 0;
  for (let i = trendHistory.length - 1; i >= 0; i--) {
    if (trendHistory[i].trendId === currentTrend) {
      consecutiveYears++;
    } else {
      break;
    }
  }

  // If already lasted 2 years, must change trend
  if (consecutiveYears >= 2) {
    const choices = ALL_TRENDS.filter((t) => t !== currentTrend);
    const idx = prng.nextInt(0, choices.length - 1);
    return choices[idx];
  }

  // Otherwise: 50% chance continue, 50% chance change
  const continueCurrent = prng.rollChance(0.5);
  if (continueCurrent) {
    return currentTrend;
  } else {
    const choices = ALL_TRENDS.filter((t) => t !== currentTrend);
    const idx = prng.nextInt(0, choices.length - 1);
    return choices[idx];
  }
}
