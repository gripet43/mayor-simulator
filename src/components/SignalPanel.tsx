import React from "react";
import { Signal, SignalType } from "../types/game";

interface Props {
  signal: Signal | null;
}

export const SignalPanel: React.FC<Props> = ({ signal }) => {
  if (!signal) return null;

  const getTypeBadge = (type: SignalType) => {
    switch (type) {
      case "official":
        return <span className="badge badge-red">官方提示 (可靠度 85%)</span>;
      case "reliable":
        return <span className="badge badge-blue">可靠消息 (可靠度 75%)</span>;
      case "market":
        return <span className="badge badge-yellow">市场传闻 (可靠度 55%)</span>;
      case "street":
        return <span className="badge badge-green">街头消息 (可靠度 45%)</span>;
    }
  };

  return (
    <div className="card" style={{
      backgroundColor: "#FAF9F5",
      borderColor: "var(--border-color)",
      padding: "10px 12px",
      marginBottom: "12px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-sub)" }}>
          📰 本季度风向线索
        </span>
        {getTypeBadge(signal.type)}
      </div>

      <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "2px" }}>
        {signal.title}
      </div>

      <p style={{ fontSize: "12px", color: "var(--text-sub)" }}>
        {signal.body}
      </p>
    </div>
  );
};
