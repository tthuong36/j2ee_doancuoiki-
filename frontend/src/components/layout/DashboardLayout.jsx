import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'
import { ROLES } from '../../utils/constants'
import { useState } from 'react'

export default function DashboardLayout({ navItems = [], children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const dashboardUrl = {
    [ROLES.ADMIN]: '/admin',
    [ROLES.OWNER]: '/owner',
    [ROLES.USER]:  '/dashboard',
  }[user?.role] ?? '/dashboard'

  const profileUrl = {
    [ROLES.ADMIN]: '/admin/profile',
    [ROLES.OWNER]: '/owner/profile',
    [ROLES.USER]:  '/dashboard/profile',
  }[user?.role] ?? '/dashboard/profile'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ══════════════════════════════════════
          NAVBAR — giống trang chủ
      ══════════════════════════════════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: '64px',
        background: 'rgba(28,31,39,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%',
      }}>
        {/* Logo */}
        <Link to="/" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '1.8rem', letterSpacing: '3px', color: '#fff', textDecoration: 'none' }}>
          D2<span style={{ color: '#E8390E' }}>-</span>CAR
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <Link to="/search" style={{ fontSize: '14px', fontWeight: '500', color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#9CA3AF'}>
            Tìm Xe
          </Link>
          <Link to="/board" style={{ fontSize: '14px', fontWeight: '500', color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#9CA3AF'}>
            Bảng Tin
          </Link>
        </nav>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E8390E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', color: '#fff', flexShrink: 0 }}>
              {getInitials(user?.name || user?.email || 'U')}
            </div>
            <span style={{ fontSize: '14px', color: '#D1D5DB', fontWeight: '500' }}>
              {user?.name ?? user?.email}
            </span>
            <span style={{ color: '#6B7280', fontSize: '11px' }}>▾</span>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
              <div style={{ position: 'absolute', right: 0, top: '48px', zIndex: 50, width: '200px', background: '#1C1F27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name ?? user?.email}</p>
                  <p style={{ fontSize: '11px', color: '#E8390E', margin: 0, textTransform: 'capitalize', fontWeight: '600' }}>{user?.role}</p>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <Link to={dashboardUrl} onClick={() => setMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#D1D5DB', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    📊 Dashboard
                  </Link>
                  <Link to={profileUrl} onClick={() => setMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#D1D5DB', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    👤 Hồ Sơ
                  </Link>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '4px 0' }}>
                  <button onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    🚪 Đăng Xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════
          BODY = Sidebar + Main
      ══════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: 1, paddingTop: '64px' }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: '240px', flexShrink: 0,
          background: '#1C1F27',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky', top: '64px',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Profile mini */}
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E8390E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                {getInitials(user?.name || user?.email || 'U')}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name ?? user?.email}
                </p>
                <p style={{ fontSize: '11px', color: '#E8390E', margin: 0, fontWeight: '600', textTransform: 'capitalize' }}>
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '12px 0' }}>
            {navItems.map((section, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                {section.label && (
                  <p style={{ padding: '8px 20px 4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4B5563' }}>
                    {section.label}
                  </p>
                )}
                {section.items.map(({ to, icon, label }) => (
                  <NavLink key={to} to={to} end
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 20px', fontSize: '14px',
                      textDecoration: 'none', transition: 'all 0.15s',
                      borderLeft: isActive ? '2px solid #E8390E' : '2px solid transparent',
                      color: isActive ? '#E8390E' : '#9CA3AF',
                      background: isActive ? 'rgba(232,57,14,0.06)' : 'transparent',
                      fontWeight: isActive ? '600' : '400',
                    })}
                    onMouseEnter={e => { if (!e.currentTarget.style.borderLeftColor.includes('E8390E')) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}}
                    onMouseLeave={e => { if (!e.currentTarget.style.borderLeftColor.includes('E8390E')) { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent' }}}
                  >
                    <span style={{ fontSize: '16px' }}>{icon}</span>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '14px', color: '#F87171', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              🚪 Đăng Xuất
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, minWidth: 0, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}