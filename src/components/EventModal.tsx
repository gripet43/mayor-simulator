import React, { useState } from "react";
import { ActiveEvent, EventOption, EventRecord, GameState } from "../types/game";
import { PRNG } from "../engine/prng";
import { resolveEventOptionSelection } from "../engine/events";
import { formatEffectsMap } from "../utils/format";

interface Props {
  activeEvent: ActiveEvent;
  state: GameState;
  onResolve: (nextState: GameState, record: EventRecord) => void;
}

export const EventModal: React.FC<Props> = ({ activeEvent, state, onResolve }) => {
  const [resultRecord, setResultRecord] = useState<EventRecord | null>(null);
  const [nextGameState, setNextGameState] = useState<GameState | null>(null);

  const event = activeEvent.event;

  const handleSelectOption = (option: EventOption) => {
    const prng = new PRNG(state.seed + state.quarter * 521 + option.id.length);
    const { nextState, record } = resolveEventOptionSelection(state, activeEvent, option.id, prng);
    setResultRecord(record);
    setNextGameState(nextState);
  };

  const effectsFormatted = resultRecord ? formatEffectsMap(resultRecord.effects) : [];
  const hasNoEffects = resultRecord ? resultRecord.costPaid === 0 && effectsFormatted.length === 0 : false;

  return (
    <div className="modal-overlay">
      <div className="modal-center" style={{ maxWidth: "440px" }}>
        {!resultRecord ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="badge badge-red">🚨 突发城市事件</span>
              <span style={{ fontSize: "12px", color: "var(--text-sub)" }}>{event.source}</span>
            </div>

            <h2 style={{ fontSize: "18px", marginBottom: "8px", fontFamily: "var(--font-serif)" }}>
              {event.title}
            </h2>

            <p style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "12px", lineHeight: "1.6" }}>
              {event.body}
            </p>

            {activeEvent.hasSignalHint && (
              <div style={{
                fontSize: "12px",
                color: "var(--color-yellow)",
                backgroundColor: "#FEF7E6",
                padding: "6px 8px",
                borderRadius: "4px",
                marginBottom: "12px"
              }}>
                💡 此前已有相关风向预警线索
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {event.options.map((opt) => {
                const rate = activeEvent.calculatedSuccessRates[opt.id];
                const costText = opt.cost ? `成本 ${opt.cost} 亿` : "免费";

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 12px",
                      backgroundColor: "#FFF",
                      cursor: "pointer",
                      transition: "border-color 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                      <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>{opt.label}</strong>
                      <span className="badge">{costText}</span>
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--text-sub)" }}>{opt.description}</p>

                    {opt.successRate !== undefined && (
                      <div style={{ fontSize: "12px", color: "var(--color-blue)", marginTop: "4px", fontWeight: "bold" }}>
                        🎯 成功率 {rate}% (胜则大赚，败则承险)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <span className={`badge ${resultRecord.isSuccess ? "badge-green" : "badge-red"}`} style={{ fontSize: "14px", padding: "4px 12px" }}>
                {resultRecord.isSuccess ? "✅ 处理成功" : "❌ 方案受挫"}
              </span>
            </div>

            <h3 style={{ textAlign: "center", marginBottom: "12px", fontFamily: "var(--font-serif)" }}>
              “{resultRecord.eventTitle}” 决策结果
            </h3>

            <div style={{ backgroundColor: "#FFF", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-sub)", marginBottom: "6px" }}>
                执行方案: <strong>【{resultRecord.optionLabel}】</strong>
              </div>

              {resultRecord.logMessage && (
                <div style={{
                  fontSize: "13px",
                  color: resultRecord.isSuccess ? "var(--color-green)" : "var(--color-red)",
                  backgroundColor: resultRecord.isSuccess ? "#E8F4EE" : "#FDE8E7",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  lineHeight: "1.5"
                }}>
                  💬 {resultRecord.logMessage}
                </div>
              )}

              {resultRecord.costPaid > 0 && (
                <div style={{ color: "var(--color-red)", fontSize: "13px", marginBottom: "4px", fontWeight: "bold" }}>
                  财政支出: -{resultRecord.costPaid} 亿元
                </div>
              )}

              {effectsFormatted.map((text, idx) => (
                <div key={idx} style={{ fontSize: "13px", margin: "3px 0", color: text.includes("+") ? "var(--color-green)" : "var(--color-red)", fontWeight: "500" }}>
                  {text}
                </div>
              ))}

              {hasNoEffects && !resultRecord.logMessage && (
                <div style={{ fontSize: "13px", color: "var(--text-sub)", fontStyle: "italic" }}>
                  ✨ 城市秩序维持平稳，未产生额外财政与指标损益。
                </div>
              )}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => {
                if (nextGameState) {
                  onResolve(nextGameState, resultRecord);
                }
              }}
            >
              查看季度总结 &gt;
            </button>
          </>
        )}
      </div>
    </div>
  );
};
