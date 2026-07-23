import { GameState } from "../types/game";

export interface ActiveLinkage {
  id: string;
  title: string;
  description: string;
}

export function checkActiveLinkages(state: GameState): ActiveLinkage[] {
  const completed = new Set(state.completedPolicyIds);
  const linkages: ActiveLinkage[] = [];

  // 14.1 Industrial & Transportation
  if (completed.has("industrial_park") && (completed.has("bus_priority") || completed.has("subway_extension"))) {
    linkages.push({
      id: "industrial_transport",
      title: "产城融合·交通先行",
      description: "工业园招商额外经济收益 +3，“企业考察工业园”成功率 +10%。"
    });
  }

  // 14.2 Talent & Housing/Education
  if (completed.has("talent_subsidy") && (completed.has("rental_housing") || completed.has("school_expansion"))) {
    linkages.push({
      id: "talent_housing",
      title: "引才育才·安居乐业",
      description: "人才补贴额外经济收益 +4，“高校毕业生外流”事件触发概率 -20%。"
    });
  }

  // 14.3 Night Market & Bus
  if (completed.has("night_market") && completed.has("bus_priority")) {
    linkages.push({
      id: "night_bus",
      title: "夜间经济·公交便民",
      description: "夜市经济额外经济收益 +2，夜市扰民事件触发概率 -20%。"
    });
  }

  // 14.4 Industrial & Environmental
  if (completed.has("industrial_park") && (completed.has("pollution_control") || completed.has("green_fund"))) {
    linkages.push({
      id: "industrial_green",
      title: "工业生态·绿色减排",
      description: "工业园招商环境负面效果减少 3 点，污染类事件概率 -15%。"
    });
  }

  // 14.5 Hospital & Flood Control
  if (completed.has("hospital_expansion") || completed.has("flood_control")) {
    linkages.push({
      id: "health_resilience",
      title: "公共卫生·极灾减伤",
      description: "暴雨与高温事件的民生和民心损失减少 30%。"
    });
  }

  // 14.6 Digital Government
  const digitalBuff = state.temporaryBuffs.find((b) => b.id === "digital_gov_buff");
  if (digitalBuff && digitalBuff.remainingUses > 0) {
    linkages.push({
      id: "digital_gov",
      title: "数字政务·高效审批",
      description: `剩余 ${digitalBuff.remainingUses} 次政策审批：资金成本 -1 亿，执行效率 +8%。`
    });
  }

  return linkages;
}
