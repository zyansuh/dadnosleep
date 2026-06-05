import { Link } from 'react-router-dom';
import { AdminFeedbackBanner } from '../../components/admin/feedback/AdminFeedbackBanner';
import { SuggestionStatusBadge } from '../../components/suggestion/SuggestionStatusBadge';
import { useAdminSuggestions } from '../../hooks/admin/useAdminSuggestions';
import { formatSuggestionDate } from '../../utils/suggestion/formatSuggestionDate';
import type { SuggestionStatus } from '../../types/suggestion';
import { SUGGESTION_STATUS_LABELS } from '../../constants/suggestion';

const STATUS_OPTIONS: SuggestionStatus[] = ['pending', 'reviewing', 'answered', 'closed'];

export function AdminSuggestionsPage() {
  const s = useAdminSuggestions();

  return (
    <div className="admin-page-body admin-page-body--suggestions">
      <h2 className="admin-panel-title">건의함 관리</h2>
      <p className="admin-page-desc admin-page-desc--compact">
        접수된 편성 건의를 확인하고 처리 상태를 변경할 수 있습니다.
        <strong>댓글</strong>은 제목을 클릭해 상세 페이지 하단에서 남길 수 있습니다.
      </p>

      <AdminFeedbackBanner warn={s.error || null} feedback={s.feedback} />

      {s.loading ? (
        <p className="admin-muted">불러오는 중…</p>
      ) : s.list.length === 0 ? (
        <p className="admin-muted">등록된 건의가 없습니다.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table sugg-admin-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>처리상태</th>
                <th>상태 변경</th>
                <th>댓글</th>
              </tr>
            </thead>
            <tbody>
              {s.list.map(item => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/suggestions/${item.id}`} className="admin-link">
                      {item.title}
                    </Link>
                  </td>
                  <td>@{item.nick}</td>
                  <td>{formatSuggestionDate(item.createdAt)}</td>
                  <td><SuggestionStatusBadge status={item.status} /></td>
                  <td>
                    <select
                      className="admin-select"
                      value={item.status}
                      disabled={s.savingId === item.id}
                      onChange={e => void s.changeStatus(item.id, e.target.value as SuggestionStatus)}
                      aria-label={`${item.title} 처리 상태`}
                    >
                      {STATUS_OPTIONS.map(st => (
                        <option key={st} value={st}>{SUGGESTION_STATUS_LABELS[st]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Link to={`/suggestions/${item.id}#comments`} className="admin-link">
                      {(item.comments?.length ?? 0) > 0 ? `${item.comments!.length}개` : '쓰기'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
