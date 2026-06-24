export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

let csrfReady = false

export async function ensureCsrfCookie() {
  if (csrfReady) {
    return
  }

  const response = await fetch('/sanctum/csrf-cookie', {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('CSRF 쿠키를 가져오지 못했습니다.')
  }

  csrfReady = true
}

export function xsrfHeaders(): Record<string, string> {
  const token = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]

  return token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}
}

export function resetCsrfCookieState() {
  csrfReady = false
}
