# Plan-it Frontend
여행 일정 + 날씨 대시보드 (React + Vite + Tailwind CSS)

## 실행 방법
1) 의존성 설치
```cmd
npm install
```
2) 개발 서버 실행

```cmd
npm run dev
```

3) OpenWeather API 키(선택)
- `./.env` 파일을 만들고 아래 키를 추가하면 실시간 날씨를 가져옵니다. 키가 없으면 목업 데이터가 표시됩니다.

```
VITE_OPEN_WEATHER_KEY=여기에_키_입력
```

## 폴더 구조

### 컴포넌트 (`src/components`)

| 파일 | 설명 |
|------|------|
| `Layout.jsx` | 전체 레이아웃/사이드바/네비게이션 |
| `Card.jsx` | 카드 UI 래퍼 |
| `CalMini.jsx` | 미니 달력 위젯 |
| `Popover.jsx` | 팝오버(툴팁/알림) |
| `Protected.jsx` | 보호 라우트(로그인 필요 페이지) |
| `WeatherWidget.jsx` | 날씨 위젯 |

### UI 컴포넌트 (`src/components/ui`)

| 파일 | 설명 |
|------|------|
| `Button.jsx` | 재사용 가능한 버튼 (variant: primary/ghost/inverse/danger) |
| `Input.jsx` | 재사용 가능한 인풋 필드 |
| `FormField.jsx` | 라벨 + 인풋 조합 폼 필드 |
| `Empty.jsx` | 빈 상태 메시지 컴포넌트 |
| `Badge.jsx` | 배지/태그 컴포넌트 |
| `Separator.jsx` | 구분선 컴포넌트 |

### 페이지 (`src/pages`)

| 파일 | 설명 |
|------|------|
| `Home.jsx` | 홈(대시보드) - 캘린더, 메모, 인기 여행지, 날씨 |
| `Trips.jsx` | 여행 목록 |
| `TripEdit.jsx` | 여행 생성/수정 |
| `Community.jsx` | 커뮤니티(후기/댓글/좋아요) |
| `Login.jsx` | 로그인 |
| `Profile.jsx` | 프로필(사용자 정보) |

### 서비스 (`src/services`)

| 파일 | 설명 |
|------|------|
| `authService.js` | 인증(로그인/로그아웃/프로필) - LocalStorage 기반 |
| `communityService.js` | 커뮤니티(게시글/댓글/좋아요) |
| `eventService.js` | 여행 일정(이벤트/메모) |
| `storageService.js` | 여행 정보 CRUD |
| `weatherService.js` | 날씨(OpenWeather API 연동/목업) |

### 스타일 (`src/styles`)

| 파일 | 설명 |
|------|------|
| `index.css` | Tailwind CSS 임포트 + 글로벌 base 스타일 |

## 기능

- **홈**: 날씨 위젯, 미니 캘린더, 메모 작성, 기간 선택으로 여행 일정 생성, 인기 여행지 카드
- **여행**: LocalStorage 기반 CRUD, 체크리스트 관리
- **커뮤니티**: 후기 작성(텍스트/사진 업로드), 좋아요, 댓글, 삭제
- **로그인**: LocalStorage 기반 목업 인증(어떤 이메일/비밀번호도 로그인 가능), 보호 라우팅 적용

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.2.0 | UI 프레임워크 |
| Vite | 5.4.2 | 빌드 도구 |
| React Router | 6.26.2 | 클라이언트 라우팅 |
| Tailwind CSS | 4.1.14 | 유틸리티 기반 스타일링 |
| @tailwindcss/vite | 4.1.14 | Vite 플러그인 (PostCSS 불필요) |
| Axios | 1.7.7 | HTTP 클라이언트 |
| dayjs | 1.11.13 | 날짜 처리 |

## Tailwind CSS 설정

### `tailwind.config.js` 커스텀 테마

| 카테고리 | 커스텀 속성 | 설명 |
|---------|------------|------|
| **Colors** | `primary`, `bg`, `surface`, `text`, `sidebar`, `accent`, `panel` | 프로젝트 색상 팔레트 |
| **fontSize** | `xs`, `sm`, `lg`, `xl`, `2xl` | 타이포그래피 스케일 |
| **borderRadius** | `DEFAULT`, `lg`, `xl` | 일관된 모서리 반경 |
| **boxShadow** | `DEFAULT`, `sm`, `md`, `lg`, `button`, `card` | 그림자 변형 |
| **backgroundImage** | `gradient-primary`, `gradient-danger`, `gradient-sidebar`, `gradient-weather-*` | 그라디언트 프리셋 |
| **height/minHeight/maxHeight** | `dvh` | 동적 뷰포트 높이 지원 |

### Tailwind 전환 전후 비교

| 항목 | 이전 방식 | 현재 방식 |
|------|----------|----------|
| **스타일 구조** | CSS 파일 12개 분리 (`buttons.css`, `layout.css` 등) | `index.css` 하나 + Tailwind 유틸리티 클래스 |
| **컴포넌트 스타일** | CSS 클래스 (`.btn`, `.card`, `.sidebar`) | Tailwind 유틸리티 직접 사용 |
| **색상 관리** | CSS 변수 (`:root`) | `tailwind.config.js` theme.extend.colors |
| **재사용성** | CSS 클래스 상속 | UI 컴포넌트 (`Button`, `Input` 등) |
| **빌드 설정** | Vite + PostCSS | Vite + @tailwindcss/vite 플러그인 |
| **스타일 방식** | `@layer components` + `@apply` | 100% 유틸리티 클래스 |

## Tailwind 전환 상세

### 전환 완료 항목 ✅

- 모든 CSS 컴포넌트 파일 삭제 (12개)
- `tailwind.config.js`에서 색상/폰트/그라디언트/그림자 토큰화
- 재사용 가능한 UI 컴포넌트 생성 (Button, Input, FormField 등)
- 모든 페이지와 컴포넌트를 Tailwind 유틸리티로 변환
- PostCSS 제거, Vite 플러그인으로 대체
- 반응형 디자인 유지
- 동적 스타일(인라인 style) 최소화

### 주요 변경 사항

```diff
- src/styles/components/buttons.css (삭제)
- src/styles/components/layout.css (삭제)
- ... (CSS 파일 12개 전체 삭제)
+ src/components/ui/Button.jsx (신규)
+ src/components/ui/Input.jsx (신규)
+ tailwind.config.js (theme 확장)
```

### 설계 원칙

1. **재사용성**: 공통 패턴은 UI 컴포넌트로 추출
2. **일관성**: 모든 색상/크기는 config에서 관리
3. **가독성**: variant/size props로 스타일 제어
4. **유지보수성**: CSS 파일 없이 JSX에서 스타일 확인 가능
5. **성능**: Tailwind JIT로 사용된 클래스만 번들링

## 브라우저 지원

- 최신 Chrome/Edge/Firefox/Safari 권장
- ES2015+ 지원 브라우저

## 개발 가이드

### 새 컴포넌트 추가 시

```jsx
// Tailwind 유틸리티 직접 사용
<div className="px-4 py-3 rounded-xl bg-surface border border-primary-dark/10">
  내용
</div>

// 또는 UI 컴포넌트 활용
<Button variant="primary" size="md" onClick={handleClick}>
  클릭
</Button>
```

### 커스텀 색상 추가

1. `tailwind.config.js`의 `theme.extend.colors`에 추가
2. `className`에서 사용: `text-새색상` 또는 `bg-새색상`

### 반응형 스타일

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>
```

## 라이선스

MIT
