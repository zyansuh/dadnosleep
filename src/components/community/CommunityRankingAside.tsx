import type { PointRecord } from '../../types/community';
import { PointRanking } from './PointRanking';

interface Props {
  points:   PointRecord[];
  vipKeys:  Set<string>;
}

export function CommunityRankingAside({ points, vipKeys }: Props) {
  return (
    <aside className="comm-sidebar">
      <PointRanking points={points} vipKeys={vipKeys} />
    </aside>
  );
}
