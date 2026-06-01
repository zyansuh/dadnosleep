# 🛌 아빠안잔다 — OTT 편성표 & 커뮤니티 웹앱

> **매일 밤 20:00 ~ 02:00, 가족·연인·친구가 함께 볼 OTT 프로그램을 고정 편성과 실시간 추천으로 제공하는 React SPA**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [주요 기능](#2-주요-기능)
3. [기술 스택](#3-기술-스택)
4. [폴더 구조](#4-폴더-구조)
5. [설치 및 실행](#5-설치-및-실행)
6. [API 키 설정](#6-api-키-설정)
7. [기능 상세 가이드](#7-기능-상세-가이드)
8. [컴포넌트 레퍼런스](#8-컴포넌트-레퍼런스)
9. [커스텀 훅 레퍼런스](#9-커스텀-훅-레퍼런스)
10. [CSS 아키텍처](#10-css-아키텍처)
11. [localStorage 데이터 구조](#11-localstorage-데이터-구조)
12. [편성표 데이터 커스터마이징](#12-편성표-데이터-커스터마이징)
13. [기여 방법](#13-기여-방법)
14. [라이선스](#14-라이선스)

---

## 1. 프로젝트 소개

**아빠안잔다**는 스트리머/크리에이터가 운영하는 심야 방송 채널의 **주간 OTT 편성표**와 **시청자 커뮤니티**를 제공하는 React 기반 싱글 페이지 애플리케이션입니다.

- 매주 **목요일 / 금요일 22:00** 고정 편성 (나는 솔로 / 이혼숙려캠프)
- 나머지 시간대는 **TMDB API** 기반 한국 드라마·영화 랜덤 추천
- 시청자가 직접 **편성 건의**를 남기고 건의함에서 전체 열람 가능
- 편성표를 **직접 수정**해 고정 편성으로 저장 (localStorage 주간 유지)
- **커뮤니티 후기** 작성 시 **1,500 포인트** 즉시 지급, 포인트 랭킹 공개

---

## 2. 주요 기능

### 📅 이번 주 편성표

| 기능 | 설명 |
|------|------|
| 7일 × 3슬롯 그리드 | 월~일, 20:00 / 22:00 / 00:00 타임슬롯 |
| 고정 편성 강조 | 목·금 22:00 고정 편성 (핑크 그라디언트 셀) |
| 실시간 상태 표시 | 현재 시각 기준 LIVE / 예정 / 종료 자동 계산 |
| 오늘 컬럼 강조 | 오늘 요일 컬럼 밝게 표시 + 점 마커 |
| 폰트 자동 맞춤 | 한글 문자폭 기반으로 셀 글씨 크기 자동 조절 |
| 링크 연결 | OTT / YouTube 직접 링크 클릭 이동 |

### ✏️ 편성표 수정 (주간 일괄 편집)

| 기능 | 설명 |
|------|------|
| 📝 편성표 수정하기 버튼 | 히어로 좌측에서 모달 오픈 |
| 요일 탭 선택 | 월~일 7개 탭, 오늘 요일 기본 선택 |
| 슬롯별 입력 | 프로그램명 + 링크 입력 (고정 편성 슬롯은 잠금) |
| 고정 편성 변환 | 저장 시 해당 슬롯이 ★ 고정 편성으로 변경 |
| localStorage 저장 | ISO 주차 기반 저장, 매주 새 주 시작 시 자동 초기화 |

### 🎲 랜덤 편성 생성

| 기능 | 설명 |
|------|------|
| TMDB API 연동 | 한국어 원작 드라마·영화 (`with_original_language=ko`) |
| 랜덤 셔플 | 가져온 데이터를 무작위로 섞어 비고정 슬롯에 배치 |
| 링크 자동 연결 | 각 셀을 TMDB 상세 페이지로 직접 연결 |
| 에러 피드백 | API 오류 시 히어로에 붉은 에러 메시지 표시 |

### 📺 API 기반 추천 엔진

| 카드 | 기능 |
|------|------|
| 넷플릭스 TOP 10 | TMDB API로 국내 Netflix 인기 영화+드라마 10편 |
| OTT 통합 인기작 | Netflix·Disney+·wavve 통합 인기 영화+드라마 10편 |
| 랜덤 편성 생성 | 한국 드라마·영화 랜덤 추천으로 편성표 갱신 |
| 유튜브 인기 영상 | YouTube Data API v3 국내 인기 영상 TOP 12 |

### 💬 건의함

| 기능 | 설명 |
|------|------|
| 프로그램 신청 | 프로그램명·카테고리·시간대·내용·닉네임 입력 |
| localStorage 영구 저장 | 새로고침해도 건의 목록 유지 |
| 1달 자동 초기화 | 첫 저장일 기준 30일 경과 시 자동 삭제 |
| 건의함 버튼 배지 | 헤더에 총 건의 수 빨간 배지 표시 |
| 커뮤니티 목록 | 카테고리·닉네임·날짜·내용 전체 열람 |

### 🏆 커뮤니티 & 포인트 랭킹 *(신규)*

| 기능 | 설명 |
|------|------|
| 후기 작성 | 프로그램명·별점(1~5)·닉네임·내용 입력, 모달 UI |
| 1,500P 즉시 지급 | 후기 등록 시 닉네임에 1,500 포인트 자동 적립 |
| 누적 포인트 | 같은 닉네임 후기 작성 시 포인트 합산 |
| 포인트 랭킹 | 메인 홈 + 커뮤니티 페이지에서 TOP 5·10 공개 |
| 후기 카드 | OTT 카드 스타일, 그라디언트 배경 5종 순환 |
| 영구 저장 | `dadnosleep-reviews-v1`, `dadnosleep-points-v1` — **만료 없음** |

---

## 3. 기술 스택

| 구분 | 기술 | 버전 | 역할 |
|------|------|------|------|
| **프레임워크** | React | 19 | UI 렌더링, 컴포넌트 구조 |
| **언어** | TypeScript | 6.0 | 타입 안전성, 인터페이스 정의 |
| **번들러** | Vite | 8 | HMR 개발 서버, 프로덕션 빌드 |
| **아이콘** | lucide-react | latest | 벡터 아이콘 |
| **폰트** | Noto Sans KR | Google Fonts | 본문 전체 |
| **폰트** | Poppins | Google Fonts | 시간·숫자 표기 |
| **폰트** | Cafe24 Ssurround | 로컬 OTF/TTF | 로고 타이틀 (선택) |
| **외부 API** | TMDB API v3 | — | OTT 콘텐츠 랭킹 |
| **외부 API** | YouTube Data API v3 | — | 국내 인기 영상 |
| **스타일** | CSS (분리된 CSS 파일) | — | 다크 퍼플 테마, 반응형 |
| **상태관리** | React useState / useCallback | — | 외부 라이브러리 없음 |
| **영구저장** | localStorage | — | 편성표·건의함·후기·포인트 |
| **배포** | Vercel | — | GitHub 자동 배포 |

---

## 4. 폴더 구조

```
dadnosleep/
├── public/
│   ├── fonts/
│   │   ├── Cafe24Ssurround-v2.0.ttf   # 로고 폰트 (로컬)
│   │   └── Cafe24Ssurround-v2.0.otf
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── types/
│   │   ├── index.ts              # BadgeType, Cell, SuggForm, OttItem, YtItem
│   │   └── community.ts          # Review, PointRecord ★신규
│   │
│   ├── constants/
│   │   └── schedule.ts           # BASE_SCHED, DAYS, TIMES, SLOT_END_TIMES
│   │
│   ├── utils/
│   │   ├── api.ts                # TMDB/YouTube TypeScript 래퍼
│   │   ├── env.ts                # import.meta.env → ENV 객체 (VITE_* 변수)
│   │   ├── tmdb.js               # TMDB API fetch (fetchOTT, fetchKoreanOTT)
│   │   ├── youtube.js            # YouTube API fetch (fetchYouTube)
│   │   ├── format.ts             # fmtViews() — 조회수 한국어 포맷
│   │   └── scheduleTime.ts       # toMin(), slotStatus(), dateToNowMin()
│   │
│   ├── hooks/
│   │   ├── useClock.ts           # 현재 시각 + todayIdx + nowMin
│   │   ├── useSchedule.ts        # 편성표 상태·수정·랜덤화·localStorage
│   │   ├── useApiCards.ts        # OTT/YouTube API 카드 상태·fetching
│   │   ├── useSuggestionForm.ts  # 건의 폼 상태·검증·localStorage
│   │   ├── useCommunity.ts       # 후기·포인트 상태·localStorage ★신규
│   │   └── useFetch.js           # 범용 비동기 로딩 훅 (레거시)
│   │
│   ├── components/
│   │   ├── HeroSection.tsx        # 히어로 (좌측 타이틀/버튼 + 우측 편성표)
│   │   ├── ScheduleTable.tsx      # 주간 편성표 7×3 테이블
│   │   ├── CellInner.tsx          # 편성표 셀 내부 (폰트 자동 맞춤)
│   │   ├── ApiSection.tsx         # API 추천 섹션 (4카드 + 결과 그리드)
│   │   ├── ApiCard.tsx            # API 추천 카드 단일
│   │   ├── InfoSection.tsx        # 하단 정보 3종 카드
│   │   ├── SuggestionModal.tsx    # 프로그램 건의 모달
│   │   ├── SuggestionBoard.tsx    # 건의함 목록 모달
│   │   ├── ScheduleEditModal.tsx  # 주간 편성표 일괄 편집 모달
│   │   ├── EditCellModal.tsx      # 단일 셀 편집 모달 (보존)
│   │   ├── Field.tsx              # 폼 필드 래퍼 (label + error)
│   │   └── community/             # ★신규 커뮤니티 컴포넌트
│   │       ├── CommunityPage.tsx   # 커뮤니티 메인 페이지
│   │       ├── ReviewCard.tsx      # 후기 카드 (OTT 스타일)
│   │       ├── ReviewModal.tsx     # 후기 작성 모달 (별점 + 1500P 안내)
│   │       ├── PointRanking.tsx    # 포인트 랭킹 패널 (커뮤니티 페이지)
│   │       └── HomeRanking.tsx     # 포인트 랭킹 (메인 홈용)
│   │
│   ├── styles/
│   │   ├── variables.css          # CSS 커스텀 프로퍼티 + 리셋
│   │   ├── header.css             # 헤더 + 건의함/커뮤니티 버튼
│   │   ├── hero.css               # 히어로 레이아웃 + 타이틀 + 에러
│   │   ├── schedule.css           # 편성표 카드·테이블·셀·태그
│   │   ├── api.css                # API 섹션 + OTT/YouTube 그리드
│   │   ├── modal.css              # 모달·폼·건의함·주간편집 모달
│   │   ├── layout.css             # 정보 섹션 + CTA + 푸터 + FAB
│   │   ├── responsive.css         # 반응형 (1024 / 768 / 640px)
│   │   └── community.css          # 커뮤니티 전체 스타일 ★신규
│   │
│   ├── App.tsx                    # 루트 (홈/커뮤니티 페이지 라우팅)
│   ├── App.css                    # @import 9줄
│   ├── index.css                  # @font-face + body 배경
│   └── main.tsx                   # React DOM 마운트
│
├── .env.example                   # 환경변수 템플릿 (커밋됨)
├── .env.local                     # 실제 API 키 (gitignore)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. 설치 및 실행

### 사전 요구사항

- **Node.js** `v20.19.0` 이상 (권장: `v22+`)
- **npm** `v10` 이상

### 클론 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/zyansuh/dadnosleep.git
cd dadnosleep

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# → .env.local 파일에 API 키 입력 (6번 섹션 참고)

# 4. 개발 서버 실행
npm run dev
# → http://localhost:5173
```

> **Windows에서 rolldown 에러 발생 시:**
> ```bash
> npm install @rolldown/binding-win32-x64-msvc
> ```
> `optionalDependencies`로 분리되어 Vercel(Linux)에서는 자동 스킵됩니다.

### 스크립트 목록

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite HMR 개발 서버 실행 |
| `npm run build` | TypeScript 컴파일 + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 로컬 미리보기 |
| `npm run lint` | ESLint 코드 검사 |

---

## 6. API 키 설정

### 환경변수 파일 생성

```bash
cp .env.example .env.local
```

```env
# .env.local (gitignore 적용 — 커밋되지 않음)
VITE_TMDB_API_KEY=여기에_입력
VITE_TMDB_READ_TOKEN=여기에_입력
VITE_YOUTUBE_API_KEY=여기에_입력
```

> Vite는 `VITE_` 접두사가 붙은 환경변수만 클라이언트에 노출합니다.

### Vercel 배포 시 환경변수 설정

**Vercel Dashboard → 프로젝트 → Settings → Environment Variables**

| 변수명 | 설명 |
|--------|------|
| `VITE_TMDB_API_KEY` | TMDB API v3 키 |
| `VITE_TMDB_READ_TOKEN` | TMDB 읽기 액세스 토큰 (Bearer 인증, 권장) |
| `VITE_YOUTUBE_API_KEY` | YouTube Data API v3 키 |

> 환경변수 설정 후 **반드시 재배포(Redeploy)** 해야 적용됩니다.

### TMDB API 키 발급

1. [TMDB 회원가입](https://www.themoviedb.org/)
2. 계정 → **설정** → **API** → **API 키 (v3)** 발급
3. **읽기 액세스 토큰(Bearer)** 도 함께 복사 → `VITE_TMDB_READ_TOKEN`

### YouTube API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. **API 및 서비스 → 라이브러리 → YouTube Data API v3** 활성화
4. **사용자 인증 정보 → API 키** 발급 → `VITE_YOUTUBE_API_KEY`
5. 일일 무료 할당량: 10,000 단위

---

## 7. 기능 상세 가이드

### 7-1. 편성표 보기

화면 상단 히어로 우측 **이번 주 편성표 미리보기** 카드에서 확인합니다.

- **오늘 요일**: 골드 색상 + 점 마커로 강조
- **고정 편성 셀**: ⭐ 표시 + 핑크 그라디언트 (목 22:00 나는 솔로, 금 22:00 이혼숙려캠프)
- **링크 셀 클릭**: Netflix/wavve/TMDB/YouTube로 직접 이동

### 7-2. 편성표 수정하기

```
히어로 좌측 → "📝 편성표 수정하기" 버튼
→ 모달: 요일 탭 선택 → 슬롯별 프로그램명 + 링크 입력
→ 저장 시 ★ 고정 편성으로 변환
→ 매주 월요일 ISO 주차 변경 시 자동 초기화
```

### 7-3. 랜덤 편성 생성

```
히어로 → "⭐ 랜덤 편성 생성하기"
→ TMDB API: with_original_language=ko 한국어 드라마·영화 조회
→ 비고정 슬롯에 무작위 배치 + TMDB 링크 연결
→ API 오류 시 히어로에 붉은 에러 메시지 표시
```

### 7-4. API 추천 카드

카드 클릭 → 해당 API 데이터 그리드 펼침 / 재클릭 시 닫힘

| 카드 | 데이터 |
|------|--------|
| 넷플릭스 TOP 10 | `providerId=8`, 영화+드라마 각 5편 |
| OTT 통합 인기작 | `providerId=0` (전체), 영화+드라마 각 5편 |
| 유튜브 인기 영상 | `chart=mostPopular&regionCode=KR`, TOP 12 |

### 7-5. 프로그램 건의

```
FAB(+ 건의) 또는 모바일 메뉴 → "✏️ 프로그램 신청하기"
→ 폼: 프로그램명 / 카테고리 / 시간대 / 내용 / 닉네임
→ 제출 → localStorage 자동 저장 (30일 후 자동 삭제)
→ 헤더 "건의함" 버튼으로 전체 목록 열람
```

### 7-6. 커뮤니티 후기 작성 & 포인트 *(신규)*

```
헤더 "커뮤니티" 버튼 → 커뮤니티 페이지 이동
→ "후기 작성하기" 버튼 → 모달 오픈

[후기 작성 모달]
  - 닉네임 (필수)
  - 어떤 프로그램? (필수)
  - 별점 1~5 (Star 버튼)
  - 후기 내용 (필수)
  → 등록 → 🎉 1,500P 즉시 지급!
```

**포인트 시스템:**
- 후기 1건 = **1,500 포인트**
- 동일 닉네임 후기 작성 시 포인트 **누적**
- 포인트 내림차순 **랭킹** 자동 정렬
- 메인 홈 + 커뮤니티 페이지 모두에서 랭킹 확인 가능

### 7-7. 포인트 랭킹

- **메인 홈**: 상위 5명 카드 그리드 + "커뮤니티 보기 →" 링크
- **커뮤니티 페이지**: 상위 10명 목록 (🥇🥈🥉 메달)
- 데이터는 **영구 보관** (만료 없음)

---

## 8. 컴포넌트 레퍼런스

### `App.tsx` — 루트 + 페이지 라우팅

```ts
type Page = 'home' | 'community';
```

`page` 상태로 홈 / 커뮤니티 페이지를 전환합니다. React Router 없이 상태 기반으로 구현합니다.

```
App
├── header (로고 + 커뮤니티 버튼 + 건의함 버튼 + 햄버거)
├── [page === 'home']
│   ├── HeroSection
│   ├── ApiSection
│   ├── InfoSection
│   ├── HomeRanking       ← 포인트 랭킹 (메인)
│   └── section.cta-banner
└── [page === 'community']
    └── CommunityPage
```

---

### `HeroSection.tsx`

| Prop | 타입 | 설명 |
|------|------|------|
| `sched` | `Cell[][]` | 현재 편성표 |
| `todayIdx` | `number` | 오늘 요일 인덱스 (0=월~6=일) |
| `nowMin` | `number` | 현재 분 |
| `randing` | `boolean` | 랜덤 생성 로딩 중 |
| `randError` | `string` | 랜덤 생성 에러 메시지 |
| `handleRandomize` | `() => void` | 랜덤 편성 생성 |
| `onOpenScheduleEdit` | `() => void` | 편성표 수정 모달 오픈 |

---

### `CommunityPage.tsx` *(신규)*

| Prop | 타입 | 설명 |
|------|------|------|
| `reviews` | `Review[]` | 전체 후기 목록 |
| `points` | `PointRecord[]` | 포인트 랭킹 목록 |
| `onAddReview` | `(draft) => void` | 후기 추가 + 포인트 지급 |
| `onBack` | `() => void` | 홈으로 돌아가기 |

---

### `ReviewModal.tsx` *(신규)*

| Prop | 타입 | 설명 |
|------|------|------|
| `onSubmit` | `(draft) => void` | 유효성 검사 통과 시 호출 |
| `onClose` | `() => void` | 모달 닫기 |

필수 필드: `nickname`, `programTitle`, `content`
선택 필드: `rating` (기본값 5)

---

### `HomeRanking.tsx` *(신규)*

| Prop | 타입 | 설명 |
|------|------|------|
| `points` | `PointRecord[]` | 포인트 랭킹 (상위 5명 표시) |
| `onGoCommunity` | `() => void` | 커뮤니티 페이지로 이동 |

---

## 9. 커스텀 훅 레퍼런스

### `useClock()`

```ts
const { now, todayIdx, nowMin } = useClock();
```

1분마다 `setInterval`로 현재 시각을 갱신합니다. 새벽 0~5시는 `+1440분` 보정하여 당일 방송으로 처리합니다.

---

### `useSchedule()`

```ts
const { sched, randing, randError, isEditMode,
        handleRandomize, updateCell, updateMany, resetCell, toggleEditMode } = useSchedule();
```

| 반환값 | 타입 | 설명 |
|--------|------|------|
| `sched` | `Cell[][]` | 현재 편성표 7×3 |
| `randing` | `boolean` | 랜덤 생성 로딩 중 |
| `randError` | `string` | 랜덤 생성 에러 |
| `handleRandomize` | `async () => void` | TMDB 기반 랜덤 생성 |
| `updateCell` | `(di, ti, title, link?) => void` | 단일 셀 고정 편성 |
| `updateMany` | `(edits[]) => void` | 복수 셀 일괄 업데이트 |
| `resetCell` | `(di, ti) => void` | 셀 기본값 초기화 |

**localStorage 저장 구조:**
```json
// "dadnosleep-sched"
{ "week": "2026-W23", "data": [[...], [...], ...] }
```
ISO 주차가 다르면 `BASE_SCHED`로 자동 초기화됩니다.

---

### `useApiCards()`

```ts
const { activeApi, ottItems, ytItems, ottLoading, ottError, handleApiCard } = useApiCards();
```

같은 타입 카드 재클릭 시 `activeApi`가 `null`로 초기화되어 결과창이 닫힙니다.

---

### `useSuggestionForm()`

```ts
const { form, setForm, errors, modalOpen, submitted,
        suggestions, openModal, closeModal, setSubmitted, validate } = useSuggestionForm();
```

**localStorage 저장 구조:**
```json
// "dadnosleep-suggestions"  → 최초 저장일 기준 30일 후 자동 삭제
// "dadnosleep-suggestions-saved-at"  → 최초 저장 타임스탬프
```

---

### `useCommunity()` *(신규)*

```ts
const { reviews, points, addReview, totalReviews } = useCommunity();
```

| 반환값 | 타입 | 설명 |
|--------|------|------|
| `reviews` | `Review[]` | 전체 후기 목록 (최신 순) |
| `points` | `PointRecord[]` | 포인트 랭킹 (내림차순) |
| `addReview` | `(draft) => void` | 후기 저장 + 1,500P 지급 |
| `totalReviews` | `number` | 총 후기 수 |

**localStorage 저장 구조 (만료 없음):**
```json
// "dadnosleep-reviews-v1"
[
  {
    "id": "1717200000000-abc12",
    "nickname": "시청자닉네임",
    "programTitle": "나는 솔로",
    "rating": 5,
    "content": "재미있어요!",
    "createdAt": "2026-06-01T12:00:00.000Z"
  }
]

// "dadnosleep-points-v1"
[
  { "nickname": "시청자닉네임", "points": 4500, "reviewCount": 3 }
]
```

> ⚠️ **데이터 보존 보장**: `dadnosleep-reviews-v1` / `dadnosleep-points-v1` 키는 만료 로직이 없습니다. 브라우저 캐시 초기화나 `localStorage.clear()`를 직접 실행하지 않는 한 데이터가 삭제되지 않습니다.

---

## 10. CSS 아키텍처

`App.css`는 순수 `@import` 9줄만 포함합니다.

```
src/styles/
├── variables.css   ← :root CSS 변수 (색상, 폰트, 배경)
├── header.css      ← 헤더, 커뮤니티/건의함 버튼, 모바일 메뉴
├── hero.css        ← 히어로 레이아웃, 타이틀 그라디언트, 에러 표시
├── schedule.css    ← 편성표 카드, 테이블, 셀, 태그, 편집 모드
├── api.css         ← API 카드, OTT/YouTube 결과 그리드
├── modal.css       ← 모달, 폼, 건의함, 주간편집 모달
├── layout.css      ← 정보 섹션, CTA 배너, 푸터, FAB
├── responsive.css  ← @media (1024 / 768 / 640px)
└── community.css   ← 커뮤니티 전체 스타일 (홈랭킹, 커뮤니티 페이지, 후기 카드) ★신규
```

### 핵심 CSS 변수

```css
:root {
  --bg:        #0f0a1f;
  --bg2:       #1a1530;
  --bg-card:   rgba(30,25,50,0.7);
  --text:      #fff;
  --text-sub:  #e0e0ff;
  --text-dim:  #a8a8c0;
  --coral:     #ff6b8a;
  --coral2:    #ff8b5a;
  --gold:      #ffd57a;
  --font-body: 'Noto Sans KR';
  --font-num:  'Poppins';
}
```

---

## 11. localStorage 데이터 구조

| 키 | 타입 | 설명 | 초기화 주기 |
|----|------|------|-------------|
| `dadnosleep-sched` | `{week, data}` JSON | 주간 편성표 | 매주 ISO 주차 변경 시 |
| `dadnosleep-suggestions` | `SavedSuggestion[]` | 건의 목록 | 최초 저장일 +30일 |
| `dadnosleep-suggestions-saved-at` | ISO date string | 건의 최초 저장일 | 건의 목록과 함께 |
| `dadnosleep-reviews-v1` | `Review[]` | 후기 목록 | **만료 없음 (영구)** |
| `dadnosleep-points-v1` | `PointRecord[]` | 포인트 랭킹 | **만료 없음 (영구)** |

---

## 12. 편성표 데이터 커스터마이징

`src/constants/schedule.ts`의 `BASE_SCHED` 배열을 수정하세요.

```ts
// BASE_SCHED[dayIndex(0=월)][timeIndex(0=20:00, 1=22:00, 2=00:00)]
const BASE_SCHED: Cell[][] = [
  // 목(3)
  [
    { title: '커뮤니티 픽', sub: '커뮤니티', type: 'community', badge: '커뮤니티', bt: 'purple' },
    {
      title: '나는 솔로',
      sub: 'TV 조선 22:00',
      type: 'fixed',              // ← 고정 편성
      badge: '★ 고정 편성',
      bt: 'pink',
      link: 'https://www.youtube.com/results?search_query=나는솔로+최신+다시보기',
    },
    { title: '랜덤 예능', sub: '랜덤', type: 'random', badge: '편성 추천', bt: 'pink' },
  ],
];
```

### 태그 타입 색상표

| `bt` 값 | 색상 | 용도 |
|---------|------|------|
| `'pink'` | 분홍 | 편성 추천 (랜덤), 고정 편성 |
| `'blue'` | 파랑 | 오늘의 픽 |
| `'orange'` | 주황 | TOP 10 |
| `'yellow'` | 노랑 | 실시간 인기 |
| `'purple'` | 보라 | 커뮤니티, 예고 |
| `'teal'` | 민트 | 일반 랜덤 추천 |

---

## 13. 기여 방법

```bash
# 1. Fork 후 기능 브랜치 생성
git checkout -b feat/기능명

# 2. 변경 후 커밋 (Conventional Commits 준수)
git commit -m "feat: 새로운 기능 설명"

# 3. 원격 브랜치 푸시
git push origin feat/기능명

# 4. Pull Request 생성
```

### 커밋 메시지 컨벤션

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `refactor` | 코드 리팩토링 |
| `style` | CSS/포매팅 (로직 변경 없음) |
| `docs` | 문서 수정 |
| `chore` | 빌드 설정, 패키지 업데이트 |

---

## 14. 라이선스

[MIT License](LICENSE) © 2026 zyansuh

---

<div align="center">
  <sub>🛌 잠 못 드는 밤, 아빠안잔다와 함께하세요</sub><br/>
  <sub>Made with ❤️ by <a href="https://github.com/zyansuh">zyansuh</a></sub>
</div>
