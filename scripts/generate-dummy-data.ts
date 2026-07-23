import fs from 'fs';
import path from 'path';
import type { CityConfig } from '../src/types/schemas';

const industries = [
  { id: "manufacturing", name: "制造业", baseOutput: 360, employmentCapacity: 41, averageWage: 4500, growthRate: 0, pollutionFactor: 78, demandSensitivity: 1.3, employmentElasticity: 0.55 },
  { id: "construction", name: "建筑与房地产相关", baseOutput: 145, employmentCapacity: 19, averageWage: 5500, growthRate: 0, pollutionFactor: 48, demandSensitivity: 1.5, employmentElasticity: 0.65 },
  { id: "logistics", name: "物流运输", baseOutput: 115, employmentCapacity: 18, averageWage: 4000, growthRate: 0, pollutionFactor: 62, demandSensitivity: 1.0, employmentElasticity: 0.55 },
  { id: "modern_services", name: "现代服务业", baseOutput: 225, employmentCapacity: 29, averageWage: 9000, growthRate: 0, pollutionFactor: 15, demandSensitivity: 1.1, employmentElasticity: 0.45 },
  { id: "local_services", name: "生活性服务业", baseOutput: 175, employmentCapacity: 35, averageWage: 3500, growthRate: 0, pollutionFactor: 20, demandSensitivity: 0.8, employmentElasticity: 0.70 },
  { id: "agriculture", name: "农业与县域经济", baseOutput: 55, employmentCapacity: 12, averageWage: 3000, growthRate: 0, pollutionFactor: 35, demandSensitivity: 0.5, employmentElasticity: 0.35 }
];

const districts = [
  { id: "central", name: "中心老城区", population: 72, housingSupply: 32, vacancyRate: 0.05, rentIndex: 112, students: 7.9, schoolCapacity: 7.3, teachers: 96, accessibility: 78, roadCondition: 55, healthcareCapability: 82, healthcareStaff: 98, environment: 55, drainage: 48, sewage: 82, safetyCapability: 68, publicSpace: 60, elderlyCare: 70, childcare: 52, floodExposure: 72, congestionIndex: 68 },
  { id: "east", name: "东部新城", population: 58, housingSupply: 29, vacancyRate: 0.13, rentIndex: 104, students: 7.2, schoolCapacity: 6.2, teachers: 88, accessibility: 60, roadCondition: 72, healthcareCapability: 58, healthcareStaff: 84, environment: 68, drainage: 62, sewage: 76, safetyCapability: 75, publicSpace: 66, elderlyCare: 48, childcare: 45, floodExposure: 58, congestionIndex: 55 },
  { id: "north", name: "北部工业区", population: 48, housingSupply: 22, vacancyRate: 0.08, rentIndex: 92, students: 4.8, schoolCapacity: 4.5, teachers: 92, accessibility: 56, roadCondition: 61, healthcareCapability: 60, healthcareStaff: 90, environment: 42, drainage: 55, sewage: 68, safetyCapability: 58, publicSpace: 44, elderlyCare: 55, childcare: 48, floodExposure: 66, congestionIndex: 60 },
  { id: "west", name: "西部大学城", population: 42, housingSupply: 19, vacancyRate: 0.09, rentIndex: 101, students: 3.8, schoolCapacity: 4.2, teachers: 103, accessibility: 66, roadCondition: 68, healthcareCapability: 70, healthcareStaff: 98, environment: 74, drainage: 67, sewage: 84, safetyCapability: 78, publicSpace: 70, elderlyCare: 54, childcare: 62, floodExposure: 45, congestionIndex: 52 },
  { id: "south", name: "南部县域", population: 38, housingSupply: 18, vacancyRate: 0.11, rentIndex: 78, students: 3.2, schoolCapacity: 3.4, teachers: 90, accessibility: 42, roadCondition: 54, healthcareCapability: 52, healthcareStaff: 86, environment: 70, drainage: 52, sewage: 60, safetyCapability: 64, publicSpace: 50, elderlyCare: 62, childcare: 40, floodExposure: 70, congestionIndex: 35 },
  { id: "logistics", name: "沿江物流带", population: 22, housingSupply: 10, vacancyRate: 0.08, rentIndex: 86, students: 2.1, schoolCapacity: 2.0, teachers: 87, accessibility: 52, roadCondition: 58, healthcareCapability: 48, healthcareStaff: 82, environment: 47, drainage: 44, sewage: 64, safetyCapability: 55, publicSpace: 42, elderlyCare: 45, childcare: 38, floodExposure: 80, congestionIndex: 58 }
];

