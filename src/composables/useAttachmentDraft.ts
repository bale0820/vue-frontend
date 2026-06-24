import { ref, type Ref } from 'vue'
import type { AttachmentPreview } from '../components/AttachmentPreviewList.vue'
import {
  createAttachmentPreviews,
  fileKey,
  revokeAttachmentPreviews,
  uniqueNewFiles,
} from '../utils/attachments'

export function useAttachmentDraft() {
  const files = ref<File[]>([]) as Ref<File[]>
  const previews = ref<AttachmentPreview[]>([])

  function append(selectedFiles: File[]) {
    if (!selectedFiles.length) return

    const newFiles = uniqueNewFiles(files.value, selectedFiles)
    if (!newFiles.length) return

    files.value = [...files.value, ...newFiles]
    previews.value = [...previews.value, ...createAttachmentPreviews(newFiles)]
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement
    append(Array.from(target.files ?? []))
    target.value = ''
  }

  function clear() {
    revokeAttachmentPreviews(previews.value)
    files.value = []
    previews.value = []

  }

  function remove(id: string) {
    const removedPreview = previews.value.find((preview) => preview.id === id)

    if (removedPreview?.url) {
      URL.revokeObjectURL(removedPreview.url)
    }

    previews.value = previews.value.filter((preview) => preview.id !== id)
    files.value = files.value.filter((file) => fileKey(file) !== id)
  }

  return {
    files,
    previews,
    append,
    handleChange,
    clear,
    remove,
  }
}
