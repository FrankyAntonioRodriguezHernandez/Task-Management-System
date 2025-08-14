import { unref } from 'vue'
import { useApi } from '../composables/useApi'

export interface TaskComment { id: number; user_id: number; comment: string; created_at: string }
export interface TaskAttachment { id: number; file_name: string; file_size: number }

export function useTaskExtras(taskId: MaybeRef<number>) {
  const api = useApi()
  const comments = ref<TaskComment[]>([])
  const attachments = ref<TaskAttachment[]>([])
  const loading = ref(false)

  async function fetchComments() {
    loading.value = true
    const { data } = await api.get(`/tasks/${unref(taskId)}/comments`)
    comments.value = data
    loading.value = false
  }

  async function addComment(userId: number, comment: string) {
    await api.post(`/tasks/${unref(taskId)}/comments`, { user_id: userId, comment })
    await fetchComments()
  }

  async function updateComment(commentId: number, comment: string) {
    await api.put(`/tasks/${unref(taskId)}/comments/${commentId}`, { comment })
    await fetchComments()
  }

  async function deleteComment(commentId: number) {
    await api.delete(`/tasks/${unref(taskId)}/comments/${commentId}`)
    await fetchComments()
  }

  async function fetchAttachments() {
    const { data } = await api.get(`/tasks/${unref(taskId)}/attachments`)
    attachments.value = data
  }

  async function uploadAttachment(file: File, uploaded_by: number) {
    if (file.size > 5 * 1024 * 1024) throw new Error('Máx 5MB')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('uploaded_by', String(uploaded_by))
    await api.post(`/tasks/${unref(taskId)}/attachments`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    await fetchAttachments()
  }

  async function deleteAttachment(attachmentId: number) {
    await api.delete(`/attachments/${attachmentId}`)
    await fetchAttachments()
  }

  async function downloadAttachment(attachmentId: number) {
    const res = await api.get(`/attachments/${attachmentId}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'download'
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    comments, attachments, loading,
    fetchComments, addComment, updateComment, deleteComment,
    fetchAttachments, uploadAttachment, deleteAttachment, downloadAttachment
  }
}
