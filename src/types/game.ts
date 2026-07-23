export type PolicyCategory = "industry" | "public_service" | "governance" | "risk_transition";
export type Intensity = "pilot" | "full" | "intensive";

export interface IntensityConfig {
  intensity: Intensity;
  label: string;
  costMultiplier: number;
  positiveMultiplier: number;
  negativeMultiplier: number;
  maintenanceMultiplier: number;
  riskMultiplier: number;
  durationReduce: number;
  description: string;
}

export type TrendId = 
  | "manufacturing_recovery"
  | "consumption_recovery"
  | "property_cooling"
  | "heavy_rain"
  | "population_outflow"
  | "green_transition";

export type SignalType = "reliable" | "market" | "official" | "street";

export interface Signal {
  id: string;
  type: SignalType;
  title: string;
  body: string;
  relatedPolicies: string[];
  relatedEvents: string[];
}

export interface MetricDelta {
  treasury?: number;
  debt?: number;
  economy?: number;
  livelihood?: number;
  environment?: number;
  morale?: number;
  resilience?: number;
}

export interface CityCapabilities {
  // New Energy
  skillTalent?: number;              // 技能人才
  cleanEnergy?: number;              // 清洁能源
  industrialSpace?: number;          // 产业空间
  administrativeEfficiency?: number; // 行政效率

  // Freight Hub
  trafficConnectivity?: number;      // 交通联通
  freightCapacity?: number;          // 货运能力
  tradeService?: number;             // 商贸服务

  // Medical Center
  clinicalCapability?: number;       // 临床能力
  medicalResearch?: number;          // 医学科研

  // Cultural Expo
  culturalAttraction?: number;       // 文化吸引力
  touristReception?: number;         // 游客接待
  eventOperation?: number;           // 活动运营

  [key: string]: number | undefined;
}

export interface PolicyDefinition {
  id: string;
  name: string;
  category: PolicyCategory;
  baseCost: number;
  duration: number; // in quarters
  maintenance: number;
  operatingIncome: number;
  stageCapabilityBoost?: Partial<CityCapabilities>;
  opportunityIds?: string[];     // 相关城市机遇ID
  strategicProjectId?: string;   // 战略项目ID映射
  isOpportunitySynergy?: boolean; // 是否为机遇协同政策
  synergyOpportunityId?: string; // 协同政策所属机遇ID
  maxUses: number;
  cooldown: number; // quarters
  isInstant: boolean;
  positiveEffects: Partial<MetricDelta>;
  negativeEffects: Partial<MetricDelta>;
  tags: string[];
  description: string;
  riskDescription: string;
  expectedBenefitDescription: string;
}

export interface ActiveProject {
  id: string;
  policyId: string;
  name: string;
  quarterStarted: number;
  remainingDuration: number;
  totalDuration: number;
  stageIndex: number;            // 0, 1, 2...
  totalCost: number;
  paidAmount: number;
  installments: number[];
  status: "in_progress" | "halted" | "completed";
  appliedStageEffectIds: string[];
  isDirectInitiation?: boolean;
  intensity: Intensity;
  maintenance: number;
  operatingIncome: number;
  positiveEffects: Partial<MetricDelta>;
  negativeEffects: Partial<MetricDelta>;
  efficiency: number;
}

export interface PolicyRecord {
  policyId: string;
  policyName: string;
  quarter: number;
  intensity: Intensity;
  cost: number;
  efficiency: number;
  completedQuarter?: number;
  maintenanceCost: number;
  operatingIncome: number;
  tourismBonusQuarters?: number;
}

export interface EventOption {
  id: string;
  label: string;
  cost?: number;
  successRate?: number;
  description: string;
  successEffects: Partial<MetricDelta>;
  failureEffects?: Partial<MetricDelta>;
  successLog?: string;
  failureLog?: string;
}

export interface EventDefinition {
  id: string;
  title: string;
  body: string;
  source: string;
  cooldown: number;
  baseWeight: number;
  isHealthRelated?: boolean; // 结构化健康事件标记 (受医学中心减损影响)
  relatedTags?: string[];
  relatedMetrics?: (keyof MetricDelta)[];
  options: EventOption[];
}

export interface ActiveEvent {
  event: EventDefinition;
  hasSignalHint: boolean;
  calculatedSuccessRates: Record<string, number>;
}

