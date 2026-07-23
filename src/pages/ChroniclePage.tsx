import React from "react";
import { GameState } from "../types/game";
import { HeaderStatus } from "../components/HeaderStatus";

interface Props {
  state: GameState;
  onOpenHelp: () => void;
}

export const ChroniclePage: React.FC<Props> = ({ state, onOpenHelp }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <HeaderStatus state={state} onOpenHelp={onOpenHelp} />

      <div className="page-content">
        <div style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "var(--font-serif)", marginBottom: "12px" }}>
          📰 临州市政务大事纪事录
        </div>

        {state.chronicle.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-sub)", padding: "20px" }}>
            暂无纪事记录
          </div>
        ) : (
          state.chronicle.map((item) => {
            const getTypeBadge = () => {
              switch (item.type) {
                case "policy_approve": return <span className="badge badge-yellow">政策批准</span>;
                case "project_complete": return <span className="badge badge-green">项目完工</span>;
                case "event": return <span className="badge badge-red">突发事件</span>;
                case "milestone": return <span className="badge badge-blue">重大里程碑</span>;
                case "opportunity_result": return <span className="badge badge-green">城市跃迁</span>;
                case "repay_debt": return <span className="badge badge-yellow">主动偿债</span>;
                case "skip": return <span className="badge">暂缓新政</span>;
                default: return <span className="badge">城市动态</span>;
              }
            };

            return (
              <div key={item.id} className="card" style={{ padding: "12px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-sub)", fontWeight: "500" }}>
                    第 {item.quarter} 季度 · 第 {item.year} 年第 {item.quarterInYear} 季度
                  </span>
                  {getTypeBadge()}
                </div>

                <div style={{ fontSize: "15px", fontWeight: "bold", fontFamily: "var(--font-serif)", color: "var(--text-main)", marginBottom: "4px" }}>
                  {item.title}
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: "1.5" }}>
                  {item.body}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
