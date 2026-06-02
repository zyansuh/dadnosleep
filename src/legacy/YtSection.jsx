import React, { useState } from "react";
import PillGroup from "./PillGroup";
import YtCard    from "./YtCard";
import { useFetch } from "../hooks/useFetch";
import { fetchYouTube, CATEGORIES } from "../utils/youtube";

export default function YtSection() {
  const [category, setCategory] = useState("0");
  const { data, setData, loading, error, run } = useFetch();

  const handleFetch = () => {
    run(() => fetchYouTube(category));
  };

  const handleShuffle = () => {
    if (!data.length) { handleFetch(); return; }
    setData([...data].sort(() => Math.random() - 0.5));
  };

  return (
    <div>
      {/* 컨트롤 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <PillGroup items={CATEGORIES} active={category} onSelect={setCategory} colorActive="#00b4d8" />
        <div style={{ flex: 1 }} />
        {data.length > 0 && (
          <span style={{ fontSize: 12, color: "#5a5a6a" }}>{data.length}개</span>
        )}
        <ActionButton onClick={handleShuffle} loading={false}  label="🔀 랜덤" />
        <ActionButton onClick={handleFetch}   loading={loading} label="불러오기" />
      </div>

      {/* 상태 */}
      {error   && <StatusMsg text={`⚠️ ${error}`} color="#e57373" />}
      {loading && <StatusMsg text="불러오는 중..." />}

      {/* 그리드 */}
      {!loading && !error && data.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}>
          {data.slice(0, 24).map((v) => (
            <YtCard key={v.id} video={v} />
          ))}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <StatusMsg text="▶  API 키를 config.js에 입력하고 불러오기를 눌러주세요" />
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
