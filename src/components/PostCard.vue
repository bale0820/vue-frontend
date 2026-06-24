<script setup lang="ts">
import type { Post } from '../services/community'

defineProps<{
  post: Post
  formattedDate: string
}>()

defineEmits<{
  open: [post: Post]
  edit: [post: Post]
  delete: [post: Post]
}>()
</script>

<template>
  <article class="post-card">
    <button class="post-card-open" type="button" @click="$emit('open', post)">
      <div class="post-main">
        <img v-if="post.imageUrl" class="post-thumb" :src="post.imageUrl" :alt="post.title" />
        <div class="post-meta">
          <span>{{ post.category }}</span>
          <span>{{ formattedDate }}</span>
          <span>@{{ post.author }}</span>
        </div>
        <h3>{{ post.title }}</h3>
        <p>{{ post.excerpt }}</p>
        <ul class="tag-list" aria-label="태그">
          <li v-for="tag in post.tags" :key="tag">#{{ tag }}</li>
        </ul>
      </div>
    </button>

    <div class="post-side">
      <dl class="post-stats">
        <div>
          <dt>댓글</dt>
          <dd>{{ post.replies }}</dd>
        </div>
        <div>
          <dt>조회</dt>
          <dd>{{ post.views }}</dd>
        </div>
      </dl>

      <div v-if="post.canEdit || post.canDelete" class="post-card-actions">
        <button
          v-if="post.canEdit"
          class="secondary-button"
          type="button"
          @click="$emit('edit', post)"
        >
          수정
        </button>
        <button
          v-if="post.canDelete"
          class="danger-button"
          type="button"
          @click="$emit('delete', post)"
        >
          삭제
        </button>
      </div>
    </div>
  </article>
</template>
