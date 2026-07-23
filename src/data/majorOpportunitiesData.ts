import { MajorOpportunityDefinition } from "../types/game";

export const MAJOR_OPPORTUNITIES_DATA: Record<string, MajorOpportunityDefinition> = {
  new_energy_base: {
    id: "new_energy_base",
    name: "新能源产业基地省内竞逐",
    shortTitle: "新能源产业基地",
    startQuarterDefault: 2,
    settleQuarterDefault: 5,
    coreCapabilityKeys: ["skillTalent", "cleanEnergy", "industrialSpace"],
    auxiliaryCapabilityKey: "administrativeEfficiency",
    capabilityNames: {
      skillTalent: "技能人才",
      cleanEnergy: "清洁能源",
      industrialSpace: "产业空间",
      administrativeEfficiency: "行政效率"
    },
    strategicProjects: [
      { id: "school_expansion", name: "职业技术学院扩建", capKey: "skillTalent", capName: "技能人才" },
      { id: "green_grid", name: "绿色电网改造", capKey: "cleanEnergy", capName: "清洁能源" },
      { id: "industrial_park", name: "产业园区扩建", capKey: "industrialSpace", capName: "产业空间" },
      { id: "digital_government", name: "数字政务升级", capKey: "administrativeEfficiency", capName: "行政效率" }
    ],
    biddingTiers: {
      none: { tier: "none", label: "放弃申报", cost: 0, scoreBonus: 0 },
      conservative: { tier: "conservative", label: "保守申报", cost: 3, scoreBonus: 4 },
      standard: { tier: "standard", label: "标准申报", cost: 6, scoreBonus: 8 },
      full: { tier: "full", label: "全力申报", cost: 10, scoreBonus: 14 }
    },
    rewards: {
      failed: { label: "未达申报门槛 (失败)", grant: 0, socialInvestment: 0, constructionTaxBonus: 0, permanentBaseBonus: 0, permanentOperatingFee: 0 },
      partial_success: { label: "部分成功 (储备基地)", grant: 5, socialInvestment: 20, constructionTaxBonus: 1, permanentBaseBonus: 2, permanentOperatingFee: 0 },
      success: { label: "竞逐成功 (重点基地)", grant: 12, socialInvestment: 60, constructionTaxBonus: 2, permanentBaseBonus: 4, permanentOperatingFee: 0 },
      super_success: { label: "超级成功 (国家级示范)", grant: 20, socialInvestment: 100, constructionTaxBonus: 3, permanentBaseBonus: 6, permanentOperatingFee: 0 }
    },
    synergyPolicyIds: ["battery_supply_chain", "clean_transport_subsidy"]
  },

  freight_hub: {
    id: "freight_hub",
    name: "国家综合货运枢纽申报",
    shortTitle: "国家综合货运枢纽",
    coreCapabilityKeys: ["trafficConnectivity", "freightCapacity", "tradeService"],
    auxiliaryCapabilityKey: "administrativeEfficiency",
    capabilityNames: {
      trafficConnectivity: "交通联通",
      freightCapacity: "货运能力",
      tradeService: "商贸服务",
      administrativeEfficiency: "行政效率"
    },
    strategicProjects: [
      { id: "freight_corridor", name: "城际货运通道升级", capKey: "trafficConnectivity", capName: "交通联通" },
      { id: "multimodal_hub", name: "多式联运中心", capKey: "freightCapacity", capName: "货运能力" },
      { id: "trade_port", name: "口岸与商贸服务中心", capKey: "tradeService", capName: "商贸服务" },
      { id: "smart_logistics", name: "智慧物流调度平台", capKey: "administrativeEfficiency", capName: "行政效率" }
    ],
    biddingTiers: {
      none: { tier: "none", label: "放弃申报", cost: 0, scoreBonus: 0 },
      conservative: { tier: "conservative", label: "基础配套", cost: 4, scoreBonus: 4 },
      standard: { tier: "standard", label: "重点配套", cost: 7, scoreBonus: 8 },
      full: { tier: "full", label: "枢纽级配套", cost: 11, scoreBonus: 14 }
    },
    rewards: {
      failed: { label: "未达申报门槛 (失败)", grant: 0, socialInvestment: 0, constructionTaxBonus: 0, permanentBaseBonus: 0, permanentOperatingFee: 0 },
      partial_success: { label: "部分成功 (区域试点)", grant: 5, socialInvestment: 25, constructionTaxBonus: 1, permanentBaseBonus: 2, permanentOperatingFee: 0.5, metricEffects: { environment: -1 } },
      success: { label: "成功批复 (国家级枢纽)", grant: 12, socialInvestment: 70, constructionTaxBonus: 2, permanentBaseBonus: 4, permanentOperatingFee: 1.0, metricEffects: { environment: -2 } },
      super_success: { label: "超级成功 (国际物流枢纽)", grant: 20, socialInvestment: 120, constructionTaxBonus: 3, permanentBaseBonus: 6, permanentOperatingFee: 1.0, metricEffects: { environment: -2 } }
    },
    synergyPolicyIds: ["sea_rail_agreement", "green_freight_demo"]
  },

  regional_medical: {
    id: "regional_medical",
    name: "国家区域医学中心争创",
    shortTitle: "区域医学中心",
    coreCapabilityKeys: ["clinicalCapability", "medicalResearch", "skillTalent"],
    auxiliaryCapabilityKey: "administrativeEfficiency",
    capabilityNames: {
      clinicalCapability: "临床能力",
      medicalResearch: "医学科研",
      skillTalent: "技能人才",
      administrativeEfficiency: "行政效率"
    },
    strategicProjects: [
      { id: "clinical_center", name: "区域临床中心扩建", capKey: "clinicalCapability", capName: "临床能力" },
      { id: "translational_med", name: "转化医学研究平台", capKey: "medicalResearch", capName: "医学科研" },
      { id: "med_talent_plan", name: "医学人才培养计划", capKey: "skillTalent", capName: "技能人才" },
      { id: "med_data_platform", name: "区域医疗数据平台", capKey: "administrativeEfficiency", capName: "行政效率" }
    ],
    biddingTiers: {
      none: { tier: "none", label: "放弃申报", cost: 0, scoreBonus: 0 },
      conservative: { tier: "conservative", label: "联合申报", cost: 3, scoreBonus: 4 },
      standard: { tier: "standard", label: "重点共建", cost: 6, scoreBonus: 8 },
      full: { tier: "full", label: "国家级共建", cost: 10, scoreBonus: 14 }
    },
    rewards: {
      failed: { label: "未达申报门槛 (失败)", grant: 0, socialInvestment: 0, constructionTaxBonus: 0, permanentBaseBonus: 0, permanentOperatingFee: 0 },
      partial_success: { label: "部分成功 (省级医疗中心)", grant: 6, socialInvestment: 20, constructionTaxBonus: 0.5, permanentBaseBonus: 1, permanentOperatingFee: 0.5, metricEffects: { livelihood: 3 }, healthLossReduction: 0.20 },
      success: { label: "成功批复 (国家区域医学中心)", grant: 15, socialInvestment: 50, constructionTaxBonus: 1, permanentBaseBonus: 2, permanentOperatingFee: 1.0, metricEffects: { livelihood: 6 }, healthLossReduction: 0.40 },
      super_success: { label: "超级成功 (国家医学创新示范区)", grant: 24, socialInvestment: 90, constructionTaxBonus: 2, permanentBaseBonus: 3, permanentOperatingFee: 1.5, metricEffects: { livelihood: 10 }, healthLossReduction: 0.60 }
    },
    synergyPolicyIds: ["top_medical_team", "clinical_trial_network"]
  },

  cultural_expo: {
    id: "cultural_expo",
    name: "国际文化旅游博览会申办",
    shortTitle: "国际文旅博览会",
    coreCapabilityKeys: ["culturalAttraction", "touristReception", "eventOperation"],
    auxiliaryCapabilityKey: "administrativeEfficiency",
    capabilityNames: {
      culturalAttraction: "文化吸引力",
      touristReception: "游客接待",
      eventOperation: "活动运营",
      administrativeEfficiency: "行政效率"
    },
    strategicProjects: [
      { id: "historic_district_renewal", name: "历史文化街区更新", capKey: "culturalAttraction", capName: "文化吸引力" },
      { id: "tourist_service_network", name: "城市游客服务网络", capKey: "touristReception", capName: "游客接待" },
      { id: "expo_center_renovation", name: "国际会展与演艺中心改造", capKey: "eventOperation", capName: "活动运营" },
      { id: "digital_tourism_platform", name: "数字文旅服务平台", capKey: "administrativeEfficiency", capName: "行政效率" }
    ],
    biddingTiers: {
      none: { tier: "none", label: "放弃申报", cost: 0, scoreBonus: 0 },
      conservative: { tier: "conservative", label: "区域联办", cost: 3, scoreBonus: 4 },
      standard: { tier: "standard", label: "主办城市", cost: 6, scoreBonus: 8 },
      full: { tier: "full", label: "国际主场", cost: 10, scoreBonus: 14 }
    },
    rewards: {
      failed: { label: "未达申报门槛 (失败)", grant: 0, socialInvestment: 0, constructionTaxBonus: 0, permanentBaseBonus: 0, permanentOperatingFee: 0 },
      partial_success: { label: "部分成功 (分会场承办)", grant: 3, socialInvestment: 20, constructionTaxBonus: 2, permanentBaseBonus: 1, permanentOperatingFee: 0.5, metricEffects: { morale: 2 } },
      success: { label: "成功申办 (主会场承办)", grant: 8, socialInvestment: 55, constructionTaxBonus: 4, permanentBaseBonus: 2, permanentOperatingFee: 1.0, metricEffects: { morale: 5 } },
      super_success: { label: "超级成功 (永久主场基地)", grant: 15, socialInvestment: 100, constructionTaxBonus: 7, permanentBaseBonus: 4, permanentOperatingFee: 1.5, metricEffects: { morale: 8 } }
    },
    synergyPolicyIds: ["intl_tourism_brand", "hospitality_training"]
  }
};
