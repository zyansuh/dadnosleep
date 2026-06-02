import { useAdminFeedback } from '../useAdminFeedback';
import { usePointReportDerived } from './usePointReportDerived';
import { usePointReportQuery } from './usePointReportQuery';

export function useAdminPointReport() {
  const { feedback, clear, showError } = useAdminFeedback();
  const query = usePointReportQuery({ clear, showError });
  const derived = usePointReportDerived(query.reviews, query.friendInvites, query.members);

  return {
    loading: query.loading,
    feedback,
    reload:  query.reload,
    ...derived,
  };
}
