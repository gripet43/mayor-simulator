import React from "react";
import { GameState } from "../types/game";
import { Award, Zap } from "lucide-react";

interface Props {
  data: GameState["opportunityResultModal"];
  onClose: () => void;
}

export const OpportunityResultModal: React.FC<Props> = ({ data, onClose }) => {
  if (!data) return null;

  const isSuper = data.resultTier === "super_success";
  const isSuccess = data.resultTier === "success";
  const isPartial = data.resultTier === "partial_success";
  const isFailed = data.resultTier === "failed";

  const title = data.opportunityName ?? "重大城市机遇竞逐";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-center" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
          <Award size={44} color={isFailed ? "var(--color-red)" : isSuper ? "var(--color-green)" : "#B98425"} />
        </div>

        <span className={`badge ${isFailed ? "badge-red" : isSuper || isSuccess ? "badge-green" : "badge-yellow"}`} style={{ fontSize: "14px", padding: "4px 12px", marginBottom: "8px" }}>
          {isSuper ? "🏆 揭晓：超级成功 (国家级示范)" : isSuccess ? "🎉 揭晓：竞逐成功 (重点基地)" : isPartial ? "⚡ 揭晓：部分成功 (储备基地)" : "❌ 揭晓：未达门槛"}
        </span>

        <h2 style={{ fontSize: "18px", marginTop: "6px", marginBottom: "10px", fontFamily: "var(--font-serif)" }}>
          {title}
        </h2>

        <div className="card" style={{ backgroundColor: "#FFF", padding: "12px", textAlign: "left", marginBottom: "14px", fontSize: "13px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
            <div>申报投入: <strong>{data.bidCost > 0 ? `${data.bidCost} 亿元` : "未投入"}</strong></div>
            <div>专项扶持资金: <strong style={{ color: "var(--color-green)" }}>+{data.grant} 亿元</strong></div>
            <div>撬动社会投资: <strong style={{ color: "#B98425" }}>+{data.socialInvestment} 亿元</strong></div>
            <div>资金撬动倍率: <strong style={{ color: "var(--color-blue)" }}>{data.leverageRatio > 0 ? `${data.leverageRatio} 倍` : "—"}</strong></div>
          </div>

          <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "6px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "3px" }}>
            {data.constructionTaxBonus > 0 && (
              <div style={{ color: "var(--color-green)" }}>
                📈 建设期/活动期临时税收: +{data.constructionTaxBonus} 亿/季 (连续2季度)
              </div>
            )}
            {data.permanentBaseBonus > 0 && (
              <div style={{ color: "var(--color-green)" }}>
                🏭 投产后永久产业税基: +{data.permanentBaseBonus} 亿/季 (生效中)
              </div>
            )}
            {data.permanentOperatingFee > 0 && (
              <div style={{ color: "var(--color-red)" }}>
                💸 永久场馆/机构运营费: -{data.permanentOperatingFee} 亿/季 (独立经常性支出)
              </div>
            )}
            {data.healthLossReduction && data.healthLossReduction > 0 && (
              <div style={{ color: "var(--color-blue)" }}>
                🏥 医疗健康突发危机损失降低: -{Math.round(data.healthLossReduction * 100)}% (永久被动生效)
              </div>
            )}
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: "100%" }} onClick={onClose}>
          太好了，继续施政
        </button>
      </div>
    </div>
  );
};
