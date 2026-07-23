import { EndingDefinition, EndingId } from "../types/game";

export const ENDINGS_DATA: Record<EndingId, EndingDefinition> = {
  fiscal_takeover: {
    id: "fiscal_takeover",
    title: "结局一：财政托管",
    subTitle: "破产边缘的借贷狂魔",
    quote: "“城市项目还没有结束，财政已经先结束了。接下来将由专门机构接管预算。”",
    description: "债务超过了120亿元上限。由于债务利息高企与赤字持续扩大，省上财政防范风险小组进驻临州市，全面冻结了重大基建与公共支出。你的任期在遗憾与质问声中提前划下句号。",
    type: "defeat"
  },
  gloomy_resignation: {
    id: "gloomy_resignation",
    title: "结局二：黯然离任",
    subTitle: "失去信任的管理者",
    quote: "“城市并没有立刻崩溃，但已经没有人愿意相信下一项承诺。”",
    description: "民心连续两个季度低于10点。社区矛盾激化、公共服务停摆与市民投诉不断，致使信任危机彻底爆发。在上级的诫勉谈话后，你提出了辞职，离任那天天空阴沉。",
    type: "defeat"
  },
  model_city: {
    id: "model_city",
    title: "结局三：示范城市",
    subTitle: "全能卓越的高分典范",
    quote: "“临州市的发展模式，成为了全国中等城市高质量转型的标杆样本。”",
    description: "你在五年任期内实现了经济、民生、环境与民心的全面繁荣，同时将债务稳妥控制在安全区。临州市不仅摘得全国文明城市与最具幸福感城市桂冠，相关治理经验更是登上了全国新闻联播。",
    type: "success"
  },
  green_transformation: {
    id: "green_transformation",
    title: "结局四：绿色转型样本",
    subTitle: "绿水青山的生态先锋",
    quote: "“淘汰落后产能的阵痛早已过去，留下一座山清水秀的高新绿城。”",
    description: "你坚定果断地推进环保整治与绿色产业升级。临州市彻底摆脱了污染工业的依赖，蓝天白云与绿色产业相得益彰，成为了全国绿色发展与生态保护的先锋典范。",
    type: "success"
  },
  livable_builder: {
    id: "livable_builder",
    title: "结局五：宜居城市建设者",
    subTitle: "以人为本的温度治者",
    quote: "“老百姓的口粮、住房、学校与老旧小区，才是施政最厚重的底色。”",
    description: "你始终把民生福祉与市民满意度放在首位。老旧小区焕然一新，学校与医院不再排队，青年人在保障房中安居乐业。临州市成为了人人向往的温暖宜居之城。",
    type: "success"
  },
  internet_famous_exp: {
    id: "internet_famous_exp",
    title: "结局六：网红城市短期体验官",
    subTitle: "喧嚣繁华下的隐忧",
    quote: "“短视频带火了老街与夜市，但热潮退去后，基础设施与债务账单露出了真容。”",
    description: "你频繁使用消费券、夜市经济与文旅节庆打造营销爆点，临州市一跃成为网红打卡地。然而，高额的项目债务与未跟上的生态配套，让这场繁华显得格外脆弱。",
    type: "success"
  },
  high_debt: {
    id: "high_debt",
    title: "结局七：债务高企",
    subTitle: "钢丝绳上的负重前行",
    quote: "“宏伟的城市蓝图已经落成，但留给下一任的，是沉甸甸的还本付息压力。”",
    description: "你通过大手笔举债建成了多项城市重点工程，推动了经济增长。然而截至任期结束，城市债务逼近预警红线，未来的每一笔财政预算都将经历严苛的精打细算。",
    type: "success"
  },
  steady_reformer: {
    id: "steady_reformer",
    title: "结局八：稳健改革者",
    subTitle: "务实平和的五年交卷",
    quote: "“没有惊天动地的奇迹，但临州市在稳健中走过了转型的关键五年。”",
    description: "在纷繁复杂的年度趋势与突发事件中，你采取了相对稳健适度的政策。临州市各项指标保持平衡发展，财政状况健康，你向市民交出了一份平实而合格的成绩单。",
    type: "success"
  }
};
