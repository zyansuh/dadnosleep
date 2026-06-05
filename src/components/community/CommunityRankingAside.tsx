import type { PointRecord } from '../../types/community';
import { PointRanking } from './PointRanking';
import { CommunitySuggestionLink } from './CommunitySuggestionLink';

interface Props {
  points:           PointRecord[];
  vipKeys:          Set<string>;
  suggestionCount?: number;
}

export function CommunityRankingAside({ points, vipKeys, suggestionCount }: Props) {
  return (
    <aside className="comm-sidebar">
      <PointRanking points={points} vipKeys={vipKeys} />
      <CommunitySuggestionLink suggestionCount={suggestionCount} />
    </aside>
  );
}
