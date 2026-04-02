// ============================================================
// AuthContext.jsx
// Quản lý trạng thái xác thực toàn cục (global auth state).
//
// Cách dùng trong component bất kỳ:
//   const { user, login, logout, isAuthenticated } = useAuth()
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react'
import { TOKEN_KEY, USER_KEY }   from '../utils/constants'
import * as authApi              from '../api/authApi'

// Tạo Context
const AuthContext = createContext(null)

// ── Provider ─────────────────────────────────────────────────
// Bọc toàn bộ ứng dụng bên trong Provider này (xem App.jsx)
export function AuthProvider({ children }) {
  // Khôi phục user từ localStorage khi reload trang
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  /**
   * Đăng nhập: gọi API → lưu token + user vào localStorage
   * @param {{ email, password }} credentials
   */
  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    const { token } = data

    // Decode JWT payload để lấy thông tin user
    // JWT có dạng: header.payload.signature (base64)
    const payload = JSON.parse(atob(token.split('.')[1]))
    localStorage.setItem(TOKEN_KEY, token)
    const { data: me } = await authApi.getMe()

    const userData = {
      id: me?.id || payload.id || payload._id,
      role: me?.role || payload.role,
      email: me?.email || credentials.email,
      name: me?.name || payload.name || '',
      avatar: me?.avatar || '',
      isActive: me?.isActive,
    }

    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)

    return userData
  }, [])

  /**
   * Đăng ký: gọi API → tự động đăng nhập luôn
   * @param {{ name, email, password, role }} info
   */
  const register = useCallback(async (info) => {
    const { data } = await authApi.register(info)
    const { token } = data

    const payload = JSON.parse(atob(token.split('.')[1]))
    localStorage.setItem(TOKEN_KEY, token)
    const { data: me } = await authApi.getMe()

    const userData = {
      id: me?.id || payload.id || payload._id,
      role: me?.role || payload.role || info.role,
      email: me?.email || info.email,
      name: me?.name || info.name || '',
      avatar: me?.avatar || '',
      isActive: me?.isActive,
    }

    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)

    return userData
  }, [])

  /** Đăng xuất: xóa localStorage và reset state */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin:         user?.role === 'admin',
    isOwner:         user?.role === 'owner',
    isUser:          user?.role === 'user',
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Custom Hook ───────────────────────────────────────────────
// Dùng hook này thay vì useContext(AuthContext) cho gọn
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
