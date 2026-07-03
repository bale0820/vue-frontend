import api from './api';

// export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'
export const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000'
let csrfReady = false

export async function ensureCsrfCookie() {
  if (csrfReady) {
    return
  }

 await api.get(`/sanctum/csrf-cookie`);


  csrfReady = true
}

// export function xsrfHeaders(): Record<string, string> {
//   const token = document.cookie
//     .split('; ')
//     .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
//     ?.split('=')[1]

//   return token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}
// }

export function resetCsrfCookieState() {
  csrfReady = false
}
