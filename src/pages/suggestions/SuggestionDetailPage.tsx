import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { SuggestionPageShell } from '../../components/suggestion/SuggestionPageShell';
import { SuggestionStatusBadge } from '../../components/suggestion/SuggestionStatusBadge';
import { useDiscordAuth } from '../../context/DiscordAuthContext';
import {
  fetchSuggestionById,
  updateSuggestionStatus,
} from '../../utils/suggestion/suggestionApi';
import { formatSuggestionDate } from '../../utils/suggestion/formatSuggestionDate';
import type { SavedSuggestion, SuggestionStatus } from '../../types/suggestion';
import { SUGGESTION_STATUS_LABELS } from '../../constants/suggestion';

const CATEGORY_EMOJI: Record<string, string> = {
  드라마: '🎭', 예능: '🎉', 영화: '🎬', 애니: '🌟', 다큐: '📹', 기타: '📌',
};

const STATUS_OPTIONS: SuggestionStatus[] = ['pending', 'reviewing', 'answered', 'closed'];

export function SuggestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useDiscordAuth();
  const [item, setItem]         = useState<SavedSuggestion | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [statusBusy, setBusy]   = useState(false);
  const [statusError, setStErr] = useState('');

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchSuggestionById(id);
        if (!cancelled) setItem(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '건의사항을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleStatusChange = async (status: SuggestionStatus) => {
    if (!id || !item) return;
    setBusy(true);
    setStErr('');
    try {
      const updated = await updateSuggestionStatus(id, status);
      setItem(updated);
    } catch (e) {
      setStErr(e instanceof Error ? e.message : '상태 변경에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  if (!id) {
    return (
      <SuggestionPageShell title="건의 상세">
        <div className="sugg-alert sugg-alert--error">
          <AlertCircle size={16} />
          <span>잘못된 경로입니다.</span>
        </div>
      </SuggestionPageShell>
    );
  }

  return (
    <SuggestionPageShell
      title="건의 상세"
      action={(
        <Link to="/suggestions" className="btn-ghost-sm">
          <ArrowLeft size={14} /> 목록
        </Link>
      )}
    >
      {loading && <p className="sugg-muted">불러오는 중…</p>}

      {error && (
        <div className="sugg-alert sugg-alert--error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {item && (
        <article className="sugg-detail-card">
          <header className="sugg-detail-hd">
            <span className="sugg-detail-cat">
              {CATEGORY_EMOJI[item.category] ?? '📌'} {item.category}
            </span>
            <SuggestionStatusBadge status={item.status} />
          </header>

          <h2 className="sugg-detail-title">{item.title}</h2>

          <dl className="sugg-detail-meta">
            <div><dt>작성자</dt><dd>@{item.nick}</dd></div>
            <div><dt>작성일</dt><dd>{formatSuggestionDate(item.createdAt)}</dd></div>
            <div><dt>희망 시간대</dt><dd>{item.time}</dd></div>
          </dl>

          <section className="sugg-detail-body">
            <h3>건의 내용</h3>
            <p>{item.desc}</p>
          </section>

          {isAdmin && (
            <section className="sugg-admin-status">
              <h3>처리 상태 (관리자)</h3>
              <div className="sugg-status-btns">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`sugg-status-btn${item.status === s ? ' active' : ''}`}
                    disabled={statusBusy || item.status === s}
                    onClick={() => void handleStatusChange(s)}
                  >
                    {SUGGESTION_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              {statusError && <p className="sugg-inline-error">{statusError}</p>}
            </section>
          )}

          <section className="sugg-replies-section" aria-label="관리자 답변">
            <h3>관리자 답변</h3>
            {(item.replies?.length ?? 0) === 0 ? (
              <p className="sugg-muted">아직 답변이 없습니다.</p>
            ) : (
              <ul className="sugg-replies-list">
                {item.replies!.map(r => (
                  <li key={r.id} className="sugg-reply-item">
                    <time>{formatSuggestionDate(r.createdAt)}</time>
                    <p>{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      )}
    </SuggestionPageShell>
  );
}
