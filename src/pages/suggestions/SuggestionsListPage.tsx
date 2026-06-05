import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { SuggestionPageShell } from '../../components/suggestion/SuggestionPageShell';
import { SuggestionStatusBadge } from '../../components/suggestion/SuggestionStatusBadge';
import { SuggestionModal } from '../../components/SuggestionModal';
import { useSuggestionForm } from '../../hooks/useSuggestionForm';
import { fetchSuggestions } from '../../utils/suggestion/suggestionApi';
import { formatSuggestionDate } from '../../utils/suggestion/formatSuggestionDate';
import type { SavedSuggestion } from '../../types/suggestion';

export function SuggestionsListPage() {
  const form = useSuggestionForm();
  const [list, setList]       = useState<SavedSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const items = await fetchSuggestions();
        if (!cancelled) setList(items);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '건의함을 불러오지 못했습니다.');
          setList([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [form.submitted]);

  return (
    <SuggestionPageShell
      title="건의함"
      subtitle="편성표에 반영하고 싶은 프로그램을 알려주세요"
      action={(
        <button type="button" className="btn-coral-sm" onClick={form.openModal}>
          <Plus size={15} /> 건의하기
        </button>
      )}
    >
      {loading && <p className="sugg-muted">불러오는 중…</p>}

      {error && (
        <div className="sugg-alert sugg-alert--error">
          <MessageSquare size={16} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="sugg-empty">
          <p className="sugg-empty-ico">💬</p>
          <p>아직 등록된 건의가 없어요.</p>
          <button type="button" className="btn-coral-sm" onClick={form.openModal}>
            첫 건의 남기기
          </button>
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="sugg-table-wrap">
          <table className="sugg-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>처리상태</th>
              </tr>
            </thead>
            <tbody>
              {list.map(item => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/suggestions/${item.id}`} className="sugg-link">
                      {item.title}
                    </Link>
                  </td>
                  <td>@{item.nick}</td>
                  <td className="sugg-date">{formatSuggestionDate(item.createdAt)}</td>
                  <td><SuggestionStatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form.modalOpen && (
        <SuggestionModal
          form={form.form}
          setForm={form.setForm}
          errors={form.errors}
          submitted={form.submitted}
          setSubmitted={form.setSubmitted}
          validate={form.validate}
          submitError={form.submitError}
          onClose={form.closeModal}
        />
      )}
    </SuggestionPageShell>
  );
}
