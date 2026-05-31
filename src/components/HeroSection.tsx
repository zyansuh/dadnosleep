import { Heart, Calendar, Edit3, AlertCircle } from 'lucide-react';
import type { Cell } from '../types';
import { ScheduleTable } from './ScheduleTable';

interface Props {
  sched:               Cell[][];
  todayIdx:            number;
  nowMin:              number;
  randing:             boolean;
  randError:           string;
  onOpenScheduleEdit:  () => void;
  handleRandomize:     () => void;
}

export function HeroSection({
  sched, todayIdx, nowMin, randing, randError, onOpenScheduleEdit, handleRandomize,
}: Props) {
  return (
    <section className="hero">

      {/* 좌측 */}
      <div className="hero-left">
        <div className="hero-pill">
          <Heart size={12} fill="currentColor" />
          목·금 고정 편성 + 실시간 랜덤 추천
        </div>

        <div className="hero-title-wrap">
          <h1 className="site-title">아빠안잔다</h1>
        </div>

        <p className="site-sub">우리가 함께 보는 OTT 편성표</p>
        <p className="site-desc">
          하루의 끝, 가족·연인·친구가 함께 즐길 수 있는<br />
          OTT 프로그램을 고정 편성과 실시간 추천으로 매일 새롭게 만나보세요.
        </p>

        <div className="hero-ctas">
          <a href="#schedule-section" className="btn-hero-primary">
            <Calendar size={15} /> 오늘 편성표 보기
          </a>
          <button
            className="btn-hero-secondary"
            onClick={handleRandomize}
            disabled={randing}
          >
            ⭐ {randing ? '생성 중…' : '랜덤 편성 생성하기'}
          </button>
          <button
            className="btn-hero-secondary btn-hero-edit"
            onClick={onOpenScheduleEdit}
          >
            <Edit3 size={14} /> 편성표 수정하기
          </button>
        </div>

        {/* 랜덤 생성 에러 메시지 */}
        {randError && (
          <div className="rand-error">
            <AlertCircle size={14} />
            <span>{randError}</span>
          </div>
        )}
      </div>

      {/* 우측: 편성표 */}
      <div className="hero-right" id="schedule-section">
        <ScheduleTable
          sched={sched}
          todayIdx={todayIdx}
          nowMin={nowMin}
          isEditMode={false}
          onEditCell={() => {}}
        />
      </div>
    </section>
  );
}
