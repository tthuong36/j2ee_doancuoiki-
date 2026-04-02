// ============================================================
// authApi.js
// Tất cả API liên quan đến xác thực (đăng ký, đăng nhập).
// ============================================================

import axiosClient from './axiosClient'

/**
 * Đăng ký tài khoản mới.
 * @param {{ name, email, password, role }} data
 * @returns {{ token: string }}
 */
export function register(data) {
  return axiosClient.post('/auth/register', data)
}

/**
 * Đăng nhập.
 * @param {{ email, password }} data
 * @returns {{ token: string }}
 */
export function login(data) {
  return axiosClient.post('/auth/login', data)
}

/**
 * Lấy thông tin người dùng hiện tại từ token.
 */
export function getMe() {
  return axiosClient.get('/auth/me')
}
