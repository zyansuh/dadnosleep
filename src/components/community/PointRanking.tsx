import type { PointRecord } from '../../types/community';

const MEDALS = ['🥇', '🥈', '🥉'];

function formatPoints(p: number) {
  return p.toLocaleString() + 'P';
}

interface Props { points: PointRecord[]; }

export function PointRanking({ points }: Props) {
  return (
    <div className="pr-panel">
      <h3 className="pr-title">🏆 포인트 랭킹</h3>
      {points.length === 0 ? (
        <p className="pr-empty">아직 순위가 없어요.<br />첫 후기를 남겨보세요!</p>
      ) : (
        <ol className="pr-list">
          {points.slice(0, 10).map((p, i) => (
            <li key={p.nickname} className={`pr-item ${i < 3 ? 'pr-top' : ''}`}>
              <span className="pr-rank">{MEDALS[i] ?? `${i + 1}`}</span>
              <span className="pr-nick">{p.nickname}</span>
              <div className="pr-right">
                <span className="pr-pts">{formatPoints(p.points)}</span>
                <span className="pr-cnt">{p.reviewCount}건</span>
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="pr-note">후기 1건 = 1,500P</p>
    </div>
  );
}
