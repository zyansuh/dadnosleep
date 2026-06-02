import React, { useState } from "react";
import { getPosterUrl } from "../utils/tmdb";

export default function OttCard({ item, rank, contentType }) {
  const [hovered, setHovered] = useState(false);

  const title  = item.title || item.name || "제목 없음";
  const poster = getPosterUrl(item.poster_path);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "-";
  const year   = (item.release_date || item.first_air_date || "").slice(0, 4);
  const url    = `https://www.themoviedb.org/${contentType}/${item.id}`;

  return (
    <div
      onClick={() => window.open(url, "_blank")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    "#1a1a1f",
        border:        `1px solid ${hovered ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}`,
        borderRadius:  10,
        overflow:      "hidden",
        cursor:        "pointer",
        transform:     hovered ? "translateY(-4px)" : "translateY(0)",
        transition:    "transform 0.2s, border-color 0.2s",
      }}
    >
      {poster ? (
        <img
          src={poster}
          alt={title}
          loading="lazy"
          style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{
          width: "100%", aspectRatio: "2/3", background: "#242429",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, color: "#5a5a6a",
        }}>🎬</div>
      )}
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#e50914", marginBottom: 4 }}>
          #{rank}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 500, color: "#f0f0f0", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          marginBottom: 3,
        }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: "#5a5a6a" }}>
          {year ? `${year} · ` : ""}⭐ {rating}
        </div>
      </div>
    </div>
  );
}
