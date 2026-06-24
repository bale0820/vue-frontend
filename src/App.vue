<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AttachmentPreviewList from './components/AttachmentPreviewList.vue'
import HeroSection from './components/HeroSection.vue'
import PostCard from './components/PostCard.vue'
import { useCommunityApp } from './composables/useCommunityApp'

const {
  activeMembers,
  apiMessage,
  authForm,
  authMessage,
  authMode,
  categories,
  closeAuth,
  currentUser,
  draft,
  editAttachmentFiles,
  editAttachmentPreviews,
  editDraft,
  editExistingAttachments,
  formatDate,
  handleAttachmentChange,
  handleDeletePost,
  handleEditAttachmentChange,
  handleFirstPostClick,
  handleLogout,
  isAuthOpen,
  isLoading,
  isSubmitting,
  openAuth,
  pageTitle,
  posts,
  removeEditAttachment,
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
  attachmentFiles,
  attachmentPreviews,
  clearAttachments,
  clearEditAttachments,
} = useCommunityApp()
</script>

<template>
  <main class="app-shell">
    <AppHeader
      :current-user="currentUser"
      @feed="showFeed"
      @my-posts="showMyPosts"
      @admin="showAdminPage"
      @login="openAuth('login')"
      @logout="handleLogout"
      @write="showWritePage"
    />

    <HeroSection
      :posts-count="posts.length"
      :total-replies="totalReplies"
      :active-members="activeMembers"
      :api-message="apiMessage"
      :is-loading="isLoading"
      @first-post="handleFirstPostClick"
      @feed="showFeed"
    />

    <section v-if="viewMode === 'detail' && selectedPost" class="detail-layout">
      <button class="back-button" type="button" @click="viewMode = currentUser?.isAdmin ? 'admin' : 'feed'">
        목록으로 돌아가기
      </button>

      <article class="post-detail">
        <div class="post-meta">
          <span>{{ selectedPost.category }}</span>
          <span>{{ formatDate(selectedPost.createdAt) }}</span>
          <span>@{{ selectedPost.author }}</span>
        </div>
        <h2>{{ selectedPost.title }}</h2>

        <div v-if="selectedPost.canEdit || selectedPost.canDelete" class="post-actions">
          <button
            v-if="selectedPost.canEdit"
            class="secondary-button"
            type="button"
            @click="startEditPost(selectedPost)"
          >
            수정하기
          </button>
          <button
            v-if="selectedPost.canDelete"
            class="danger-button"
            type="button"
            @click="handleDeletePost(selectedPost)"
          >
            삭제하기
          </button>
        </div>

        <img
          v-if="selectedPost.imageUrl"
          class="detail-image"
          :src="selectedPost.imageUrl"
          :alt="selectedPost.title"
        />
        <div v-if="selectedPost.imageUrls.length > 1" class="image-gallery">
          <img
            v-for="imageUrl in selectedPost.imageUrls.slice(1)"
            :key="imageUrl"
            :src="imageUrl"
            :alt="selectedPost.title"
          />
        </div>
        <p class="detail-body">{{ selectedPost.excerpt }}</p>
        <div v-if="selectedPost.attachments.length" class="attachment-list">
          <h3>첨부 파일</h3>
          <a
            v-for="attachment in selectedPost.attachments"
            :key="attachment.path"
            :href="attachment.url"
            target="_blank"
            rel="noreferrer"
          >
            {{ attachment.name }}
          </a>
        </div>
        <ul class="tag-list" aria-label="태그">
          <li v-for="tag in selectedPost.tags" :key="tag">#{{ tag }}</li>
        </ul>
      </article>
    </section>

    <section v-else-if="viewMode === 'write' || viewMode === 'edit'" class="write-page">
      <div class="section-heading">
        <div>
          <p class="eyebrow">{{ viewMode === 'edit' ? 'Edit Post' : 'Write Post' }}</p>
          <h2>{{ viewMode === 'edit' ? '게시글 수정' : '자세한 글쓰기' }}</h2>
        </div>
        <button class="secondary-button" type="button" @click="showFeed">목록으로</button>
      </div>

      <form
        v-if="viewMode === 'write'"
        class="write-panel write-panel-wide"
        @submit.prevent="submitPost"
      >
        <label>
          제목
          <input v-model="draft.title" type="text" placeholder="예: Sanctum 세션 인증 질문" />
        </label>

        <label>
          카테고리
          <select v-model="draft.category">
            <option v-for="category in categories.slice(1)" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </label>

        <label>
          내용
          <textarea
            v-model="draft.excerpt"
            rows="12"
            placeholder="상황, 시도한 방법, 에러 메시지, 궁금한 점을 자세히 적어주세요."
          />
        </label>

        <label>
          태그
          <input v-model="draft.tags" type="text" placeholder="vue, laravel, postgresql" />
        </label>

        <div class="file-upload-field">
          <span>첨부 파일</span>
          <input
            type="file"
            name="attachments[]"
            multiple
            class="file-upload-input"
            @change="handleAttachmentChange"
          />
          <small>여러 파일을 한 번에 선택하거나, 파일 선택을 여러 번 눌러 계속 추가할 수 있습니다.</small>
          <small v-if="attachmentFiles.length">{{ attachmentFiles.length }}개 파일 선택됨</small>
        </div>

        <AttachmentPreviewList
          :previews="attachmentPreviews"
          clear-label="첨부 파일 제거"
          @clear="clearAttachments"
        />

        <button class="primary-button" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? '등록 중' : '게시글 등록' }}
        </button>
      </form>

      <form v-else class="write-panel write-panel-wide" @submit.prevent="submitEditPost">
        <label>
          제목
          <input v-model="editDraft.title" type="text" />
        </label>

        <label>
          카테고리
          <select v-model="editDraft.category">
            <option v-for="category in categories.slice(1)" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </label>

        <label>
          내용
          <textarea v-model="editDraft.excerpt" rows="12" />
        </label>

        <label>
          태그
          <input v-model="editDraft.tags" type="text" placeholder="vue, laravel, postgresql" />
        </label>

        <div v-if="editExistingAttachments.length" class="attachment-list">
          <h3>현재 첨부 파일</h3>
          <a
            v-for="attachment in editExistingAttachments"
            :key="attachment.path"
            :href="attachment.url"
            target="_blank"
            rel="noreferrer"
          >
            {{ attachment.name }}
            <button
              type="button"
              class="attachment-remove-button"
              @click.prevent="removeExistingAttachment(attachment.path)"
            >
              삭제
            </button>
          </a>
        </div>

        <div class="file-upload-field">
          <span>새 첨부 파일</span>
          <input
            type="file"
            name="attachments[]"
            multiple
            class="file-upload-input"
            @change="handleEditAttachmentChange"
          />
          <small>새 파일을 선택하고 수정 완료를 누르면 기존 S3 첨부는 삭제되고 새 파일로 교체됩니다.</small>
          <small v-if="editAttachmentFiles.length">
            {{ editAttachmentFiles.length }}개 파일 선택됨
          </small>
        </div>

        <AttachmentPreviewList
          :previews="editAttachmentPreviews"
          clear-label="새 첨부 파일 제거"
          removable
          @clear="clearEditAttachments"
          @remove="removeEditAttachment"
        />

        <button class="primary-button" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? '수정 중' : '수정 완료' }}
        </button>
      </form>
    </section>

    <section v-else id="posts" class="content-grid">
      <div class="posts-area">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Community Feed</p>
            <h2>{{ pageTitle }}</h2>
          </div>
          <input v-model="search" type="search" placeholder="검색어 입력" aria-label="게시글 검색" />
        </div>

        <div class="category-tabs" aria-label="카테고리 필터">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <PostCard
          v-for="post in visiblePosts"
          :key="post.id"
          :post="post"
          :formatted-date="formatDate(post.createdAt)"
          @open="showPost"
          @edit="startEditPost"
          @delete="handleDeletePost"
        />

        <p v-if="!visiblePosts.length" class="empty-state">조건에 맞는 게시글이 없습니다.</p>
      </div>

      <aside class="side-column">
        <div class="write-panel">
          <p class="eyebrow">New Post</p>
          <h2>글쓰기</h2>
          <p v-if="!currentUser" class="login-required">
            로그인하면 게시글을 작성할 수 있습니다.
          </p>
          <button class="primary-button" type="button" @click="showWritePage">
            자세한 글쓰기
          </button>
        </div>

        <div class="setup-panel">
          <p class="eyebrow">권한</p>
          <h2>게시글 관리</h2>
          <ul>
            <li>내 게시글: 본인이 작성한 글만 조회</li>
            <li>수정/삭제: 본인 글 또는 관리자</li>
            <li>관리자: user id 1</li>
          </ul>
        </div>
      </aside>
    </section>

    <div v-if="isAuthOpen" class="modal-backdrop" @click.self="closeAuth">
      <section class="auth-modal" aria-modal="true" role="dialog" aria-labelledby="auth-title">
        <button class="close-button" type="button" aria-label="닫기" @click="closeAuth">x</button>
        <p class="eyebrow">Account</p>
        <h2 id="auth-title">{{ authMode === 'login' ? '로그인' : '회원가입' }}</h2>

        <form class="auth-form" @submit.prevent="submitAuth">
          <label v-if="authMode === 'register'">
            이름
            <input v-model="authForm.name" type="text" autocomplete="name" />
          </label>

          <label>
            이메일
            <input v-model="authForm.email" type="email" autocomplete="email" />
          </label>

          <label>
            비밀번호
            <input v-model="authForm.password" type="password" autocomplete="current-password" />
          </label>

          <button class="primary-button" type="submit">
            {{ authMode === 'login' ? '로그인' : '계정 만들기' }}
          </button>
        </form>

        <div class="social-login">
          <button class="kakao-button" type="button" @click="startSocialLogin('kakao')">
            카카오로 시작하기
          </button>
          <button class="naver-button" type="button" @click="startSocialLogin('naver')">
            네이버로 시작하기
          </button>
        </div>

        <p v-if="authMessage" class="auth-message">{{ authMessage }}</p>

        <button
          class="switch-auth"
          type="button"
          @click="authMode = authMode === 'login' ? 'register' : 'login'"
        >
          {{ authMode === 'login' ? '계정이 없나요? 회원가입' : '이미 계정이 있나요? 로그인' }}
        </button>
      </section>
    </div>
  </main>
</template>
