import axios from 'axios'
import api from './api'
import { ensureCsrfCookie } from './http'

export type PostAttachment = {
  path: string
  name: string
  mime: string | null
  size: number | null
  isImage: boolean
  url: string
}

export type Post = {
  id: number
  userId: number | null
  title: string
  excerpt: string
  author: string
  category: string
  imageUrl: string | null
  imageUrls: string[]
  attachments: PostAttachment[]
  tags: string[]
  replies: number
  views: number
  createdAt: string
  canEdit: boolean
  canDelete: boolean
}

export type PostDraft = {
  title: string
  excerpt: string
  category: string
  tags: string
  attachments: File[]
}

export type PostUpdatePayload = {
  title: string
  excerpt: string
  category: string
  tags: string
  attachments: File[]
  keepAttachmentPaths: string[]
}

export const demoPosts: Post[] = [
  {
    id: 1,
    userId: null,
    title: 'Laravel API와 Vue 화면은 어떤 방식으로 나누면 좋을까요?',
    excerpt:
      '인증은 Sanctum, 게시글은 REST API로 시작하려고 합니다. 폴더 구조와 호출 흐름이 궁금합니다.',
    author: 'backend-kim',
    category: 'Laravel',
    imageUrl: null,
    imageUrls: [],
    attachments: [],
    tags: ['sanctum', 'api', 'architecture'],
    replies: 12,
    views: 438,
    createdAt: '2026-06-20T08:30:00+09:00',
    canEdit: false,
    canDelete: false,
  },
  {
    id: 2,
    userId: null,
    title: 'PostgreSQL 인덱스가 실제로 데이터에 적용되는지 확인하는 법',
    excerpt:
      'EXPLAIN ANALYZE 결과를 볼 때 초보자가 놓치기 쉬운 부분들을 정리해봤습니다.',
    author: 'query-plan',
    category: 'Database',
    imageUrl: null,
    imageUrls: [],
    attachments: [],
    tags: ['postgresql', 'index', 'performance'],
    replies: 7,
    views: 291,
    createdAt: '2026-06-19T19:14:00+09:00',
    canEdit: false,
    canDelete: false,
  },
  {
    id: 3,
    userId: null,
    title: 'WSL2에서 Laravel 서버를 Windows 브라우저로 접속하기',
    excerpt:
      '방화벽, CORS, Vite proxy까지 한 번에 맞추는 체크리스트를 공유합니다.',
    author: 'wsl-runner',
    category: 'DevOps',
    imageUrl: null,
    imageUrls: [],
    attachments: [],
    tags: ['wsl2', 'firewall', 'cors'],
    replies: 18,
    views: 611,
    createdAt: '2026-06-18T22:02:00+09:00',
    canEdit: false,
    canDelete: false,
  },
]

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return fallback
}

async function requestJson<T>(path: string): Promise<T> {
  try {
    const response = await api.get<T>(path)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error, '요청을 처리하지 못했습니다.'))
  }
}

function normalizePostResponse(data: { data?: Post[] } | Post[]): Post[] {
  return Array.isArray(data) ? data : (data.data ?? [])
}

function normalizePost(data: { data?: Post } | Post): Post {
  return 'data' in data && data.data ? data.data : (data as Post)
}

function tagsToArray(tags: string): string[] {
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export async function fetchPosts(): Promise<Post[]> {
  const data = await requestJson<{ data?: Post[] } | Post[]>('/posts')
  return normalizePostResponse(data)
}

export async function fetchMyPosts(): Promise<Post[]> {
  const data = await requestJson<{ data?: Post[] } | Post[]>('/posts/my')
  return normalizePostResponse(data)
}

export async function fetchAdminPosts(): Promise<Post[]> {
  const data = await requestJson<{ data?: Post[] } | Post[]>('/admin/posts')
  return normalizePostResponse(data)
}

export async function updatePost(postId: number, payload: PostUpdatePayload): Promise<Post> {
  await ensureCsrfCookie()

  const body = new FormData()
  body.append('_method', 'PUT')
  body.append('title', payload.title)
  body.append('excerpt', payload.excerpt)
  body.append('category', payload.category)

  tagsToArray(payload.tags).forEach((tag) => body.append('tags[]', tag))

  payload.keepAttachmentPaths.forEach((path) => {
    body.append('keepAttachmentPaths[]', path)
  })

  payload.attachments.forEach((file) => {
    body.append('attachments[]', file, file.name)
  })

  try {
    const response = await api.post<{ data?: Post } | Post>(`/posts/${postId}`, body)
    return normalizePost(response.data)
  } catch (error) {
    throw new Error(getErrorMessage(error, '게시글을 수정하지 못했습니다.'))
  }
}

export async function deletePost(postId: number): Promise<void> {
  await ensureCsrfCookie()

  try {
    await api.delete<{ message?: string }>(`/posts/${postId}`)
  } catch (error) {
    throw new Error(getErrorMessage(error, '게시글을 삭제하지 못했습니다.'))
  }
}

export async function createPost(draft: PostDraft): Promise<Post> {
  await ensureCsrfCookie()

  const body = new FormData()
  body.append('title', draft.title)
  body.append('excerpt', draft.excerpt)
  body.append('category', draft.category)

  tagsToArray(draft.tags).forEach((tag) => body.append('tags[]', tag))

  draft.attachments.forEach((file) => {
    body.append('attachments[]', file, file.name)
  })

  try {
    const response = await api.post<{ data?: Post } | Post>('/posts', body)
    return normalizePost(response.data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('로그인해야 게시글을 등록할 수 있습니다.')
    }

    throw new Error(getErrorMessage(error, '게시글을 등록하지 못했습니다.'))
  }
}
