
import { X, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SavedSuggestion } from '../../types/suggestion';
import { formatSuggestionDate } from '../../utils/suggestion/formatSuggestionDate';

const CATEGORY_EMOJI: Record<string, string> = {
  드라마: '🎭', 예능: '🎉', 영화: '🎬', 애니: '🌟', 다큐: '📹', 기타: '📌',
};

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
          <div className="sb-hd-actions">
            <Link to="/suggestions" className="btn-ghost-sm sb-all-link" onClick={onClose}>
              전체 보기
            </Link>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
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
                  <span className="sb-date">{formatSuggestionDate(s.createdAt)}</span>
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
