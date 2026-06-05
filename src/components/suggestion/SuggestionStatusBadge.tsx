import type { SuggestionStatus } from '../../types/suggestion';
import { SUGGESTION_STATUS_LABELS } from '../../constants/suggestion';

interface Props {
  status: SuggestionStatus;
}

export function SuggestionStatusBadge({ status }: Props) {
  return (
    <span className={`sugg-status sugg-status--${status}`}>
      {SUGGESTION_STATUS_LABELS[status]}
    </span>
  );
}
