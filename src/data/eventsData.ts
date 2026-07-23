import { EventDefinition } from "../types/game";

export const EVENTS_DATA: EventDefinition[] = [
  {
    id: "order_inquiry",
    title: "外地订单询价增加",
    body: "受产业市场影响，多家沿海转移企业向临州市发出订单采购与产能意向。",
    source: "市经信局报送",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["industrial", "manufacturing"],
    options: [
      {
        id: "opt_sign",
        label: "签下订单",
        cost: 3,
        description: "支付 3 亿建立供应链对接与用工支持。",
        successEffects: { economy: 5, morale: 1 }
      },
      {
        id: "opt_pass",
        label: "暂不接单",
        description: "放弃订单，错失市场扩张良机。",
        successEffects: { economy: -2 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (55%)",
        successRate: 55,
        description: "尝试签约高端高附加值订单，风险与收益并存。",
        successEffects: { economy: 9 },
        failureEffects: { economy: -5 },
        successLog: "成功签下高端大单，效益远超预期！",
        failureLog: "未能按期履约，赔付违约金并损害市场声誉。"
      }
    ]
  },
  {
    id: "industrial_inspection",
    title: "企业考察工业园",
    body: "某省外重点制造企业代表团莅临临州，评估工业园二期招商落户条件。",
    source: "招商局风向",
    cooldown: 4,
    baseWeight: 25,
    relatedTags: ["industrial"],
    options: [
      {
        id: "opt_support",
        label: "配套先行",
        cost: 6,
        description: "支付 6 亿完善园区周边道路与水电气配套。",
        successEffects: { economy: 8, morale: 2 }
      },
      {
        id: "opt_discount",
        label: "低价换落户",
        description: "出让部分出让金优惠，快速出让土地。",
        successEffects: { treasury: 4, economy: -3, environment: -2 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "争取总部级产业基地落户。",
        successEffects: { economy: 12 },
        failureEffects: { debt: 6, economy: -5 },
        successLog: "巨头总部项目成功落地，园区价值爆发！",
        failureLog: "谈判破裂，园区垫资建设成本转为债务。"
      }
    ]
  },
  {
    id: "industrial_odor",
    title: "居民反映工业异味",
    body: "工业园周边小区群众多次向市长热线投诉夜间有刺激性气体异味。",
    source: "市生态环境局",
    cooldown: 3,
    baseWeight: 25,
    relatedTags: ["industrial", "environment"],
    options: [
      {
        id: "opt_rectify",
        label: "立即整改",
        cost: 4,
        description: "支付 4 亿补贴企业加装废气过滤装置并限期整改。",
        successEffects: { environment: 6, morale: 1 }
      },
      {
        id: "opt_production",
        label: "先保生产",
        description: "优先保证园区产值，拖延整改时间。",
        successEffects: { economy: 2, environment: -5, morale: -5 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "依赖自然风向稀释，寄希望于检测合格。",
        successEffects: {},
        failureEffects: { environment: -8, morale: -4 },
        successLog: "检测符合临时标准，群众情绪暂时平复。",
        failureLog: "异味扩散引发省媒关注，环境与民心受创。"
      }
    ]
  },
  {
    id: "hiring_difficulty",
    title: "企业招工困难",
    body: "园区新进制造业工厂面临普工与技术工人短缺，产能无法满负荷运转。",
    source: "人社局报告",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["industrial", "talent"],
    options: [
      {
        id: "opt_train",
        label: "启动培训",
        cost: 3,
        description: "支付 3 亿联合职业学校开展专项技能培训。",
        successEffects: { economy: 4 }
      },
      {
        id: "opt_slow",
        label: "暂缓扩产",
        description: "建议企业自行在市场高薪招工，控制扩产。",
        successEffects: { economy: -3 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (60%)",
        successRate: 60,
        description: "向周边县市跨区域开展包车抢人行动。",
        successEffects: { economy: 8 },
        failureEffects: { economy: -5 },
        successLog: "包车抢人成功，数千名工人顺利入职！",
        failureLog: "跨区招工引发劳务纠纷，招工未达预期。"
      }
    ]
  },
  {
    id: "environmental_inspection",
    title: "环保检查临近",
    body: "中央环保督察组即将进驻临州市，开展为期一个月的暗访与抽查。",
    source: "官方提示",
    cooldown: 4,
    baseWeight: 30,
    relatedTags: ["environment"],
    options: [
      {
        id: "opt_fix",
        label: "主动补齐设施",
        cost: 3,
        description: "支付 3 亿提前排查并关停隐患车间。",
        successEffects: { environment: 4, economy: -2 }
      },
      {
        id: "opt_ignore",
        label: "暂时搁置",
        description: "抱着侥幸心理维持现状。",
        successEffects: { environment: -6, morale: -3 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "组织紧急应检抽查。",
        successEffects: {},
        failureEffects: { debt: 5, environment: -5 },
        successLog: "顺利通过抽查，未被通报批评。",
        failureLog: "违规排污被抓正着，被处以高额罚款及停业整顿。"
      }
    ]
  },
  {
    id: "property_slump",
    title: "房地产成交下滑",
    body: "市场观望情绪浓厚，商品房成交量同比下降四成，土地流拍风险加剧。",
    source: "市住建局",
    cooldown: 3,
    baseWeight: 25,
    relatedTags: ["housing", "land"],
    options: [
      {
        id: "opt_housing",
        label: "转向保障房",
        cost: 2,
        description: "支付 2 亿收购部分存量房作为保障房。",
        successEffects: { livelihood: 4, morale: 2 }
      },
      {
        id: "opt_land_sell",
        label: "加快土地出让",
        description: "降价推介优质地块，补充临时财政。",
        successEffects: { treasury: 5, livelihood: -2, morale: -3 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "出台购房落户与契税补贴政策。",
        successEffects: { economy: 5 },
        failureEffects: { debt: 6 },
        successLog: "楼市成交短暂回暖，带起相关产业链。",
        failureLog: "补贴未能刺激消费，反而增加财政债务负担。"
      }
    ]
  },
  {
    id: "youth_rent_complaint",
    title: "青年租房投诉",
    body: "年轻白领与高校毕业生反映二房东乱涨价、房源质量差与押金退还难。",
    source: "街头消息",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["housing", "talent"],
    options: [
      {
        id: "opt_subsidize",
        label: "增加租赁补贴",
        cost: 4,
        description: "支付 4 亿发放青年人才租房直接补贴。",
        successEffects: { livelihood: 5, morale: 3 }
      },
      {
        id: "opt_market",
        label: "交给市场调节",
        description: "仅做常态化调解，不投入专项财政。",
        successEffects: { morale: -5 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (55%)",
        successRate: 55,
        description: "联合多部门开展集中租赁市场整顿行动。",
        successEffects: { economy: 6, livelihood: 2 },
        failureEffects: { morale: -7 },
        successLog: "租房秩序焕然一新，青年好评如潮！",
        failureLog: "中介机构联合对抗，部分租客被强制退租引发民愤。"
      }
    ]
  },
  {
    id: "school_slot_shortage",
    title: "入学名额紧张",
    body: "新一轮幼升小、小升初报名开启，老城区与新园区多所学校学位告急。",
    source: "市教育局",
    cooldown: 4,
    baseWeight: 25,
    relatedTags: ["education"],
    options: [
      {
        id: "opt_expand_class",
        label: "临时扩充学位",
        cost: 3,
        description: "支付 3 亿改造功能室与聘请临时教师。",
        successEffects: { livelihood: 4, morale: 2 }
      },
      {
        id: "opt_status_quo",
        label: "维持现状",
        description: "严格按照现有限额划片，部分学生需远距离就读。",
        successEffects: { livelihood: -3, morale: -2 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (55%)",
        successRate: 55,
        description: "推行“集团化办学”与名校联办。",
        successEffects: { livelihood: 7 },
        failureEffects: { morale: -5 },
        successLog: "集团化办学成效显著，家长满意度大增！",
        failureLog: "名校资源被稀释，引发家长联名抗议。"
      }
    ]
  },
  {
    id: "hospital_queue_news",
    title: "医院排队上新闻",
    body: "市第一人民医院门诊排队过长、急诊拥堵现象被省电视台暗访报道。",
    source: "媒体焦点",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["healthcare"],
    options: [
      {
        id: "opt_temp_clinic",
        label: "开设临时门诊",
        cost: 4,
        description: "支付 4 亿调配医护人员与增加夜间号源。",
        successEffects: { livelihood: 5, morale: 3 }
      },
      {
        id: "opt_explain",
        label: "解释情况",
        description: "发表声明称处于季节性高峰，希望市民谅解。",
        successEffects: { morale: -6 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "上线互联网医院与社区分诊系统。",
        successEffects: { livelihood: 8 },
        failureEffects: { livelihood: -4, morale: -4 },
        successLog: "线上分诊成功分流三成患者，舆情迅速逆转！",
        failureLog: "系统故障导致就医更慢，引发次生舆情。"
      }
    ]
  },
  {
    id: "morning_peak_jam",
    title: "早高峰拥堵",
    body: "东西主干道车辆激增，通勤时间延长一倍，市民抱怨连连。",
    source: "交警支队",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["transportation"],
    options: [
      {
        id: "opt_more_bus",
        label: "增加公交班次",
        cost: 2,
        description: "支付 2 亿租用高频高峰接驳车。",
        successEffects: { livelihood: 3, environment: 2, morale: 1 }
      },
      {
        id: "opt_no_change",
        label: "维持原有班次",
        description: "不作额外财政干预。",
        successEffects: { economy: -2, morale: -4 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (55%)",
        successRate: 55,
        description: "实施潮汐车道与智能绿波带。",
        successEffects: { livelihood: 5, economy: 3 },
        failureEffects: { economy: -4, morale: -4 },
        successLog: "绿波控制成效显著，主干道通行速度提升 40%！",
        failureLog: "潮汐车道引发多起刮擦事故，交通瘫痪半天。"
      }
    ]
  },
  {
    id: "digital_gov_outage",
    title: "政务平台故障",
    body: "市民网办事平台服务器遭遇高并发访问导致宕机，多项审批中断。",
    source: "大数据局",
    cooldown: 3,
    baseWeight: 15,
    relatedTags: ["efficiency"],
    options: [
      {
        id: "opt_fix_server",
        label: "紧急修复",
        cost: 2,
        description: "支付 2 亿扩容云服务器与防护组件。",
        successEffects: { morale: 4 }
      },
      {
        id: "opt_pause_online",
        label: "暂停线上服务",
        description: "引导市民前往线下大厅办理。",
        successEffects: { livelihood: -3, morale: -4 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (60%)",
        successRate: 60,
        description: "热备服务器紧急切换。",
        successEffects: {},
        failureEffects: { morale: -7 },
        successLog: "无缝无感完成备用机切换，用户零感知。",
        failureLog: "数据同步出现异常，部分申报表格丢失。"
      }
    ]
  },
  {
    id: "efficiency_reported",
    title: "办事效率被报道",
    body: "市行政审批局“一网通办”极速办结案例被省报头版赞扬。",
    source: "宣传部",
    cooldown: 4,
    baseWeight: 15,
    relatedTags: ["efficiency"],
    options: [
      {
        id: "opt_publicize",
        label: "顺势宣传",
        description: "广泛宣传优秀政务环境，提升市民自豪感。",
        successEffects: { morale: 3 }
      },
      {
        id: "opt_low_key",
        label: "保持低调",
        description: "把精力放在省下行政成本上。",
        successEffects: { treasury: 2 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (65%)",
        successRate: 65,
        description: "申报全国政务服务示范城市。",
        successEffects: { morale: 6 },
        failureEffects: {},
        successLog: "成功入选示范城市名单，获得广泛赞誉！",
        failureLog: "未能通过终审答辩，未获得额外奖励。"
      }
    ]
  },
  {
    id: "reservoir_water_rise",
    title: "水库水位上涨",
    body: "上游持续降雨导致市属三大水库水位接近防汛警戒线。",
    source: "水利局预警",
    cooldown: 4,
    baseWeight: 30,
    relatedTags: ["disaster", "resilience"],
    options: [
      {
        id: "opt_discharge",
        label: "提前泄洪排险",
        cost: 5,
        description: "支付 5 亿疏散下游加固河堤，有序泄洪。",
        successEffects: { resilience: 10 }
      },
      {
        id: "opt_watch",
        label: "继续观察",
        description: "暂不泄洪，风险留待下一次暴雨事件。",
        successEffects: {}
      },
      {
        id: "opt_gamble",
        label: "小规模试排 (60%)",
        cost: 1,
        successRate: 60,
        description: "支付 1 亿尝试阶段性控水。",
        successEffects: { resilience: 4 },
        failureEffects: {},
        successLog: "水位成功回落至安全区间。",
        failureLog: "泄洪量不足，水库依然面临过水压力。"
      }
    ]
  },
  {
    id: "rainstorm_waterlogging",
    title: "暴雨导致积水",
    body: "特大暴雨突袭临州，老城区与主干道出现多处严重积水淹车。",
    source: "应急管理局",
    cooldown: 3,
    baseWeight: 35,
    relatedTags: ["disaster"],
    options: [
      {
        id: "opt_drain",
        label: "紧急排涝",
        cost: 6,
        description: "支付 6 亿强抽排涝与救灾。（防灾能力>=50时损失微弱）",
        successEffects: {}, // Dynamic calculated in engine
        successLog: "已动员紧急防汛排涝，成功控制并消退积水，避免灾情升级为重大险情！"
      },
      {
        id: "opt_traffic_first",
        label: "先恢复交通",
        description: "不做全面救灾，优先打通主干路。",
        successEffects: { debt: 8, livelihood: -6, morale: -8 },
        successLog: "优先移走倒塌落木与故障车辆，主干道交通恢复基本通行。"
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "动员社会救援力量与志愿者共同排涝。",
        successEffects: { debt: 2, livelihood: -1, morale: -2 },
        failureEffects: { debt: 10, livelihood: -8, morale: -10 },
        successLog: "军民一心，积水在12小时内快速消退！",
        failureLog: "物资调度失误，灾情扩大导致严重次生灾害。"
      }
    ]
  },
  {
    id: "continuous_heatwave",
    title: "连续高温",
    body: "市气象局发布高温红色预警，电网负荷创历史新高，用电紧张。",
    source: "官方提示",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["environment"],
    options: [
      {
        id: "opt_cooling",
        label: "开放纳凉场所",
        cost: 3,
        description: "支付 3 亿开启人防工程纳凉并补贴商业用电。",
        successEffects: { environment: 2, morale: 2 }
      },
      {
        id: "opt_no_action",
        label: "暂不处理",
        description: "由市民与企业自行调节降温。",
        successEffects: { environment: -2, morale: -5 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (55%)",
        successRate: 55,
        description: "对工业企业实行错峰用电压降。",
        successEffects: {},
        failureEffects: { environment: -5, morale: -5 },
        successLog: "错峰用电平稳度过负荷高峰。",
        failureLog: "居民区意外遭遇无预警停电，民怨沸腾。"
      }
    ]
  },
  {
    id: "river_water_anomaly",
    title: "河道水质异常",
    body: "临江河段水质监测指标陡降，溶解氧降低，出现局部死鱼现象。",
    source: "环保督查",
    cooldown: 3,
    baseWeight: 25,
    relatedTags: ["environment"],
    options: [
      {
        id: "opt_clean_river",
        label: "紧急治理",
        cost: 5,
        description: "支付 5 亿清淤换水并严查上游非法排污。",
        successEffects: { environment: 7, livelihood: 2 }
      },
      {
        id: "opt_delay_test",
        label: "暂缓检测",
        description: "声称系自然水文变化，延后处理。",
        successEffects: { environment: -7, morale: -6 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "投放生物降解菌剂尝试生态自我修复。",
        successEffects: { environment: 3 },
        failureEffects: { environment: -8, livelihood: -3 },
        successLog: "生物降解效果良好，水质快速恢复正常。",
        failureLog: "菌剂失效导致水质进一步恶化。"
      }
    ]
  },
  {
    id: "short_video_fire",
    title: "短视频带火老街",
    body: "某网络达人拍摄的老街美食与夜市视频播放量破千万，全国游客涌入。",
    source: "街头消息",
    cooldown: 4,
    baseWeight: 20,
    relatedTags: ["tourism", "consumption"],
    options: [
      {
        id: "opt_prepare",
        label: "做好接待准备",
        cost: 2,
        description: "支付 2 亿增加摆渡车、便民驿站与安保维持秩序。",
        successEffects: { economy: 6, morale: 3 }
      },
      {
        id: "opt_limit_flow",
        label: "控制客流",
        description: "限量预约入街，收取临时管理费。",
        successEffects: { treasury: 5, morale: -2 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (55%)",
        successRate: 55,
        description: "顺势顺水举办全网“临州夜宵节”。",
        successEffects: { economy: 10 },
        failureEffects: { economy: -4 },
        successLog: "夜宵节爆火，打造全网现象级热点！",
        failureLog: "接待能力崩溃，宰客新闻登上热搜。"
      }
    ]
  },
  {
    id: "tourism_budget_overrun",
    title: "文旅项目预算超支",
    body: "近期文旅宣传与节庆推介活动实际消耗超出预算，需追加财政资金。",
    source: "文旅局申报",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["tourism"],
    options: [
      {
        id: "opt_add_budget",
        label: "补齐服务预算",
        cost: 3,
        description: "支付 3 亿补齐文旅服务与宣传欠账。",
        successEffects: { economy: 4, morale: 1 }
      },
      {
        id: "opt_compress_proj",
        label: "直接压缩项目",
        description: "砍掉后续宣传与配套服务。",
        successEffects: { debt: 4, morale: -4 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "招揽社会资本赞助冠名。",
        successEffects: { economy: 8 },
        failureEffects: { debt: 6, morale: -5 },
        successLog: "企业踊跃冠名赞助，成功化解预算缺口！",
        failureLog: "招商流产，超支款项不得不转为政府债务。"
      }
    ]
  },
  {
    id: "night_market_noise",
    title: "夜市扰民",
    body: "夜市摊位音响与宵夜摊占道经营引发周边居民强烈的噪音与环境投诉。",
    source: "城管大队",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["night", "consumption"],
    options: [
      {
        id: "opt_soundproof",
        label: "增加隔音和保洁",
        cost: 2,
        description: "支付 2 亿安装隔离声屏障与增加深夜保洁。",
        successEffects: { environment: 2, morale: 1 }
      },
      {
        id: "opt_keep_flow",
        label: "保住客流",
        description: "允许延长营业时间，不做过度干预。",
        successEffects: { economy: 2, morale: -6 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (55%)",
        successRate: 55,
        description: "引导夜市摊位向室内规范市场整体搬迁。",
        successEffects: { environment: 4, economy: 3 },
        failureEffects: { morale: -8 },
        successLog: "搬迁顺利，既保留了烟火气又解决了扰民问题。",
        failureLog: "摊主集体抵制搬迁，夜市人气骤降。"
      }
    ]
  },
  {
    id: "food_safety_anomaly",
    title: "餐饮抽检异常",
    body: "市市场监管局在夜市与特色餐馆例行抽检中发现多批次次食用油与肉类不合格。",
    source: "市监局报送",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["consumption"],
    options: [
      {
        id: "opt_inspection",
        label: "加强抽检",
        cost: 3,
        description: "支付 3 亿展开全城餐饮安全大排查大整顿。",
        successEffects: { livelihood: 2, morale: 2 }
      },
      {
        id: "opt_keep_market",
        label: "保持市场热度",
        description: "对涉事小商家轻罚了事，维护经营积极性。",
        successEffects: { economy: 2, morale: -8 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (60%)",
        successRate: 60,
        description: "全面推行“明厨亮灶”与食品溯源二维码。",
        successEffects: {},
        failureEffects: { livelihood: -4, morale: -7 },
        successLog: "食品溯源系统获得群众高度好评。",
        failureLog: "发生集中食品安全事件，品牌形象受创。"
      }
    ]
  },
  {
    id: "vip_guest_visit",
    title: "大型活动嘉宾来访",
    body: "知名企业家与投资代表团组团来临州考察投资环境。",
    source: "招商引资办",
    cooldown: 3,
    baseWeight: 15,
    relatedTags: [],
    options: [
      {
        id: "opt_reception",
        label: "做好接待",
        cost: 1,
        description: "支付 1 亿举办投资推介会与产业对接会。",
        successEffects: { economy: 4, morale: 2 }
      },
      {
        id: "opt_normal",
        label: "不做额外安排",
        description: "按常规流程接待，不增加支出。",
        successEffects: {}
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "争取现场签署重大战略投资框架协议。",
        successEffects: { economy: 8 },
        failureEffects: { morale: -4 },
        successLog: "成功签署百亿战略合作协议！",
        failureLog: "协议流产，被媒体质疑过度铺张营销。"
      }
    ]
  },
  {
    id: "local_specialty_fire",
    title: "本地特产走红",
    body: "临州特色农副产品与特色小吃在电商平台销量暴增。",
    source: "商务局 report",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["consumption"],
    options: [
      {
        id: "opt_brand",
        label: "组织品牌推广",
        cost: 3,
        description: "支付 3 亿建立地标保护与标准化供应链。",
        successEffects: { economy: 5, morale: 2 }
      },
      {
        id: "opt_nature",
        label: "顺其自然",
        description: "由市场商户自行销售，按税征收。",
        successEffects: { treasury: 3 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (60%)",
        successRate: 60,
        description: "打造国家级地理标志农产品品牌。",
        successEffects: { economy: 9 },
        failureEffects: { economy: -3 },
        successLog: "地标品牌打造成功，带飞全产业链！",
        failureLog: "假冒伪劣产品充斥市场，砸了地标招牌。"
      }
    ]
  },
  {
    id: "garbage_removal_stop",
    title: "垃圾清运中断",
    body: "市生活垃圾处理厂外包承包商资金链断裂，部分老城区垃圾堆积。",
    source: "城管局报告",
    cooldown: 3,
    baseWeight: 20,
    relatedTags: ["environment", "community"],
    options: [
      {
        id: "opt_outsource",
        label: "紧急外包清运",
        cost: 3,
        description: "支付 3 亿应急托底并重新招投标。",
        successEffects: { environment: 5, morale: 2 }
      },
      {
        id: "opt_wait_recovery",
        label: "等待恢复",
        description: "责令原承包商限期恢复清运。",
        successEffects: { environment: -6, morale: -6 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "动员环卫工人与社区志愿应急清扫。",
        successEffects: {},
        failureEffects: { environment: -7, morale: -5 },
        successLog: "社区志愿清扫顺利完成应急过渡。",
        failureLog: "清运不及引发恶臭，社区居民围堵城管局。"
      }
    ]
  },
  {
    id: "relocation_dispute",
    title: "改造项目搬迁争议",
    body: "老旧小区与拆迁改造项目中，个别住户因补偿期望过高引发僵局。",
    source: "拆迁办",
    cooldown: 4,
    baseWeight: 20,
    relatedTags: ["housing", "community"],
    options: [
      {
        id: "opt_negotiate",
        label: "增加协商补偿",
        cost: 5,
        description: "支付 5 亿提高搬迁安置补偿标准。",
        successEffects: { livelihood: 4, morale: 4 }
      },
      {
        id: "opt_force",
        label: "按原方案推进",
        description: "依法依规执行，不作额外让步。",
        successEffects: { treasury: 3, livelihood: -2, morale: -8 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "引入第三方仲裁与业主代表调解。",
        successEffects: {},
        failureEffects: { livelihood: -4, morale: -10 },
        successLog: "第三方调解成功达成补偿协议。",
        failureLog: "调解失败并引发冲突，项目被迫停工。"
      }
    ]
  },
  {
    id: "construction_accident",
    title: "施工现场发生事故",
    body: "在建基建项目工地发生吊装机械事故，所幸未造成人员伤亡但工期受阻。",
    source: "安监局预警",
    cooldown: 4,
    baseWeight: 25,
    relatedTags: ["infrastructure"],
    options: [
      {
        id: "opt_stop_inspect",
        label: "停工排查",
        cost: 5,
        description: "支付 5 亿全面整改，随机在建项目剩余周期 +1 季。",
        successEffects: { morale: 1 }
      },
      {
        id: "opt_quick_resume",
        label: "尽快复工",
        description: "轻微处罚后要求立即赶工期。",
        successEffects: { livelihood: -2, morale: -9 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (45%)",
        successRate: 45,
        description: "边生产边排查专项隐患。",
        successEffects: {},
        failureEffects: { debt: 6, morale: -8 },
        successLog: "专项排查顺利结束，未耽误工期。",
        failureLog: "二次隐患触发安监挂牌督办，项目陷入停工拉锯。"
      }
    ]
  },
  {
    id: "fiscal_audit_loophole",
    title: "财政审计发现漏洞",
    body: "上级审计部门对临州市过去两年的专项资金进行审计，指出部分资金使用不规范。",
    source: "审计局报告",
    cooldown: 4,
    baseWeight: 20,
    relatedTags: ["efficiency"],
    options: [
      {
        id: "opt_fix_audit",
        label: "补齐管理费用",
        cost: 2,
        description: "支付 2 亿健全财务内部控制制度。",
        successEffects: { treasury: 5, morale: 1 }
      },
      {
        id: "opt_hide",
        label: "暂不公开",
        description: "内部悄悄理顺账目。",
        successEffects: { morale: -3 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (60%)",
        successRate: 60,
        description: "申请上级审计豁免与结余资金留存。",
        successEffects: { treasury: 10 },
        failureEffects: { debt: 5, morale: -5 },
        successLog: "申请成功，获准留存 10 亿结余资金！",
        failureLog: "申请被驳回，追缴违规资金转为债务。"
      }
    ]
  },
  {
    id: "financing_cost_rise",
    title: "融资成本上升",
    body: "受金融市场波动影响，城投债发行利率上升，债务还本付息压力加头。",
    source: "财政局风向",
    cooldown: 4,
    baseWeight: 25,
    relatedTags: [],
    options: [
      {
        id: "opt_repay_early",
        label: "提前偿还部分债务",
        cost: 5,
        description: "支付 5 亿优先偿还高息债务，债务 -8 亿。",
        successEffects: { debt: -8 }
      },
      {
        id: "opt_continue_borrow",
        label: "继续借债",
        description: "展期高息债券维持资金链。",
        successEffects: { debt: 3 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "置换为低息长期地方政府专项债。",
        successEffects: { debt: -3 },
        failureEffects: { debt: 8 },
        successLog: "专项债置换成功，债务负担大幅减轻！",
        failureLog: "置换额度受限，不得不承接更高利率债务。"
      }
    ]
  },
  {
    id: "maintenance_fee_rise",
    title: "公共项目维护费上调",
    body: "随着完工基建项目增多，人工与设备老化的常态化维护成本超预期。",
    source: "财政局报告",
    cooldown: 4,
    baseWeight: 25,
    relatedTags: [],
    options: [
      {
        id: "opt_maint",
        label: "集中维护",
        cost: 4,
        description: "支付 4 亿进行全面保养，未来 4 季度维护费减少 1 亿。",
        successEffects: {}
      },
      {
        id: "opt_delay_maint",
        label: "暂缓维修",
        description: "将维修费用挂账延迟支付。",
        successEffects: { debt: 4 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (55%)",
        successRate: 55,
        description: "引入 PPP 模式市场化运营维护。",
        successEffects: {},
        failureEffects: { debt: 7 },
        successLog: "PPP 市场化运营成功，维保支出大幅降低。",
        failureLog: "运营方违约弃管，紧急接手产生高额债务。"
      }
    ]
  },
  {
    id: "graduates_outflow",
    title: "高校毕业生外流",
    body: "本地两所高校应届毕业生选择留临州就业比例仅为两成，人口流失隐忧加剧。",
    source: "官方提示",
    cooldown: 4,
    baseWeight: 25,
    relatedTags: ["talent", "housing"],
    options: [
      {
        id: "opt_jobs",
        label: "提供就业配套",
        cost: 4,
        description: "支付 4 亿设立实习创业基地与见习补贴。",
        successEffects: { economy: 2, livelihood: 3, morale: 3 }
      },
      {
        id: "opt_accept",
        label: "接受人口调整",
        description: "顺应区域人口自然流动趋势。",
        successEffects: { treasury: 4, morale: -4 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (50%)",
        successRate: 50,
        description: "举办全省大规模青年人才招聘会。",
        successEffects: { economy: 6 },
        failureEffects: { economy: -5, morale: -6 },
        successLog: "招聘会盛况空前，上万名毕业生签约留临！",
        failureLog: "岗位匹配度低，毕业生纷纷转投外地。"
      }
    ]
  },
  {
    id: "green_supply_order",
    title: "绿色供应链订单",
    body: "国际知名企业向临州市绿色产业园颁发环保认证并追加大额低碳采购。",
    source: "绿色产业协会",
    cooldown: 4,
    baseWeight: 20,
    relatedTags: ["green", "industrial"],
    options: [
      {
        id: "opt_expand_green",
        label: "扩大绿色产能",
        cost: 4,
        description: "支付 4 亿补贴绿色企业技改。",
        successEffects: { economy: 6, environment: 3 }
      },
      {
        id: "opt_control_rhythm",
        label: "控制投资节奏",
        description: "保持现有产能稳定交付。",
        successEffects: { economy: 1 }
      },
      {
        id: "opt_gamble",
        label: "赌一把 (60%)",
        successRate: 60,
        description: "打造国家级零碳产业园区示范工程。",
        successEffects: { economy: 10, environment: 4 },
        failureEffects: { economy: -4 },
        successLog: "零碳园区验收通过，引爆绿色产业链！",
        failureLog: "技术指标未达标，被暂停采购资格。"
      }
    ]
  }
];
