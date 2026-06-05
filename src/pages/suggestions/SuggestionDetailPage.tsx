import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { SuggestionPageShell } from '../../components/suggestion/SuggestionPageShell';
import { SuggestionStatusBadge } from '../../components/suggestion/SuggestionStatusBadge';
import { useDiscordAuth } from '../../context/DiscordAuthContext';
import {
  addSuggestionComment,
  fetchSuggestionById,
  updateSuggestionStatus,
} from '../../utils/suggestion/suggestionApi';
import { formatSuggestionDate } from '../../utils/suggestion/formatSuggestionDate';
import type { SavedSuggestion, SuggestionStatus } from '../../types/suggestion';
import { SUGGESTION_STATUS_LABELS } from '../../constants/suggestion';
import { getMyNickname, saveMyNickname } from '../../utils/nickname';

const CATEGORY_EMOJI: Record<string, string> = {
  드라마: '🎭', 예능: '🎉', 영화: '🎬', 애니: '🌟', 다큐: '📹', 기타: '📌',
};

const STATUS_OPTIONS: SuggestionStatus[] = ['pending', 'reviewing', 'answered', 'closed'];

function defaultCommentNick(displayName: string | null): string {
  return displayName?.trim() || getMyNickname()?.trim() || '';
}

export function SuggestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin, displayName } = useDiscordAuth();
  const [item, setItem]           = useState<SavedSuggestion | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [statusBusy, setBusy]     = useState(false);
  const [statusError, setStErr]   = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentNick, setCommentNick] = useState(() => defaultCommentNick(displayName));
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState('');

  const initialNick = useMemo(() => defaultCommentNick(displayName), [displayName]);

  useEffect(() => {
    if (initialNick && !commentNick) setCommentNick(initialNick);
  }, [initialNick, commentNick]);

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

  const handleCommentSubmit = async () => {
    if (!id || !commentBody.trim() || !commentNick.trim()) return;
    setCommentBusy(true);
    setCommentError('');
    try {
      const updated = await addSuggestionComment(
        id,
        commentBody,
        commentNick,
        isAdmin,
      );
      saveMyNickname(commentNick);
      setItem(updated);
      setCommentBody('');
    } catch (e) {
      setCommentError(e instanceof Error ? e.message : '댓글 등록에 실패했습니다.');
    } finally {
      setCommentBusy(false);
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

          <section id="comments" className="sugg-comments-section" aria-label="댓글">
            <h3>댓글 {(item.comments?.length ?? 0) > 0 && `(${item.comments!.length})`}</h3>

            {(item.comments?.length ?? 0) > 0 ? (
              <ul className="sugg-comments-list">
                {item.comments!.map(c => (
                  <li
                    key={c.id}
                    className={`sugg-comment-item${c.isAdmin ? ' sugg-comment-item--admin' : ''}`}
                  >
                    <div className="sugg-comment-hd">
                      <strong>@{c.nick}</strong>
                      {c.isAdmin && <span className="sugg-comment-admin-badge">관리자</span>}
                      <time>{formatSuggestionDate(c.createdAt)}</time>
                    </div>
                    <p>{c.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sugg-muted">아직 댓글이 없습니다.</p>
            )}

            <form
              className="sugg-comment-form"
              onSubmit={e => {
                e.preventDefault();
                void handleCommentSubmit();
              }}
            >
              <label className="sugg-comment-nick-label" htmlFor="sugg-comment-nick">
                닉네임
              </label>
              <input
                id="sugg-comment-nick"
                className="sugg-comment-nick-input"
                value={commentNick}
                maxLength={20}
                disabled={commentBusy}
                placeholder="댓글에 표시할 닉네임"
                onChange={e => setCommentNick(e.target.value)}
              />
              <textarea
                className="sugg-comment-input"
                rows={3}
                placeholder="댓글을 입력하세요"
                value={commentBody}
                disabled={commentBusy}
                onChange={e => setCommentBody(e.target.value)}
              />
              <div className="sugg-comment-form-actions">
                <button
                  type="submit"
                  className="btn-coral-sm"
                  disabled={commentBusy || !commentBody.trim() || !commentNick.trim()}
                >
                  {commentBusy ? '등록 중…' : '댓글 등록'}
                </button>
              </div>
              {commentError && <p className="sugg-inline-error">{commentError}</p>}
            </form>
          </section>
        </article>
      )}
    </SuggestionPageShell>
  );
}
