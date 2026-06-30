import { apiBaseUrl, ensureCsrfCookie, xsrfHeaders } from './http'

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
      '인증은 Sanctum, 게시글은 REST API로 시작하려고 합니다. 폴더 구조와 라우팅 전략이 궁금합니다.',
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
    title: 'PostgreSQL 인덱스가 실제로 쓰이는지 확인하는 팁',
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

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorData?.message ?? '요청을 처리하지 못했습니다.')
  }

  return response.json() as Promise<T>
}

function normalizePostResponse(data: { data?: Post[] } | Post[]): Post[] {
  return Array.isArray(data) ? data : (data.data ?? [])
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

  const response = await fetch(`${apiBaseUrl}/posts/${postId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...xsrfHeaders(),
    },
    body,
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorData?.message ?? '게시글을 수정하지 못했습니다.')
  }

  const data = (await response.json()) as { data?: Post } | Post
  return 'data' in data && data.data ? data.data : (data as Post)
}

export async function deletePost(postId: number): Promise<void> {
  await ensureCsrfCookie()

  await requestJson<{ message?: string }>(`/posts/${postId}`, {
    method: 'DELETE',
    headers: xsrfHeaders(),
  })
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
  const headers = xsrfHeaders()

  console.log(headers['X-XSRF-TOKEN'])
  console.log(document.cookie)
  const response = await fetch(`${apiBaseUrl}/posts`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...xsrfHeaders(),
    },
    body,
  })

  if (response.status === 401) {
    throw new Error('로그인해야 게시글을 등록할 수 있습니다.')
  }

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorData?.message ?? '게시글을 등록하지 못했습니다.')
  }

  const data = (await response.json()) as { data?: Post } | Post
  if ('data' in data && data.data) {
    return data.data
  }

  return data as Post
}
