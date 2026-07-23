import React, { useState } from "react";

interface Props {
  hasSave: boolean;
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onOpenHelp: () => void;
}

export const StartPage: React.FC<Props> = ({ hasSave, onStartNewGame, onContinueGame, onOpenHelp }) => {
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [showFirstGuide, setShowFirstGuide] = useState(false);

  const handleStartNewClick = () => {
    if (hasSave) {
      setShowOverwriteConfirm(true);
    } else {
      setShowFirstGuide(true);
    }
  };

  const handleConfirmNewGame = () => {
    setShowOverwriteConfirm(false);
    setShowFirstGuide(true);
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      backgroundColor: "var(--bg-main)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "24px 20px",
      textAlign: "center"
    }}>
      {/* Top Header Logo */}
      <div style={{ marginTop: "40px" }}>
        <div style={{
          display: "inline-block",
          padding: "4px 12px",
          backgroundColor: "var(--color-red)",
          color: "#FFF",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "bold",
          marginBottom: "12px",
          letterSpacing: "2px"
        }}>
          单局决策模拟
        </div>

        <h1 style={{
          fontSize: "36px",
          fontFamily: "var(--font-serif)",
          color: "var(--text-main)",
          marginBottom: "8px",
          letterSpacing: "1px"
        }}>
          市长模拟器
        </h1>

        <div style={{ fontSize: "16px", color: "var(--text-sub)", fontFamily: "var(--font-serif)" }}>
          临州市五年任期公报
        </div>
      </div>

      {/* Center Newspaper Vintage Badge */}
      <div className="card" style={{
        margin: "0 10px",
        padding: "20px 16px",
        backgroundColor: "#FAF9F5",
        borderColor: "var(--border-strong)",
        boxShadow: "var(--shadow-md)"
      }}>
        <p style={{ fontSize: "14px", color: "var(--text-main)", lineHeight: "1.7", fontStyle: "italic" }}>
          “看城市形势，选择一项政策，决定投入力度，等待政策兑现，处理连锁事件，最终得到一份任期答卷。”
        </p>
        <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-sub)", borderTop: "1px dashed var(--border-color)", paddingTop: "8px" }}>
          架空城市“临州市” · 20 个季度极速决策
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {hasSave && (
          <button className="btn btn-primary" style={{ height: "48px", fontSize: "16px" }} onClick={onContinueGame}>
            继续任期 (读取存档)
          </button>
        )}

        <button
          className={hasSave ? "btn btn-secondary" : "btn btn-primary"}
          style={{ height: "48px", fontSize: "16px" }}
          onClick={handleStartNewClick}
        >
          开始新任期
        </button>

        <button className="btn btn-outline" style={{ height: "44px" }} onClick={onOpenHelp}>
          规则说明
        </button>

        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "10px" }}>
          版本号 v1.0.0 · 纯前端离线单机
        </div>
      </div>

      {/* Confirm Overwrite Modal */}
      {showOverwriteConfirm && (
        <div className="modal-overlay">
          <div className="modal-center">
            <h3 style={{ marginBottom: "12px" }}>覆盖现有存档？</h3>
            <p style={{ fontSize: "14px", color: "var(--text-sub)", marginBottom: "20px" }}>
              当前任期还没有结束，开始新任期会覆盖当前存档。
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowOverwriteConfirm(false)}>
                取消
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirmNewGame}>
                开始新任期
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First Time Brief Guide Modal */}
      {showFirstGuide && (
        <div className="modal-overlay">
          <div className="modal-center" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "16px", fontFamily: "var(--font-serif)" }}>
              施政须知
            </h2>
            <div style={{ fontSize: "15px", color: "var(--text-main)", lineHeight: "1.8", marginBottom: "24px" }}>
              每个季度，你需要批准一项政策。
              <br />
              先看城市风向，再决定投入规模。
              <br />
              五年后，看看这座城市变成了什么样。
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", height: "48px" }}
              onClick={() => {
                setShowFirstGuide(false);
                onStartNewGame();
              }}
            >
              开始第一季度 &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
