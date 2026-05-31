# 🛌 아빠안잔다 — OTT 편성표 웹앱

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

**아빠안잔다**는 스트리머/크리에이터가 운영하는 심야 방송 채널의 **주간 OTT 편성표**를 제공하는 React 기반 싱글 페이지 애플리케이션입니다.

- 매주 **목요일 / 금요일 22:00** 고정 편성 (나는 솔로 / 이혼숙려캠프)
- 나머지 시간대는 **TMDB API** 기반 한국 드라마·영화 랜덤 추천
- 시청자가 직접 **편성 건의**를 남기고 커뮤니티 건의함에서 확인 가능
- 편성표를 **직접 수정**해 고정 편성으로 저장 가능 (localStorage 주간 유지)

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

### 📺 API 기반 추천 엔진

| 카드 | 기능 |
|------|------|
| 넷플릭스 TOP 10 | TMDB API로 국내 Netflix 인기 영화+드라마 10편 |
| OTT 통합 인기작 | Netflix·Disney+·wavve 통합 인기 영화+드라마 10편 |
| 랜덤 편성 생성 | 한국 드라마·영화 랜덤 추천으로 편성표 갱신 |
| 유튜브 인기 영상 | YouTube Data API v3 국내 인기 영상 TOP 12 |

### 💬 건의함 커뮤니티

| 기능 | 설명 |
|------|------|
| 프로그램 신청 | 프로그램명·카테고리·시간대·내용·닉네임 입력 |
| localStorage 영구 저장 | 새로고침해도 건의 목록 유지 |
| 1달 자동 초기화 | 첫 저장일 기준 30일 경과 시 자동 삭제 |
| 건의함 버튼 배지 | 헤더에 총 건의 수 빨간 배지 표시 |
| 커뮤니티 목록 | 카테고리·닉네임·날짜·내용 전체 열람 |

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
| **스타일** | CSS Modules (분리된 CSS) | — | 다크 퍼플 테마, 반응형 |
| **상태관리** | React useState / useCallback | — | 외부 라이브러리 없음 |
| **영구저장** | localStorage | — | 편성표·건의함 데이터 |

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
│   │   └── index.ts              # 전역 TypeScript 인터페이스/타입
│   │
│   ├── constants/
│   │   └── schedule.ts           # 기본 편성표 데이터 (BASE_SCHED), DAYS, TIMES
│   │
│   ├── utils/
│   │   ├── api.ts                # TMDB/YouTube TypeScript 래퍼
│   │   ├── tmdb.js               # TMDB API fetch 함수 (fetchOTT, fetchKoreanOTT)
│   │   ├── youtube.js            # YouTube API fetch 함수 (fetchYouTube)
│   │   ├── format.ts             # fmtViews() — 조회수 한국어 포맷
│   │   └── scheduleTime.ts       # toMin(), slotStatus(), dateToNowMin()
│   │
│   ├── hooks/
│   │   ├── useClock.ts           # 현재 시각 + todayIdx + nowMin (1분 인터벌)
│   │   ├── useSchedule.ts        # 편성표 상태·수정·랜덤화·localStorage 저장
│   │   ├── useApiCards.ts        # OTT/YouTube API 카드 상태·데이터 fetching
│   │   ├── useSuggestionForm.ts  # 건의 폼 상태·검증·localStorage 저장/1달 초기화
│   │   └── useFetch.js           # 범용 비동기 데이터 로딩 훅 (레거시)
│   │
│   ├── components/
│   │   ├── HeroSection.tsx        # 히어로 전체 (좌측 타이틀/버튼 + 우측 편성표)
│   │   ├── ScheduleTable.tsx      # 주간 편성표 7×3 테이블
│   │   ├── CellInner.tsx          # 편성표 셀 내부 (제목 + 태그, 고정 편성 분기)
│   │   ├── ApiSection.tsx         # API 추천 섹션 (설명 패널 + 4개 카드 + 결과 그리드)
│   │   ├── ApiCard.tsx            # API 추천 카드 단일 컴포넌트
│   │   ├── InfoSection.tsx        # 하단 정보 3종 카드 (운영시간/편성방식/갱신주기)
│   │   ├── SuggestionModal.tsx    # 프로그램 건의 모달 (폼 + 접수 완료)
│   │   ├── SuggestionBoard.tsx    # 건의함 목록 모달 (전체 건의 열람)
│   │   ├── ScheduleEditModal.tsx  # 주간 편성표 일괄 편집 모달 (요일 탭 + 슬롯 입력)
│   │   ├── EditCellModal.tsx      # 단일 셀 편집 모달 (미사용, 보존)
│   │   ├── Field.tsx              # 폼 필드 래퍼 (label + error)
│   │   ├── OttCard.jsx            # OTT 콘텐츠 포스터 카드 (레거시)
│   │   ├── OttSection.jsx         # OTT 섹션 UI (레거시)
│   │   ├── OttYoutubeExplorer.jsx # OTT·YouTube 탭 탐색기 (레거시)
│   │   ├── PillGroup.jsx          # 필터 Pill 버튼 그룹 (레거시)
│   │   ├── YtCard.jsx             # YouTube 영상 카드 (레거시)
│   │   └── YtSection.jsx          # YouTube 섹션 UI (레거시)
│   │
│   ├── styles/
│   │   ├── variables.css          # CSS 커스텀 프로퍼티 + 리셋
│   │   ├── header.css             # 헤더 + 건의함 버튼 + 모바일 메뉴
│   │   ├── hero.css               # 히어로 레이아웃 + 타이틀 그라디언트 + CTA 버튼
│   │   ├── schedule.css           # 편성표 카드·테이블·셀·태그 + 편집 모드
│   │   ├── api.css                # API 섹션 + OTT·YouTube 결과 그리드
│   │   ├── modal.css              # 모달·폼·건의함·주간편집 모달
│   │   ├── layout.css             # 정보 섹션 + CTA 배너 + 푸터 + FAB
│   │   └── responsive.css         # 반응형 (1024 / 768 / 640px 브레이크포인트)
│   │
│   ├── App.tsx                    # 루트 컴포넌트 (레이아웃 조합 + 모달 상태)
│   ├── App.css                    # @import 8줄 (styles/ 폴더 전체 로드)
│   ├── index.css                  # @font-face Cafe24Ssurround + body 배경
│   └── main.tsx                   # React DOM 마운트
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
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

