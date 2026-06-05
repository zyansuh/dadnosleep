import { Link } from 'react-router-dom';
import { MessageSquare, ChevronRight } from 'lucide-react';

interface Props {
  suggestionCount?: number;
}

export function CommunitySuggestionLink({ suggestionCount = 0 }: Props) {
  return (
    <Link to="/suggestions" className="comm-suggestion-card" aria-label="건의함">
      <span className="comm-suggestion-icon" aria-hidden>
        <MessageSquare size={18} />
      </span>
      <div className="comm-suggestion-text">
        <strong>건의함</strong>
        <p>편성표 건의 남기기</p>
      </div>
      {suggestionCount > 0 && (
        <span className="board-badge">{suggestionCount}</span>
      )}
      <ChevronRight size={16} className="comm-suggestion-arrow" aria-hidden />
    </Link>
  );
}
