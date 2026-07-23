import { GameState, RepaymentRecord, QuarterFinanceBreakdown } from "../types/game";
import { getQuarterInYear, getYearFromQuarter } from "./trends";

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function getDebtInterestRate(debt: number): number {
  return 0.06 / 4; // 6% annual rate = 1.5% quarterly
}

export function calculateDebtInterest(debt: number): number {
  if (debt <= 0) return 0;
  return Math.round((debt * 0.06 / 4) * 100) / 100;
}

export function calculateCompletedMaintenance(state: GameState): number {
  return state.completedPolicies.reduce((sum, p: any) => sum + (p.maintenanceCost ?? 0), 0);
}

export function calculateCompletedOperatingIncome(state: GameState): number {
  let totalIncome = 0;
  state.completedPolicies.forEach((p: any) => {
    totalIncome += p.operatingIncome ?? 0;
    if (p.tourismBonusQuarters && p.tourismBonusQuarters > 0) {
      totalIncome += 1;
    }
  });
  return totalIncome;
}

export function calculateQuarterTax(state: GameState): {
  taxBaseEconomy: number;
  industrialTaxBase: number;
  temporaryTaxBonus: number;
  taxIncome: number;
  taxModifier: number;
} {
  const taxBaseEconomy = 4 + Math.floor(state.economy / 7);
  const industrialTaxBase = state.industrialTaxBase ?? 0;

  let temporaryTaxBonus = 0;
  (state.temporaryTaxBonuses ?? []).forEach((b) => {
    if (b.remainingQuarters > 0) {
      temporaryTaxBonus += b.amount;
    }
  });

  if (state.couponNextQuarterTaxBonus) {
    temporaryTaxBonus += 1;
  }

  const taxIncome = taxBaseEconomy + industrialTaxBase + temporaryTaxBonus;

  return {
    taxBaseEconomy,
    industrialTaxBase,
    temporaryTaxBonus,
    taxIncome,
    taxModifier: temporaryTaxBonus
  };
}

export function calculateDigitalGovMaintenanceDiscount(state: GameState): number {
  const isDigitalGovDone = state.completedPolicyIds.includes("digital_government");
  return isDigitalGovDone ? 1 : 0;
}

export interface RecurringBalanceBreakdown {
  taxBaseEconomy: number;
  industrialTaxBase: number;
  temporaryTaxBonus: number;
  taxIncome: number;
  operatingIncome: number;
  baseExpense: number;
  maintenanceExpense: number;
  opportunityOperatingCosts: number;
  maintenanceDiscount: number;
  debtInterest: number;
  recurringBalance: number;
  statusText: string;
  statusBadgeClass: string;
  isStructuralDeficit: boolean;
}

export function calculateRecurringBalance(state: GameState): RecurringBalanceBreakdown {
  const taxDetails = calculateQuarterTax(state);
  const operatingIncome = calculateCompletedOperatingIncome(state);
  const rawMaintenance = calculateCompletedMaintenance(state);
  const maintenanceDiscount = calculateDigitalGovMaintenanceDiscount(state);
  const maintenanceExpense = Math.max(0, rawMaintenance - maintenanceDiscount);
  const opportunityOperatingCosts = state.permanentOpportunityOperatingCosts ?? 0;

  const isDigitalGovDone = state.completedPolicyIds.includes("digital_government");
  const baseExpense = isDigitalGovDone ? 3 : 4;

  const debtInterest = calculateDebtInterest(state.debt);

  const totalExpense = baseExpense + maintenanceExpense + opportunityOperatingCosts + debtInterest;
  const recurringBalance = Math.round((taxDetails.taxIncome + operatingIncome - totalExpense) * 10) / 10;

  let statusText = "基本平衡";
  let statusBadgeClass = "badge-green";
  let isStructuralDeficit = false;

  if (recurringBalance >= 3) {
    statusText = "财政宽裕";
    statusBadgeClass = "badge-green";
  } else if (recurringBalance >= 0) {
    statusText = "基本平衡";
    statusBadgeClass = "badge-green";
  } else if (recurringBalance >= -3) {
    statusText = "轻度赤字";
    statusBadgeClass = "badge-yellow";
  } else {
    statusText = "结构性赤字";
    statusBadgeClass = "badge-red";
    isStructuralDeficit = true;
  }

  return {
    ...taxDetails,
    operatingIncome,
    baseExpense,
    maintenanceExpense,
    opportunityOperatingCosts,
    maintenanceDiscount,
    debtInterest,
    recurringBalance,
    statusText,
    statusBadgeClass,
    isStructuralDeficit
  };
}

export function calculateFiscalHealth(treasury: number, debt: number): number {
  return clamp(Math.round(50 + treasury * 0.8 - debt * 0.6), 0, 100);
}

export function payExpense(treasury: number, debt: number, cost: number): { treasury: number; debt: number; debtAdded: number } {
  if (cost <= 0) return { treasury, debt, debtAdded: 0 };

  if (treasury >= cost) {
    return { treasury: Math.round((treasury - cost) * 10) / 10, debt, debtAdded: 0 };
  } else {
    const deficit = Math.round((cost - treasury) * 10) / 10;
    return { treasury: 0, debt: Math.round((debt + deficit) * 10) / 10, debtAdded: deficit };
  }
}

export function wouldExceedDebtLimit(treasury: number, debt: number, cost: number): boolean {
  const result = payExpense(treasury, debt, cost);
  return result.debt > 120;
}

export function repayDebtAction(state: GameState, requestedAmount: number): GameState {
  const amount = Math.floor(requestedAmount);
  if (amount <= 0) return state;

  const actualRepayment = Math.min(amount, state.treasury, state.debt);
  if (actualRepayment <= 0) return state;

  const nextTreasury = Math.round((state.treasury - actualRepayment) * 10) / 10;
  const nextDebt = Math.round((state.debt - actualRepayment) * 10) / 10;

  const year = getYearFromQuarter(state.quarter);
  const qInYear = ((state.quarter - 1) % 4) + 1;

  const repaymentRecord: RepaymentRecord = {
    quarter: state.quarter,
    amount: actualRepayment,
    preTreasury: state.treasury,
    postTreasury: nextTreasury,
    preDebt: state.debt,
    postDebt: nextDebt
  };

  const chronicleEntry = {
    id: `chron_repay_${state.quarter}_${Date.now()}`,
    quarter: state.quarter,
    year,
    quarterInYear: qInYear,
    type: "repay_debt" as const,
    title: `主动偿还债务 ${actualRepayment} 亿元`,
    body: `调配可用财政偿还城投债务，债务由 ${state.debt} 亿降至 ${nextDebt} 亿，降低未来利息负担。`
  };

  return {
    ...state,
    treasury: nextTreasury,
    debt: nextDebt,
    voluntaryRepaymentThisQuarter: (state.voluntaryRepaymentThisQuarter ?? 0) + actualRepayment,
    repaymentHistory: [...(state.repaymentHistory ?? []), repaymentRecord],
    chronicle: [chronicleEntry, ...state.chronicle]
  };
}
