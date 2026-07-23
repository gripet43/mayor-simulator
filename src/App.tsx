import React, { useState, useEffect } from "react";
import { GameState, EventRecord, PolicyDefinition, Intensity } from "./types/game";
import { createNewGame, completeQuarterStep, approvePolicyAction, skipQuarterAction, setDraftAction, executeQuarterResolution } from "./engine/gameEngine";
import { loadGameState, saveGameState, clearSaveGame } from "./storage/saveGame";

import { StartPage } from "./pages/StartPage";
import { DecisionPage } from "./pages/DecisionPage";
import { CityPage } from "./pages/CityPage";
import { ChroniclePage } from "./pages/ChroniclePage";
import { ResultPage } from "./pages/ResultPage";

import { BottomNav, NavTab } from "./components/BottomNav";
import { EventModal } from "./components/EventModal";
import { OpportunityResultModal } from "./components/OpportunityResultModal";
import { QuarterSummary } from "./components/QuarterSummary";
import { HelpModal } from "./components/HelpModal";
import { PolicySheet } from "./components/PolicySheet";

export const App: React.FC = () => {
  const [showStartPage, setShowStartPage] = useState<boolean>(true);

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGameState();
    if (saved) return saved;
    return createNewGame();
  });

  const [activeTab, setActiveTab] = useState<NavTab>("decision");
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDefinition | null>(null);

  useEffect(() => {
    if (!showStartPage) {
      saveGameState(gameState);
    }
  }, [gameState, showStartPage]);

  const hasSave = loadGameState() !== null;

  const handleStartNewGame = () => {
    clearSaveGame();
    const newGame = createNewGame();
    setGameState(newGame);
    setShowStartPage(false);
    setActiveTab("decision");
  };

  const handleContinueGame = () => {
    setShowStartPage(false);
  };

  const handleRestartGame = () => {
    clearSaveGame();
    const newGame = createNewGame();
    setGameState(newGame);
    setShowStartPage(false);
    setActiveTab("decision");
  };

  const handleUpdateGameState = (nextState: GameState) => {
    setGameState(nextState);
  };

  const handleSelectPolicyCard = (policy: PolicyDefinition) => {
    setSelectedPolicy(policy);
  };

  const handleConfirmApprovePolicy = (policyId: string, intensity: Intensity) => {
    setGameState(setDraftAction(gameState, { type: "policy", policyId, intensity }));
    setSelectedPolicy(null);
  };

  const handleSkipQuarter = (prioritizeRepay?: boolean) => {
    setGameState(setDraftAction(gameState, { type: prioritizeRepay ? "repay" : "skip" }));
  };

  const handleExecuteResolution = () => {
    try {
      const { nextState } = executeQuarterResolution(gameState);
      setGameState(nextState);
    } catch (err: any) {
      alert(err.message || "季度结算失败");
    }
  };

  const handleResolveEvent = (nextState: GameState, record: EventRecord) => {
    setGameState({
      ...nextState,
      currentEvent: undefined
    });
  };

  const handleCloseOpportunityResult = () => {
    setGameState((prev) => ({
      ...prev,
      opportunityResultModal: undefined
    }));
  };

  const handleConfirmNextQuarter = () => {
    const nextState = completeQuarterStep(gameState);
    setGameState(nextState);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
      {showStartPage ? (
        <StartPage
          hasSave={hasSave}
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          onOpenHelp={() => setShowHelp(true)}
        />
      ) : gameState.gameStatus !== "playing" ? (
        <ResultPage state={gameState} onRestart={handleRestartGame} />
      ) : (
        <>
          {/* Active Page View */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {activeTab === "decision" && (
              <DecisionPage
                state={gameState}
                onSelectPolicyCard={handleSelectPolicyCard}
                onExecuteResolution={handleExecuteResolution}
                onUpdateState={handleUpdateGameState}
                onOpenHelp={() => setShowHelp(true)}
              />
            )}

            {activeTab === "city" && (
              <CityPage
                state={gameState}
                onOpenHelp={() => setShowHelp(true)}
              />
            )}

            {activeTab === "chronicle" && (
              <ChroniclePage
                state={gameState}
                onOpenHelp={() => setShowHelp(true)}
              />
            )}
          </div>

          {/* Bottom Navigation */}
          <BottomNav
            currentTab={activeTab}
            onSelectTab={setActiveTab}
          />

          {/* Policy Sheet */}
          {selectedPolicy && (
            <PolicySheet
              policy={selectedPolicy}
              state={gameState}
              onClose={() => setSelectedPolicy(null)}
              onConfirmApprove={handleConfirmApprovePolicy}
            />
          )}

          {/* Event Modal (Blocking Dialog) */}
          {gameState.currentEvent && (
            <EventModal
              activeEvent={gameState.currentEvent}
              state={gameState}
              onResolve={handleResolveEvent}
            />
          )}

          {/* Opportunity Settlement Result Modal */}
          {gameState.opportunityResultModal && (
            <OpportunityResultModal
              data={gameState.opportunityResultModal}
              onClose={handleCloseOpportunityResult}
            />
          )}

          {/* Quarter Summary Modal */}
          {!gameState.currentEvent && !gameState.opportunityResultModal && gameState.lastQuarterSummary && (
            <QuarterSummary
              summary={gameState.lastQuarterSummary}
              isLastQuarter={gameState.quarter >= 20}
              onNextQuarter={handleConfirmNextQuarter}
            />
          )}
        </>
      )}

      {/* Rules & Manual Help Modal */}
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
};
