import {  ensureCsrfCookie, resetCsrfCookieState } from './http'
import api from './api';
import axios from 'axios';
import type { AxiosResponse } from 'axios'
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


function parseAuthResponse(
  response: AxiosResponse<{ data?: User; message?: string }>
): User {
  const data = response.data

  if (!data.data) {
    throw new Error(data.message ?? '인증 요청을 처리하지 못했습니다.')
  }

  return data.data
}

export async function fetchCurrentUser(): Promise<User | null> {
    try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function login(payload: LoginPayload): Promise<User> {
  await ensureCsrfCookie()

  const response = await api.post(
    `/auth/login`,
    payload
  )

  return response.data 
}

export async function register(payload: RegisterPayload): Promise<User> {
  await ensureCsrfCookie()

  const response = await api.post(`/auth/register`, payload)

  return parseAuthResponse(response.data)
}

export async function logout() {
  await ensureCsrfCookie()

  await api.post(`/auth/logout`);

  //  if (response.status !== 200) {
  //   throw new Error("로그아웃하지 못했습니다.");
  // }

  resetCsrfCookieState()
}

export function socialLoginUrl(provider: 'kakao' | 'naver') {
  return `${backendUrl}/auth/${provider}/redirect`
}
