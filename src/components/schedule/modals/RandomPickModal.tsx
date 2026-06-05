import { useState, useMemo } from 'react';
import { X, Check, CheckSquare, Square } from 'lucide-react';
import type { RecommendItem } from '../../../types';

interface Props {
  items:    RecommendItem[];
  loading?: boolean;
  onApply:  (selected: RecommendItem[]) => void;
  onClose:  () => void;
}

export function RandomPickModal({ items, loading, onApply, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(items.map(i => i.id)));

  const selectedList = useMemo(
    () => items.filter(i => selected.has(i.id)),
    [items, selected]
  );

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map(i => i.id)));
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal random-pick-modal">
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico">🎲</div>
            <div>
              <h3>랜덤 편성 추천</h3>
              <p>적용할 프로그램을 선택하세요 (고정 편성 슬롯 제외)</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="rpm-toolbar">
          <button type="button" className="rpm-select-all" onClick={toggleAll}>
            {selected.size === items.length ? <CheckSquare size={16} /> : <Square size={16} />}
            {selected.size === items.length ? '전체 해제' : '전체 선택'}
          </button>
          <span className="rpm-count">{selected.size}개 선택</span>
        </div>

        <div className="rpm-list">
          {loading && <p className="result-msg">불러오는 중…</p>}
          {!loading && items.map((item, i) => (
            <label key={item.id} className={`rpm-row ${selected.has(item.id) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggle(item.id)}
              />
              <span className="rpm-rank">#{i + 1}</span>
              {item.posterPath ? (
                <img
                  className="rpm-poster"
                  src={`https://image.tmdb.org/t/p/w92${item.posterPath}`}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span className="rpm-poster rpm-poster-empty">🎬</span>
              )}
              <div className="rpm-info">
                <span className="rpm-title">{item.title}</span>
                <span className="rpm-meta">
                  {item.platform} · {item.mediaType === 'movie' ? '영화' : '드라마'} · {item.genre}
                </span>
                {item.voteAverage != null && (
                  <span className="rpm-rating">★ {item.voteAverage.toFixed(1)}</span>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="form-actions rpm-footer">
          <button type="button" className="btn-ghost-sm" onClick={onClose}>취소</button>
          <button
            type="button"
            className="btn-coral-form"
            disabled={selectedList.length === 0}
            onClick={() => onApply(selectedList)}
          >
            <Check size={14} /> 선택 항목 편성표에 적용 ({selectedList.length})
          </button>
        </div>
      </div>
    </div>
  );
}