export interface EventRecord {
  quarter: number;
  eventId: string;
  eventTitle: string;
  optionId: string;
  optionLabel: string;
  isSuccess: boolean;
  costPaid: number;
  effects: Partial<MetricDelta>;
  logMessage?: string;
  hasSignalHint: boolean;
}

export interface TemporaryBuff {
  id: string;
  name: string;
  policyCostDiscount: number;
  executionEfficiencyBonus: number;
  remainingUses: number;
}

export interface TemporaryTaxBonus {
  id: string;
  name: string;
  amount: number;
  remainingQuarters: number;
}

export interface TrendRecord {
  year: number;
  trendId: TrendId;
  trendTitle: string;
}

export interface ChronicleEntry {
  id: string;
  quarter: number;
  year: number;
  quarterInYear: number;
  type: "policy_approve" | "project_complete" | "event" | "trend" | "milestone" | "skip" | "repay_debt" | "opportunity_result" | "direct_initiation";
  title: string;
  body: string;
  effects?: Partial<MetricDelta>;
}

export interface QuarterDebtLedger {
  openingDebt: number;
  policyBorrowing: number;
  recurringDeficitBorrowing: number;
  eventBorrowing: number;
  voluntaryRepayment: number;
  netChange: number;
  endingDebt: number;
  explanation: string;
}

export interface QuarterFinanceBreakdown {
  taxBaseEconomy: number;
  industrialTaxBase: number;
  temporaryTaxBonus: number;
  taxIncome: number;
  taxModifier: number;
  operatingIncomeTotal: number;
  baseExpense: number;
  maintenanceExpense: number;
  opportunityOperatingCosts: number; // 机遇永久运营费
  maintenanceDiscount: number;
  debtInterest: number;
  recurringBalance: number;
  policySpending: number;
  eventSpending: number;
  debtAdded: number;
  debtLedger: QuarterDebtLedger;
}

export interface ProjectProgressNotice {
  projectName: string;
  oldProgress: number;
  newProgress: number;
  capabilityChange?: string;
}

export interface QuarterSummaryData {
  quarter: number;
  finance: QuarterFinanceBreakdown;
  completedProjectNames: string[];
  projectProgressNotices?: ProjectProgressNotice[];
  opportunityNotice?: string;
  eventRecord?: EventRecord;
  metricChanges: Partial<MetricDelta>;
  newsHeadline: string;
  executedDraft?: DraftAction;
  draftPolicyName?: string;
}

export type BidTier = "none" | "conservative" | "standard" | "full";
export type OpportunityResultTier = "failed" | "partial_success" | "success" | "super_success";

export interface OpportunityStrategicProject {
  id: string;
  name: string;
  capKey: keyof CityCapabilities;
  capName: string;
}

export interface OpportunityBidConfig {
  tier: BidTier;
  label: string;
  cost: number;
  scoreBonus: number;
}

export interface OpportunityRewardConfig {
  label: string;
  grant: number;
  socialInvestment: number;
  constructionTaxBonus: number;
  permanentBaseBonus: number;
  permanentOperatingFee: number;
  metricEffects?: Partial<MetricDelta>;
  healthLossReduction?: number; // e.g. 0.2, 0.4, 0.6
}

export interface MajorOpportunityDefinition {
  id: string;
  name: string;
  shortTitle: string;
  startQuarterDefault?: number;
  settleQuarterDefault?: number;
  coreCapabilityKeys: (keyof CityCapabilities)[];
  auxiliaryCapabilityKey: keyof CityCapabilities;
  capabilityNames: Record<string, string>;
  strategicProjects: OpportunityStrategicProject[];
  biddingTiers: Record<BidTier, OpportunityBidConfig>;
  rewards: Record<OpportunityResultTier, OpportunityRewardConfig>;
  synergyPolicyIds: string[];
}

export interface CityOpportunityState {
  id: string;
  title: string;
  startQuarter: number;
  settleQuarter: number;
  hasResearched: boolean;
  status: "announced" | "bidding" | "settled";
  selectedBidTier?: BidTier;
  resultTier?: OpportunityResultTier;
  grantReceived?: number;
  socialInvestment?: number;
  leverageRatio?: number;
  constructionTaxBonus?: number;
  permanentBaseBonus?: number;
  permanentOperatingFee?: number;
  settledQuarter?: number;
  opportunitySynergyIds: string[];
}

