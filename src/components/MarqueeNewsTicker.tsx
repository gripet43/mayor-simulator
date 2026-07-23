import React, { useState } from "react";
import { GameState } from "../types/game";
import { TRENDS_DATA } from "../data/trendsData";
import { TrendSignalSheet } from "./TrendSignalSheet";

interface Props {
  state: GameState;
}

export const MarqueeNewsTicker: React.FC<Props> = ({ state }) => {
  const [showSheet, setShowSheet] = useState<boolean>(false);

  const trend = TRENDS_DATA[state.currentTrend];
  const signal = state.currentSignal;

  const trendChunk = trend
    ? `【年度形势】${trend.title}｜${trend.description}`
    : "【年度形势】秩序平稳｜各项建设稳步推进";

  const signalChunk = signal
    ? `【本季风向】${signal.title}｜${signal.body}`
    : "【本季风向】治安良善｜暂无突发预警";

  // Combine both into one single marquee string with a clean separator
  const combinedText = `${trendChunk}    ❖    ${signalChunk}`;

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <>
      <div
        className="marquee-container"
        onClick={() => setShowSheet(true)}
        style={{
          height: "38px",
          backgroundColor: "#FAF9F5",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          cursor: "pointer",
          position: "relative",
          boxShadow: "var(--shadow-sm)"
        }}
        aria-label={`城市情报快讯: ${combinedText}`}
      >
        {/* Left Fixed Label */}
        <div style={{
          width: "72px",
          minWidth: "72px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          borderRight: "1px solid var(--border-color)",
          paddingRight: "6px",
          marginRight: "6px",
          zIndex: 2,
          backgroundColor: "#FAF9F5"
        }}>
          <span className="badge badge-yellow" style={{ fontSize: "10px", padding: "2px 4px", fontWeight: "bold" }}>
            情报快讯
          </span>
        </div>

        {/* Right Infinite Looping Text Track */}
        <div style={{
          flex: 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
          fontSize: "12px",
          color: "var(--text-main)",
          fontWeight: "500"
        }}>
          {prefersReducedMotion ? (
            <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {combinedText}
            </div>
          ) : (
            <div
              className="ticker-track-seamless"
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                animation: "seamlessMarquee 28s linear infinite"
              }}
            >
              <span style={{ paddingRight: "40px" }}>{combinedText}</span>
              <span style={{ paddingRight: "40px" }}>{combinedText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Marquee Infinite Keyframe CSS Rule */}
      <style>{`
        @keyframes seamlessMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Detail Bottom Sheet Modal */}
      {showSheet && (
        <TrendSignalSheet
          state={state}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
};
