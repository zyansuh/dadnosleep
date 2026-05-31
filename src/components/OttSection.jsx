import React, { useState } from "react";
import PillGroup from "./PillGroup";
import OttCard   from "./OttCard";
import { useFetch } from "../hooks/useFetch";
import { fetchOTT, PROVIDERS, CONTENT_TYPES } from "../utils/tmdb";

export default function OttSection() {
  const [provider,    setProvider]    = useState("8");
  const [contentType, setContentType] = useState("movie");
  const { data, loading, error, run } = useFetch();

  const handleFetch = () => {
    run(() => fetchOTT(provider, contentType));
  };

  return (
    <div>
      {/* 컨트롤 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <PillGroup items={PROVIDERS} active={provider} onSelect={setProvider} colorActive="#e50914" />
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
        <PillGroup items={CONTENT_TYPES} active={contentType} onSelect={setContentType} colorActive="#555" />
        <div style={{ flex: 1 }} />
        {data.length > 0 && (
          <span style={{ fontSize: 12, color: "#5a5a6a" }}>{data.length}개</span>
        )}
        <ActionButton onClick={handleFetch} loading={loading} label="불러오기" />
      </div>

      {/* 상태 */}
      {error   && <StatusMsg text={`⚠️ ${error}`} color="#e57373" />}
      {loading && <StatusMsg text="불러오는 중..." />}

      {/* 그리드 */}
      {!loading && !error && data.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
        }}>
          {data.slice(0, 20).map((item, i) => (
            <OttCard key={item.id} item={item} rank={i + 1} contentType={contentType} />
          ))}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <StatusMsg text="🎬  API 키를 config.js에 입력하고 불러오기를 눌러주세요" />
      )}
    </div>
  );
}

function ActionButton({ onClick, loading, label }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 6, color: "#f0f0f0", fontSize: 12, fontWeight: 500,
        padding: "6px 14px", cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? "..." : label}
    </button>
  );
}

function StatusMsg({ text, color = "#5a5a6a" }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 0", color, fontSize: 14 }}>
      {text}
    </div>
  );
}
