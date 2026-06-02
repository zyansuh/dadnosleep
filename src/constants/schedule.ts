import type { Cell } from '../types';

export const DAYS  = ['월', '화', '수', '목', '금', '토', '일'] as const;
export const TIMES = ['20:00', '22:00', '00:00'] as const;
export const SLOT_END_TIMES = ['22:00', '00:00', '02:00'] as const;

/** 회원 전용 편성 (요일별 1슬롯) */
export const BASE_MEMBER_ROW: Cell[] = [
  { title: '회원 비하인드 토크', sub: '회원 전용', type: 'member', badge: '👑 회원 전용', bt: 'purple', link: 'https://www.netflix.com/kr/' },
  { title: 'VIP 큐레이션',     sub: '회원 전용', type: 'member', badge: '👑 회원 전용', bt: 'purple', link: 'https://www.netflix.com/kr/' },
  { title: '심야 회원 영화',   sub: '회원 전용', type: 'member', badge: '👑 회원 전용', bt: 'purple', link: 'https://www.netflix.com/kr/' },
  { title: '회원 라이브 Q&A', sub: '회원 전용', type: 'member', badge: '👑 회원 전용', bt: 'purple' },
  { title: '프리미엄 예능',   sub: '회원 전용', type: 'member', badge: '👑 회원 전용', bt: 'purple', link: 'https://www.netflix.com/kr/' },
  { title: '회원 정주행',     sub: '회원 전용', type: 'member', badge: '👑 회원 전용', bt: 'purple', link: 'https://www.netflix.com/kr/' },
  { title: '주말 회원 스페셜', sub: '회원 전용', type: 'member', badge: '👑 회원 전용', bt: 'purple', link: 'https://www.netflix.com/kr/' },
];

export const BASE_SCHED: Cell[][] = [
  // 월(0)
  [
    { title: '랜덤 예능',    sub: '랜덤',    type: 'random',    badge: '편성 추천',   bt: 'pink' },
    { title: 'TOP 10 드라마', sub: 'Netflix', type: 'ott',       badge: 'TOP 10',     bt: 'orange', link: 'https://www.netflix.com/kr/browse/genre/83' },
    { title: '심야 영화',    sub: '오늘의 픽', type: 'ott',      badge: '오늘의 픽',  bt: 'blue',   link: 'https://www.netflix.com/kr/' },
  ],
  // 화(1)
  [
    { title: '랜덤 애니',    sub: '랜덤',    type: 'random',    badge: '편성 추천',   bt: 'pink' },
    { title: '실시간 인기작', sub: '실시간', type: 'ott',        badge: '실시간 인기', bt: 'yellow', link: 'https://www.netflix.com/kr/' },
    { title: '랜덤 다큐',   sub: '랜덤',     type: 'random',    badge: '편성 추천',   bt: 'pink' },
  ],
  // 수(2)
  [
    { title: '로맨스 추천', sub: '오늘의 픽', type: 'ott',       badge: '오늘의 픽',   bt: 'blue' },
    { title: 'OTT 화제작',  sub: '실시간',   type: 'ott',       badge: '실시간 인기', bt: 'yellow', link: 'https://www.wavve.com/' },
    { title: '랜덤 시리즈', sub: '랜덤',     type: 'random',    badge: '편성 추천',   bt: 'pink' },
  ],
  // 목(3)
  [
    { title: '커뮤니티 픽', sub: '커뮤니티', type: 'community', badge: '커뮤니티',    bt: 'purple' },
    { title: '나는 솔로',  sub: 'TV 조선',   type: 'fixed',     badge: '★ 고정 편성', bt: 'pink',   link: 'https://www.youtube.com/results?search_query=나는솔로+최신+다시보기' },
    { title: '랜덤 예능',  sub: '랜덤',      type: 'random',    badge: '편성 추천',   bt: 'pink' },
  ],
  // 금(4)
  [
    { title: '주간 인기작',   sub: 'TOP 10',   type: 'ott',   badge: 'TOP 10',      bt: 'orange', link: 'https://www.netflix.com/kr/' },
    { title: '이혼숙려캠프', sub: 'TV 조선',  type: 'fixed', badge: '★ 고정 편성', bt: 'pink',   link: 'https://www.youtube.com/results?search_query=이혼숙려캠프+최신+다시보기' },
    { title: '심야 토크',    sub: '오늘의 픽', type: 'ott',   badge: '오늘의 픽',   bt: 'blue' },
  ],
  // 토(5)
  [
    { title: '정주행 추천',    sub: '오늘의 픽', type: 'ott',    badge: '오늘의 픽',   bt: 'blue',   link: 'https://www.netflix.com/kr/' },
    { title: '랜덤 영화',     sub: '랜덤',      type: 'random', badge: '편성 추천',   bt: 'pink' },
    { title: '실시간 TOP 10', sub: '실시간',    type: 'ott',    badge: '실시간 인기', bt: 'yellow', link: 'https://www.netflix.com/kr/' },
  ],
  // 일(6)
  [
    { title: '휴일 추천',  sub: '오늘의 픽', type: 'ott',       badge: '오늘의 픽',  bt: 'blue',   link: 'https://www.netflix.com/kr/' },
    { title: '랜덤 드라마', sub: '랜덤',     type: 'random',   badge: '편성 추천',  bt: 'pink' },
    { title: '다음주 예고', sub: '예고',     type: 'community', badge: '예고',       bt: 'purple' },
  ],
];
