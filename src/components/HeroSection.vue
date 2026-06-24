<script setup lang="ts">
defineProps<{
  postsCount: number
  totalReplies: number
  activeMembers: number
  apiMessage: string
  isLoading: boolean
}>()

defineEmits<{
  firstPost: []
  feed: []
}>()
</script>

<template>
  <section class="hero-section">
    <div class="hero-copy">
      <p class="eyebrow">PostgreSQL 기반 개발자 커뮤니티</p>
      <h1>질문, 팁, 해결 과정을 함께 모으는 개발자 광장</h1>
      <p>
        게시글을 클릭하면 상세 내용을 볼 수 있고, 로그인한 사용자는 내 게시글에서 본인 글을
        수정하거나 삭제할 수 있습니다.
      </p>

      <div class="hero-actions">
        <button class="primary-button" type="button" @click="$emit('firstPost')">
          첫 글 작성
        </button>
        <button class="secondary-button" type="button" @click="$emit('feed')">
          게시글 둘러보기
        </button>
      </div>
    </div>

    <aside class="status-panel" aria-label="Community stats">
      <div>
        <span>{{ postsCount }}</span>
        <small>게시글</small>
      </div>
      <div>
        <span>{{ totalReplies }}</span>
        <small>댓글</small>
      </div>
      <div>
        <span>{{ activeMembers }}</span>
        <small>작성자</small>
      </div>
      <p :class="{ loading: isLoading }">{{ apiMessage }}</p>
    </aside>
  </section>
</template>
