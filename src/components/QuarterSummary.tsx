import React, { useState, useEffect } from "react";
import { QuarterSummaryData } from "../types/game";
import { Coins, CheckCircle2, TrendingUp, Newspaper, BookOpen, HardHat, Zap, FileCheck } from "lucide-react";

interface Props {
  summary: QuarterSummaryData;
  isLastQuarter: boolean;
  onNextQuarter: () => void;
}

export const QuarterSummary: React.FC<Props> = ({ summary, isLastQuarter, onNextQuarter }) => {
  const [phase, setPhase] = useState<"simulating" | "report">("simulating");
  const [revealedStepCount, setRevealedStepCount] = useState<number>(1);

  useEffect(() => {
    if (phase === "simulating") {
      setRevealedStepCount(1);
      const t1 = setTimeout(() => setRevealedStepCount(2), 320);
      const t2 = setTimeout(() => setRevealedStepCount(3), 640);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [phase]);

  const f = summary.finance;
  const m = summary.metricChanges;
  const dl = f.debtLedger;

  const totalIncome = Math.round((f.taxIncome + (f.operatingIncomeTotal ?? 0)) * 10) / 10;
  const totalExpense = Math.round((f.baseExpense + f.maintenanceExpense + (f.opportunityOperatingCosts ?? 0) + f.debtInterest) * 10) / 10;
  const netBalance = Math.round((totalIncome - totalExpense) * 10) / 10;

  const getSimulationSteps = () => {
    const draft = summary.executedDraft;
    const policyName = summary.draftPolicyName || "拟定项目";
    const intensityLabel = draft?.intensity === "pilot" ? "试点" : draft?.intensity === "intensive" ? "攻坚" : "全市推行";

    if (draft?.type === "policy") {
      return [
        { icon: <Coins size={15} color="#B98425" />, text: `划拨【${policyName}】(${intensityLabel}) 首期建设款` },
        { icon: <HardHat size={15} color="#2E7D32" />, text: `招投标完成，施工团队进场推进建设进度` },
        { icon: <TrendingUp size={15} color="#0277BD" />, text: `结算经常性财税、产业税基与城投利息...` }
      ];
    }

    if (draft?.type === "repay") {
      return [
        { icon: <Coins size={15} color="#2E7D32" />, text: `调配 5.0 亿元财政专款，划拨城投偿债账户` },
        { icon: <CheckCircle2 size={15} color="#2E7D32" />, text: `成功偿还部分债务，有效降低后续利息负担` },
        { icon: <TrendingUp size={15} color="#0277BD" />, text: `结算经常性财税账目，编印《临州纪事》头条...` }
      ];
    }

    return [
      { icon: <BookOpen size={15} color="#8E8E93" />, text: `暂缓新项目立项，保留财政资金用于周转` },
      { icon: <CheckCircle2 size={15} color="#8E8E93" />, text: `维持现有城投基础设施平稳运行与基本开支` },
      { icon: <TrendingUp size={15} color="#0277BD" />, text: `结算经常性财税账目，编印《临州纪事》头条...` }
    ];
  };

  const steps = getSimulationSteps();

  if (phase === "simulating") {
    return (
      <div className="modal-overlay">
        <div className="modal-center" style={{ maxWidth: "400px", textAlign: "center", padding: "24px 18px" }}>
          <div style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "14px", fontFamily: "var(--font-serif)" }}>
            ⚙️ 正在推演第 {summary.quarter} 季度城市运转...
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-sub)", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", textAlign: "left", minHeight: "110px" }}>
            {steps.map((s, idx) => {
              const isVisible = revealedStepCount >= idx + 1;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: isVisible ? 1 : 0.15,
                    transform: isVisible ? "translateY(0)" : "translateY(4px)",
                    transition: "all 0.3s ease-out"
                  }}
                >
                  <div style={{ minWidth: "16px" }}>{s.icon}</div>
                  <span style={{ fontWeight: isVisible ? "bold" : "normal", color: isVisible ? "#1C1C1E" : "#8E8E93" }}>
                    {s.text}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ height: "6px", backgroundColor: "#E5E5EA", borderRadius: "3px", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{
              width: `${(revealedStepCount / 3) * 100}%`,
              height: "100%",
              backgroundColor: "#B98425",
              borderRadius: "3px",
              transition: "width 0.3s ease-out"
            }} />
          </div>

          <button
            className="btn"
            style={{
              width: "100%",
              height: "40px",
              backgroundColor: "#B98425",
              color: "#FFF",
              fontWeight: "bold",
              fontSize: "14px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
            onClick={() => setPhase("report")}
          >
            下一步：查看本季政务公报 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-center" style={{ maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-sub)", letterSpacing: "1px" }}>季度政务公报</span>
          <h2 style={{ fontSize: "18px", fontFamily: "var(--font-serif)" }}>
            第 {summary.quarter} 季度结算
          </h2>
        </div>

        {/* Financial Breakdown Table */}
        <div className="card" style={{ padding: "10px 12px", marginBottom: "8px", backgroundColor: "#FFF" }}>
          <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "6px", borderBottom: "1px dashed var(--border-color)", paddingBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Coins size={14} color="var(--color-yellow)" /> 财政与产业税收账目
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", margin: "2px 0" }}>
            <span>经济基础税收:</span>
            <span style={{ color: "var(--color-green)", fontWeight: "bold" }}>+{f.taxBaseEconomy} 亿</span>
          </div>

          {f.industrialTaxBase > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", margin: "2px 0", color: "#B98425", fontWeight: "bold" }}>
              <span>永久产业税基加成:</span>
              <span>+{f.industrialTaxBase} 亿</span>
            </div>
          )}

          {f.temporaryTaxBonus > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", margin: "2px 0", color: "var(--color-blue)" }}>
              <span>临时建设期税收加成:</span>
              <span>+{f.temporaryTaxBonus} 亿</span>
            </div>
          )}

          {f.operatingIncomeTotal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", margin: "2px 0", color: "var(--color-green)" }}>
              <span>已完工项目运营收益:</span>
              <span>+{f.operatingIncomeTotal} 亿</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", margin: "2px 0", borderTop: "1px dashed var(--border-color)", paddingTop: "3px" }}>
            <span>基础公共支出:</span>
            <span style={{ color: "var(--color-red)" }}>-{f.baseExpense} 亿</span>
          </div>

          {f.maintenanceExpense > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", margin: "2px 0" }}>
              <span>已完工项目维护费:</span>
              <span style={{ color: "var(--color-red)" }}>-{f.maintenanceExpense} 亿</span>
            </div>
          )}

          {f.opportunityOperatingCosts > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", margin: "2px 0" }}>
              <span>重大机遇运营成本:</span>
              <span style={{ color: "var(--color-red)" }}>-{f.opportunityOperatingCosts} 亿</span>
            </div>
          )}

          {f.debtInterest > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", margin: "2px 0" }}>
              <span>债务利息支出 (6%年化):</span>
              <span style={{ color: "var(--color-red)" }}>-{f.debtInterest} 亿</span>
            </div>
          )}

          {/* Net Result Highlight Summary Line */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            fontWeight: "bold",
            margin: "6px 0 0 0",
            borderTop: "2px solid var(--border-color)",
            paddingTop: "6px",
            backgroundColor: netBalance >= 0 ? "#F4F9F4" : "#FDF2F2",
            padding: "6px 8px",
            borderRadius: "4px"
          }}>
            <span>本季经常性收支净额:</span>
            <span style={{ color: netBalance >= 0 ? "#2E7D32" : "#C62828", fontSize: "14px", fontFamily: "var(--font-serif)" }}>
              {netBalance >= 0 ? `+${netBalance} 亿元 (盈余)` : `${netBalance} 亿元 (赤字)`}
            </span>
          </div>
        </div>

        {/* Project & Opportunity Progress Notices */}
        {((summary.projectProgressNotices && summary.projectProgressNotices.length > 0) || summary.opportunityNotice) && (
          <div className="card" style={{ padding: "10px 12px", marginBottom: "8px", backgroundColor: "#FFFDF6", borderColor: "#F6E2B3" }}>
            <div style={{ fontWeight: "bold", fontSize: "12px", color: "#B98425", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <HardHat size={14} /> 项目建设与机遇进展
            </div>

            {summary.projectProgressNotices?.map((n, idx) => (
              <div key={idx} style={{ fontSize: "12px", margin: "2px 0", display: "flex", justifyContent: "space-between" }}>
                <span>• {n.projectName}: <strong>{n.oldProgress}% &rarr; {n.newProgress}%</strong></span>
                {n.capabilityChange && <span className="badge badge-yellow" style={{ fontSize: "10px" }}>{n.capabilityChange}</span>}
              </div>
            ))}

            {summary.opportunityNotice && (
              <div style={{ fontSize: "12px", color: "var(--color-green)", marginTop: "6px", fontWeight: "bold", borderTop: "1px dashed #F6E2B3", paddingTop: "4px" }}>
                ✨ {summary.opportunityNotice}
              </div>
            )}
          </div>
        )}

        {/* Quarterly Debt Ledger Section */}
        <div className="card" style={{ padding: "10px 12px", marginBottom: "8px", backgroundColor: "#FAF9F5" }}>
          <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "6px", borderBottom: "1px dashed var(--border-color)", paddingBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <BookOpen size={14} color="var(--color-blue)" /> 本季度债务账本
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", margin: "2px 0" }}>
            <span>期初债务:</span>
            <span>{dl.openingDebt} 亿</span>
          </div>

          {dl.policyBorrowing > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", margin: "2px 0", color: "var(--color-red)" }}>
              <span>工程建设首期融资借款:</span>
              <span>+{dl.policyBorrowing} 亿</span>
            </div>
          )}

          {dl.recurringDeficitBorrowing > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", margin: "2px 0", color: "var(--color-red)" }}>
              <span>经常性财政赤字补齐:</span>
              <span>+{dl.recurringDeficitBorrowing} 亿</span>
            </div>
          )}

          {dl.voluntaryRepayment > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", margin: "2px 0", color: "var(--color-green)" }}>
              <span>本季主动偿还:</span>
              <span>-{dl.voluntaryRepayment} 亿</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "bold", borderTop: "1px dashed var(--border-color)", paddingTop: "4px", marginTop: "2px" }}>
            <span>期末债务 (本季净变化):</span>
            <span style={{ color: dl.netChange > 0 ? "var(--color-red)" : dl.netChange < 0 ? "var(--color-green)" : "var(--text-main)" }}>
              {dl.endingDebt} 亿 ({dl.netChange >= 0 ? `+${dl.netChange}` : dl.netChange} 亿)
            </span>
          </div>

          <div style={{ fontSize: "11px", color: "var(--text-sub)", marginTop: "4px", fontStyle: "italic" }}>
            💡 {dl.explanation}
          </div>
        </div>

        {/* Completed Projects */}
        {summary.completedProjectNames.length > 0 && (
          <div className="card" style={{ padding: "10px 12px", marginBottom: "8px", backgroundColor: "#E8F4EE", borderColor: "#B4DEC9" }}>
            <div style={{ fontWeight: "bold", fontSize: "12px", color: "var(--color-green)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={14} /> 完工运行项目
            </div>
            <div style={{ fontSize: "12px" }}>
              {summary.completedProjectNames.map((name, idx) => (
                <div key={idx}>• <strong>{name}</strong> 正式完工运行</div>
              ))}
            </div>
          </div>
        )}

        {/* Newspaper Headline */}
        <div style={{
          backgroundColor: "var(--bg-secondary)",
          padding: "8px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          color: "var(--text-main)",
          marginBottom: "14px",
          borderLeft: "3px solid var(--color-red)",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <Newspaper size={14} style={{ minWidth: "14px" }} />
          <span><strong>临州纪事:</strong> “{summary.newsHeadline}”</span>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%", height: "42px", fontSize: "14px" }}
          onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            const pageEls = document.querySelectorAll(".page-content, .app-container, div[style*='overflow']");
            pageEls.forEach((el) => {
              el.scrollTop = 0;
            });
            onNextQuarter();
          }}
        >
          {isLastQuarter ? "进入任期答卷 →" : `开启第 ${summary.quarter + 1} 季度施政 →`}
        </button>
      </div>
    </div>
  );
};