# 3. Windows에서 rolldown 네이티브 바인딩 수동 설치 (필요 시)
npm install @rolldown/binding-win32-x64-msvc

# 4. 개발 서버 실행
npm run dev
# → http://localhost:5173
```

### 스크립트 목록

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite HMR 개발 서버 실행 |
| `npm run build` | TypeScript 컴파일 + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 로컬 미리보기 |
| `npm run lint` | ESLint 코드 검사 |

---

## 6. API 키 설정

### config.js 생성

```bash
# 템플릿 복사
cp src/config.example.js src/config.js
```

```js
// src/config.js
const config = {
  // TMDB API 키 (https://www.themoviedb.org/settings/api)
  TMDB_API_KEY: "여기에_입력",

  // TMDB 읽기 액세스 토큰 (Bearer 인증 — API 키보다 권장)
  TMDB_READ_TOKEN: "eyJhbGciOiJIUzI1NiJ9...",

  // YouTube Data API v3 키 (https://console.cloud.google.com)
  YOUTUBE_API_KEY: "AIzaSy...",

  // OAuth 2.0 자격증명 (공개 영상 조회에는 미사용)
  YOUTUBE_OAUTH_CLIENT_ID: "...",
  YOUTUBE_OAUTH_CLIENT_SECRET: "...",
};

