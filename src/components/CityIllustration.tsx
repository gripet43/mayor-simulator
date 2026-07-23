import React from "react";
import { GameState } from "../types/game";

interface Props {
  state: GameState;
}

export function getCityStage(state: GameState): { stage: string; key: "city_initial" | "city_growth" | "city_green" | "city_crisis" } {
  const avg = (state.economy + state.livelihood + state.environment + state.morale) / 4;

  if (state.debt > 100 || state.morale < 20 || state.environment < 25 || avg < 30) {
    return { stage: "危机城市", key: "city_crisis" };
  }
  if (state.environment >= 70 && state.economy >= 55) {
    return { stage: "生态宜居示范城", key: "city_green" };
  }
  if (avg >= 65) {
    return { stage: "繁荣发展的临州市", key: "city_growth" };
  }
  if (avg >= 50) {
    return { stage: "稳步推进的临州市", key: "city_growth" };
  }
  return { stage: "转型中的临州市", key: "city_initial" };
}

export const CityIllustration: React.FC<Props> = ({ state }) => {
  const { stage, key } = getCityStage(state);
  const isPolluted = state.environment < 30;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "110px",
      backgroundColor: key === "city_green" ? "#E8F3F1" : key === "city_crisis" ? "#F5EBEB" : "#EBEADF",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-color)",
      marginBottom: "12px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end"
    }}>
      {/* Dynamic SVG skyline rendering */}
      <svg viewBox="0 0 400 110" style={{ width: "100%", height: "100%", position: "absolute", bottom: 0, left: 0 }}>
        {/* Background Hills */}
        <path d="M0,80 Q100,50 200,75 T400,60 L400,110 L0,110 Z" fill={key === "city_green" ? "#3A8175" : "#A8A59C"} opacity="0.25" />
        <path d="M50,90 Q180,60 320,85 T400,70 L400,110 L0,110 Z" fill={key === "city_green" ? "#2F7657" : "#8F8E88"} opacity="0.35" />

        {/* Buildings Skyline */}
        {key === "city_crisis" ? (
          <>
            {/* Smokestacks & Factory silhouette */}
            <rect x="40" y="45" width="30" height="65" fill="#555" />
            <line x1="50" y1="45" x2="50" y2="25" stroke="#777" strokeWidth="4" />
            <path d="M45,25 Q30,15 20,20 Q10,10 0,15" fill="none" stroke="#999" strokeWidth="3" opacity="0.7" />
            <rect x="110" y="55" width="40" height="55" fill="#444" />
            <rect x="220" y="50" width="35" height="60" fill="#333" />
            <polygon points="220,50 237,30 255,50" fill="#222" />
            <rect x="300" y="60" width="50" height="50" fill="#555" />
          </>
        ) : key === "city_green" ? (
          <>
            {/* Modern Eco Towers and Trees */}
            <rect x="50" y="35" width="25" height="75" rx="3" fill="#3A8175" />
            <rect x="55" y="40" width="15" height="5" fill="#FFF" opacity="0.8" />
            <rect x="55" y="50" width="15" height="5" fill="#FFF" opacity="0.8" />
            <rect x="130" y="25" width="35" height="85" rx="4" fill="#3D6F91" />
            <circle cx="230" cy="75" r="20" fill="#2F7657" />
            <circle cx="260" cy="70" r="25" fill="#3A8175" />
            <rect x="310" y="40" width="30" height="70" rx="3" fill="#2F7657" />
          </>
        ) : (
          <>
            {/* Standard Transitional City */}
            <rect x="30" y="50" width="30" height="60" fill="#8F8E88" />
            <rect x="80" y="35" width="35" height="75" fill="#6B6B66" />
            <rect x="140" y="45" width="25" height="65" fill="#8F8E88" />
            <rect x="200" y="30" width="40" height="80" fill="#242424" />
            <rect x="270" y="55" width="30" height="55" fill="#6B6B66" />
            <rect x="330" y="40" width="35" height="70" fill="#8F8E88" />
          </>
        )}

        {/* Bridge & River at Bottom */}
        <rect x="0" y="98" width="400" height="12" fill={key === "city_green" ? "#3D6F91" : "#6B6B66"} />
        <line x1="0" y1="98" x2="400" y2="98" stroke="#FFF" strokeWidth="1" strokeDasharray="6,6" />
      </svg>

      {/* Pollution Smog Overlay */}
      {isPolluted && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(183, 132, 37, 0.25)",
          backdropFilter: "contrast(0.9)",
          pointerEvents: "none"
        }}>
          <span style={{
            position: "absolute",
            top: "6px",
            right: "8px",
            fontSize: "11px",
            backgroundColor: "#B8642B",
            color: "#FFF",
            padding: "1px 6px",
            borderRadius: "4px"
          }}>
            🌫️ 污染雾霾罩城
          </span>
        </div>
      )}

      {/* Stage Badge overlay */}
      <div style={{
        position: "absolute",
        bottom: "6px",
        left: "8px",
        backgroundColor: "rgba(36, 36, 36, 0.85)",
        color: "#F4F3EF",
        padding: "3px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
        fontFamily: "var(--font-serif)",
        display: "flex",
        alignItems: "center",
        gap: "4px"
      }}>
        🏙️ {stage}
      </div>
    </div>
  );
};
