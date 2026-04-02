import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { getInitials, formatDate } from '../../utils/formatters'
import { ROLES } from '../../utils/constants'
import axiosClient from '../../api/axiosClient'
import { OWNER_NAV } from '../owner/OwnerDashboard'
import { ADMIN_NAV } from '../admin/AdminDashboard'

const RENTER_NAV = [
  {
    label: 'Tổng Quan', items: [
      { to: '/dashboard', icon: '📊', label: 'Tổng Quan' },
      { to: '/dashboard/bookings', icon: '🗓️', label: 'Chuyến Của Tôi' },
    ]
  },
  {
    label: 'Tài Khoản', items: [
      { to: '/dashboard/profile', icon: '👤', label: 'Hồ Sơ' },
      { to: '/search', icon: '🔍', label: 'Tìm Xe Mới' },
    ]
  },
]

const TABS = [
  { key: 'info', icon: '👤', label: 'Thông Tin' },
  { key: 'security', icon: '🔒', label: 'Bảo Mật' },
]

export default function ProfilePage() {
  const { user, logout, isAdmin, isOwner } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef()
  const navItems = isAdmin ? ADMIN_NAV : isOwner ? OWNER_NAV : RENTER_NAV

  const [activeTab, setActiveTab] = useState('info')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const [infoForm, setInfoForm] = useState({
    name: '', phone: '', address: '',
  })
  const [passForm, setPassForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })

  // Load profile từ API
  useEffect(() => {
    axiosClient.get('/auth/me')
      .then(({ data }) => {
        setProfile(data)
        setInfoForm({
          name: data.name ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
        })
      })
      .catch(() => {
        // Fallback dùng data từ localStorage
        setProfile(user)
        setInfoForm({ name: user?.name ?? '', phone: '', address: '' })
      })
      .finally(() => setLoading(false))
  }, [])

  function handleInfoChange(e) {
    setInfoForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }
  function handlePassChange(e) {
    setPassForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }
  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { toast.error('Ảnh tối đa 3MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  // Lưu thông tin cá nhân
  async function handleSaveInfo(e) {
    e.preventDefault()
    if (!infoForm.name.trim()) { toast.error('Vui lòng nhập họ tên'); return }
    setSavingInfo(true)
    try {
      const fd = new FormData()
      if (infoForm.name) fd.append('name', infoForm.name.trim())
      if (infoForm.phone) fd.append('phone', infoForm.phone.trim())
      if (infoForm.address) fd.append('address', infoForm.address.trim())
      if (avatarFile) fd.append('avatar', avatarFile)

      const { data } = await axiosClient.put('/auth/me', fd)
      setProfile(data)
      setAvatarFile(null)

      // Cập nhật tên trong localStorage
      const stored = JSON.parse(localStorage.getItem('d2car_user') || '{}')
      stored.name = data.name
      if (data.avatar) stored.avatar = data.avatar
      localStorage.setItem('d2car_user', JSON.stringify(stored))

      toast.success('Cập nhật thông tin thành công! ✅')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Cập nhật thất bại')
    } finally { setSavingInfo(false) }
  }

  // Đổi mật khẩu
  async function handleSavePassword(e) {
    e.preventDefault()
    if (!passForm.currentPassword) { toast.error('Vui lòng nhập mật khẩu hiện tại'); return }
    if (!passForm.newPassword) { toast.error('Vui lòng nhập mật khẩu mới'); return }
    if (passForm.newPassword.length < 6) { toast.error('Mật khẩu mới tối thiểu 6 ký tự'); return }
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return }

    setSavingPass(true)
    try {
      await axiosClient.patch('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      })
      toast.success('Đổi mật khẩu thành công! 🔒')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Đổi mật khẩu thất bại')
    } finally { setSavingPass(false) }
  }

  const roleLabel = {
    [ROLES.ADMIN]: 'Quản Trị Viên',
    [ROLES.OWNER]: 'Chủ Xe',
    [ROLES.USER]: 'Người Thuê Xe',
  }[user?.role] ?? user?.role

  const roleColor = {
    [ROLES.ADMIN]: '#FBBF24',
    [ROLES.OWNER]: '#60A5FA',
    [ROLES.USER]: '#E8390E',
  }[user?.role] ?? '#E8390E'

  const displayName = profile?.name || infoForm.name || user?.email || 'Người dùng'
  const currentAvatar = avatarPreview || profile?.avatar || null

  if (loading) return (
    <DashboardLayout navItems={navItems}>
      <LoadingSpinner text="Đang tải hồ sơ..." />
    </DashboardLayout>
  )

  return (
    <DashboardLayout navItems={navItems}>
      <div style={{ maxWidth: '640px' }}>

        {/* ── Banner profile ── */}
        <div style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
          {/* Cover */}
          <div style={{ height: '80px', background: 'linear-gradient(135deg, #E8390E 0%, #1C1F27 100%)' }} />

          <div style={{ padding: '0 24px 20px' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginTop: '-36px', marginBottom: '12px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '4px solid #1E2129', overflow: 'hidden', background: '#E8390E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                {currentAvatar
                  ? <img src={currentAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '26px', fontWeight: '700', color: '#fff' }}>{getInitials(displayName)}</span>
                }
              </div>
              <button onClick={() => fileRef.current.click()}
                style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', background: '#E8390E', border: '2px solid #1E2129', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px' }}
                title="Đổi ảnh đại diện">
                ✏️
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: 0 }}>{displayName}</p>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '2px 0' }}>{profile?.email || user?.email}</p>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: roleColor }}>{roleLabel}</span>
              </div>
              <button onClick={() => { logout(); navigate('/') }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.3)', background: 'transparent', color: '#F87171', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                🚪 Đăng Xuất
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#252931', borderRadius: '12px', marginBottom: '24px' }}>
          {TABS.map(({ key, icon, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === key ? '#E8390E' : 'transparent', color: activeTab === key ? '#fff' : '#9CA3AF' }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ══ TAB THÔNG TIN ══ */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo}>

            {/* Preview ảnh mới */}
            {avatarPreview && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.25)', borderRadius: '10px', marginBottom: '16px' }}>
                <img src={avatarPreview} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', margin: 0 }}>Ảnh đại diện mới đã chọn</p>
                  <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>Nhấn "Lưu thay đổi" để cập nhật</p>
                </div>
                <button type="button" onClick={() => { setAvatarPreview(null); setAvatarFile(null) }}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '18px' }}>✕</button>
              </div>
            )}

            <div style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: '0 0 20px' }}>Thông Tin Cá Nhân</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Họ Và Tên *
                  </label>
                  <input name="name" value={infoForm.name} onChange={handleInfoChange}
                    placeholder="Nguyễn Văn A" required
                    style={{ width: '100%', background: '#252931', border: '1px solid rgba(255,255,255,0.1)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#E8390E'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Số Điện Thoại
                  </label>
                  <input name="phone" value={infoForm.phone} onChange={handleInfoChange}
                    placeholder="0901234567" type="tel"
                    style={{ width: '100%', background: '#252931', border: '1px solid rgba(255,255,255,0.1)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#E8390E'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Địa Chỉ
                </label>
                <input name="address" value={infoForm.address} onChange={handleInfoChange}
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                  style={{ width: '100%', background: '#252931', border: '1px solid rgba(255,255,255,0.1)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#E8390E'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Email
                </label>
                <input value={profile?.email || user?.email || ''} disabled
                  style={{ width: '100%', background: '#1A1D23', border: '1px solid rgba(255,255,255,0.06)', color: '#6B7280', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }} />
                <p style={{ fontSize: '11px', color: '#4B5563', marginTop: '4px' }}>Email không thể thay đổi</p>
              </div>
            </div>

            <button type="submit" disabled={savingInfo}
              style={{ padding: '12px 32px', background: '#E8390E', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: savingInfo ? 'not-allowed' : 'pointer', opacity: savingInfo ? 0.7 : 1, transition: 'all 0.2s' }}>
              {savingInfo ? '⏳ Đang lưu...' : '💾 Lưu Thay Đổi'}
            </button>
          </form>
        )}

        {/* ══ TAB BẢO MẬT ══ */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Đổi mật khẩu */}
            <form onSubmit={handleSavePassword}
              style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: '0 0 20px' }}>Đổi Mật Khẩu</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {[
                  { name: 'currentPassword', label: 'Mật Khẩu Hiện Tại', placeholder: 'Nhập mật khẩu hiện tại' },
                  { name: 'newPassword', label: 'Mật Khẩu Mới', placeholder: 'Tối thiểu 6 ký tự' },
                  { name: 'confirmPassword', label: 'Xác Nhận Mật Khẩu', placeholder: 'Nhập lại mật khẩu mới' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      {label}
                    </label>
                    <input type="password" name={name} value={passForm[name]} onChange={handlePassChange}
                      placeholder={placeholder}
                      style={{ width: '100%', background: '#252931', border: '1px solid rgba(255,255,255,0.1)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#E8390E'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                ))}

                {/* Hiển thị trạng thái khớp mật khẩu */}
                {passForm.confirmPassword && (
                  <p style={{ fontSize: '12px', margin: 0, color: passForm.newPassword === passForm.confirmPassword ? '#34D399' : '#F87171' }}>
                    {passForm.newPassword === passForm.confirmPassword ? '✅ Mật khẩu khớp' : '⚠️ Mật khẩu không khớp'}
                  </p>
                )}
              </div>

              <button type="submit" disabled={savingPass}
                style={{ padding: '10px 28px', background: '#E8390E', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: savingPass ? 'not-allowed' : 'pointer', opacity: savingPass ? 0.7 : 1 }}>
                {savingPass ? '⏳ Đang lưu...' : '🔒 Đổi Mật Khẩu'}
              </button>
            </form>

            {/* Thông tin tài khoản */}
            <div style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: '0 0 16px' }}>Thông Tin Tài Khoản</h3>
              {[
                { label: 'Trạng thái', value: '✅ Đang hoạt động', color: '#34D399' },
                { label: 'Loại tài khoản', value: roleLabel, color: roleColor },
                { label: 'Email', value: profile?.email || user?.email || '—', color: '#D1D5DB' },
                { label: 'Ngày tham gia', value: formatDate(profile?.createdAt), color: '#D1D5DB' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                  <span style={{ color: '#9CA3AF' }}>{label}</span>
                  <span style={{ color, fontWeight: '500' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}   