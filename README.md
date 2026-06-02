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
3. [사용자 등급 & 인증](#3-사용자-등급--인증)
4. [기술 스택](#4-기술-스택)
5. [폴더 구조](#5-폴더-구조)
6. [설치 및 실행](#6-설치-및-실행)
7. [환경변수 설정](#7-환경변수-설정)
8. [Discord OAuth 설정](#8-discord-oauth-설정)
9. [Vercel 배포](#9-vercel-배포)
10. [기능 상세 가이드](#10-기능-상세-가이드)
11. [데이터 저장 구조](#11-데이터-저장-구조)
12. [관리자 가이드](#12-관리자-가이드)
13. [CSS 아키텍처](#13-css-아키텍처)
14. [기여 방법](#14-기여-방법)
15. [라이선스](#15-라이선스)

---

## 1. 프로젝트 소개

**아빠안잔다**는 심야 방송 채널의 **주간 OTT 편성표**와 **시청자 커뮤니티**를 제공하는 React 기반 웹 애플리케이션입니다.

| 영역 | 설명 |
|------|------|
| 편성표 | 목·금 고정 편성 + TMDB 랜덤 추천, 셀 편집·고정·초기화 |
| 회원 전용 | 동호회 회원(VIP 행) — Discord 화이트리스트 기반 |
| 커뮤니티 | 후기 작성·수정·삭제, JSONBin 동기화, 포인트 랭킹 |
| 인증 | Discord OAuth2, 3단계 등급(guest / member / admin) |
| 관리 | `/admin` 대시보드, 회원 명단 JSONBin 관리 |

---

## 2. 주요 기능

### 📅 편성표

| 기능 | 설명 |
|------|------|
| 7일 × 3슬롯 + VIP 회원 행 | 월~일 20:00 / 22:00 / 00:00 + 회원 전용 편성 |
| 고정 편성 | 목·금 22:00 등 — 고정 지정/해제, 초기화 시 고정만 유지 |
| 랜덤 편성 | TMDB 한국어 콘텐츠 → **미리보기 모달**에서 선택 후 적용 |
| 셀 편집 모드 | 관리자 — 셀 클릭 수정, 고정 해제 |
| LIVE 표시 | 현재 시각 기준 방송 중 슬롯 강조 |
| localStorage | ISO 주차별 편성표·회원 행 저장 |

### 📺 API 추천 & 드로어

| 기능 | 설명 |
|------|------|
| 넷플릭스 / OTT 통합 / YouTube | TMDB·YouTube API 카드 |
| MediaDrawer | OTT 통합·랜덤 추천 목록 슬라이드 패널 |

### 💬 커뮤니티

| 기능 | 설명 |
|------|------|
| 후기 CRUD | 작성·수정·삭제 (본인 닉네임 또는 관리자) |
| JSONBin 동기화 | PC·모바일 동일 데이터, 오프라인 시 localStorage fallback |
| 레거시 마이그레이션 | `dadnosleep-reviews-v1` → JSONBin 1회 병합 |
| 포인트 | 후기 1건당 1,500P, 랭킹 표시 |

### 🔐 인증 & 등급

| 기능 | 설명 |
|------|------|
| Discord 로그인 | OAuth2 `identify` 스코프 |
| guest / member / admin | 등급별 콘텐츠·관리 권한 분리 |
| 닉네임 변경 | member — 프로필 메뉴에서 사이트 표시명 수정 |
| 푸터 관리자 | 비밀번호 세션(탭 닫으면 만료) — `/admin` 보조 진입 |

### 🛠 관리자

| 기능 | 설명 |
|------|------|
| 편성표 수정·초기화 | 고정 편성 제외 슬롯 비우기(확인 모달) |
| 후기 관리 | 타인 후기 삭제·수정 |
| 회원 명단 | Discord ID·username·닉네임 CRUD (JSONBin) |

---

## 3. 사용자 등급 & 인증

### 등급 정의

| 등급 | 조건 | 회원 전용 편성 | 관리 기능 |
|------|------|:-------------:|:---------:|
| **guest** | 비로그인, 또는 로그인했으나 명단 미등록 | ❌ | ❌ |
| **member** | `VITE_JSONBIN_BIN_MEMBERS`에 Discord ID 등록 | ✅ | ❌ |
| **admin** | Discord username이 `1000hyehyang1`, `sweet__rain` | ✅ | ✅ |

### 표시 이름 우선순위

```
nickname (사이트 커스텀) → globalName (Discord) → username
```

### 로그인 흐름

```
[Discord 로그인] → /auth/callback
  → POST /api/discord-callback (code → 토큰 → @me)
  → 등급 판별 + 회원이면 JSONBin avatar/globalName 동기화
  → sessionStorage 저장 → 메인(/) 리다이렉트
```

### sessionStorage (탭 닫으면 만료)

| 키 | 설명 |
|----|------|
| `isLoggedIn` | `true` |
| `discordId`, `username`, `globalName`, `avatar` | Discord 프로필 |
| `nickname` | 사이트 표시명 |
| `role` | `guest` \| `member` \| `admin` |
| `isAdmin` | 관리자 여부 (`true` / `false`) |

---

## 4. 기술 스택

| 구분 | 기술 | 역할 |
|------|------|------|
| UI | React 19 + TypeScript 6 | 컴포넌트·타입 |
| 빌드 | Vite 8 | HMR, 프로덕션 번들 |
| 라우팅 | react-router-dom 7 | `/`, `/auth/callback`, `/admin/*` |
| 아이콘 | lucide-react | UI 아이콘 |
| API | TMDB, YouTube Data API v3 | OTT·영상 추천 |
| 저장 | localStorage, JSONBin, sessionStorage | 편성·후기·회원 명단·세션 |
| 서버 | Vercel Serverless (`api/`) | Discord OAuth, (선택) 이메일 JWT |
| 배포 | Vercel + `vercel.json` SPA rewrite | GitHub 연동 배포 |

---

## 5. 폴더 구조

```
dadnosleep/
├── api/
│   ├── discord-callback.js      # Discord OAuth code → 사용자 정보
│   └── auth/                    # (선택) 이메일 register/login/me
├── server/
│   ├── auth/                    # JWT·비밀번호·JSONBin 사용자 (dev 미들웨어)
│   └── discord/                 # OAuth 토큰 교환 (dev 미들웨어)
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx         # 메인 (홈/커뮤니티 탭)
│   │   ├── AuthCallbackPage.tsx # Discord OAuth 콜백
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx
│   │       └── AdminMembersPage.tsx   # 회원 명단 관리
│   ├── components/
│   │   ├── admin/AdminLayout.tsx
│   │   ├── DiscordLoginButton.tsx
│   │   ├── ProfileMenu.tsx      # 닉네임 변경 / 로그아웃
│   │   ├── NicknameChangeModal.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── MediaDrawer.tsx
│   │   ├── RandomPickModal.tsx
│   │   ├── SiteFooter.tsx
│   │   └── community/ ...
│   ├── context/
│   │   ├── DiscordAuthContext.tsx
│   │   ├── AdminGateContext.tsx
│   │   └── ToastContext.tsx
│   ├── utils/
│   │   ├── membersStore.ts      # JSONBin 회원 화이트리스트
│   │   ├── communityStore.ts    # JSONBin 후기·포인트
│   │   ├── processDiscordLogin.ts
│   │   ├── discordSession.ts
│   │   └── adminSession.ts
│   ├── constants/adminUsers.ts  # 관리자 Discord username
│   └── types/role.ts, member.ts
├── vercel.json                  # SPA + /api 라우팅
├── .env.example
└── package.json
```

---

## 6. 설치 및 실행

### 사전 요구사항

- **Node.js** v20.19+ (권장 v22+)
- **npm** v10+

### 로컬 실행

```bash
git clone https://github.com/zyansuh/dadnosleep.git
cd dadnosleep
npm install
cp .env.example .env.local
# .env.local 값 입력 (7·8절 참고)
npm run dev
# → http://localhost:5173
```

> Windows에서 rolldown 바인딩 오류 시: `npm install @rolldown/binding-win32-x64-msvc`

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (Discord API는 Vite 미들웨어로 프록시) |
| `npm run build` | `tsc -b` + 프로덕션 빌드 |
| `npm run preview` | 빌드 미리보기 |
| `npm run lint` | ESLint |

---

## 7. 환경변수 설정

```bash
cp .env.example .env.local
```

### 클라이언트 (`VITE_*` — 브라우저 노출)

| 변수 | 필수 | 설명 |
|------|:----:|------|
| `VITE_TMDB_API_KEY` | ○ | TMDB API v3 키 |
| `VITE_TMDB_READ_TOKEN` | 권장 | TMDB Bearer 토큰 |
| `VITE_YOUTUBE_API_KEY` | ○ | YouTube Data API v3 |
| `VITE_JSONBIN_BIN_ID` | ○ | 후기·포인트 Bin ID |
| `VITE_JSONBIN_BIN_MEMBERS` | ○ | 동호회 회원 명단 Bin ID |
| `VITE_JSONBIN_ACCESS_KEY` | ○ | JSONBin Access Key (읽기/쓰기) |
| `VITE_DISCORD_CLIENT_ID` | ○ | Discord 앱 Client ID |
| `VITE_DISCORD_REDIRECT_URI` | ○ | 예: `http://localhost:5173/auth/callback` |
| `VITE_ADMIN_PASSWORD` | △ | 푸터 관리자 비밀번호 (선택) |

### 서버 전용 (Vercel·로컬 — **절대 Git 커밋 금지**)

| 변수 | 설명 |
|------|------|
| `DISCORD_CLIENT_ID` | Discord Client ID (`VITE_`와 동일 값) |
| `DISCORD_CLIENT_SECRET` | Discord Client Secret |
| `DISCORD_REDIRECT_URI` | OAuth Redirect URI (프로덕션 URL 포함) |
| `JWT_SECRET` | (선택) 이메일 회원 JWT |
| `JSONBIN_USERS_BIN_ID` | (선택) 이메일 회원 저장 Bin |
| `ADMIN_EMAILS` | (선택) 이메일 가입 시 admin 역할 |

---

## 8. Discord OAuth 설정

1. [Discord Developer Portal](https://discord.com/developers/applications) → 애플리케이션 생성
2. **OAuth2 → Redirects**에 URI 등록:
   - 로컬: `http://localhost:5173/auth/callback`
   - 프로덕션: `https://your-domain.vercel.app/auth/callback`
3. **Client ID / Client Secret**을 `.env.local` 및 Vercel에 설정
4. 스코프: `identify` (로그인 URL에 포함됨)

### 관리자 계정

`src/constants/adminUsers.ts`:

```ts
export const ADMIN_USERS = ['1000hyehyang1', 'sweet__rain'];
```

위 Discord **username**으로 로그인 시 `admin` 등급이 부여됩니다.

---

## 9. Vercel 배포

1. GitHub 저장소 연결 → Import
2. **Settings → Environment Variables**에 7절 변수 전부 등록
3. `DISCORD_REDIRECT_URI`에 **프로덕션** 콜백 URL 사용
4. Discord Developer Portal Redirects에도 동일 URL 추가
5. 배포 후 **Redeploy** (환경변수 변경 시)

`vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

---

## 10. 기능 상세 가이드

### 편성표 — 관리자

1. Discord **admin** 계정으로 로그인
2. **편성표 수정하기** — 주간 일괄 편집 모달
3. **셀 편집 모드** — 셀 클릭 수정, 🔓 고정 해제
4. **초기화** — 고정 편성만 남기고 나머지 `EMPTY` 슬롯으로 (확인 모달)
5. **랜덤 편성 생성하기** — 후보 목록 모달에서 선택 적용

### 회원 전용 VIP 행

- **member / admin**: 콘텐츠·링크 열람
- **guest (비로그인)**: 잠금 + Discord 로그인 유도
- **guest (로그인만)**: *「현재 동호회 회원만 이용 가능한 콘텐츠입니다…」* 안내

### 닉네임 변경 (member)

헤더 프로필 클릭 → **닉네임 변경** → 2~20자 (한글·영문·숫자·`_`) → JSONBin + sessionStorage 반영

### 커뮤니티

- 후기 작성 시 1,500P 지급
- 본인 닉네임(`dadnosleep-my-nickname`) 또는 관리자만 수정·삭제
- JSONBin 실패 시 localStorage 저장 + 토스트 「오프라인 모드로 저장됩니다」

### 푸터 관리자 링크

- `VITE_ADMIN_PASSWORD` 일치 시 `isAdmin` 세션 → `/admin` (Discord admin과 별도)
- 5회 오류 시 30초 잠금

---

## 11. 데이터 저장 구조

### JSONBin — 후기 (`VITE_JSONBIN_BIN_ID`)

```json
{
  "reviews": [{ "id", "nickname", "programTitle", "rating", "content", "createdAt" }],
  "points": [{ "nickname", "points", "reviewCount" }]
}
```

### JSONBin — 회원 명단 (`VITE_JSONBIN_BIN_MEMBERS`)

```json
{
  "members": [
    {
      "discordId": "123456789012345678",
      "username": "discord_user",
      "globalName": "표시이름",
      "nickname": "사이트닉네임",
      "avatar": "hash",
      "role": "member",
      "joinedAt": "2026-06-02"
    }
  ]
}
```

> 로그인 시 등록 회원의 `avatar`, `globalName`, `username`은 Discord 최신값으로 자동 갱신됩니다.

### localStorage

| 키 | 설명 |
|----|------|
| `dadnosleep-sched` | 주간 편성표 + `memberRow` |
| `dadnosleep-suggestions` | 건의함 (30일 만료) |
| `dadnosleep-reviews-v1` | 후기 fallback / 마이그레이션 소스 |
| `dadnosleep-points-v1` | 포인트 fallback |
| `dadnosleep-my-nickname` | 후기 본인 식별용 |
| `reviews_migrated` | 레거시 → JSONBin 마이그레이션 완료 플래그 |

---

## 12. 관리자 가이드

### `/admin` 접근

- Discord **admin** 로그인 (`sessionStorage.isAdmin === true`)
- 또는 푸터 **관리자** → 비밀번호 인증

### 회원 명단 관리 (`/admin/members`)

| 작업 | 방법 |
|------|------|
| 추가 | Discord ID + username (필수) + 닉네임 (선택) |
| 닉네임 수정 | 테이블 닉네임 셀 클릭 또는 **수정** → 저장 |
| 제거 | **제거** → 확인 모달 → Bin에서 삭제 |

제거된 회원은 **다음 로그인부터 guest**가 되며 회원 전용 편성이 잠깁니다.

### JSONBin 초기 데이터

회원 Bin 생성 후 최소 본문:

```json
{ "members": [] }
```

---

## 13. CSS 아키텍처

`App.css`는 `@import`만 사용합니다.

```
variables.css   — 테마·배경 그라디언트
header.css      — 헤더·프로필
hero.css, schedule.css, api.css
modal.css, drawer.css
community.css, auth.css, discord.css
admin-page.css, toast.css
responsive.css  — 1024 / 768 / 640px
```

모바일에서는 `backdrop-filter` 비활성화, `background-attachment: fixed` 제거로 색상 통일.

---

## 14. 기여 방법

```bash
git checkout -b feat/기능명
# 변경 후
git commit -m "feat: 설명"
git push origin feat/기능명
# Pull Request
```

| 커밋 타입 | 설명 |
|-----------|------|
| `feat` | 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | README 등 문서 |
| `refactor` | 리팩토링 |
| `chore` | 빌드·의존성 |

---

## 15. 라이선스

[MIT License](LICENSE) © 2026 zyansuh

---

<div align="center">
  <sub>🛌 잠 못 드는 밤, 아빠안잔다와 함께하세요</sub><br/>
  <sub>Made with ❤️ by <a href="https://github.com/zyansuh">zyansuh</a></sub>
</div>
