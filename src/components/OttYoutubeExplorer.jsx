import React, { useState } from "react";
import OttSection from "./OttSection";
import YtSection  from "./YtSection";

const TABS = [
  { id: "ott", label: "📺 OTT 순위" },
  { id: "yt",  label: "▶ 유튜브 추천" },
];

export default function OttYoutubeExplorer() {
  const [activeTab, setActiveTab] = useState("ott");

  return (
    <div style={{
      background: "#0f0f11",
      color:      "#f0f0f0",
      minHeight:  "100vh",
      fontFamily: "'Segoe UI', -apple-system, sans-serif",
    }}>
      {/* 헤더 */}
      <header style={{
        background:  "#1a1a1f",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding:     "16px 24px",
        position:    "sticky",
        top:          0,
        zIndex:       100,
        display:     "flex",
        alignItems:  "center",
        gap:          12,
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px" }}>
          OTT <span style={{ color: "#e50914" }}>&</span> YouTube
        </span>
        <span style={{ fontSize: 12, color: "#5a5a6a" }}>한국 콘텐츠 탐색기</span>
      </header>

      {/* 탭 바 */}
      <div style={{
        display:      "flex",
        gap:           4,
        padding:      "0 24px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background:   "#0f0f11",
      }}>
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background:       "none",
                border:           "none",
                borderBottom:     `2px solid ${isActive ? "#e50914" : "transparent"}`,
                color:            isActive ? "#f0f0f0" : "#9999aa",
                fontSize:         14,
                fontWeight:       500,
                padding:          "12px 20px",
                cursor:           "pointer",
                marginBottom:     -1,
                transition:       "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 콘텐츠 */}
      <main style={{ padding: "20px 24px 48px" }}>
        {activeTab === "ott" && <OttSection />}
        {activeTab === "yt"  && <YtSection  />}
      </main>
    </div>
  );
}
