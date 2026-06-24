import { computed, onMounted, reactive, ref } from 'vue'
import {
  fetchCurrentUser,
  login,
  logout,
  register,
  socialLoginUrl,
  type User,
} from '../services/auth'
import {
  createPost,
  deletePost,
  demoPosts,
  fetchAdminPosts,
  fetchMyPosts,
  fetchPosts,
  updatePost,
  type Post,
  type PostAttachment,
} from '../services/community'
import { useAttachmentDraft } from './useAttachmentDraft'

type ViewMode = 'feed' | 'my' | 'admin' | 'detail' | 'write' | 'edit'

export function useCommunityApp() {
  const categories = ['All', 'Laravel', 'Vue', 'Database', 'DevOps', 'Career']

  const posts = ref<Post[]>(demoPosts)
  const currentUser = ref<User | null>(null)
  const selectedCategory = ref('All')
  const selectedPost = ref<Post | null>(null)
  const viewMode = ref<ViewMode>('feed')
  const search = ref('')
  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const isAuthOpen = ref(false)
  const authMode = ref<'login' | 'register'>('login')
  const apiMessage = ref('Laravel API 연결 확인 중')
  const authMessage = ref('')

  const draft = reactive({
    title: '',
    excerpt: '',
    category: 'Laravel',
    tags: '',
  })

  const editDraft = reactive({
    title: '',
    excerpt: '',
    category: 'Laravel',
    tags: '',
  })

  const writeAttachments = useAttachmentDraft()
  const editAttachments = useAttachmentDraft()
  const editExistingAttachments = ref<PostAttachment[]>([])

  const authForm = reactive({
    name: '',
    email: '',
    password: '',
  })

  const visiblePosts = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return posts.value.filter((post) => {
      const matchesCategory =
        selectedCategory.value === 'All' || post.category === selectedCategory.value
      const matchesSearch =
        !keyword ||
        [post.title, post.excerpt, post.author, post.category, ...post.tags]
          .join(' ')
          .toLowerCase()
          .includes(keyword)

      return matchesCategory && matchesSearch
    })
  })

  const pageTitle = computed(() => {
    if (viewMode.value === 'my') return '내 게시글'
    if (viewMode.value === 'admin') return '관리자 게시글 관리'
    return '최근 토론'
  })

  const totalReplies = computed(() =>
    posts.value.reduce((replyCount, post) => replyCount + post.replies, 0),
  )

  const activeMembers = computed(() => new Set(posts.value.map((post) => post.author)).size)

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }

  function openAuth(mode: 'login' | 'register' = 'login') {
    authMode.value = mode
    authMessage.value = ''
    isAuthOpen.value = true
  }

  function closeAuth() {
    isAuthOpen.value = false
  }

  function showPost(post: Post) {
    selectedPost.value = post
    viewMode.value = 'detail'
    scrollToTop()
  }

  async function showFeed() {
    viewMode.value = 'feed'
    selectedPost.value = null
    await loadPosts()
  }

  async function showMyPosts() {
    if (!currentUser.value) {
      apiMessage.value = '내 게시글은 로그인해야 볼 수 있습니다.'
      openAuth('login')
      return
    }

    viewMode.value = 'my'
    selectedPost.value = null
    await loadMyPosts()
  }

  async function showAdminPage() {
    if (!currentUser.value?.isAdmin) {
      apiMessage.value = '관리자만 접근할 수 있습니다.'
      return
    }

    viewMode.value = 'admin'
    selectedPost.value = null
    await loadAdminPosts()
  }

  function showWritePage() {
    if (!currentUser.value) {
      apiMessage.value = '글쓰기는 로그인 후 사용할 수 있습니다.'
      openAuth('login')
      return
    }

    viewMode.value = 'write'
    selectedPost.value = null
    scrollToTop()
  }

  function handleFirstPostClick() {
    if (!currentUser.value) {
      apiMessage.value = '첫 글 작성은 로그인 후 시작할 수 있습니다.'
      openAuth('login')
      return
    }

    showWritePage()
  }

  function startEditPost(post: Post) {
    if (!post.canEdit) {
      apiMessage.value = '수정 권한이 없습니다.'
      return
    }

    selectedPost.value = post
    editDraft.title = post.title
    editDraft.excerpt = post.excerpt
    editDraft.category = post.category
    editDraft.tags = post.tags.join(', ')
    editAttachments.clear()
    editExistingAttachments.value = [...post.attachments]
    viewMode.value = 'edit'
    scrollToTop()
  }

  function removeExistingAttachment(path: string) {
    editExistingAttachments.value = editExistingAttachments.value.filter(
      (attachment) => attachment.path !== path,
    )
  }

  async function loadPosts() {
    isLoading.value = true

    try {
      posts.value = await fetchPosts()
      apiMessage.value = 'Laravel API에 연결되었습니다.'
    } catch {
      posts.value = demoPosts
      apiMessage.value = 'API 미연결: 데모 데이터를 표시 중입니다.'
    } finally {
      isLoading.value = false
    }
  }

  async function loadMyPosts() {
    isLoading.value = true

    try {
      posts.value = await fetchMyPosts()
      apiMessage.value = '내 게시글만 불러왔습니다.'
    } catch (error) {
      apiMessage.value =
        error instanceof Error ? error.message : '내 게시글을 불러오지 못했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  async function loadAdminPosts() {
    isLoading.value = true

    try {
      posts.value = await fetchAdminPosts()
      apiMessage.value = '관리자 게시글 목록을 불러왔습니다.'
    } catch (error) {
      apiMessage.value =
        error instanceof Error ? error.message : '관리자 목록을 불러오지 못했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  async function loadCurrentUser() {
    try {
      currentUser.value = await fetchCurrentUser()
    } catch {
      currentUser.value = null
    }
  }

  async function submitAuth() {
    authMessage.value = ''

    try {
      currentUser.value =
        authMode.value === 'login'
          ? await login({
              email: authForm.email,
              password: authForm.password,
            })
          : await register({
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
            })

      authForm.name = ''
      authForm.email = ''
      authForm.password = ''
      closeAuth()
      apiMessage.value = `${currentUser.value.name}으로 로그인됨`
    } catch (error) {
      authMessage.value =
        error instanceof Error ? error.message : '로그인 요청을 처리하지 못했습니다.'
    }
  }

  async function handleLogout() {
    try {
      await logout()
      currentUser.value = null
      await showFeed()
      apiMessage.value = '로그아웃되었습니다.'
    } catch (error) {
      apiMessage.value = error instanceof Error ? error.message : '로그아웃하지 못했습니다.'
    }
  }

  function startSocialLogin(provider: 'kakao' | 'naver') {
    window.location.href = socialLoginUrl(provider)
  }

  async function submitPost() {
    if (!currentUser.value) {
      apiMessage.value = '로그인해야 게시글을 등록할 수 있습니다.'
      openAuth('login')
      return
    }

    if (!draft.title.trim() || !draft.excerpt.trim()) {
      apiMessage.value = '제목과 내용을 먼저 입력해주세요.'
      return
    }

    isSubmitting.value = true

    try {
      const createdPost = await createPost({
        ...draft,
        attachments: writeAttachments.files.value,
      })
      posts.value = [createdPost, ...posts.value]
      selectedPost.value = createdPost
      viewMode.value = 'detail'
      apiMessage.value = '게시글이 등록되었습니다.'
      draft.title = ''
      draft.excerpt = ''
      draft.tags = ''
      writeAttachments.clear()
      scrollToTop()
    } catch (error) {
      apiMessage.value =
        error instanceof Error ? error.message : '게시글을 등록하지 못했습니다.'
    } finally {
      isSubmitting.value = false
    }
  }

  async function submitEditPost() {
    if (!selectedPost.value) return

    if (!editDraft.title.trim() || !editDraft.excerpt.trim()) {
      apiMessage.value = '제목과 내용을 먼저 입력해주세요.'
      return
    }

    isSubmitting.value = true

    try {
      const updatedPost = await updatePost(selectedPost.value.id, {
        ...editDraft,
        attachments: editAttachments.files.value,
        keepAttachmentPaths: editExistingAttachments.value.map((attachment) => attachment.path),
      })
      replacePost(updatedPost)
      selectedPost.value = updatedPost
      viewMode.value = 'detail'
      apiMessage.value = '게시글이 수정되었습니다.'
    } catch (error) {
      apiMessage.value =
        error instanceof Error ? error.message : '게시글을 수정하지 못했습니다.'
    } finally {
      isSubmitting.value = false
    }
  }

  async function handleDeletePost(post: Post) {
    if (!post.canDelete) {
      apiMessage.value = '삭제 권한이 없습니다.'
      return
    }

    const confirmed = window.confirm(`"${post.title}" 게시글을 삭제할까요?`)
    if (!confirmed) return

    try {
      await deletePost(post.id)
      posts.value = posts.value.filter((item) => item.id !== post.id)
      selectedPost.value = null
      apiMessage.value = '게시글이 삭제되었습니다.'

      if (viewMode.value === 'detail' || viewMode.value === 'edit') {
        viewMode.value = currentUser.value?.isAdmin ? 'admin' : 'my'
      }
    } catch (error) {
      apiMessage.value =
        error instanceof Error ? error.message : '게시글을 삭제하지 못했습니다.'
    }
  }

  function replacePost(post: Post) {
    posts.value = posts.value.map((item) => (item.id === post.id ? post : item))
  }

  onMounted(async () => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('login') === 'success') {
      apiMessage.value = '소셜 로그인 처리 완료'
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (params.get('login') === 'provider_error') {
      apiMessage.value = '소셜 로그인 처리 중 오류가 발생했습니다.'
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    await Promise.all([loadPosts(), loadCurrentUser()])

    if (currentUser.value) {
      apiMessage.value = `${currentUser.value.name}으로 로그인됨`
    }
  })

  return {
    activeMembers,
    apiMessage,
    authForm,
    authMessage,
    authMode,
    categories,
    closeAuth,
    currentUser,
    draft,
    editAttachmentFiles: editAttachments.files,
    editAttachmentPreviews: editAttachments.previews,
    editDraft,
    editExistingAttachments,
    formatDate,
    handleAttachmentChange: writeAttachments.handleChange,
    handleDeletePost,
    handleEditAttachmentChange: editAttachments.handleChange,
    handleFirstPostClick,
    handleLogout,
    isAuthOpen,
    isLoading,
    isSubmitting,
    openAuth,
    pageTitle,
    posts,
    removeEditAttachment: editAttachments.remove,
    removeExistingAttachment,
    search,
    selectedCategory,
    selectedPost,
    showAdminPage,
    showFeed,
    showMyPosts,
    showPost,
    showWritePage,
    startEditPost,
    startSocialLogin,
    submitAuth,
    submitEditPost,
    submitPost,
    totalReplies,
    viewMode,
    visiblePosts,
    attachmentFiles: writeAttachments.files,
    attachmentPreviews: writeAttachments.previews,
    clearAttachments: writeAttachments.clear,
    clearEditAttachments: editAttachments.clear,
  }
}
