import { X } from 'lucide-react';
import type { RecommendItem } from '../../../types';

interface Props {
  open:     boolean;
  title:    string;
  subtitle: string;
  loading:  boolean;
  error:    string;
  items:    RecommendItem[];
  onClose:  () => void;
}

export function MediaDrawer({ open, title, subtitle, loading, error, items, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <aside className="media-drawer" role="dialog" aria-label={title}>
        <div className="drawer-hd">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="닫기"><X size={20} /></button>
        </div>

        <div className="drawer-body">
          {loading && <p className="result-msg">불러오는 중…</p>}
          {error && <p className="result-msg err">⚠️ {error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="result-msg">표시할 항목이 없습니다.</p>
          )}
          {!loading && !error && items.length > 0 && (
            <ul className="drawer-list">
              {items.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="drawer-row"
                  >
                    <span className="drawer-rank">#{i + 1}</span>
                    {item.posterPath ? (
                      <img
                        className="drawer-poster"
                        src={`https://image.tmdb.org/t/p/w92${item.posterPath}`}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <span className="drawer-poster drawer-poster-empty">🎬</span>
                    )}
                    <div className="drawer-info">
                      <span className="drawer-title">{item.title}</span>
                      <span className="drawer-meta">
                        <span className="drawer-platform">{item.platform}</span>
                        <span>{item.mediaType === 'movie' ? '영화' : '드라마'}</span>
                        <span>{item.genre}</span>
                      </span>
                      {item.voteAverage != null && (
                        <span className="drawer-rating">평점 {item.voteAverage.toFixed(1)}</span>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
