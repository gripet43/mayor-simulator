import React from "react";
import { FileText, Building2, Newspaper } from "lucide-react";

export type NavTab = "decision" | "city" | "chronicle";

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "decision", label: "决策", icon: <FileText size={20} /> },
    { id: "city", label: "城市", icon: <Building2 size={20} /> },
    { id: "chronicle", label: "纪事", icon: <Newspaper size={20} /> }
  ];

  return (
    <nav style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "var(--nav-height)",
      backgroundColor: "#242424",
      borderTop: "1px solid #333",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      zIndex: 50,
      paddingBottom: "env(safe-area-inset-bottom, 0px)"
    }}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              flex: 1,
              height: "100%",
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: isActive ? "#FFF" : "#8F8E88",
              transition: "color 0.15s ease"
            }}
          >
            <div style={{ marginBottom: "2px" }}>{tab.icon}</div>
            <span style={{ fontSize: "11px", fontWeight: isActive ? "bold" : "normal" }}>
              {tab.label}
            </span>
            {isActive && (
              <div style={{
                width: "16px",
                height: "3px",
                backgroundColor: "#B7352C",
                borderRadius: "2px",
                marginTop: "2px"
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
};
