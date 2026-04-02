// ============================================================
// postsApi.js
// Tất cả API liên quan đến bảng tin (bulletin board).
// ============================================================

import axiosClient from './axiosClient'

/**
 * Lấy bảng tin công khai (chỉ bài đã duyệt).
 * @param {{ postType?, location? }} params - filter tùy chọn
 */
export function getPosts(params = {}) {
  return axiosClient.get('/posts', { params })
}

/** Lấy bài đăng của user đang đăng nhập */
export function getMyPosts() {
  return axiosClient.get('/posts/me/list')
}

/**
 * Tạo bài đăng mới (sẽ ở trạng thái pending, chờ admin duyệt).
 * @param {object} data
 */
export function createPost(data) {
  return axiosClient.post('/posts', data)
}

/** Sửa bài đăng */
export function updatePost(id, data) {
  return axiosClient.put(`/posts/${id}`, data)
}

/** Xóa bài đăng */
export function deletePost(id) {
  return axiosClient.delete(`/posts/${id}`)
}

// ── Admin only ────────────────────────────────────────────────

/** Lấy danh sách bài chờ duyệt (admin) */
export function getPendingPosts() {
  return axiosClient.get('/posts/admin/pending')
}

/** Duyệt bài (admin) */
export function approvePost(id, reviewNote = '') {
  return axiosClient.patch(`/posts/admin/${id}/approve`, { reviewNote })
}

/** Từ chối bài (admin) */
export function rejectPost(id, reviewNote = '') {
  return axiosClient.patch(`/posts/admin/${id}/reject`, { reviewNote })
}
