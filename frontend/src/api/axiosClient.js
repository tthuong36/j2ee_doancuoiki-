// ============================================================
// axiosClient.js
// Instance Axios dùng chung cho toàn bộ app.
// ============================================================

import axios from 'axios'
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  // KHÔNG đặt cứng Content-Type ở đây để Axios tự linh hoạt 
  // giữa 'application/json' và 'multipart/form-data'
})

// ── Request Interceptor ──────────────────────────────────────
// Trước mỗi request, lấy token từ localStorage và gắn vào header.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Nếu dữ liệu gửi đi KHÔNG phải là FormData, mới đặt là application/json
  // Nếu là FormData (để upload ảnh), ta để trình duyệt tự xử lý.
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

// ── Response Interceptor ─────────────────────────────────────
// Nếu server trả về 401 (token hết hạn/sai), xóa token và về trang login.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      // Chuyển về trang login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient