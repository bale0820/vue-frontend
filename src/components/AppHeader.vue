<script setup lang="ts">
import type { User } from '../services/auth'

defineProps<{
  currentUser: User | null
}>()

defineEmits<{
  feed: []
  myPosts: []
  admin: []
  login: []
  logout: []
  write: []
}>()
</script>

<template>
  <header class="topbar">
    <button class="brand brand-button" type="button" @click="$emit('feed')">
      <span class="brand-mark">C</span>
      <span>
        <strong>Candy Dev</strong>
        <small>Laravel + Vue Community</small>
      </span>
    </button>

    <nav class="nav-links" aria-label="Primary navigation">
      <button class="nav-button" type="button" @click="$emit('feed')">게시글</button>
      <button class="nav-button" type="button" @click="$emit('myPosts')">내 게시글</button>
      <button
        v-if="currentUser?.isAdmin"
        class="nav-button admin-button"
        type="button"
        @click="$emit('admin')"
      >
        관리자페이지
      </button>
      <button v-if="!currentUser" class="nav-button" type="button" @click="$emit('login')">
        로그인
      </button>
      <button v-else class="nav-button user-button" type="button" @click="$emit('logout')">
        {{ currentUser.name }} 로그아웃
      </button>
      <button class="nav-button" type="button" @click="$emit('write')">글쓰기</button>
    </nav>
  </header>
</template>
