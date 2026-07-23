import { GameState } from "../types/game";
import { computeInstallments, POLICIES_DATA } from "../data/policiesData";
import { deriveOpportunitySeed } from "../engine/cityOpportunity";
import { MAJOR_OPPORTUNITIES_DATA } from "../data/majorOpportunitiesData";
import { PRNG } from "../engine/prng";
import { syncMajorOpportunityRotation } from "../engine/gameEngine";

const SAVE_KEY = "mayor_simulator_save_v1";

export function saveGameState(state: GameState): void {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, json);
  } catch (err) {
    console.error("Failed to save game state:", err);
  }
}

export function loadGameState(): GameState | null {
  try {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return null;
    const parsed = JSON.parse(json) as GameState;

    return migrateSaveData(parsed);
  } catch (err) {
    console.error("Failed to load game state:", err);
    return null;
  }
}

export function clearSaveGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.error("Failed to clear save game:", err);
  }
}

export function migrateSaveData(save: any): GameState {
  if (!save) return save;

  const saveSeed = save.seed || 12345;

  if (save.actionUsedThisQuarter === undefined) {
    save.actionUsedThisQuarter = false;
  }

  if (!save.followUpOpportunityOrder || save.followUpOpportunityOrder.length === 0) {
    const orderSeed = deriveOpportunitySeed(saveSeed, "global", "followup_order");
    const orderPrng = new PRNG(orderSeed);
    const followUpCandidates = ["freight_hub", "regional_medical", "cultural_expo"];
    save.followUpOpportunityOrder = [...followUpCandidates].sort(() => orderPrng.nextFloat() - 0.5);
  }

  if (save.nextOpportunityStartQuarter === undefined) {
    save.nextOpportunityStartQuarter = 8;
  }

  if (!save.opportunityBaseFits) {
    const fits: Record<string, number> = {
      new_energy_base: save.baseFit || 30
    };
    save.followUpOpportunityOrder.forEach((oppId: string) => {
      const oppSeed = deriveOpportunitySeed(saveSeed, oppId, "base_fit");
      const oppPrng = new PRNG(oppSeed);
      fits[oppId] = 26 + Math.floor(oppPrng.nextFloat() * 9);
    });
    save.opportunityBaseFits = fits;
  }

  if (!save.opportunityStates) {
    save.opportunityStates = {};
  }

  if (save.cityOpportunityState) {
    save.opportunityStates[save.cityOpportunityState.id || "new_energy_base"] = { ...save.cityOpportunityState };
  } else {
    save.opportunityStates.new_energy_base = {
      id: "new_energy_base",
      title: MAJOR_OPPORTUNITIES_DATA.new_energy_base.name,
      startQuarter: 2,
      settleQuarter: 5,
      hasResearched: false,
      status: "announced",
      opportunitySynergyIds: []
    };
  }

  if (!save.activeMajorOpportunityId) {
    save.activeMajorOpportunityId = save.cityOpportunityState?.id || "new_energy_base";
  }

  if (!save.quartersWithoutRelevantPolicyMap) {
    save.quartersWithoutRelevantPolicyMap = {
      [save.activeMajorOpportunityId]: save.quartersWithoutRelevantPolicy || 0
    };
  }

  if (!save.scheduledOpportunityRewards) {
    save.scheduledOpportunityRewards = [];
  }

  if (save.permanentOpportunityOperatingCosts === undefined) {
    save.permanentOpportunityOperatingCosts = 0;
  }

  if (save.healthEventLossMultiplier === undefined) {
    save.healthEventLossMultiplier = 1.0;
  }

  if (!save.capabilities) {
    save.capabilities = {};
  }

  if (save.industrialTaxBase === undefined) {
    save.industrialTaxBase = 0;
  }

  if (!save.temporaryTaxBonuses) {
    save.temporaryTaxBonuses = [];
  }

  if (save.cumulativeSocialInvestment === undefined) {
    save.cumulativeSocialInvestment = 0;
  }

  if (Array.isArray(save.activeProjects)) {
    save.activeProjects = save.activeProjects.map((p: any) => {
      const def = POLICIES_DATA.find((item) => item.id === p.policyId);
      const duration = p.totalDuration || (def ? def.duration : 3);
      const totalCost = p.totalCost || (def ? def.baseCost : 10);
      const installments = p.installments || computeInstallments(totalCost, duration);

      const stageIndex = p.stageIndex !== undefined
        ? p.stageIndex
        : Math.max(0, duration - (p.remainingDuration || 1));

      return {
        ...p,
        quarterStarted: p.quarterStarted || 1,
        totalDuration: duration,
        totalCost,
        installments,
        stageIndex,
        paidAmount: p.paidAmount !== undefined ? p.paidAmount : installments[0] || 0,
        status: p.status || "in_progress",
        appliedStageEffectIds: p.appliedStageEffectIds || []
      };
    });
  }

  save.saveVersion = 4;
  return syncMajorOpportunityRotation(save as GameState);
}
