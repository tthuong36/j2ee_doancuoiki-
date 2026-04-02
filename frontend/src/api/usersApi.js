// ============================================================
// usersApi.js — sync với /api/admin/users
// ============================================================
import axiosClient from './axiosClient'

// 1. Danh sách users (có filter + pagination)
export function getAllUsers(params = {}) {
  return axiosClient.get('/admin/users', { params })
}

// 2. Chi tiết 1 user
export function getUserById(id) {
  return axiosClient.get(`/admin/users/${id}`)
}

// 3. Đổi role
export function changeUserRole(id, role) {
  return axiosClient.patch(`/admin/users/${id}/role`, { role })
}

// 4. Khóa / mở khóa (field isActive)
export function toggleUserStatus(id, isActive) {
  return axiosClient.patch(`/admin/users/${id}/status`, { isActive })
}

// 5. Xóa user
export function deleteUser(id) {
  return axiosClient.delete(`/admin/users/${id}`)
}

// Cập nhật profile (name, phone, address, avatar)
export function updateUserProfile(id, data) {
  return axiosClient.patch(`/admin/users/${id}/profile`, data)
}

// Profile của mình (dùng trong ProfilePage)
export function getMyProfile() {
  return axiosClient.get('/auth/me')
}

export function updateMyProfile(data) {
  return axiosClient.put('/auth/me', data)
}