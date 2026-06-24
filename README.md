# Candy Dev Frontend

Vue + Vite 기반 개발자 커뮤니티 프론트엔드입니다. Laravel 서버(`candy-php`)는 PostgreSQL에 연결된 API 서버로 두고, 프론트는 `/api` 경로를 통해 호출합니다.

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

Vite는 기본적으로 `http://localhost:5173`에서 실행됩니다. WSL2 또는 같은 네트워크의 다른 장치에서 접근해야 하면 이미 `vite.config.ts`에 `host: 0.0.0.0`이 설정되어 있습니다.

## Laravel 서버 권장 실행

WSL2 Ubuntu 24.04의 `candy-php`에서:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

프론트의 `.env`:

```bash
VITE_API_BASE_URL=/api
VITE_BACKEND_URL=http://127.0.0.1:8000
```

Laravel이 WSL2 안에서 뜨고 Windows 브라우저에서 접속이 안 되면 Windows 방화벽에서 TCP 5173, 8000 포트를 개발용으로 허용하세요. 운영 서버에서는 필요한 IP만 열어두는 것이 좋습니다.

## 필요한 API

프론트는 아래 엔드포인트를 기대합니다.

```http
GET /api/posts
POST /api/posts
GET /api/auth/me
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /sanctum/csrf-cookie
```

`GET /api/posts` 응답 예시:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Laravel API 질문",
      "excerpt": "Sanctum 인증 연결 방식이 궁금합니다.",
      "author": "backend-kim",
      "category": "Laravel",
      "tags": ["sanctum", "api"],
      "replies": 3,
      "views": 120,
      "createdAt": "2026-06-20T08:30:00+09:00"
    }
  ]
}
```

백엔드가 꺼져 있어도 화면은 데모 데이터로 동작합니다.

## 로그인

로그인은 Laravel Sanctum의 세션 쿠키 방식으로 처리합니다. `POST` 요청 전에는 프론트가 `/sanctum/csrf-cookie`를 먼저 호출하고, 이후 `X-XSRF-TOKEN` 헤더와 쿠키를 함께 보냅니다.

`candy-php`의 `.env`에서 세션 저장 방식은 파일로 설정합니다.

```bash
SESSION_DRIVER=file
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost:8000,127.0.0.1:8000
```

카카오/네이버 로그인 버튼은 UI와 env 자리까지 준비되어 있습니다. 실제 OAuth 앱 키를 발급받으면 `KAKAO_CLIENT_ID`, `NAVER_CLIENT_ID` 등에 값을 넣고 콜백 교환 로직을 이어 붙이면 됩니다.

현재 소셜 로그인은 Laravel에서 직접 OAuth code를 access token으로 교환합니다. 개발 중에는 쿠키 host를 맞추기 위해 프론트도 `http://127.0.0.1:5173`으로 접속하세요.

Provider 콘솔 callback URL:

```txt
Kakao: http://127.0.0.1:8000/auth/kakao/callback
Naver: http://127.0.0.1:8000/auth/naver/callback
```
