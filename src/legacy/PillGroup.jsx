import React from "react";

export default function PillGroup({ items, active, onSelect, colorActive = "#e50914" }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              background:   isActive ? colorActive : "transparent",
              border:       `1px solid ${isActive ? colorActive : "rgba(255,255,255,0.15)"}`,
              borderRadius: 20,
              padding:      "5px 14px",
              fontSize:     12,
              fontWeight:   600,
              color:        isActive ? "#fff" : "#9999aa",
              cursor:       "pointer",
              transition:   "all 0.18s",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