const residentGroups = [
  { id: "young_renters", name: "青年租住者", populationRatio: 0.18, initialSatisfaction: 58, weights: { employment: 0.25, housing: 0.25, education: 0.05, healthcare: 0.05, transport: 0.20, environment: 0.08, business: 0.02, elderly: 0, governance: 0.10 } },
  { id: "families", name: "有孩家庭", populationRatio: 0.24, initialSatisfaction: 61, weights: { employment: 0.15, housing: 0.17, education: 0.25, healthcare: 0.15, transport: 0.10, environment: 0.08, business: 0.02, elderly: 0, governance: 0.08 } },
  { id: "industrial_workers", name: "产业工人", populationRatio: 0.16, initialSatisfaction: 57, weights: { employment: 0.30, housing: 0.12, education: 0.05, healthcare: 0.10, transport: 0.18, environment: 0.10, business: 0.03, elderly: 0, governance: 0.12 } },
  { id: "skilled_workers", name: "高技能就业者", populationRatio: 0.12, initialSatisfaction: 64, weights: { employment: 0.25, housing: 0.12, education: 0.15, healthcare: 0.10, transport: 0.10, environment: 0.18, business: 0.02, elderly: 0, governance: 0.08 } },
  { id: "small_business", name: "小微经营者", populationRatio: 0.13, initialSatisfaction: 56, weights: { employment: 0.18, housing: 0.12, education: 0.05, healthcare: 0.08, transport: 0.10, environment: 0.07, business: 0.28, elderly: 0, governance: 0.12 } },
  { id: "elderly", name: "老年居民", populationRatio: 0.17, initialSatisfaction: 62, weights: { employment: 0.05, housing: 0.08, education: 0.03, healthcare: 0.30, transport: 0.14, environment: 0.10, business: 0, elderly: 0.20, governance: 0.10 } }
];

const legacyProjects = [
  { id: "legacy_east_road", name: "东部新城主干路项目", remainingCapitalCost: 24, remainingQuarters: 4, quarterlyCost: 6, completedOperatingCost: 0.3, effects: [{ id: "eff_east_road", stage: "ON_COMPLETE" as const, scope: "DISTRICT" as const, scopeId: "east", metric: "roadCondition", mode: "ADD" as const, minValue: 10, maxValue: 15, delayQuarters: 0, durationQuarters: null, description: "提升东部新城道路条件" }] },
  { id: "legacy_central_hospital", name: "中心医院扩建项目", remainingCapitalCost: 30, remainingQuarters: 6, quarterlyCost: 5, completedOperatingCost: 0.9, effects: [{ id: "eff_central_hospital", stage: "ON_COMPLETE" as const, scope: "DISTRICT" as const, scopeId: "central", metric: "healthcareCapability", mode: "ADD" as const, minValue: 15, maxValue: 20, delayQuarters: 0, durationQuarters: null, description: "缓解中心城区医疗压力" }] },
  { id: "legacy_logistics_facility", name: "沿江物流设施项目", remainingCapitalCost: 32, remainingQuarters: 8, quarterlyCost: 4, completedOperatingCost: 0.5, effects: [{ id: "eff_logistics_facility", stage: "ON_COMPLETE" as const, scope: "DISTRICT" as const, scopeId: "logistics", metric: "congestionIndex", mode: "ADD" as const, minValue: -5, maxValue: -2, delayQuarters: 0, durationQuarters: null, description: "增加货运压力" }] }
];