export default config;
```

> ⚠️ `src/config.js`는 `.gitignore`에 등록되어 있어 Git에 업로드되지 않습니다.

### TMDB API 키 발급

1. [TMDB 회원가입](https://www.themoviedb.org/)
2. 계정 → **설정** → **API** → **API 키 (v3)** 발급
3. **읽기 액세스 토큰(Bearer)** 도 함께 복사하여 `TMDB_READ_TOKEN`에 입력

### YouTube API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. **API 및 서비스 → 라이브러리 → YouTube Data API v3** 활성화
4. **사용자 인증 정보 → API 키** 발급 후 `YOUTUBE_API_KEY`에 입력
5. 일일 무료 할당량: 10,000 단위 (영상 목록 조회 = 1 단위)

---

## 7. 기능 상세 가이드

### 7-1. 편성표 보기

화면 상단 히어로 우측에 **이번 주 편성표 미리보기** 카드가 있습니다.

- **오늘 요일**: 골드 색상 + 점 마커로 강조
- **고정 편성 셀**: 핑크 그라디언트 배경 + ⭐ 표시 (목 22:00 나는 솔로, 금 22:00 이혼숙려캠프)
- **현재 방송 중**: 초록 테두리 + 점 애니메이션
- **링크 클릭**: OTT 셀은 Netflix/wavve 페이지, 고정 편성 셀은 YouTube 다시보기로 이동

### 7-2. 편성표 수정하기

```
히어로 좌측 → "📝 편성표 수정하기" 버튼 클릭
→ 모달 오픈
→ 요일 탭 선택 (기본: 오늘 요일)
→ 슬롯별 프로그램명 입력 (고정 편성 슬롯은 잠금 표시)
→ 링크 입력 (선택)
→ "저장하기" 클릭 → 해당 슬롯이 ★ 고정 편성으로 변경
```

저장된 편성표는 **매주 월요일 새벽** 자동으로 초기화됩니다. (ISO 주차 기반)

### 7-3. 랜덤 편성 생성

```
히어로 좌측 → "⭐ 랜덤 편성 생성하기" 클릭
→ TMDB API에서 한국어 원작(with_original_language=ko) 드라마·영화 조회
→ 비고정 슬롯에 무작위 배치
→ 각 셀 클릭 시 TMDB 상세 페이지 이동
```

### 7-4. API 추천 카드 사용

**넷플릭스 TOP 10** 또는 **OTT 통합 인기작** 카드를 클릭하면 해당 플랫폼 인기 콘텐츠 그리드가 펼쳐집니다.
**유튜브 인기 영상** 카드를 클릭하면 국내 YouTube 인기 영상 TOP 12가 16:9 썸네일 그리드로 표시됩니다.
같은 카드를 다시 클릭하면 결과창이 닫힙니다.

### 7-5. 프로그램 건의

```
화면 우하단 FAB(+ 건의) 또는 모바일 메뉴 → "✏️ 프로그램 신청하기"
→ 폼 입력 (프로그램명 / 카테고리 / 희망 시간대 / 내용 / 닉네임)
→ 제출 → 접수 완료 화면
→ 데이터가 localStorage에 자동 저장
```

### 7-6. 건의함 열람

```
헤더 "건의함" 버튼 (빨간 배지에 총 건의 수 표시)
→ 전체 건의 목록 모달
→ 카테고리 이모지 / 닉네임 / 날짜 / 프로그램명 / 내용 확인
```

건의 목록은 **제출일 기준 30일 후** 자동 삭제됩니다.

---

## 8. 컴포넌트 레퍼런스

### `App.tsx` — 루트 컴포넌트

모든 훅을 초기화하고 레이아웃을 조합하는 최상위 컴포넌트입니다. 순수 레이아웃 역할만 담당합니다.

```
App
├── header (헤더 + 건의함 버튼 + 햄버거 메뉴)
├── HeroSection (히어로 + 편성표)
├── ApiSection (API 추천 카드)
├── InfoSection (정보 3종)
├── section.cta-banner (CTA 배너)
├── footer.site-footer
├── button.fab (프로그램 건의 FAB)
├── SuggestionModal (건의 폼 모달)
├── ScheduleEditModal (편성표 수정 모달)
└── SuggestionBoard (건의함 목록 모달)
```

---

### `HeroSection.tsx`

| Prop | 타입 | 설명 |
|------|------|------|
| `sched` | `Cell[][]` | 현재 편성표 7×3 배열 |
| `todayIdx` | `number` | 오늘 요일 인덱스 (0=월~6=일) |
| `nowMin` | `number` | 현재 분(당일 새벽 보정 포함) |
| `randing` | `boolean` | 랜덤 생성 로딩 중 여부 |
| `handleRandomize` | `() => void` | 랜덤 편성 생성 트리거 |
| `onOpenScheduleEdit` | `() => void` | 편성표 수정 모달 오픈 트리거 |

---

### `ScheduleTable.tsx`

| Prop | 타입 | 설명 |
|------|------|------|
| `sched` | `Cell[][]` | 편성표 데이터 |
| `todayIdx` | `number` | 오늘 요일 |
| `nowMin` | `number` | 현재 분 |
| `isEditMode` | `boolean` | 셀 편집 모드 활성 여부 |
| `onEditCell` | `(di, ti) => void` | 셀 클릭 콜백 (편집 모드 시) |

---

### `CellInner.tsx`

| Prop | 타입 | 설명 |
|------|------|------|
| `cell` | `Cell` | 셀 데이터 객체 |
| `isLive` | `boolean` | 현재 방송 중 여부 |

내부적으로 `calcFontSize(text)` 함수로 한글 문자폭을 계산해 `font-size`를 자동 조절합니다.

```ts
// 한글/CJK = 2배 가중치
function calcFontSize(text: string): string {
  const weight = [...text].reduce((acc, ch) => acc + (isWide(ch) ? 2 : 1), 0);
  if (weight <= 8)  return '12px';
  if (weight <= 12) return '11px';
  if (weight <= 16) return '10px';
  if (weight <= 20) return '9px';
  return '8px';
}
```

---

### `ApiSection.tsx`

4개 카드 (넷플릭스 TOP10 / OTT통합 / 랜덤생성 / 유튜브) + 선택 시 결과 그리드

| Prop | 타입 | 설명 |
|------|------|------|
| `activeApi` | `ApiType \| null` | 현재 열린 API 결과 타입 |
| `ottItems` | `OttItem[]` | OTT 결과 배열 |
| `ytItems` | `YtItem[]` | YouTube 결과 배열 |
| `ottLoading` | `boolean` | 로딩 중 |
| `ottError` | `string` | 에러 메시지 |
| `randing` | `boolean` | 랜덤 생성 중 |
| `handleApiCard` | `(type) => Promise<void>` | 카드 클릭 핸들러 |
| `handleRandomize` | `() => void` | 랜덤 생성 핸들러 |

---

### `ScheduleEditModal.tsx`

| Prop | 타입 | 설명 |
|------|------|------|
| `sched` | `Cell[][]` | 현재 편성표 |
| `onSaveAll` | `(edits) => void` | 변경사항 일괄 저장 콜백 |
| `onClose` | `() => void` | 모달 닫기 |

---

### `SuggestionModal.tsx` / `SuggestionBoard.tsx`

`SuggestionModal`: 건의 입력 폼 모달 (5개 필드 + 유효성 검사)
`SuggestionBoard`: 전체 건의 목록 열람 모달

---

## 9. 커스텀 훅 레퍼런스

### `useClock()`

```ts
const { now, todayIdx, nowMin } = useClock();
```

| 반환값 | 타입 | 설명 |
|--------|------|------|
| `now` | `Date` | 현재 시각 (1분마다 업데이트) |
| `todayIdx` | `number` | 0(월)~6(일) |
| `nowMin` | `number` | 현재 분 (새벽 0~5시는 +1440 보정) |

---

### `useSchedule()`

```ts
const { sched, randing, isEditMode, handleRandomize, updateCell, updateMany, resetCell, toggleEditMode } = useSchedule();
```

| 반환값 | 타입 | 설명 |
|--------|------|------|
| `sched` | `Cell[][]` | 현재 편성표 7×3 |
| `randing` | `boolean` | 랜덤 생성 로딩 중 |
| `isEditMode` | `boolean` | 셀 편집 모드 활성 여부 |
| `handleRandomize` | `() => Promise<void>` | TMDB 기반 랜덤 편성 생성 |
| `updateCell` | `(di, ti, title, link?) => void` | 단일 셀 고정 편성 업데이트 |
| `updateMany` | `(edits[]) => void` | 복수 셀 일괄 업데이트 |
| `resetCell` | `(di, ti) => void` | 단일 셀 기본값 초기화 |
| `toggleEditMode` | `() => void` | 편집 모드 토글 |

**localStorage 저장 구조:**
```json
{
  "week": "2026-W23",
  "data": [[ {...}, {...}, {...} ], ...]
}
```
ISO 주차가 다르면 자동으로 `BASE_SCHED`로 초기화됩니다.

---

### `useApiCards()`

```ts
const { activeApi, ottItems, ytItems, ottLoading, ottError, handleApiCard } = useApiCards();
```

| 반환값 | 타입 | 설명 |
|--------|------|------|
| `activeApi` | `'netflix' \| 'ott' \| 'youtube' \| null` | 현재 활성 API 타입 |
| `ottItems` | `OttItem[]` | OTT 결과 |
| `ytItems` | `YtItem[]` | YouTube 결과 |
| `ottLoading` | `boolean` | 로딩 중 |
| `ottError` | `string` | 에러 메시지 |
| `handleApiCard` | `(type) => Promise<void>` | 같은 타입 재클릭 시 닫힘 |

---

### `useSuggestionForm()`

```ts
const { form, setForm, errors, modalOpen, submitted, suggestions, openModal, closeModal, setSubmitted, validate } = useSuggestionForm();
```

| 반환값 | 설명 |
|--------|------|
| `form` | 현재 입력값 객체 (`SuggForm`) |
| `errors` | 필드별 에러 메시지 |
| `suggestions` | localStorage에 저장된 전체 건의 목록 |
| `openModal` | 폼 초기화 + 모달 오픈 |
| `validate` | 유효성 검사 + 성공 시 localStorage 저장 |

**localStorage 저장 구조:**
```json
// "dadnosleep-suggestions"
[
  {
    "id": "1717200000000-abc12",
    "title": "나는 솔로",
    "category": "예능",
    "time": "목요일 밤 10시",
    "desc": "고정 편성으로 넣어주세요!",
    "nick": "시청자123",
    "createdAt": "2026-06-01T12:00:00.000Z"
  }
]

