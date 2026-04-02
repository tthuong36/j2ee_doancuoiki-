// ============================================================
// Navbar.jsx
// Thanh điều hướng cố định phía trên cùng.
// Hiển thị khác nhau tùy theo trạng thái đăng nhập và role.
// ============================================================

import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'
import { ROLES } from '../../utils/constants'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  // URL dashboard tùy theo role
  const dashboardUrl = {
    [ROLES.ADMIN]: '/admin',
    [ROLES.OWNER]: '/owner',
    [ROLES.USER]:  '/dashboard',
  }[user?.role] ?? '/dashboard'

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-dark-2/90 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto h-full px-5 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className="font-display text-3xl tracking-widest text-white">
          D2<span className="text-primary">-</span>CAR
        </Link>

        {/* ── Nav links (desktop) ── */}
        <nav className="hidden md:flex items-center gap-7">
          {[
            { to: '/search', label: 'Tìm Xe' },
            { to: '/board',  label: 'Bảng Tin' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Auth area ── */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              {/* Avatar button */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 group"
              >
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold select-none">
                  {getInitials(user?.name || user?.email || 'U')}
                </div>
                <span className="hidden md:block text-sm text-gray-300 group-hover:text-white">
                  {user?.name ?? user?.email}
                </span>
                <span className="text-gray-500 text-xs">▾</span>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <>
                  {/* Overlay để đóng menu khi click ngoài */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-52 bg-dark-2 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.name ?? user?.email}
                      </p>
                      <p className="text-xs text-primary capitalize">{user?.role}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to={dashboardUrl}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        to={`${dashboardUrl}/profile`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                      >
                        👤 Hồ Sơ
                      </Link>
                    </div>
                    <div className="border-t border-white/8 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        🚪 Đăng Xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    className="btn-outline btn-sm btn">Đăng Nhập</Link>
              <Link to="/register" className="btn-primary btn-sm btn">Đăng Ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
