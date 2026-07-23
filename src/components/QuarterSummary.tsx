import React, { useState, useEffect } from "react";
import { QuarterSummaryData } from "../types/game";
import { Coins, CheckCircle2, TrendingUp, Newspaper, BookOpen, HardHat, Zap, FileCheck } from "lucide-react";

interface Props {
  summary: QuarterSummaryData;
  isLastQuarter: boolean;
  onNextQuarter: () => void;
}

export const QuarterSummary: React.FC<Props> = ({ summary, isLastQuarter, onNextQuarter }) => {
  const [phase, setPhase] = useState<"signing" | "simulating" | "report">("signing");

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase("simulating");
    }, 850);

    const timer2 = setTimeout(() => {
      setPhase("report");
    }, 1750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const f = summary.finance;
  const m = summary.metricChanges;
  const dl = f.debtLedger;

  const totalIncome = Math.round((f.taxIncome + (f.operatingIncomeTotal ?? 0)) * 10) / 10;
  const totalExpense = Math.round((f.baseExpense + f.maintenanceExpense + (f.opportunityOperatingCosts ?? 0) + f.debtInterest) * 10) / 10;
  const netBalance = Math.round((totalIncome - totalExpense) * 10) / 10;

  if (phase === "signing") {
    return (
      <div className="modal-overlay" onClick={() => setPhase("report")}>
        <div className="modal-center" style={{ maxWidth: "400px", textAlign: "center", backgroundColor: "#FFFDF6", border: "2px solid #B7352C", padding: "24px 18px", boxShadow: "0 8px 32px rgba(183,53,44,0.2)" }}>
          <div style={{ fontSize: "11px", color: "#B7352C", fontWeight: "bold", letterSpacing: "2px", marginBottom: "4px" }}>
            🏛️ 临州市人民政府 · 行政批复
          </div>
          <div style={{ fontSize: "11px", color: "#8E8E93", marginBottom: "14px" }}>
            临政发〔2026〕第 {summary.quarter < 10 ? `0${summary.quarter}` : summary.quarter} 号
          </div>

          <h3 style={{ fontSize: "16px", color: "#1C1C1E", marginBottom: "16px", lineHeight: "1.5", fontFamily: "var(--font-serif)" }}>
            《关于第 {summary.quarter} 季度施政草案落地与财政拨付的决定》
          </h3>

          <div style={{ margin: "18px 0" }}>
            <span className="stamp-seal">
              ★ 准予立项盖章 ★
            </span>
          </div>

          <div style={{ fontSize: "11px", color: "#8E8E93", marginTop: "16px" }}>
            ✍️ 市长印鉴已签发 · 正在推演城市运行... (点击跳过)
          </div>
        </div>
      </div>
    );
  }

  if (phase === "simulating") {
    return (
      <div className="modal-overlay" onClick={() => setPhase("report")}>
        <div className="modal-center" style={{ maxWidth: "400px", textAlign: "center", padding: "24px 18px" }}>
          <div style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "14px", fontFamily: "var(--font-serif)" }}>
            ⚙️ 正在推演第 {summary.quarter} 季度城市运转...
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-sub)", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Coins size={14} color="#B98425" /> 划拨工程分期首付款及招投标预算...
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp size={14} color="#2E7D32" /> 结算经常性税收、营运收益与债务利息...
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Newspaper size={14} color="#0277BD" /> 编印《临州纪事》本季头条专稿...
            </div>
          </div>

          <div style={{ height: "6px", backgroundColor: "#E5E5EA", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: "92%", height: "100%", backgroundColor: "#B98425", borderRadius: "3px", transition: "width 0.8s ease-in-out" }} />
          </div>

          <div style={{ fontSize: "11px", color: "#8E8E93", marginTop: "14px" }}>
            点击任意位置快速查看政务公报 →
          </div>
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
          {isLastQuarter ? "进入任期答卷 →" : "进入下一季度 →"}
        </button>
      </div>
    </div>
  );
};
