import { Users } from 'lucide-react';
import type { PointRecord } from '../../types/community';
import { formatPointBreakdown } from '../../utils/community/pointCalc';
import { nicknameHasVipBadge } from '../../utils/members/memberVip';
import { VipCrown } from '../VipCrown';

const MEDALS = ['🥇', '🥈', '🥉'];

interface Props {
  points:        PointRecord[];
  vipKeys?:      Set<string>;
  onGoCommunity: () => void;
}

export function HomeRanking({ points, vipKeys, onGoCommunity }: Props) {
  return (
    <section className="home-ranking-section">
      <div className="home-ranking-header">
        <h2 className="home-ranking-title">
          🏆 포인트 랭킹
        </h2>
        <button className="home-ranking-more" onClick={onGoCommunity}>
          <Users size={14} /> 커뮤니티 보기 →
        </button>
      </div>

      {points.length === 0 ? (
        <div className="home-ranking-empty">
          <p>아직 랭킹이 없어요. <button className="link-btn" onClick={onGoCommunity}>첫 후기를 남겨보세요! →</button></p>
        </div>
      ) : (
        <div className="home-ranking-grid">
          {points.slice(0, 5).map((p, i) => (
            <div key={p.nickname} className={`home-rank-card ${i < 3 ? 'rank-top' : ''}`}>
              <span className="hrk-medal">{MEDALS[i] ?? `${i + 1}`}</span>
              <span className="hrk-nick">
                {p.nickname}
                {vipKeys && nicknameHasVipBadge(p.nickname, vipKeys) && (
                  <VipCrown className="hrk-vip-crown" />
                )}
              </span>
              <span className="hrk-pts">{p.points.toLocaleString()}P</span>
              <span className="hrk-cnt">{formatPointBreakdown(p)}</span>
            </div>
          ))}
          {points.length > 5 && (
            <div className="home-rank-card rank-more" onClick={onGoCommunity}>
              <span className="hrk-more-txt">+{points.length - 5}명 더 보기</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
