import { POLICIES_DATA } from "../data/policiesData";
import { MetricDelta } from "../types/game";

export const METRIC_NAMES: Record<string, string> = {
  treasury: "可用财政",
  debt: "城投债务",
  economy: "经济",
  livelihood: "民生",
  environment: "环境",
  morale: "民心",
  resilience: "防灾能力"
};

export const CAPABILITY_NAMES: Record<string, string> = {
  skillTalent: "技能人才",
  cleanEnergy: "清洁能源",
  industrialSpace: "产业空间",
  administrativeEfficiency: "行政效率",
  trafficConnectivity: "交通联通",
  freightCapacity: "货运能力",
  tradeService: "商贸服务",
  clinicalCapability: "临床能力",
  medicalResearch: "医学科研",
  culturalAttraction: "文化吸引力",
  touristReception: "游客接待",
  eventOperation: "活动运营"
};

export function getMetricName(key: string): string {
  return METRIC_NAMES[key] ?? CAPABILITY_NAMES[key] ?? key;
}

export function getCapabilityName(key: string): string {
  return CAPABILITY_NAMES[key] ?? key;
}

export function formatMetricDelta(key: string, value: number): string {
  const name = getMetricName(key);
  const isFinancial = key === "treasury" || key === "debt";
  const unit = isFinancial ? " 亿" : "";
  const sign = value >= 0 ? `+${value}` : `${value}`;
  return `${name} ${sign}${unit}`;
}

export function formatEffectsMap(effects: Partial<MetricDelta>): string[] {
  const result: string[] = [];
  Object.entries(effects).forEach(([key, val]) => {
    if (val !== undefined && val !== 0) {
      result.push(formatMetricDelta(key, val));
    }
  });
  return result;
}

export interface FormattedEffectItem {
  key: string;
  text: string;
  isPositive: boolean;
}

export function isMetricChangePositive(key: string, value: number): boolean {
  if (key === "debt") {
    return value < 0; // 债务减少为正面 (绿色)，增加为负面 (红色)
  }
  return value > 0; // 其他指标增加为正面
}

export function formatEffectsMapDetailed(effects: Partial<MetricDelta>): FormattedEffectItem[] {
  const result: FormattedEffectItem[] = [];
  Object.entries(effects).forEach(([key, val]) => {
    if (val !== undefined && val !== 0) {
      result.push({
        key,
        text: formatMetricDelta(key, val),
        isPositive: isMetricChangePositive(key, val)
      });
    }
  });
  return result;
}

export function getPolicyName(policyId: string): string {
  const found = POLICIES_DATA.find((p) => p.id === policyId);
  return found ? found.name : policyId;
}
