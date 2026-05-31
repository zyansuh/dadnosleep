# dadnosleep 🌙

> **잠 못 드는 밤을 함께하는 스트리머 편성표 & 콘텐츠 탐색 웹앱**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [주요 기능](#2-주요-기능)
3. [스크린샷](#3-스크린샷)
4. [기술 스택](#4-기술-스택)
5. [폴더 구조](#5-폴더-구조)
6. [설치 및 실행](#6-설치-및-실행)
7. [API 키 설정](#7-api-키-설정)
8. [컴포넌트 상세](#8-컴포넌트-상세)
9. [커스터마이징 가이드](#9-커스터마이징-가이드)
10. [기여 방법](#10-기여-방법)
11. [라이선스](#11-라이선스)

---

## 1. 프로젝트 소개

**dadnosleep**은 스트리머/크리에이터의 방송 편성표를 한눈에 보고,
시청자가 원하는 프로그램을 직접 건의할 수 있는 **React 기반 SPA(Single Page Application)**입니다.

이름처럼 *"잠 못 드는 아빠(dad)"*를 모티프로, 밤늦게도 즐길 수 있는 방송 스케줄을 제공하는 것을 목표로 만들어졌습니다.

추가로 **TMDB API**를 연동한 OTT 인기 콘텐츠 순위와  
**YouTube Data API v3**를 연동한 국내 인기 영상 탐색 기능도 내장되어 있습니다.

---

## 2. 주요 기능

### 📅 방송 편성표 (Schedule Board)

| 기능 | 설명 |
|------|------|
| 요일별 편성표 | 월~일 7개 탭으로 요일별 편성 확인 |
| 방송 상태 배지 | `LIVE` (현재 방송 중) / `예정` / `종료` 세 가지 상태 표시 |
| 카테고리 색상 구분 | 음악 · 토크 · 게임 · 영화 · 교양 · 특집 6개 카테고리별 컬러 코딩 |
| 실시간 LIVE 카드 | 헤더 및 히어로 영역에 현재 방송 프로그램 강조 표시 |
| 현재 시간 표시 | 헤더 우측 실시간 시각 렌더링 |

### 💬 편성표 건의 모달 (Suggestion Modal)

| 기능 | 설명 |
|------|------|
| FAB 버튼 | 화면 우하단 `+ 건의` 플로팅 버튼으로 모달 오픈 |
| 건의 폼 | 프로그램명 · 카테고리 선택 · 희망 방송 시간 · 건의 내용 · 닉네임 입력 |
| 카테고리 그리드 | 6종 카테고리를 시각적 버튼으로 선택 |
| 유효성 검사 | 필수 항목 미입력 시 개별 에러 메시지 인라인 표시 |
| 접수 완료 화면 | 제출 후 입력 요약 화면으로 전환 (애니메이션 포함) |
| 배경 클릭/X 버튼 닫기 | 오버레이 클릭 또는 X 버튼으로 모달 닫기 |

### 📺 OTT 순위 탐색 (TMDB 연동)

| 기능 | 설명 |
|------|------|
| 플랫폼 필터 | Netflix · Disney+ · wavve · Apple TV+ · 전체 인기 선택 |
| 콘텐츠 타입 | 영화 / 드라마·TV 전환 |
| 포스터 카드 | 랭크 번호 · 포스터 이미지 · 평점 · 출시연도 표시 |
| TMDB 상세 링크 | 카드 클릭 시 TMDB 상세 페이지로 이동 |

### ▶ 유튜브 인기 영상 탐색 (YouTube Data API 연동)

| 기능 | 설명 |
|------|------|
| 카테고리 필터 | 전체 · 코미디 · 엔터테인먼트 · 인물/블로그 · 음악 · 스포츠 · 과학/기술 |
| 랜덤 셔플 | 불러온 영상 목록을 랜덤으로 재정렬 |
| 조회수 포매팅 | 숫자 → `1.2억회` / `34만회` 형식으로 자동 변환 |
| 재생 오버레이 | 카드 호버 시 재생 아이콘 오버레이 표시 |
| YouTube 링크 | 카드 클릭 시 YouTube 영상 페이지로 이동 |

---

## 3. 스크린샷

> 다크 테마 기반의 모던 UI

```
┌──────────────────────────────────────────────────────┐
│  🔴 dadnosleep • 편성표          01:09  LIVE: 점심 영화  │
├──────────────────────────────────────────────────────┤
│                                                      │
│   dadnosleep              ┌─────────────────────┐   │
│   편성표                  │ 🔴 현재 방송 중       │   │
│                           │  점심 영화 특선       │   │
│   잠들기 전 편성표...      │  시네마 클럽          │   │
│                           └─────────────────────┘   │
│                                                      │
│  [월][화][수][목][금][토][일]                          │
│                                                      │
│  00:00  ━━  심야 음악 여행  · DJ 문라이트  [종료]       │
│  02:00  ━━  새벽 힐링 토크  · 라디오 수다방 [종료]      │
│  12:00  ━━  점심 영화 특선  · 시네마 클럽   [LIVE🔴]   │
│  14:00  ━━  오후 음악 파티  · DJ 애프터눈   [예정]      │
│                                                      │
│                                       [+ 건의 FAB]   │
└──────────────────────────────────────────────────────┘
```

---

## 4. 기술 스택

| 구분 | 기술 | 버전 | 역할 |
|------|------|------|------|
| **프레임워크** | React | 19 | UI 렌더링, 컴포넌트 기반 개발 |
| **언어** | TypeScript | 6.0 | 타입 안전성, 인터페이스 정의 |
| **번들러** | Vite | 8 | 초고속 개발 서버 및 빌드 |
| **아이콘** | lucide-react | latest | 벡터 아이콘 |
| **외부 API** | TMDB API v3 | — | OTT 콘텐츠 순위 |
| **외부 API** | YouTube Data API v3 | — | 국내 인기 유튜브 영상 |
| **스타일** | CSS Variables + Vanilla CSS | — | 다크 테마, 반응형 레이아웃 |

### 설계 원칙

- **컴포넌트 분리**: UI 단위를 최소 단위로 쪼개어 재사용성 확보
- **Custom Hook**: `useFetch` 로 비동기 데이터 로딩 로직 단일화
- **CSS Custom Properties**: `:root` 변수로 전체 테마를 한 곳에서 관리
- **No External State Library**: React 내장 `useState` / `useCallback` 만으로 상태 관리

---

## 5. 폴더 구조

```
dadnosleep/
├── public/                    # 정적 파일
├── src/
│   ├── components/            # UI 컴포넌트
│   │   ├── OttCard.jsx        # OTT 콘텐츠 카드 (포스터 + 랭크)
│   │   ├── OttSection.jsx     # OTT 섹션 (플랫폼/타입 필터 + 그리드)
│   │   ├── OttYoutubeExplorer.jsx  # OTT & YouTube 탐색기 (탭 전환)
│   │   ├── PillGroup.jsx      # 재사용 가능한 필터 Pill 버튼 그룹
│   │   ├── YtCard.jsx         # 유튜브 영상 카드 (썸네일 + 정보)
│   │   └── YtSection.jsx      # 유튜브 섹션 (카테고리 필터 + 그리드)
│   ├── hooks/
│   │   └── useFetch.js        # 비동기 데이터 로딩 Custom Hook
│   ├── utils/
│   │   ├── tmdb.js            # TMDB API 호출 함수 및 상수
│   │   └── youtube.js         # YouTube API 호출 함수 및 상수
│   ├── App.tsx                # 편성표 메인 페이지 (홈)
│   ├── App.css                # 편성표 페이지 스타일
│   ├── config.js              # API 키 설정 파일 (로컬 전용)
│   ├── index.css              # 전역 스타일 및 CSS 변수
│   └── main.tsx               # React 앱 진입점
├── index.html                 # HTML 엔트리
├── vite.config.ts             # Vite 설정
├── tsconfig.json              # TypeScript 설정
└── package.json
```

---

## 6. 설치 및 실행

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

# 3. (Windows 한정) rolldown 네이티브 바인딩 수동 설치
npm install @rolldown/binding-win32-x64-msvc

# 4. 개발 서버 실행
npm run dev
# → http://localhost:5173 에서 확인
```

### 빌드 및 미리보기

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview
```

### 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite 개발 서버 시작 (HMR 지원) |
| `npm run build` | TypeScript 컴파일 + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 로컬 서버로 미리보기 |
| `npm run lint` | ESLint 코드 검사 |

---

## 7. API 키 설정

OTT 순위 및 YouTube 탐색 기능을 사용하려면 각각의 API 키가 필요합니다.

### TMDB API 키 발급

1. [TMDB](https://www.themoviedb.org/) 회원가입
2. **설정 → API → API 키 (v3 auth)** 에서 키 복사
3. 무료 플랜으로 충분 (하루 40,000 요청)

### YouTube Data API v3 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 (또는 기존 프로젝트 선택)
3. **API 및 서비스 → 라이브러리 → YouTube Data API v3** 활성화
4. **사용자 인증 정보 → API 키** 생성 후 복사
5. 무료 할당량: 하루 10,000 단위 (영상 목록 조회 = 1 단위)

### 키 입력 방법

```js
// src/config.js
const config = {
  TMDB_API_KEY:    "여기에_TMDB_키_입력",
  YOUTUBE_API_KEY: "여기에_YouTube_키_입력",
};

export default config;
```

> ⚠️ **보안 주의**: `src/config.js`는 `.gitignore`에 추가하여 키가 GitHub에 올라가지 않도록 하세요.

```gitignore
# .gitignore 에 추가
src/config.js
```

---

## 8. 컴포넌트 상세

### `App.tsx` — 편성표 메인 페이지

편성표 전체 레이아웃을 담당하는 루트 컴포넌트입니다.

**주요 State**

| 상태 | 타입 | 역할 |
|------|------|------|
| `selectedDay` | `number` | 현재 선택된 요일 인덱스 (0=월 ~ 6=일) |
| `isModalOpen` | `boolean` | 건의 모달 표시 여부 |
| `isSubmitted` | `boolean` | 건의 폼 제출 완료 여부 |
| `form` | `SuggestionForm` | 건의 폼 입력값 객체 |
| `errors` | `Partial<SuggestionForm>` | 유효성 검사 에러 메시지 객체 |

**주요 인터페이스**

```typescript
interface ScheduleItem {
  id: number;
  time: string;        // "HH:MM" 형식
  title: string;
  host: string;
  category: string;    // 'music' | 'talk' | 'game' | 'movie' | 'edu' | 'special'
  status: 'live' | 'upcoming' | 'past';
  duration: string;    // "N분" 형식
  description: string;
}

interface SuggestionForm {
  title: string;
  category: string;
  preferredTime: string;
  description: string;
  nickname: string;
}
```

---

### `useFetch.js` — 비동기 데이터 로딩 Hook

API 호출의 loading / error / data 상태를 일괄 관리하는 Custom Hook입니다.

```js
const { data, loading, error, run } = useFetch();

// 사용 예시
run(() => fetchOTT("8", "movie"));
```

| 반환값 | 타입 | 설명 |
|--------|------|------|
| `data` | `any[]` | 불러온 데이터 배열 |
| `loading` | `boolean` | 로딩 중 여부 |
| `error` | `string \| null` | 에러 메시지 |
| `run` | `(asyncFn) => void` | 비동기 함수 실행 트리거 |
| `setData` | `Dispatch` | 데이터 직접 조작 (셔플 등) |

---

### `PillGroup.jsx` — 재사용 가능한 필터 버튼

```jsx
<PillGroup
  items={[{ id: "8", label: "Netflix" }, ...]}
  active="8"
  onSelect={(id) => setProvider(id)}
  colorActive="#e50914"
/>
```

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `items` | `{ id: string; label: string }[]` | 필수 | 버튼 목록 |
| `active` | `string` | 필수 | 현재 활성화된 id |
| `onSelect` | `(id: string) => void` | 필수 | 선택 콜백 |
| `colorActive` | `string` | `"#e50914"` | 활성 상태 배경색 |

---

### `OttCard.jsx` — OTT 콘텐츠 카드

TMDB API 응답의 단일 아이템을 카드 형태로 렌더링합니다.

- 포스터 이미지 없을 경우 기본 이모지 표시
- 클릭 시 TMDB 상세 페이지 새 탭 오픈
- 호버 시 `translateY(-4px)` 애니메이션

---

### `YtCard.jsx` — YouTube 영상 카드

YouTube Data API 응답의 단일 영상 아이템을 카드 형태로 렌더링합니다.

- 16:9 비율 썸네일
- 호버 시 재생 버튼 오버레이 페이드인
- 클릭 시 YouTube 영상 페이지 새 탭 오픈
- 조회수를 한국어 단위(`억회`, `만회`)로 포매팅

---

## 9. 커스터마이징 가이드

### 편성표 데이터 수정

`src/App.tsx`의 `SCHEDULE_DATA` 배열을 수정하세요.

```typescript
const SCHEDULE_DATA: ScheduleItem[] = [
  {
    id: 1,
    time: '20:00',
    title: '저녁 라이브',
    host: '스트리머닉네임',
    category: 'game',           // 카테고리 ID
    status: 'upcoming',         // 'live' | 'upcoming' | 'past'
    duration: '180분',
    description: '저녁 8시 게임 라이브 방송',
  },
  // ...
];
```

### 카테고리 추가/수정

```typescript
const CATEGORIES = [
  { id: 'music', label: '음악', icon: Music },
  // 새 카테고리 추가:
  { id: 'cooking', label: '쿠킹', icon: ChefHat },
];

const categoryColors: Record<string, string> = {
  music: '#6c63ff',
  cooking: '#ff9f43',   // 새 카테고리 색상 추가
};
```

### 테마 색상 변경

`src/index.css`의 `:root` 변수를 수정하세요.

```css
:root {
  --primary: #6c63ff;        /* 메인 보라색 */
  --accent:  #ff6584;        /* 강조 핑크색 */
  --bg-dark: #0f0f14;        /* 배경 최어둠 */
  --bg-card: #1a1a24;        /* 카드 배경 */
  --live:    #ff4757;        /* LIVE 빨강 */
  --upcoming: #2ed573;       /* 예정 초록 */
}
```

### OTT 플랫폼 추가

`src/utils/tmdb.js`의 `PROVIDERS` 배열에 추가하세요.  
플랫폼 ID는 [TMDB Watch Providers](https://www.themoviedb.org/settings/api)에서 확인할 수 있습니다.

```js
export const PROVIDERS = [
  { id: "8",    label: "Netflix" },
  { id: "337",  label: "Disney+" },
  { id: "356",  label: "wavve" },
  { id: "97",   label: "Apple TV+" },
  { id: "626",  label: "Tving" },    // 추가 예시
  { id: "0",    label: "전체 인기" },
];
```

---

## 10. 기여 방법

이슈나 PR은 언제나 환영합니다!

```bash
# 1. 저장소 포크
# 2. 기능 브랜치 생성
git checkout -b feat/기능명

# 3. 변경 사항 커밋
git commit -m "feat: 기능 설명"

# 4. 포크한 저장소에 푸시
git push origin feat/기능명

# 5. Pull Request 생성
```

### 커밋 메시지 컨벤션

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `style` | 코드 포매팅, 세미콜론 등 (로직 변경 없음) |
| `refactor` | 코드 리팩토링 |
| `docs` | 문서 수정 |
| `chore` | 빌드 설정, 패키지 업데이트 등 |

---

## 11. 라이선스

[MIT License](LICENSE) © 2026 zyansuh

---

<div align="center">
  <sub>Made with ❤️ by <a href="https://github.com/zyansuh">zyansuh</a></sub>
</div>