// 36 Policies (6 per category)
const policyTitles = [
  // 1. 经济与就业 (economy_employment)
  { id: "pol_1", name: "制造业技术改造支持", cat: "economy_employment", desc: "鼓励制造企业引进高新技术，对技改项目给予资金贴息支持，以提升全市工业生产效率和竞争力。" },
  { id: "pol_2", name: "中小企业综合服务平台", cat: "economy_employment", desc: "建立一站式小微企业公共服务体系，提供政策咨询、财税代理、法律援助等综合孵化支持。" },
  { id: "pol_3", name: "职业技能提升计划", cat: "economy_employment", desc: "开展覆盖全体产业工人的新型职业技能培训，对获得国家职业资格证书的给予专项补贴奖励。" },
  { id: "pol_4", name: "物流园区设施升级", cat: "economy_employment", desc: "升级扩建北部和沿江物流园区的智能仓储和数字化分拨中枢设备，提升全市货物吞吐量和运转时效。" },
  { id: "pol_5", name: "大学毕业生留城计划", cat: "economy_employment", desc: "对留城就业的大学毕业生提供一笔过首年租房安家补贴，并在新城落户政策上予以重点倾斜。" },
  { id: "pol_6", name: "老商业街区更新计划", cat: "economy_employment", desc: "对中心老城区破旧商业街区进行人行道美化、老旧店面升级和基础设施微改造，重塑夜间经济活力。" },

  // 2. 财政与治理 (fiscal_governance)
  { id: "pol_7", name: "预算绩效管理改革", cat: "fiscal_governance", desc: "全面落实预算项目全生命周期绩效追踪审计，根据绩效评价结果核减或砍掉低效行政资金支出。" },
  { id: "pol_8", name: "低效项目清理", cat: "fiscal_governance", desc: "停止财政对长期处于闲置或效率低下的基建和信息化项目的运维拨款，节约全市公共财政开支。" },
  { id: "pol_9", name: "债务风险管理计划", cat: "fiscal_governance", desc: "对到期债务批次制定长效债务置换方案，优化地方融资杠杆结构，严格限制超限新增融资规模。" },
  { id: "pol_10", name: "政务服务数字化", cat: "fiscal_governance", desc: "建设统一的安澜市政务小程序，实现90%以上行政审批事项线上秒批秒办，压缩办事周期与人员编制。" },
  { id: "pol_11", name: "招标采购透明化", cat: "fiscal_governance", desc: "推进公共资源交易电子化平台闭环改革，规范财政招标控制价管理，节约各项工程资本支出预算。" },
  { id: "pol_12", name: "基础设施维护优先机制", cat: "fiscal_governance", desc: "建立优先拨付道路、管线及防灾等存量市政公用设施维护资金的长效机制，防范带病超期服役风险。" },

  // 3. 住房与城市更新 (housing_renewal)
  { id: "pol_13", name: "保障性租赁住房计划", cat: "housing_renewal", desc: "在东部新城和大学城周边集中规划建设一批平价保障性公租房，向新市民和青年租房群体配租。" },
  { id: "pol_14", name: "老旧小区综合改造", cat: "housing_renewal", desc: "对中心城区老旧小区进行管网清淤、外墙加固、适老化无障碍通道和老旧电梯增设等硬件更新。" },
  { id: "pol_15", name: "新城土地供应调整", cat: "housing_renewal", desc: "合理优化东部新城居住用地出让配比，根据当前房地产市场库存和空置率科学控制开发节奏。" },
  { id: "pol_16", name: "闲置商业空间改造", cat: "housing_renewal", desc: "允许将空置率较高的新城商业写字楼依法改建为长租公寓和青年孵化公寓，提高房源利用效率。" },
  { id: "pol_17", name: "社区公共空间提升", cat: "housing_renewal", desc: "利用社区夹角、空地增建小型口袋公园、居民健身点及休闲走廊，增加片区绿化与公共活动场所。" },
  { id: "pol_18", name: "青年过渡住房计划", cat: "housing_renewal", desc: "为刚入职的初创人群和灵活就业青年提供3-6个月超低租金的过渡期驿站，缓解毕业生首期租房困难。" },

  // 4. 交通与基础设施 (transport_infrastructure)
  { id: "pol_19", name: "公交优先走廊", cat: "transport_infrastructure", desc: "在中心老城区和东部新城通勤主干道增设彩色公交专用车道，通过信号灯优先保障公交运行速度。" },
  { id: "pol_20", name: "公交线网重构", cat: "transport_infrastructure", desc: "优化调整全市低效长途公交线路，增设地铁与大学城、物流带之间的微循环社区穿梭巴士。" },
  { id: "pol_21", name: "老城区停车管理", cat: "transport_infrastructure", desc: "对老城区占道车位实施差异化智慧化停车收费，建设立体公共停车场以缓解路面违停现象。" },
  { id: "pol_22", name: "道路养护专项", cat: "transport_infrastructure", desc: "实施北部工业区和沿江物流带重载货运主通道路面结构性修复，提升物流周转安全性与时效。" },
  { id: "pol_23", name: "排水管网改造", cat: "transport_infrastructure", desc: "彻底改造老城区和沿江物流带易涝区域老旧下水道，拓宽排水管径，提升城市瞬时暴雨排涝能力。" },
  { id: "pol_24", name: "县域公共交通补贴", cat: "transport_infrastructure", desc: "由财政拨付县域公共交通运营补贴，平抑南部县域长途客车票价，保障偏远农村群体出行便利。" },

  // 5. 教育、医疗与养老 (welfare_services)
  { id: "pol_25", name: "东部新城学校建设", cat: "welfare_services", desc: "在住宅流入集中的东部片区配建2所高标准九年一贯制公办学校，缓解新城刚需学位短缺瓶颈。" },
  { id: "pol_26", name: "教师跨片区调配", cat: "welfare_services", desc: "鼓励老城区优秀教师到东部新城和南部县域骨干学校开展轮岗教学，促进教育资源水平均衡化。" },
  { id: "pol_27", name: "普惠托育补贴", cat: "welfare_services", desc: "对符合标准的普惠性3岁以下民办托育机构按照托位给予财政补贴，降低青年双职工家庭育儿开支。" },
  { id: "pol_28", name: "基层医疗扩容", cat: "welfare_services", desc: "升级南部县域和北部工业区社区卫生服务中心硬件设备，增设夜间急诊和常用药储备。" },
  { id: "pol_29", name: "家庭医生服务计划", cat: "welfare_services", desc: "为老城区及南部县域的高龄和慢性病老人提供签约式上门义诊，以减少二级及三级医院门诊负荷。" },
  { id: "pol_30", name: "社区养老服务中心", cat: "welfare_services", desc: "在老旧小区集中建设提供午餐助餐、日间照料和健康娱乐的社区养老日间服务点。" },

  // 6. 环境与安全 (environment_safety)
  { id: "pol_31", name: "工业低排放改造", cat: "environment_safety", desc: "对北部工业区的高耗能高污染制造企业脱硫脱硝设备升级给予财政补贴，限制重点企业排污。" },
  { id: "pol_32", name: "污水管网补缺", cat: "environment_safety", desc: "补齐新开发片区的生活污水收集主管网断头路，提高污水集中收治率并改善片区景观水系环境。" },
  { id: "pol_33", name: "沿江防洪能力提升", cat: "environment_safety", desc: "加固沿江物流带重点防汛堤防，提升沿江港口和物流设施抵御超标特大洪涝水灾的安全系数。" },
  { id: "pol_34", name: "安全生产专项检查", cat: "environment_safety", desc: "对北部工业区危化企业开展拉网式消防与特种设备安全排查，消除恶性安全事故隐患。" },
  { id: "pol_35", name: "老旧地下管线更新", cat: "environment_safety", desc: "对中心老城区超期服役的燃气、供自来水老旧地下钢管实施开挖更新，防范爆裂和漏损事故。" },
  { id: "pol_36", name: "城市应急储备提升", cat: "environment_safety", desc: "建立市级抗洪防汛沙袋、便携式抽水泵以及应急食品医药的充足配额仓库，防范自然气候风险。" }
];