// "dadnosleep-suggestions-saved-at"
"2026-06-01T12:00:00.000Z"
```

---

## 10. CSS 아키텍처

`App.css`는 순수 `@import` 8줄만 포함합니다.

```
src/styles/
├── variables.css   ← :root CSS 변수 (색상, 폰트, 배경)
├── header.css      ← .header, .logo, .btn-board, .hamburger, .mobile-nav
├── hero.css        ← .hero, .hero-left, .hero-right, .site-title (그라디언트), 버튼
├── schedule.css    ← .sched-card, .sched-tbl, .cell-inner, .tag, 편집 모드
├── api.css         ← .api-section, .api-layout, .api-card, OTT/YouTube 그리드
├── modal.css       ← .modal, 폼, 건의함, 주간편집 모달
├── layout.css      ← .info-section, .cta-banner, .site-footer, .fab
└── responsive.css  ← @media (1024 / 768 / 640px)
```

### 핵심 CSS 변수

```css
:root {
  --bg:        #0f0a1f;          /* 전체 배경 */
  --bg2:       #1a1530;          /* 카드 배경 */
  --bg-card:   rgba(30,25,50,0.7);
  --text:      #fff;
  --text-sub:  #e0e0ff;
  --text-dim:  #a8a8c0;
  --coral:     #ff6b8a;          /* 주요 액센트 */
  --coral2:    #ff8b5a;          /* 그라디언트 끝 */
  --gold:      #ffd57a;          /* 시간 표기 / 고정 편성 */
  --font-body: 'Noto Sans KR';
  --font-num:  'Poppins';        /* 숫자·시간 전용 */
}
```

---

## 11. localStorage 데이터 구조

| 키 | 타입 | 설명 | 초기화 주기 |
|----|------|------|-------------|
| `dadnosleep-sched` | `{week, data}` JSON | 주간 편성표 | 매주 ISO 주차 변경 시 |
| `dadnosleep-suggestions` | `SavedSuggestion[]` JSON | 건의 목록 | 저장일 기준 30일 경과 시 |
| `dadnosleep-suggestions-saved-at` | ISO date string | 건의 최초 저장일 | 건의 목록과 함께 삭제 |

---

## 12. 편성표 데이터 커스터마이징

`src/constants/schedule.ts`의 `BASE_SCHED` 배열을 수정하세요.

```ts
// BASE_SCHED[dayIndex(0=월)][timeIndex(0=20:00, 1=22:00, 2=00:00)]
const BASE_SCHED: Cell[][] = [
  // 월(0)
  [
    { title: '랜덤 예능', sub: '랜덤', type: 'random', badge: '편성 추천', bt: 'pink' },
    { title: 'TOP 10 드라마', sub: 'Netflix', type: 'ott', badge: 'TOP 10', bt: 'orange',
      link: 'https://www.netflix.com/kr/' },
    { title: '심야 영화', sub: '오늘의 픽', type: 'ott', badge: '오늘의 픽', bt: 'blue' },
  ],
  // ... 화~일 동일 구조
  // 목(3)
  [
    { title: '커뮤니티 픽', sub: '커뮤니티', type: 'community', badge: '커뮤니티', bt: 'purple' },
    {
      title: '나는 솔로',   // ← 고정 편성
      sub: 'TV 조선 22:00',
      type: 'fixed',
      badge: '★ 고정 편성',
      bt: 'pink',
      link: 'https://www.youtube.com/results?search_query=나는솔로+최신+다시보기',
    },
    { title: '랜덤 예능', sub: '랜덤', type: 'random', badge: '편성 추천', bt: 'pink' },
  ],
];
```

### 태그 타입 색상표

| `bt` 값 | 색상 | 용도 예시 |
|---------|------|-----------|
| `'pink'` | 분홍 | 편성 추천 (랜덤), 고정 편성 |
| `'blue'` | 파랑 | 오늘의 픽 |
| `'orange'` | 주황 | TOP 10 |
| `'yellow'` | 노랑 | 실시간 인기 |
| `'purple'` | 보라 | 커뮤니티, 예고 |
| `'teal'` | 민트 | 일반 랜덤 추천 |
| `'green'` | 초록 | 특수 |

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
