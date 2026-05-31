import React from 'react';
import { Heart, Calendar } from 'lucide-react';
import type { Cell } from '../types';
import { ScheduleTable } from './ScheduleTable';

interface Props {
  sched:           Cell[][];
  todayIdx:        number;
  nowMin:          number;
  randing:         boolean;
  handleRandomize: () => void;
}

export function HeroSection({ sched, todayIdx, nowMin, randing, handleRandomize }: Props) {
  return (
    <section className="hero" id="편성표">
      <div className="hero-inner">

        {/* 좌측 카드 */}
        <div className="hero-left">
          <div className="hero-moon">🌙</div>

          <div className="hero-pill">
            <Heart size={12} fill="currentColor" />
            목·금 고정 편성 + 실시간 랜덤 추천 ✦
          </div>

          <div className="hero-title-wrap">
            <span className="sp sp1">✦</span>
            <span className="sp sp2">✦</span>
            <span className="sp sp3">⋆</span>
            <span className="sp sp4">✦</span>
            <h1 className="site-title">
              아빠안잔다<span className="title-heart">♥</span>
            </h1>
          </div>

          <p className="site-sub">우리가 함께 보는 OTT 편성표</p>
          <p className="site-desc">
            하루의 끝, 가족·연인·친구가 함께 즐길 수 있는<br />
            OTT 프로그램을 고정 편성과 실시간 추천으로<br />
            매일 새롭게 만나보세요.
          </p>

          <div className="hero-ctas">
            <a href="#schedule-section" className="btn-hero">
              <Calendar size={14} /> 오늘 편성표 보기
            </a>
            <button
              className="btn-hero"
              onClick={handleRandomize}
              disabled={randing}
            >
              <span>☆</span> {randing ? '생성 중…' : '랜덤 편성 생성하기'}
            </button>
          </div>
        </div>

        {/* 우측: 편성표 테이블 */}
        <div className="hero-right" id="schedule-section">
          <ScheduleTable sched={sched} todayIdx={todayIdx} nowMin={nowMin} />
        </div>
      </div>
    </section>
  );
}
