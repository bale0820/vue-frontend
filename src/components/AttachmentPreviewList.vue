<script setup lang="ts">
export type AttachmentPreview = {
  id: string
  name: string
  url: string | null
  isImage: boolean
}

defineProps<{
  previews: AttachmentPreview[]
  clearLabel: string
  removable?: boolean
}>()

defineEmits<{
  clear: []
  remove: [id: string]
}>()
</script>

<template>
  <div v-if="previews.length" class="image-preview">
    <div v-for="preview in previews" :key="preview.id" class="attachment-preview">
      <img v-if="preview.isImage && preview.url" :src="preview.url" :alt="preview.name" />
      <span v-else>{{ preview.name }}</span>
      <button
        v-if="removable"
        type="button"
        class="attachment-remove-button"
        @click="$emit('remove', preview.id)"
      >
        삭제
      </button>
    </div>
    <button type="button" class="secondary-button" @click="$emit('clear')">
      {{ clearLabel }}
    </button>
  </div>
</template>
