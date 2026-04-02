import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LoadingSpinner  from '../../components/common/LoadingSpinner'
import { getAllUsers, changeUserRole, toggleUserStatus, deleteUser } from '../../api/usersApi'
import { formatDate, getInitials } from '../../utils/formatters'
import { ADMIN_NAV } from './AdminDashboard'

const ROLE_CONFIG = {
  admin: { label: '👑 Admin',      color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  },
  owner: { label: '🚗 Chủ Xe',     color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
  user:  { label: '👤 Người Thuê', color: '#34D399', bg: 'rgba(52,211,153,0.12)'  },
}

// ── Modal chi tiết + sửa user ────────────────────────────────
function UserModal({ user, onClose, onRoleChange, onToggle, onDelete }) {
  const [newRole, setNewRole] = useState(user.role)
  const [saving,  setSaving]  = useState(false)

  async function handleSaveRole() {
    if (newRole === user.role) { toast('Role không thay đổi'); return }
    setSaving(true)
    try {
      await onRoleChange(user._id, newRole)
      toast.success('Đã đổi role thành công!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Đổi role thất bại')
    } finally { setSaving(false) }
  }

  const isActive = user.isActive !== false

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div style={{ background: '#1C1F27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', position: 'relative' }}>

        {/* Nút đóng */}
        <button onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#6B7280', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>
          ✕
        </button>

        {/* Avatar + tên */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#E8390E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
            {user.avatar
              ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(user.name || user.email)
            }
          </div>
          <div>
            <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '18px', margin: '0 0 4px' }}>
              {user.name || '—'}
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '13px', margin: '0 0 6px' }}>{user.email}</p>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '100px', background: ROLE_CONFIG[user.role]?.bg, color: ROLE_CONFIG[user.role]?.color }}>
              {ROLE_CONFIG[user.role]?.label}
            </span>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div style={{ background: '#252931', borderRadius: '10px', padding: '4px 16px', marginBottom: '20px' }}>
          {[
            { label: 'ID',         value: user._id },
            { label: 'Số ĐT',      value: user.phone   || '—' },
            { label: 'Địa chỉ',    value: user.address || '—' },
            { label: 'Ngày tạo',   value: formatDate(user.createdAt) },
            { label: 'Trạng thái', value: isActive ? '✅ Đang hoạt động' : '🔒 Bị khóa',
              color: isActive ? '#34D399' : '#F87171' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
              <span style={{ color: '#6B7280', flexShrink: 0 }}>{label}</span>
              <span style={{ color: color || '#D1D5DB', textAlign: 'right', wordBreak: 'break-all', maxWidth: '260px' }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Đổi role */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Đổi Role
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {['user', 'owner', 'admin'].map(r => (
              <button key={r} onClick={() => setNewRole(r)}
                style={{ flex: 1, padding: '9px 6px', borderRadius: '8px', border: `1.5px solid ${newRole === r ? '#E8390E' : 'rgba(255,255,255,0.1)'}`, background: newRole === r ? 'rgba(232,57,14,0.12)' : 'transparent', color: newRole === r ? '#E8390E' : '#9CA3AF', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.15s' }}>
                {ROLE_CONFIG[r]?.label}
              </button>
            ))}
          </div>
          <button onClick={handleSaveRole} disabled={saving || newRole === user.role}
            style={{ width: '100%', padding: '10px', background: '#E8390E', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: saving || newRole === user.role ? 'not-allowed' : 'pointer', opacity: saving || newRole === user.role ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {saving ? '⏳ Đang lưu...' : '💾 Lưu Role Mới'}
          </button>
        </div>

        {/* Khóa / Xóa */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { onToggle(user); onClose() }}
            style={{ flex: 1, padding: '10px', background: isActive ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${isActive ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`, color: isActive ? '#FBBF24' : '#34D399', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            {isActive ? '🔒 Khóa Tài Khoản' : '🔓 Mở Tài Khoản'}
          </button>
          <button
            onClick={() => { onDelete(user._id, user.name || user.email); onClose() }}
            style={{ flex: 1, padding: '10px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', color: '#F87171', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            🗑️ Xóa Tài Khoản
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function ManageUsersPage() {
  const navigate = useNavigate()

  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page,         setPage]         = useState(1)
  const [pagination,   setPagination]   = useState({ total: 0, totalPages: 1 })
  const [selectedUser, setSelectedUser] = useState(null)
  const LIMIT = 10

  function loadUsers() {
    setLoading(true)
    const params = { page, limit: LIMIT }
    if (search)       params.q        = search
    if (roleFilter)   params.role     = roleFilter
    if (statusFilter) params.isActive = statusFilter

    getAllUsers(params)
      .then(({ data }) => {
        setUsers(data.items || [])
        setPagination(data.pagination || { total: 0, totalPages: 1 })
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [search, roleFilter, statusFilter, page])

  // Đổi role → cập nhật local state
  async function handleRoleChange(id, role) {
    const { data } = await changeUserRole(id, role)
    setUsers(p => p.map(u => u._id === id ? data : u))
    if (selectedUser?._id === id) setSelectedUser(data)
  }

  // Khóa / mở khóa
  async function handleToggle(user) {
    const newActive = user.isActive === false ? true : false
    try {
      const { data } = await toggleUserStatus(user._id, newActive)
      setUsers(p => p.map(u => u._id === user._id ? data : u))
      if (selectedUser?._id === user._id) setSelectedUser(data)
      toast.success(newActive ? '🔓 Đã mở khóa tài khoản' : '🔒 Đã khóa tài khoản')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Cập nhật thất bại')
    }
  }

  // Xóa
  async function handleDelete(id, name) {
    if (!window.confirm(`Xóa tài khoản "${name}"?\nHành động này KHÔNG THỂ hoàn tác!`)) return
    try {
      await deleteUser(id)
      toast.success('Đã xóa tài khoản')
      setUsers(p => p.filter(u => u._id !== id))
      setPagination(p => ({ ...p, total: p.total - 1 }))
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Xóa thất bại')
    }
  }

  const { total, totalPages } = pagination

  return (
    <DashboardLayout navItems={ADMIN_NAV}>

      {/* ── Breadcrumb + Header ── */}
      <div style={{ marginBottom: '28px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '13px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8390E'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
            🏠 Trang Chủ
          </button>
          <span style={{ color: '#374151' }}>›</span>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8390E'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
            Admin
          </button>
          <span style={{ color: '#374151' }}>›</span>
          <span style={{ color: '#E8390E', fontWeight: '600' }}>Người Dùng</span>
        </div>

        {/* Tiêu đề + filters */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => navigate(-1)}
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.2s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8390E'; e.currentTarget.style.color = '#E8390E' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#9CA3AF' }}>
              ←
            </button>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '2rem', letterSpacing: '2px', color: '#fff', margin: 0 }}>
                QUẢN LÝ NGƯỜI DÙNG
              </h1>
              <p style={{ color: '#6B7280', fontSize: '13px', margin: 0, marginTop: '2px' }}>
                {total} tài khoản trong hệ thống
              </p>
            </div>
          </div>

          {/* Bộ lọc */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="🔍 Tìm tên, email, SĐT..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)', color: '#F3F4F6', borderRadius: '10px', padding: '9px 14px', fontSize: '14px', outline: 'none', width: '220px' }}
              onFocus={e => e.target.style.borderColor = '#E8390E'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />

            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
              style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)', color: '#F3F4F6', borderRadius: '10px', padding: '9px 12px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
              <option value="">Tất cả role</option>
              <option value="user">Người Thuê</option>
              <option value="owner">Chủ Xe</option>
              <option value="admin">Admin</option>
            </select>

            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)', color: '#F3F4F6', borderRadius: '10px', padding: '9px 12px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
              <option value="">Tất cả trạng thái</option>
              <option value="true">Hoạt Động</option>
              <option value="false">Bị Khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng',        value: total,                                             color: '#E8390E' },
          { label: 'Người Thuê',  value: users.filter(u => u.role === 'user').length,       color: '#34D399' },
          { label: 'Chủ Xe',     value: users.filter(u => u.role === 'owner').length,      color: '#60A5FA' },
          { label: 'Admin',      value: users.filter(u => u.role === 'admin').length,      color: '#FBBF24' },
          { label: 'Bị Khóa',   value: users.filter(u => u.isActive === false).length,    color: '#F87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 18px' }}>
            <p style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', margin: 0 }}>{label}</p>
            <p style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '1.6rem', color, lineHeight: 1, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E8390E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Đang tải...
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#1E2129', borderRadius: '12px', color: '#6B7280' }}>
          <p style={{ fontSize: '40px', opacity: 0.2, marginBottom: '12px' }}>👥</p>
          <p>Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <>
          <div style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Người Dùng', 'Role', 'SĐT', 'Ngày Tạo', 'Trạng Thái', 'Hành Động'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', fontWeight: '700' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isActive = u.isActive !== false
                  return (
                    <tr key={u._id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setSelectedUser(u)}
                    >
                      {/* Avatar + tên */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#E8390E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                            {u.avatar
                              ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : getInitials(u.name || u.email)
                            }
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', color: '#fff', margin: 0, fontSize: '14px' }}>{u.name || '—'}</p>
                            <p style={{ color: '#6B7280', margin: 0, fontSize: '12px' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', background: ROLE_CONFIG[u.role]?.bg, color: ROLE_CONFIG[u.role]?.color }}>
                          {ROLE_CONFIG[u.role]?.label}
                        </span>
                      </td>

                      {/* SĐT */}
                      <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: '13px' }}>
                        {u.phone || '—'}
                      </td>

                      {/* Ngày tạo */}
                      <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: '13px' }}>
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Trạng thái */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', background: isActive ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: isActive ? '#34D399' : '#F87171' }}>
                          {isActive ? '✓ Hoạt Động' : '✗ Bị Khóa'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setSelectedUser(u)}
                            style={{ padding: '5px 10px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60A5FA', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                            👁️
                          </button>
                          <button onClick={() => handleToggle(u)}
                            style={{ padding: '5px 10px', background: isActive ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${isActive ? 'rgba(251,191,36,0.25)' : 'rgba(52,211,153,0.25)'}`, color: isActive ? '#FBBF24' : '#34D399', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                            {isActive ? '🔒' : '🔓'}
                          </button>
                          <button onClick={() => handleDelete(u._id, u.name || u.email)}
                            style={{ padding: '5px 10px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', color: '#F87171', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; e.currentTarget.style.color = '#F87171' }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '7px 16px', background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)', color: page === 1 ? '#4B5563' : '#D1D5DB', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding: '7px 12px', background: page === p ? '#E8390E' : '#1E2129', border: `1px solid ${page === p ? '#E8390E' : 'rgba(255,255,255,0.1)'}`, color: page === p ? '#fff' : '#D1D5DB', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: page === p ? '700' : '400' }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '7px 16px', background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)', color: page === totalPages ? '#4B5563' : '#D1D5DB', borderRadius: '8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal chi tiết */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRoleChange={handleRoleChange}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}

    </DashboardLayout>
  )
}