import type { Cell } from '../types';

export const DAYS  = ['월', '화', '수', '목', '금', '토', '일'] as const;
export const TIMES = ['20:00', '22:00', '00:00'] as const;
export const SLOT_END_TIMES = ['22:00', '00:00', '02:00'] as const;

export const BASE_SCHED: Cell[][] = [
  // 월(0)
  [
    { title: '랜덤 애뇨',    sub: 'OTT 통합',        type: 'random',    badge: '랜덤 추천',  bt: 'teal' },
    { title: 'TOP 10 드라마', sub: '넷플릭스 TOP 10', type: 'ott',       badge: 'TOP 10',    bt: 'pink',   link: 'https://www.netflix.com/kr/browse/genre/83' },
    { title: '심야 영화',     sub: '오늘의 픽',       type: 'ott',       badge: '오늘의 픽', bt: 'orange', link: 'https://www.netflix.com/kr/' },
  ],
  // 화(1)
  [
    { title: '랜덤 애니',    sub: 'OTT 통합',        type: 'random',    badge: '랜덤 추천',   bt: 'teal' },
    { title: '실시간 인기작', sub: 'OTT 통합 인기',  type: 'ott',       badge: '실시간 인기', bt: 'purple', link: 'https://www.netflix.com/kr/' },
    { title: '랜덤 다큐',    sub: 'OTT 통합',        type: 'random',    badge: '랜덤 추천',   bt: 'teal' },
  ],
  // 수(2)
  [
    { title: '로맨스 추천',  sub: '랜덤 추천',  type: 'random', badge: '랜덤 추천', bt: 'teal' },
    { title: 'OTT 화제작',  sub: 'OTT 통합',   type: 'ott',    badge: 'OTT 통합',  bt: 'orange', link: 'https://www.wavve.com/' },
    { title: '랜덤 시리즈', sub: 'OTT 통합',   type: 'random', badge: '랜덤 추천', bt: 'teal' },
  ],
  // 목(3)
  [
    { title: '커뮤니티 픽', sub: '커뮤니티 투표', type: 'community', badge: '커뮤니티',   bt: 'green' },
    { title: '나는 솔로',   sub: 'TV 조선 22:00', type: 'fixed',     badge: '★ 고정 편성', bt: 'pink', link: 'https://www.youtube.com/results?search_query=나는솔로+최신+다시보기' },
    { title: '랜덤 애뇨',  sub: 'OTT 통합',      type: 'random',    badge: '랜덤 추천',   bt: 'teal' },
  ],
  // 금(4)
  [
    { title: '주간 인기작',   sub: '주간 TOP',      type: 'ott',   badge: '주간 인기',   bt: 'purple', link: 'https://www.netflix.com/kr/' },
    { title: '이혼숙려캠프', sub: 'TV 조선 22:00', type: 'fixed', badge: '★ 고정 편성', bt: 'pink',   link: 'https://www.youtube.com/results?search_query=이혼숙려캠프+최신+다시보기' },
    { title: '심야 토크',    sub: '오늘의 픽',     type: 'ott',   badge: '오늘의 픽',   bt: 'orange' },
  ],
  // 토(5)
  [
    { title: '정주행 추천',    sub: '오늘의 픽',  type: 'ott',    badge: '오늘의 픽',   bt: 'orange', link: 'https://www.netflix.com/kr/' },
    { title: '랜덤 영화',     sub: 'OTT 통합',  type: 'random', badge: '랜덤 추천',   bt: 'teal' },
    { title: '실시간 TOP 10', sub: '실시간 인기', type: 'ott',   badge: '실시간 인기', bt: 'purple', link: 'https://www.netflix.com/kr/' },
  ],
  // 일(6)
  [
    { title: '휴일 추천',  sub: '오늘의 픽', type: 'ott',       badge: '오늘의 픽',  bt: 'orange', link: 'https://www.netflix.com/kr/' },
    { title: '랜덤 드라마', sub: 'OTT 통합', type: 'random',   badge: '랜덤 추천',  bt: 'teal' },
    { title: '다음주 예고', sub: '커뮤니티', type: 'community', badge: '커뮤니티',  bt: 'green' },
  ],
];
