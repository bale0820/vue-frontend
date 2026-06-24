import { apiBaseUrl, ensureCsrfCookie, resetCsrfCookieState, xsrfHeaders } from './http'

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000'

export type User = {
  id: number
  name: string
  email: string
  isAdmin: boolean
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = LoginPayload & {
  name: string
}

async function parseAuthResponse(response: Response): Promise<User> {
  const data = (await response.json()) as { data?: User; message?: string }

  if (!response.ok || !data.data) {
    throw new Error(data.message ?? '인증 요청을 처리하지 못했습니다.')
  }

  return data.data
}

export async function fetchCurrentUser(): Promise<User | null> {
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (response.status === 401) {
    return null
  }

  return parseAuthResponse(response)
}

export async function login(payload: LoginPayload): Promise<User> {
  await ensureCsrfCookie()

  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...xsrfHeaders(),
    },
    body: JSON.stringify(payload),
  })

  return parseAuthResponse(response)
}

export async function register(payload: RegisterPayload): Promise<User> {
  await ensureCsrfCookie()

  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...xsrfHeaders(),
    },
    body: JSON.stringify(payload),
  })

  return parseAuthResponse(response)
}

export async function logout() {
  await ensureCsrfCookie()

  const response = await fetch(`${apiBaseUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...xsrfHeaders(),
    },
  })

  if (!response.ok) {
    throw new Error('로그아웃하지 못했습니다.')
  }

  resetCsrfCookieState()
}

export function socialLoginUrl(provider: 'kakao' | 'naver') {
  return `${backendUrl}/auth/${provider}/redirect`
}
