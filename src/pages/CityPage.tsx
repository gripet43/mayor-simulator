import React from "react";
import { GameState } from "../types/game";
import { HeaderStatus } from "../components/HeaderStatus";
import { calculateFiscalHealth, calculateQuarterTax, calculateRecurringBalance } from "../engine/finance";
import { checkActiveLinkages } from "../engine/linkages";
import { CityIllustration, getCityStage } from "../components/CityIllustration";
import { TRENDS_DATA } from "../data/trendsData";
import { getPolicyName } from "../utils/format";
import { Zap, Coins, Building2, Award } from "lucide-react";
import { MAJOR_OPPORTUNITIES_DATA } from "../data/majorOpportunitiesData";

import { NavTab } from "../components/BottomNav";

interface Props {
  state: GameState;
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onOpenHelp: () => void;
}

export const CityPage: React.FC<Props> = ({ state, currentTab, onSelectTab, onOpenHelp }) => {
  const fiscalHealth = calculateFiscalHealth(state.treasury, state.debt);
  const activeLinkages = checkActiveLinkages(state);
  const { stage } = getCityStage(state);
  const currentTrend = TRENDS_DATA[state.currentTrend];
  const taxBreakdown = calculateQuarterTax(state);
  const recBalance = calculateRecurringBalance(state);

  const caps = state.capabilities ?? {};

  const settledOpportunities = Object.values(state.opportunityStates ?? {}).filter((o) => o.status === "settled");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <HeaderStatus state={state} currentTab={currentTab} onSelectTab={onSelectTab} onOpenHelp={onOpenHelp} />

      <div className="page-content">
        {/* 1. 五项城市指标与财政健康度 */}
        <div className="card" style={{ padding: "12px", backgroundColor: "#FFF", marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "15px", fontWeight: "bold", fontFamily: "var(--font-serif)" }}>
              🏛️ 城市综合指标状态
            </span>
            <span className="badge badge-yellow">财政健康度 {fiscalHealth}/100</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", textAlign: "center", fontSize: "12px", marginBottom: "8px" }}>
            <div style={{ backgroundColor: "#E8F4EE", padding: "6px", borderRadius: "4px" }}>
              <div style={{ color: "var(--text-sub)" }}>经济</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--color-green)" }}>{state.economy}</div>
            </div>
            <div style={{ backgroundColor: "#EBF3F8", padding: "6px", borderRadius: "4px" }}>
              <div style={{ color: "var(--text-sub)" }}>民生</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--color-blue)" }}>{state.livelihood}</div>
            </div>
            <div style={{ backgroundColor: "#E8F3F1", padding: "6px", borderRadius: "4px" }}>
              <div style={{ color: "var(--text-sub)" }}>环境</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--color-cyan)" }}>{state.environment}</div>
            </div>
            <div style={{ backgroundColor: "#FAF9F5", padding: "6px", borderRadius: "4px" }}>
              <div style={{ color: "var(--text-sub)" }}>民心</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: state.morale < 20 ? "var(--color-red)" : "var(--text-main)" }}>{state.morale}</div>
            </div>
            <div style={{ backgroundColor: "#FAF9F5", padding: "6px", borderRadius: "4px" }}>
              <div style={{ color: "var(--text-sub)" }}>防灾能力</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--color-yellow)" }}>{state.resilience}</div>
            </div>
            <div style={{ backgroundColor: "#FAF9F5", padding: "6px", borderRadius: "4px" }}>
              <div style={{ color: "var(--text-sub)" }}>城市评级</div>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)" }}>{stage}</div>
            </div>
          </div>
        </div>

        {/* 2. 城市战略能力总览 (动态渲染) */}
        <div className="card" style={{ padding: "12px", backgroundColor: "#FFFDF6", borderColor: "#F6E2B3", marginBottom: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", color: "#B98425", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Zap size={14} /> 城市战略能力 (参与重大城市机遇竞逐)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", textAlign: "center", fontSize: "11px" }}>
            <div style={{ backgroundColor: "#FFF", padding: "6px", borderRadius: "4px", border: "1px solid #F6E2B3" }}>
              <div style={{ color: "var(--text-sub)" }}>技能人才</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#B98425" }}>{caps.skillTalent ?? 0}</div>
            </div>
            <div style={{ backgroundColor: "#FFF", padding: "6px", borderRadius: "4px", border: "1px solid #F6E2B3" }}>
              <div style={{ color: "var(--text-sub)" }}>清洁能源</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#B98425" }}>{caps.cleanEnergy ?? 0}</div>
            </div>
            <div style={{ backgroundColor: "#FFF", padding: "6px", borderRadius: "4px", border: "1px solid #F6E2B3" }}>
              <div style={{ color: "var(--text-sub)" }}>产业空间</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#B98425" }}>{caps.industrialSpace ?? 0}</div>
            </div>
            <div style={{ backgroundColor: "#FFF", padding: "6px", borderRadius: "4px", border: "1px solid #F6E2B3" }}>
              <div style={{ color: "var(--text-sub)" }}>行政效率</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#B98425" }}>{caps.administrativeEfficiency ?? 0}</div>
            </div>
            <div style={{ backgroundColor: "#FFF", padding: "6px", borderRadius: "4px", border: "1px solid #F6E2B3" }}>
              <div style={{ color: "var(--text-sub)" }}>交通联通</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#B98425" }}>{caps.trafficConnectivity ?? 0}</div>
            </div>
            <div style={{ backgroundColor: "#FFF", padding: "6px", borderRadius: "4px", border: "1px solid #F6E2B3" }}>
              <div style={{ color: "var(--text-sub)" }}>货运能力</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#B98425" }}>{caps.freightCapacity ?? 0}</div>
            </div>
            <div style={{ backgroundColor: "#FFF", padding: "6px", borderRadius: "4px", border: "1px solid #F6E2B3" }}>
              <div style={{ color: "var(--text-sub)" }}>商贸服务</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#B98425" }}>{caps.tradeService ?? 0}</div>
            </div>
            <div style={{ backgroundColor: "#FFF", padding: "6px", borderRadius: "4px", border: "1px solid #F6E2B3" }}>
              <div style={{ color: "var(--text-sub)" }}>临床能力</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#B98425" }}>{caps.clinicalCapability ?? 0}</div>
            </div>
          </div>
        </div>

        {/* 3. 城市跃迁记录 (已完成机遇收益与运营费) */}
        <div className="card" style={{ padding: "12px", backgroundColor: "#FFF", marginBottom: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "var(--font-serif)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Award size={14} color="#B98425" /> 城市跃迁与重大机遇成果记录
          </div>

          {settledOpportunities.length === 0 ? (
            <div style={{ fontSize: "12px", color: "var(--text-sub)", fontStyle: "italic" }}>
              暂无已结算重大机遇成果。随着任期推进，更多国家级机遇将陆续发布。
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {settledOpportunities.map((opp) => {
                const oppDef = MAJOR_OPPORTUNITIES_DATA[opp.id];
                const rewards = oppDef?.rewards[opp.resultTier ?? "failed"];

                return (
                  <div key={opp.id} style={{ border: "1px solid var(--border-color)", borderRadius: "6px", padding: "8px 10px", fontSize: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <strong>{oppDef?.name ?? opp.title}</strong>
                      <span className={`badge ${opp.resultTier === "super_success" || opp.resultTier === "success" ? "badge-green" : "badge-yellow"}`}>
                        {rewards?.label ?? "已完成"}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "11px", color: "var(--text-sub)" }}>
                      <div>专项资金: <strong style={{ color: "var(--color-green)" }}>+{opp.grantReceived ?? 0}亿</strong></div>
                      <div>社会投资: <strong style={{ color: "#B98425" }}>+{opp.socialInvestment ?? 0}亿</strong></div>
                      <div>永久产业税基: <strong style={{ color: "var(--color-green)" }}>+{opp.permanentBaseBonus ?? 0}亿/季</strong></div>
                      <div>永久场馆运营费: <strong style={{ color: "var(--color-red)" }}>-{opp.permanentOperatingFee ?? 0}亿/季</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. 产业税基与收支明细 */}
        <div className="card" style={{ padding: "12px", backgroundColor: "#FFF", marginBottom: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "var(--font-serif)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Coins size={14} color="#B98425" /> 季度税收账目与经常性结余
          </div>

          <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>经济基础税收 (4 + economy/7):</span>
              <strong style={{ color: "var(--color-green)" }}>+{taxBreakdown.taxBaseEconomy} 亿元</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#B98425" }}>
              <span>永久产业税基 (无上限):</span>
              <strong>+{taxBreakdown.industrialTaxBase} 亿元</strong>
            </div>
            {taxBreakdown.temporaryTaxBonus > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-blue)" }}>
                <span>建设期/活动期临时税收加成:</span>
                <strong>+{taxBreakdown.temporaryTaxBonus} 亿元</strong>
              </div>
            )}
            {recBalance.opportunityOperatingCosts > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-red)" }}>
                <span>重大机遇永久场馆/机构运营费:</span>
                <strong>-{recBalance.opportunityOperatingCosts} 亿元</strong>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border-color)", paddingTop: "4px", fontWeight: "bold" }}>
              <span>预计季度经常性结余:</span>
              <span className={`badge ${recBalance.statusBadgeClass}`}>
                {recBalance.recurringBalance >= 0 ? `+${recBalance.recurringBalance}` : recBalance.recurringBalance} 亿 ({recBalance.statusText})
              </span>
            </div>
          </div>
        </div>

        {/* 5. 项目运营收益列表 */}
        <div className="card" style={{ padding: "12px", marginBottom: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", fontFamily: "var(--font-serif)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Building2 size={14} /> 项目运营与净贡献列表
          </div>
          {state.completedPolicies.length === 0 ? (
            <div style={{ fontSize: "12px", color: "var(--text-sub)" }}>暂无已完工运行项目</div>
          ) : (
            state.completedPolicies.map((p: any, idx) => {
              const income = p.operatingIncome ?? 0;
              const cost = p.maintenanceCost ?? 0;
              const net = income - cost;
              return (
                <div key={idx} style={{ fontSize: "12px", margin: "4px 0", borderBottom: "1px dashed var(--border-color)", paddingBottom: "3px" }}>
                  <div style={{ fontWeight: "bold", color: "var(--text-main)" }}>{p.policyName}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-sub)", fontSize: "11px", marginTop: "1px" }}>
                    <span>运营收入: +{income}亿/季</span>
                    <span>维护支出: -{cost}亿/季</span>
                    <span style={{ color: net >= 0 ? "var(--color-green)" : "var(--color-red)", fontWeight: "bold" }}>
                      净贡献: {net >= 0 ? `+${net}` : net}亿/季
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dynamic City Visual Illustration */}
        <CityIllustration state={state} />
      </div>
    </div>
  );
};
