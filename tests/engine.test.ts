import { describe, expect, it } from "vitest";
import { approvePolicyAction, completeQuarterStep, createNewGame, skipQuarterAction } from "../src/engine/gameEngine";
import { calculateDebtInterest, calculateQuarterTax, calculateRecurringBalance } from "../src/engine/finance";
import {
  calculateOpportunityScore,
  checkOpportunityGuaranteedSuccess,
  checkOpportunitySuperSuccess,
  deriveOpportunitySeed,
  getMajorOpportunityDefinition,
  projectCapabilitiesAtSettle,
  resolveOpportunityResultTier
} from "../src/engine/cityOpportunity";
import { computeDirectInitiationCost, POLICIES_DATA } from "../src/data/policiesData";
import { migrateSaveData } from "../src/storage/saveGame";
import { MAJOR_OPPORTUNITIES_DATA } from "../src/data/majorOpportunitiesData";
import { resolveEventOptionSelection } from "../src/engine/events";
import { PRNG } from "../src/engine/prng";

describe("Universal Major City Opportunity System Test Suite (Save V4)", () => {
  it("1. New Energy Base Zero-RNG Path Guarantees SUCCESS", () => {
    const game = createNewGame(12345);
    game.opportunityBaseFits.new_energy_base = 26;

    let s = completeQuarterStep(skipQuarterAction(game).nextState); // Q1 -> Q2 (New Energy starts)

    s = approvePolicyAction(s, "school_expansion", "full", true).nextState; // Q2
    s = completeQuarterStep(s);

    s = approvePolicyAction(s, "green_grid", "full", true).nextState; // Q3
    s = completeQuarterStep(s);

    s = approvePolicyAction(s, "industrial_park", "full", true).nextState; // Q4
    s = completeQuarterStep(s);

    // Q5 Bidding & Settlement
    s.cityOpportunityState.selectedBidTier = "standard";
    const q5Res = skipQuarterAction(s).nextState;

    expect(q5Res.opportunityStates.new_energy_base.status).toBe("settled");
    expect(q5Res.opportunityStates.new_energy_base.resultTier).toBe("success");
  });

  it("2. Freight Hub Zero-RNG Path Guarantees SUCCESS", () => {
    const game = createNewGame(11111);
    game.followUpOpportunityOrder = ["freight_hub", "regional_medical", "cultural_expo"];
    game.nextOpportunityStartQuarter = 8;
    game.opportunityBaseFits.freight_hub = 26;

    let s = game;
    while (s.quarter < 8) {
      const skipRes = skipQuarterAction(s).nextState;
      s = completeQuarterStep(skipRes);
    }

    expect(s.quarter).toBe(8);
    expect(s.activeMajorOpportunityId).toBe("freight_hub");

    // T (Q8): Freight Corridor
    s = approvePolicyAction(s, "freight_corridor", "full", true).nextState;
    s = completeQuarterStep(s);

    // T+1 (Q9): Multimodal Hub
    s = approvePolicyAction(s, "multimodal_hub", "full", true).nextState;
    s = completeQuarterStep(s);

    // T+2 (Q10): Trade Port
    s = approvePolicyAction(s, "trade_port", "full", true).nextState;
    s = completeQuarterStep(s);

    // T+3 (Q11): Bidding & Settlement
    s.opportunityStates.freight_hub.selectedBidTier = "standard";
    s.cityOpportunityState.selectedBidTier = "standard";
    const q11Res = skipQuarterAction(s).nextState;

    expect(q11Res.opportunityStates.freight_hub.status).toBe("settled");
    expect(q11Res.opportunityStates.freight_hub.resultTier).toBe("success");
    expect(q11Res.permanentOpportunityOperatingCosts).toBeGreaterThan(0);
  });

  it("3. Regional Medical Center Zero-RNG Path Guarantees SUCCESS & reduces health loss", () => {
    const game = createNewGame(22222);
    game.followUpOpportunityOrder = ["regional_medical", "freight_hub", "cultural_expo"];
    game.nextOpportunityStartQuarter = 8;
    game.opportunityBaseFits.regional_medical = 26;

    let s = game;
    while (s.quarter < 8) {
      const skipRes = skipQuarterAction(s).nextState;
      s = completeQuarterStep(skipRes);
    }

    expect(s.quarter).toBe(8);
    expect(s.activeMajorOpportunityId).toBe("regional_medical");

    // Q8: Clinical Center
    s = approvePolicyAction(s, "clinical_center", "full", true).nextState;
    s = completeQuarterStep(s);

    // Q9: Translational Med
    s = approvePolicyAction(s, "translational_med", "full", true).nextState;
    s = completeQuarterStep(s);

    // Q10: Med Talent Plan
    s = approvePolicyAction(s, "med_talent_plan", "full", true).nextState;
    s = completeQuarterStep(s);

    // Q11: Settlement
    s.opportunityStates.regional_medical.selectedBidTier = "standard";
    s.cityOpportunityState.selectedBidTier = "standard";
    const q11Res = skipQuarterAction(s).nextState;

    expect(q11Res.opportunityStates.regional_medical.resultTier).toBe("success");
    expect(q11Res.healthEventLossMultiplier).toBe(0.6);

    // Health event damage reduction test
    const prng = new PRNG(1234);
    const mockActiveEvent = {
      event: {
        id: "food_safety_anomaly",
        title: "餐饮抽检异常",
        body: "抽检不合格",
        source: "市监局",
        cooldown: 3,
        baseWeight: 10,
        isHealthRelated: true,
        options: [
          {
            id: "opt_keep_market",
            label: "保持热度",
            description: "轻罚",
            successEffects: { livelihood: -10, morale: -10 }
          }
        ]
      },
      hasSignalHint: false,
      calculatedSuccessRates: { opt_keep_market: 100 }
    };

    const eventRes = resolveEventOptionSelection(q11Res, mockActiveEvent, "opt_keep_market", prng);
    expect(eventRes.record.effects.livelihood).toBe(-6);
    expect(eventRes.record.effects.morale).toBe(-6);
  });

  it("4. Cultural Tourism Expo Zero-RNG Path Guarantees SUCCESS", () => {
    const game = createNewGame(33333);
    game.followUpOpportunityOrder = ["cultural_expo", "freight_hub", "regional_medical"];
    game.nextOpportunityStartQuarter = 8;
    game.opportunityBaseFits.cultural_expo = 26;

    let s = game;
    while (s.quarter < 8) {
      const skipRes = skipQuarterAction(s).nextState;
      s = completeQuarterStep(skipRes);
    }

    expect(s.quarter).toBe(8);
    expect(s.activeMajorOpportunityId).toBe("cultural_expo");

    // Q8: Historic District Renewal
    s = approvePolicyAction(s, "historic_district_renewal", "full", true).nextState;
    s = completeQuarterStep(s);

    // Q9: Tourist Service Network
    s = approvePolicyAction(s, "tourist_service_network", "full", true).nextState;
    s = completeQuarterStep(s);

    // Q10: Expo Center Renovation
    s = approvePolicyAction(s, "expo_center_renovation", "full", true).nextState;
    s = completeQuarterStep(s);

    // Q11: Settlement
    s.opportunityStates.cultural_expo.selectedBidTier = "standard";
    s.cityOpportunityState.selectedBidTier = "standard";
    const q11Res = skipQuarterAction(s).nextState;

    expect(q11Res.opportunityStates.cultural_expo.resultTier).toBe("success");
    expect(q11Res.scheduledOpportunityRewards.length).toBeGreaterThan(0);
  });

  it("5. Derived RNG reproducibility and order stability across games", () => {
    const seed1 = deriveOpportunitySeed(12345, "freight_hub", "base_fit");
    const seed2 = deriveOpportunitySeed(12345, "freight_hub", "base_fit");
    expect(seed1).toBe(seed2);

    const g1 = createNewGame(88888);
    const g2 = createNewGame(88888);
    expect(g1.followUpOpportunityOrder).toEqual(g2.followUpOpportunityOrder);
  });

  it("6. Only one major opportunity active at a time and follow-up intervals are respected", () => {
    const game = createNewGame(12345);
    expect(game.activeMajorOpportunityId).toBe("new_energy_base");

    let s = game;
    while (s.quarter < 5) {
      const skipRes = skipQuarterAction(s).nextState;
      s = completeQuarterStep(skipRes);
    }

    // Q5 Settlement
    const q5Res = skipQuarterAction(s).nextState;
    expect(q5Res.opportunityStates.new_energy_base.status).toBe("settled");
    expect(q5Res.nextOpportunityStartQuarter).toBe(8);

    // Advance Q5 -> Q6, Q6 -> Q7, Q7 -> Q8
    s = completeQuarterStep(q5Res); // Q6
    s = completeQuarterStep(skipQuarterAction(s).nextState); // Q7
    s = completeQuarterStep(skipQuarterAction(s).nextState); // Q8

    expect(s.quarter).toBe(8);
    expect(s.activeMajorOpportunityId).toBe(s.followUpOpportunityOrder[0]);
  });

  it("7. Save Version 4 migration compatibility", () => {
    const oldSave: any = {
      version: 1,
      seed: 54321,
      quarter: 6,
      treasury: 40,
      debt: 15,
      activeProjects: []
    };

    const migrated = migrateSaveData(oldSave);
    expect(migrated.saveVersion).toBe(4);
    expect(migrated.treasury).toBe(40);
    expect(migrated.followUpOpportunityOrder.length).toBe(3);
    expect(migrated.opportunityBaseFits.new_energy_base).toBeDefined();
  });
});
