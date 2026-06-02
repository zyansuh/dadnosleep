import type { PointRecord } from '../../types/community';
import { POINTS_PER_FRIEND_INVITE, POINTS_PER_REVIEW } from '../../constants/points';
import { formatPointBreakdown } from '../../utils/community/pointCalc';
import { nicknameHasVipBadge } from '../../utils/members/memberVip';
import { VipCrown } from '../VipCrown';

const MEDALS = ['🥇', '🥈', '🥉'];

function formatPoints(p: number) {
  return p.toLocaleString() + 'P';
}

interface Props {
  points:   PointRecord[];
  vipKeys?: Set<string>;
}

export function PointRanking({ points, vipKeys }: Props) {
  return (
    <div className="pr-panel">
      <h3 className="pr-title">🏆 포인트 랭킹</h3>
      {points.length === 0 ? (
        <p className="pr-empty">아직 순위가 없어요.<br />후기나 지인 초대를 남겨보세요!</p>
      ) : (
        <ol className="pr-list">
          {points.slice(0, 10).map((p, i) => (
            <li key={p.nickname} className={`pr-item ${i < 3 ? 'pr-top' : ''}`}>
              <span className="pr-rank">{MEDALS[i] ?? `${i + 1}`}</span>
              <span className="pr-nick">
                {p.nickname}
                {vipKeys && nicknameHasVipBadge(p.nickname, vipKeys) && (
                  <VipCrown className="pr-vip-crown" />
                )}
              </span>
              <div className="pr-right">
                <span className="pr-pts">{formatPoints(p.points)}</span>
                <span className="pr-cnt">{formatPointBreakdown(p)}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="pr-note">
        후기 1건 = {POINTS_PER_REVIEW.toLocaleString()}P · 지인 초대 1건 = {POINTS_PER_FRIEND_INVITE.toLocaleString()}P
      </p>
    </div>
  );
}
