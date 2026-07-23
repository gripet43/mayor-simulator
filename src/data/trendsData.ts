import { TrendId } from "../types/game";

export interface TrendDefinition {
  id: TrendId;
  title: string;
  subtitle: string;
  description: string;
  affectedPolicyTypes: string;
  positivePrompt: string;
  riskPrompt: string;
}

export const TRENDS_DATA: Record<TrendId, TrendDefinition> = {
  manufacturing_recovery: {
    id: "manufacturing_recovery",
    title: "制造业订单回暖",
    subtitle: "外地企业开始重新寻找生产基地，产业投资机会增加。",
    description: "工业园招商、交通建设与绿色产业的经济收益提升 25%。",
    affectedPolicyTypes: "工业园招商、地铁/公交、绿色产业",
    positivePrompt: "工业与交通联动政策将带来超额经济回报。",
    riskPrompt: "盲目扩产可能同步增加污染事件与用工压力。"
  },
  consumption_recovery: {
    id: "consumption_recovery",
    title: "消费市场回暖",
    subtitle: "市民消费意愿提升，餐饮、零售与文旅业迎来复苏。",
    description: "消费券、夜市经济、文旅节庆的经济收益提升 25%。",
    affectedPolicyTypes: "消费券、夜市经济、文旅节庆",
    positivePrompt: "轻量级消费政策能快速刺激城市活力与税收。",
    riskPrompt: "若忽视配套治理，可能引发夜市扰民与食品安全投诉。"
  },
  property_cooling: {
    id: "property_cooling",
    title: "房地产市场降温",
    subtitle: "土地出让收入放缓，住房保障需求更加凸显。",
    description: "土地整理财政收益减半 (x0.5)；保障性租赁住房民生收益提升 15%。",
    affectedPolicyTypes: "土地整理、保障性租赁住房",
    positivePrompt: "发展保障房能获得极佳的民生与人口留存回报。",
    riskPrompt: "依赖卖地变现的短视政策收益将大幅缩水。"
  },
  heavy_rain: {
    id: "heavy_rain",
    title: "汛期降雨偏多",
    subtitle: "气象部门预警本年度降雨量显著高于往年平均。",
    description: "暴雨积水事件发生概率提升 100% (x2)；防洪排涝工程效果提升 35%。",
    affectedPolicyTypes: "防洪排涝、医院扩容",
    positivePrompt: "提前兴修水利能化解重大城市积水危机。",
    riskPrompt: "不做防灾准备在暴雨来临时将遭受重大财政与民心损失。"
  },
  population_outflow: {
    id: "population_outflow",
    title: "人口外流加剧",
    subtitle: "周边大城市吸聚效应增强，青年劳动人口持续流失。",
    description: "人才补贴、保障房与学校扩建收益提升 25%；若本季度未回应人口政策，民心每季 -2。",
    affectedPolicyTypes: "人才补贴、保障房、学校扩建",
    positivePrompt: "加码人才与教育公共服务能大幅缓解人才流失。",
    riskPrompt: "缺乏配套回应将导致社会民心持续下滑。"
  },
  green_transition: {
    id: "green_transition",
    title: "绿色转型加速",
    subtitle: "上级环保考核升级，绿色低碳产业获得政策红利。",
    description: "环保整治与绿色产业基金的经济和环境收益提升 25%。",
    affectedPolicyTypes: "环保整治、绿色产业基金",
    positivePrompt: "绿色产业投资可实现经济与环境的双赢突破。",
    riskPrompt: "传统高污染高能耗项目更容易触发监管处罚。"
  }
};
