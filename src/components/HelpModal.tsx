import React from "react";
import { AlertTriangle, AlertOctagon } from "lucide-react";

interface Props {
  onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-center" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "80vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "18px" }}>施政指南与规则</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-sub)" }}>✕</button>
        </div>

        <div style={{ fontSize: "13px", color: "var(--text-main)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <strong>1. 任期与目标:</strong>
            <br />
            你将在 20 个季度 (共 5 年) 内治理临州市。看城市形势，批准政策并决定投入力度，处理突发事件，最终完成五年答卷。
          </div>

          <div>
            <strong>2. 财政与债务红线:</strong>
            <br />
            季度开销先消耗可用财政。财政不足时自动计入债务。
            <br />
            <span style={{ color: "var(--color-red)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <AlertOctagon size={14} /> <strong>债务超过 120 亿:</strong> 立即触发“财政托管”失败结局！
            </span>
          </div>

          <div>
            <strong>3. 民心与离任风险:</strong>
            <br />
            民心反映市民满意度。
            <br />
            <span style={{ color: "var(--color-red)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <AlertTriangle size={14} /> <strong>民心低于 10 连续两个季度:</strong> 触发“黯然离任”失败结局！
            </span>
          </div>

          <div>
            <strong>4. 三种投入力度:</strong>
            <br />
            • <strong>试点 (0.6x):</strong> 成本低，负面效果微弱，适合观察风向。
            <br />
            • <strong>全市推行 (1.0x):</strong> 标准均衡方案。
            <br />
            • <strong>攻坚投入 (1.5x):</strong> 效果与工期优势明显，但非线性副作用与突发风险剧增。
          </div>

          <div>
            <strong>5. 政策联动与风向:</strong>
            <br />
            完成交通+工业、人才+住房、夜市+公交、工业+环保等特定组合可激活强力联动加成。每季风向线索能提前预判突发事件风险。
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: "100%", marginTop: "16px" }} onClick={onClose}>
          掌握规则，开始治理
        </button>
      </div>
    </div>
  );
};