const policies = policyTitles.map((p, i) => {
  let cost = 3;
  let upkeep = 0.5;
  let admin = 1;
  let quarters = 2;
  
  if (i % 3 === 1) { // Medium
    cost = 8;
    upkeep = 1.2;
    admin = 2;
    quarters = 4;
  } else if (i % 3 === 2) { // Large
    cost = 20;
    upkeep = 3.0;
    admin = 3;
    quarters = 6;
  }

  return {
    id: p.id,
    name: p.name,
    category: p.cat,
    description: p.desc,
    authorityDescription: "市级主要负责人核准",
    targetDistricts: ["central", "east", "north", "west", "south", "logistics"],
    beneficiaries: ["young_renters", "families", "industrial_workers", "elderly"],
    negativelyAffectedGroups: [],
    startupCost: 1,
    capitalCost: cost,
    annualOperatingCost: upkeep * 4,
    approvalQuarters: 1,
    implementationQuarters: quarters,
    durationQuarters: null,
    adminCostPerQuarter: admin,
    repeatable: false,
    cancellable: true,
    cooldownQuarters: 4,
    effects: [
      {
        id: `eff_${p.id}`,
        stage: "WHILE_ACTIVE" as const,
        scope: "CITY" as const,
        metric: p.cat === "economy_employment" ? "economy.gdp" : "city.credibility",
        mode: "ADD" as const,
        minValue: 1.5,
        maxValue: 3.5,
        delayQuarters: 0,
        durationQuarters: null,
        description: "政策中间效应传导"
      }
    ],
    confidence: "HIGH" as const,
    risks: ["项目推进局部阻力"],
    causalChain: ["实施生效后提升特定满意度"]
  };
});

