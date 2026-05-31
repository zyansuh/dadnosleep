import React, { useState } from "react";
import { formatViews } from "../utils/youtube";

export default function YtCard({ video }) {
  const [hovered, setHovered] = useState(false);

  const title   = video.snippet?.title        || "";
  const channel = video.snippet?.channelTitle || "";
  const thumb   = video.snippet?.thumbnails?.medium?.url || "";
  const views   = formatViews(video.statistics?.viewCount);
  const url     = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <div
      onClick={() => window.open(url, "_blank")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   "#1a1a1f",
        border:       `1px solid ${hovered ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 10,
        overflow:     "hidden",
        cursor:       "pointer",
        transform:    hovered ? "translateY(-4px)" : "translateY(0)",
        transition:   "transform 0.2s, border-color 0.2s",
      }}
    >
      {/* 썸네일 */}
      <div style={{ position: "relative" }}>
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            loading="lazy"
            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{
            width: "100%", aspectRatio: "16/9", background: "#242429",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>▶</div>
        )}
        {/* 재생 오버레이 */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 40, height: 40, background: "rgba(0,0,0,0.75)",
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered ? 1 : 0, transition: "opacity 0.2s",
          color: "#fff", fontSize: 16, paddingLeft: 2,
        }}>▶</div>
      </div>

      {/* 정보 */}
      <div style={{ padding: "9px 12px 11px" }}>
        <div style={{
          fontSize: 12, fontWeight: 500, color: "#f0f0f0", lineHeight: 1.45, marginBottom: 4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: "#9999aa", marginBottom: 1 }}>{channel}</div>
        {views && <div style={{ fontSize: 11, color: "#5a5a6a" }}>{views}</div>}
      </div>
    </div>
  );
}
