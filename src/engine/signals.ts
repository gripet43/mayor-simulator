import { Signal, SignalType } from "../types/game";
import { PRNG } from "./prng";

export interface SignalTemplate {
  title: string;
  type: SignalType;
  body: string;
  relatedPolicies: string[];
  relatedEvents: string[];
}

const SIGNAL_TEMPLATES: SignalTemplate[] = [
  {
    title: "市气象台强降雨预警",
    type: "official",
    body: "防汛办提示：本季度强降雨与强对流天气出现概率上升，请做好积水防御与设施排查。",
    relatedPolicies: ["flood_control", "hospital_expansion"],
    relatedEvents: ["rainstorm_waterlogging", "reservoir_water_rise"]
  },
  {
    title: "制造业外地企业考察传闻",
    type: "market",
    body: "几家沿海制造企业正在打听临州工业用地出让条件与用工成本。",
    relatedPolicies: ["industrial_park", "bus_priority"],
    relatedEvents: ["order_inquiry", "industrial_inspection"]
  },
  {
    title: "老街夜间客流上升",
    type: "street",
    body: "本地老街与特色宵夜街区夜间客流连续三周上升，市民消夜热情高涨。",
    relatedPolicies: ["night_market", "tourism_festival", "bus_priority"],
    relatedEvents: ["short_video_fire", "night_market_noise"]
  },
  {
    title: "青年群体住房诉求增加",
    type: "reliable",
    body: "市长信箱与社交网络上关于青年租房价格与品质的讨论热度攀升。",
    relatedPolicies: ["rental_housing", "talent_subsidy"],
    relatedEvents: ["youth_rent_complaint", "graduates_outflow"]
  },
  {
    title: "老旧小区供水管网老化",
    type: "official",
    body: "水务集团通报老城区多处管网水压偏低，居民改造呼声强烈。",
    relatedPolicies: ["old_housing"],
    relatedEvents: ["relocation_dispute"]
  },
  {
    title: "环保暗访小组抵临传言",
    type: "market",
    body: "业内传出消息，上级环保督察组正在周边城市开展例行巡查。",
    relatedPolicies: ["pollution_control", "green_fund"],
    relatedEvents: ["environmental_inspection", "industrial_odor"]
  },
  {
    title: "市民就医排队投诉回升",
    type: "reliable",
    body: "卫生健康热线接到多起关于三甲医院号源紧张与急诊排队的反馈。",
    relatedPolicies: ["hospital_expansion"],
    relatedEvents: ["hospital_queue_news"]
  },
  {
    title: "主干道早高峰拥堵加剧",
    type: "reliable",
    body: "交警指挥中心数据反映，东西向通勤干道早高峰平均行驶车速降低。",
    relatedPolicies: ["bus_priority", "subway_extension"],
    relatedEvents: ["morning_peak_jam"]
  }
];

export function generateQuarterlySignal(prng: PRNG, quarter: number): Signal {
  const idx = prng.nextInt(0, SIGNAL_TEMPLATES.length - 1);
  const template = SIGNAL_TEMPLATES[idx];
  return {
    id: `sig_q${quarter}_${prng.nextInt(100, 999)}`,
    ...template
  };
}