export interface ScheduledOpportunityReward {
  id: string;
  opportunityId: string;
  opportunityName: string;
  resultTier: OpportunityResultTier;
  type: "temp_tax" | "perm_base";
  amount: number;
  activateQuarter: number;
  remainingQuarters?: number;
}

export type EndingId = 
  | "fiscal_takeover"
  | "gloomy_resignation"
  | "model_city"
  | "green_transformation"
  | "livable_builder"
  | "internet_famous_exp"
  | "high_debt"
  | "steady_reformer";

export interface EndingDefinition {
  id: EndingId;
  title: string;
  subTitle: string;
  quote: string;
  description: string;
  type: "defeat" | "success";
}

export interface FinalScore {
  fiscalHealth: number;
  baseScore: number;
  unfinishedProjectsPenalty: number;
  finalScore: number;
  ending: EndingDefinition;
}

export interface RepaymentRecord {
  quarter: number;
  amount: number;
  preTreasury: number;
  postTreasury: number;
  preDebt: number;
  postDebt: number;
}

export interface DraftAction {
  type: "policy" | "skip" | "repay";
  policyId?: string;
  intensity?: Intensity;
  prioritizeRepay?: boolean;
}

export interface GameState {
  version: 1;
  saveVersion: 4;
  seed: number;
  rngIndex: number;
  quarter: number;

  actionUsedThisQuarter: boolean;
  draftAction?: DraftAction;

  // Standard Metrics
  treasury: number;
  debt: number;
  economy: number;
  livelihood: number;
  environment: number;
  morale: number;
  resilience: number;

  // City Capabilities System
  capabilities: CityCapabilities;
  industrialTaxBase: number;
  temporaryTaxBonuses: TemporaryTaxBonus[];
  cumulativeSocialInvestment: number;

  // Universal Major Opportunity System (Save V4)
  activeMajorOpportunityId?: string;
  followUpOpportunityOrder: string[]; // Order of the 3 follow-up opportunities
  nextOpportunityStartQuarter: number; // Next quarter an opportunity triggers
  opportunityStates: Record<string, CityOpportunityState>;
  opportunityBaseFits: Record<string, number>;
  quartersWithoutRelevantPolicyMap: Record<string, number>;
  scheduledOpportunityRewards: ScheduledOpportunityReward[];
  permanentOpportunityOperatingCosts: number; // 机遇产生的永久运营费
  healthEventLossMultiplier: number; // 0.8, 0.6, 0.4 when medical center succeeds

  // Legacy compatibility fields
  baseFit: number;
  cityOpportunityState: CityOpportunityState;
  quartersWithoutRelevantPolicy: number;

  // Trends & Signals
  currentTrend: TrendId;
  trendHistory: TrendRecord[];
  currentSignal: Signal | null;

  // Projects & Policies
  candidatePolicies: string[];
  activeProjects: ActiveProject[];
  completedPolicies: PolicyRecord[];
  completedPolicyIds: string[];
  policyCooldowns: Record<string, number>;
  policyUseCount: Record<string, number>;

  // Buffs & History
  temporaryBuffs: TemporaryBuff[];
  eventHistory: EventRecord[];
  quarterHistory: QuarterSummaryData[];
  chronicle: ChronicleEntry[];
  repaymentHistory: RepaymentRecord[];

  openingDebtThisQuarter: number;
  voluntaryRepaymentThisQuarter: number;
  policyBorrowingThisQuarter: number;
  eventBorrowingThisQuarter: number;

  consecutiveLowMorale: number;
  gameStatus: "playing" | "finished" | "failed";
  endingId?: EndingId;

  currentEvent?: ActiveEvent;
  lastQuarterSummary?: QuarterSummaryData;
  opportunityResultModal?: {
    opportunityId: string;
    opportunityName: string;
    resultTier: OpportunityResultTier;
    bidCost: number;
    grant: number;
    socialInvestment: number;
    leverageRatio: number;
    constructionTaxBonus: number;
    permanentBaseBonus: number;
    permanentOperatingFee: number;
    healthLossReduction?: number;
  };
  couponNextQuarterTaxBonus?: boolean;
}