// 60 events
const events = Array.from({ length: 60 }).map((_, i) => {
  const cat = ["economy", "fiscal", "housing", "welfare", "transport", "environment"][i % 6];
  return {
    id: `evt_${i}`,
    title: `事件 ${i + 1}: 市政治理日常决策`,
    category: cat,
    description: `安澜市收到市民代表对于关于“${cat === 'economy' ? '促进青年群体灵活就业支持政策' : cat === 'fiscal' ? '严格压减一般性行政开支决议' : '加快老城区停车位差异化收费管理'}”的反馈诉求，需要主要领导决断。`,
    isCrisis: i % 15 === 0,
    weight: 10,
    earliestQuarter: 1,
    latestQuarter: 20,
    cooldownQuarters: 4,
    triggerOnce: false,
    options: [
      {
        id: `opt_${i}_1`,
        text: "支持积极推进（需拨付小额紧急财政资金）",
        effects: [
          { id: `eff_opt_${i}_1`, stage: "ON_COMPLETE" as const, scope: "CITY" as const, metric: "fiscal.cash", mode: "ADD" as const, minValue: -2, maxValue: -1, delayQuarters: 0, durationQuarters: null, description: "拨付应急财政资金" }
        ],
        cost: 1.5
      },
      {
        id: `opt_${i}_2`,
        text: "暂缓列支预算（倾向于维持原有管理规划）",
        effects: [
          { id: `eff_opt_${i}_2`, stage: "ON_COMPLETE" as const, scope: "CITY" as const, metric: "city.credibility", mode: "ADD" as const, minValue: -2, maxValue: -1, delayQuarters: 0, durationQuarters: null, description: "公信力小幅扣减" }
        ],
        cost: 0
      }
    ]
  };
});

const config: CityConfig = {
  policies,
  events,
  industries,
  districts,
  residentGroups,
  legacyProjects,
  initialCash: 48,
  initialDebt: 780,
  baseAdministrativeCapacity: 12
};

const outputPath = path.join(process.cwd(), 'src/data/config.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
console.log(`Generated complete write-out config to ${outputPath}`);
