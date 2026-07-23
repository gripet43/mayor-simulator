import React from "react";
import { GameState } from "../types/game";
import { calculateFinalScore, generateEndingSummaryText } from "../engine/scoring";
import { getPolicyName, formatDeltaVal, round1Dec } from "../utils/format";
import { AlertOctagon, XCircle, CheckCircle2 } from "lucide-react";

interface Props {
  state: GameState;
  onRestart: () => void;
}

export const ResultPage: React.FC<Props> = ({ state, onRestart }) => {
  const scoreResult = calculateFinalScore(state);
  const ending = scoreResult.ending;
  const summaryText = generateEndingSummaryText(state, scoreResult);

  const isFiscalTakeover = state.endingId === "fiscal_takeover" || state.debt > 120;

  // Compute last 4 quarters deficit total with rounding protection
  const recentHistory = state.quarterHistory.slice(-4);
  const last4DeficitTotal = round1Dec(recentHistory.reduce((sum, q) => sum + (q.finance.debtAdded ?? 0), 0));

  const topPolicies = Object.entries(state.policyUseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      backgroundColor: "var(--bg-main)",
      overflowY: "auto",
      padding: "16px 14px",
      paddingBottom: "40px"
    }}>
      {/* Header Result Badge */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <span className={`badge ${ending.type === "success" ? "badge-green" : "badge-red"}`} style={{ fontSize: "13px", padding: "4px 12px" }}>
          {ending.type === "success" ? "任期顺利圆满履职交卷" : "任期提前终止或一票否决"}
        </span>
      </div>

      {/* Fiscal Takeover Specific Disambiguation Header */}
      {isFiscalTakeover ? (
        <div className="card" style={{ padding: "16px", backgroundColor: "#FFF", borderColor: "#F8B4B0" }}>
          <div style={{ textAlign: "center", marginBottom: "12px" }}>
            <span className="badge badge-red" style={{ fontSize: "12px", marginBottom: "4px" }}>
              一票否决 · 财政托管
            </span>
            <h1 style={{ fontSize: "22px", color: "var(--color-red)", marginBottom: "2px" }}>
              任期考核结果：不合格
            </h1>
            <div style={{ fontSize: "13px", color: "var(--text-sub)", fontWeight: "bold" }}>
              一票否决原因：债务超过 120 亿元红线，触发财政托管
            </div>
          </div>

          <div style={{ backgroundColor: "#242424", color: "#FFF", padding: "12px", borderRadius: "8px", textAlign: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "11px", color: "#A8A59C" }}>截至第 {state.quarter} 季度城市发展得分</div>
            <div style={{ fontSize: "44px", fontWeight: "900", fontFamily: "var(--font-serif)", color: "#B98425" }}>
              {scoreResult.finalScore} <span style={{ fontSize: "14px", fontWeight: "normal" }}>分 (发展分高但统筹失衡)</span>
            </div>
          </div>

          <div style={{ fontSize: "12px", backgroundColor: "#FDE8E7", padding: "10px", borderRadius: "6px", color: "var(--color-red)" }}>
            <div style={{ fontWeight: "bold", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertOctagon size={14} /> 托管原因深度剖析：
            </div>
            <div>• 最终债务: <strong>{state.debt} 亿元</strong> (上限 120 亿)</div>
            <div>• 任期债务净增: <strong>{formatDeltaVal(state.debt - 32, true)}</strong></div>
            {last4DeficitTotal > 0 && <div>• 近 4 个季度经常性赤字累计: <strong>+{last4DeficitTotal} 亿元</strong></div>}
            <div>• 主要原因: 项目维护费与债务利息支出持续超过季度税收与运营收入。</div>
          </div>
        </div>
      ) : (
        /* Normal Ending Header */
        <div className="card" style={{ textAlign: "center", padding: "16px", backgroundColor: "#FFF" }}>
          <h1 style={{ fontSize: "22px", color: "var(--text-main)", marginBottom: "4px" }}>
            {ending.title}
          </h1>
          <div style={{ fontSize: "13px", color: "var(--text-sub)", fontWeight: "bold", marginBottom: "10px" }}>
            {ending.subTitle}
          </div>

          <blockquote style={{ fontSize: "12px", fontStyle: "italic", color: "#664D03", backgroundColor: "#FEF7E6", padding: "8px 10px", borderRadius: "6px", marginBottom: "10px" }}>
            {ending.quote}
          </blockquote>

          <p style={{ fontSize: "13px", color: "var(--text-main)", lineHeight: "1.6" }}>
            {ending.description}
          </p>
        </div>
      )}

      {/* Score Panel (For Non-Takeover) */}
      {!isFiscalTakeover && (
        <div className="card" style={{ textAlign: "center", padding: "14px", backgroundColor: "#242424", color: "#FFF" }}>
          <div style={{ fontSize: "11px", color: "#A8A59C", letterSpacing: "1px" }}>临州市五年任期最终评分</div>
          <div style={{ fontSize: "48px", fontWeight: "900", fontFamily: "var(--font-serif)", color: "#B98425" }}>
            {scoreResult.finalScore} <span style={{ fontSize: "14px", fontWeight: "normal" }}>/ 100 分</span>
          </div>
          <div style={{ fontSize: "12px", color: "#D8D5CE" }}>
            基础综合得分: {scoreResult.baseScore} 分
            {scoreResult.unfinishedProjectsPenalty > 0 && ` | 未完工扣分: -${scoreResult.unfinishedProjectsPenalty} 分 (${state.activeProjects.length}个)`}
          </div>
        </div>
      )}

      {/* Automatic Narrative Story Summary */}
      <div className="card" style={{ padding: "12px", backgroundColor: "#FAF9F5" }}>
        <div style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "var(--font-serif)", marginBottom: "6px" }}>
          📖 城市发展五年述职总结
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-main)", lineHeight: "1.7" }}>
          {summaryText}
        </p>
      </div>

      {/* Initial vs Final Comparison Table */}
      <div className="card" style={{ padding: "12px", backgroundColor: "#FFF" }}>
        <div style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "var(--font-serif)", marginBottom: "8px" }}>
          📊 初始状态与五年成果对比
        </div>
        <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse", textAlign: "center" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-sub)" }}>
              <th style={{ padding: "4px", textAlign: "left" }}>指标</th>
              <th style={{ padding: "4px" }}>初始值</th>
              <th style={{ padding: "4px" }}>最终值</th>
              <th style={{ padding: "4px" }}>净变化</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "4px", textAlign: "left" }}>可用财政</td>
              <td>48 亿</td>
              <td>{state.treasury} 亿</td>
              <td style={{ color: state.treasury >= 48 ? "var(--color-green)" : "var(--color-red)" }}>{formatDeltaVal(state.treasury - 48, true)}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px", textAlign: "left" }}>城市债务</td>
              <td>32 亿</td>
              <td>{state.debt} 亿</td>
              <td style={{ color: state.debt <= 32 ? "var(--color-green)" : "var(--color-red)" }}>{formatDeltaVal(state.debt - 32, true)}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px", textAlign: "left" }}>经济</td>
              <td>42</td>
              <td>{state.economy}</td>
              <td style={{ color: state.economy >= 42 ? "var(--color-green)" : "var(--color-red)" }}>{formatDeltaVal(state.economy - 42)}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px", textAlign: "left" }}>民生</td>
              <td>40</td>
              <td>{state.livelihood}</td>
              <td style={{ color: state.livelihood >= 40 ? "var(--color-green)" : "var(--color-red)" }}>{formatDeltaVal(state.livelihood - 40)}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px", textAlign: "left" }}>环境</td>
              <td>38</td>
              <td>{state.environment}</td>
              <td style={{ color: state.environment >= 38 ? "var(--color-green)" : "var(--color-red)" }}>{formatDeltaVal(state.environment - 38)}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px", textAlign: "left" }}>民心</td>
              <td>55</td>
              <td>{state.morale}</td>
              <td style={{ color: state.morale >= 55 ? "var(--color-green)" : "var(--color-red)" }}>{formatDeltaVal(state.morale - 55)}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px", textAlign: "left" }}>防灾能力</td>
              <td>20</td>
              <td>{state.resilience}</td>
              <td style={{ color: state.resilience >= 20 ? "var(--color-green)" : "var(--color-red)" }}>{formatDeltaVal(state.resilience - 20)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Policy Statistics & Projects */}
      <div className="card" style={{ padding: "12px", backgroundColor: "#FFF" }}>
        <div style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "var(--font-serif)", marginBottom: "6px" }}>
          🏛️ 核心政策与项目盘点
        </div>
        <div style={{ fontSize: "12px", marginBottom: "6px" }}>
          <strong>最常用政策:</strong>{" "}
          {topPolicies.length === 0 ? "无" : topPolicies.map(([id, cnt]) => `${getPolicyName(id)} (${cnt}次)`).join("，")}
        </div>
        <div style={{ fontSize: "12px", marginBottom: "4px" }}>
          <strong>完工项目 ({state.completedPolicies.length}个):</strong>{" "}
          {state.completedPolicies.map((p) => p.policyName).join("、") || "无"}
        </div>
        {state.activeProjects.length > 0 && (
          <div style={{ fontSize: "12px", color: "var(--color-red)" }}>
            <strong>未完工项目 ({state.activeProjects.length}个):</strong>{" "}
            {state.activeProjects.map((p) => p.name).join("、")}
          </div>
        )}
      </div>

      {/* Seed info */}
      <div style={{ fontSize: "11px", color: "var(--text-sub)", textAlign: "center", marginBottom: "16px" }}>
        本局随机种子: <code>{state.seed}</code>
      </div>

      <button className="btn btn-primary" style={{ width: "100%", height: "46px", fontSize: "15px" }} onClick={onRestart}>
        再次开始任期 (重新挑战)
      </button>
    </div>
  );
};
