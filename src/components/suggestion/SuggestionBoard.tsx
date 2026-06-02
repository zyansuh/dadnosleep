
import { X, MessageSquare } from 'lucide-react';
import type { SavedSuggestion } from '../../hooks/useSuggestionForm';

const CATEGORY_EMOJI: Record<string, string> = {
  드라마: '🎭', 예능: '🎉', 영화: '🎬', 애니: '🌟', 다큐: '📹', 기타: '📌',
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch { return iso; }
}

interface Props {
  suggestions: SavedSuggestion[];
  onClose:     () => void;
}

export function SuggestionBoard({ suggestions, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal sb-modal">
        {/* 헤더 */}
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico"><MessageSquare size={16} /></div>
            <div>
              <h3>건의함</h3>
              <p>총 {suggestions.length}건의 건의가 있어요</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* 리스트 */}
        <div className="sb-list">
          {suggestions.length === 0 ? (
            <div className="sb-empty">
              <p>💬</p>
              <p>아직 건의된 내용이 없어요.</p>
              <p>첫 번째 건의를 남겨보세요!</p>
            </div>
          ) : (
            suggestions.map(s => (
              <div key={s.id} className="sb-card">
                <div className="sb-card-head">
                  <span className="sb-cat">
                    {CATEGORY_EMOJI[s.category] ?? '📌'} {s.category}
                  </span>
                  <span className="sb-nick">@{s.nick}</span>
                  <span className="sb-date">{formatDate(s.createdAt)}</span>
                </div>
                <p className="sb-title">{s.title}</p>
                <div className="sb-meta">
                  <span>⏰ {s.time}</span>
                </div>
                <p className="sb-desc">{s.desc}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
