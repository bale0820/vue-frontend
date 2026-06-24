import type { AttachmentPreview } from '../components/AttachmentPreviewList.vue'

export function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

export function createAttachmentPreviews(files: File[]): AttachmentPreview[] {
  return files.map((file) => ({
    id: fileKey(file),
    name: file.name,
    url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    isImage: file.type.startsWith('image/'),
  }))
}

export function revokeAttachmentPreviews(previews: AttachmentPreview[]) {
  previews.forEach((preview) => {
    if (preview.url) {
      URL.revokeObjectURL(preview.url)
    }
  })
}

export function uniqueNewFiles(currentFiles: File[], files: File[]) {
  const currentKeys = new Set(currentFiles.map(fileKey))

  return files.filter((file) => {
    const key = fileKey(file)

    if (currentKeys.has(key)) {
      return false
    }

    currentKeys.add(key)
    return true
  })
}
