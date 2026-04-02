import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LoadingSpinner  from '../../components/common/LoadingSpinner'
import StatusBadge     from '../../components/common/StatusBadge'
import { getMyBookings } from '../../api/bookingsApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { CITIES } from '../../utils/constants'

const NAV_ITEMS = [
  {
    label: 'Tổng Quan',
    items: [
      { to: '/dashboard',          icon: '📊', label: 'Tổng Quan'      },
      { to: '/dashboard/bookings', icon: '🗓️', label: 'Chuyến Của Tôi' },
    ],
  },
  {
    label: 'Tài Khoản',
    items: [
      { to: '/dashboard/profile', icon: '👤', label: 'Hồ Sơ'      },
      { to: '/search',            icon: '🔍', label: 'Tìm Xe Mới' },
    ],
  },
]

export default function RenterDashboard() {
  const navigate = useNavigate()
  const [bookings,  setBookings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [city,      setCity]      = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')

  useEffect(() => {
    getMyBookings()
      .then(({ data }) => setBookings(data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total:     bookings.length,
    active:    bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    spent:     bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0),
  }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('location', city)
    navigate(`/search${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS}>

      {/* ── Breadcrumb + Header ── */}
      <div style={{ marginBottom: '24px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '13px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8390E'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
          >
            🏠 Trang Chủ
          </button>
          <span style={{ color: '#374151' }}>›</span>
          <span style={{ color: '#E8390E', fontWeight: '600' }}>Tổng Quan</span>
        </div>

        {/* Nút back + Tiêu đề */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)',
              color: '#9CA3AF', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8390E'; e.currentTarget.style.color = '#E8390E' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#9CA3AF' }}
            title="Quay lại"
          >
            ←
          </button>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '2rem', letterSpacing: '2px', color: '#fff', margin: 0 }}>
              TỔNG QUAN
            </h1>
            <p style={{ color: '#6B7280', fontSize: '13px', margin: 0, marginTop: '2px' }}>
              Xem tất cả hoạt động thuê xe của bạn
            </p>
          </div>
        </div>
      </div>

      {/* ── Thanh tìm kiếm nhanh ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,57,14,0.15) 0%, rgba(28,31,39,0.9) 100%)',
        border: '1px solid rgba(232,57,14,0.25)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        {/* Tiêu đề search box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <span style={{ fontSize: '22px' }}>🚗</span>
          <div>
            <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: 0 }}>
              Tìm Xe Thuê Ngay
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>
              Hàng trăm xe chất lượng đang chờ bạn
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                📍 Địa Điểm
              </label>
              <select value={city} onChange={e => setCity(e.target.value)}
                style={{ width: '100%', background: '#111318', border: '1px solid rgba(255,255,255,0.12)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                <option value="">Chọn thành phố</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                📅 Ngày Nhận Xe
              </label>
              <input type="date" value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setStartDate(e.target.value)}
                style={{ width: '100%', background: '#111318', border: '1px solid rgba(255,255,255,0.12)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                📅 Ngày Trả Xe
              </label>
              <input type="date" value={endDate}
                min={startDate || new Date().toISOString().split('T')[0]}
                onChange={e => setEndDate(e.target.value)}
                style={{ width: '100%', background: '#111318', border: '1px solid rgba(255,255,255,0.12)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit"
              style={{ padding: '10px 24px', background: '#E8390E', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap', height: '42px' }}>
              🔍 Tìm Xe
            </button>
          </div>
        </form>

        {/* Quick links */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Tìm nhanh:</span>
          {['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Đà Lạt'].map(c => (
            <button key={c}
              onClick={() => navigate(`/search?location=${encodeURIComponent(c)}`)}
              style={{ fontSize: '12px', color: '#E8390E', background: 'rgba(232,57,14,0.1)', border: '1px solid rgba(232,57,14,0.2)', borderRadius: '100px', padding: '3px 12px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,57,14,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(232,57,14,0.1)'}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng Chuyến',   value: stats.total,                 color: '#E8390E', icon: '🗓️' },
          { label: 'Đang Thuê',     value: stats.active,                color: '#FBBF24', icon: '🚗' },
          { label: 'Hoàn Thành',   value: stats.completed,             color: '#34D399', icon: '✅' },
          { label: 'Tổng Chi Tiêu', value: formatCurrency(stats.spent), color: '#60A5FA', icon: '💰' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="card p-5" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Icon mờ phía sau */}
            <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '28px', opacity: 0.08 }}>
              {icon}
            </span>
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '8px' }}>
              {label}
            </p>
            <p style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '2rem', color, lineHeight: 1, margin: 0 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Chuyến gần đây ── */}
      <div className="card p-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: '700', color: '#fff', fontSize: '16px', margin: 0 }}>
            🗓️ Chuyến Gần Đây
          </h2>
          <Link to="/dashboard/bookings"
            style={{ color: '#E8390E', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Đang tải chuyến đi..." />
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6B7280' }}>
            <p style={{ fontSize: '40px', opacity: 0.15, marginBottom: '12px' }}>🚗</p>
            <p style={{ marginBottom: '16px', fontSize: '14px' }}>Bạn chưa có chuyến thuê xe nào</p>
            <button onClick={() => navigate('/search')}
              style={{ padding: '8px 20px', background: '#E8390E', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
              Tìm Xe Ngay
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Xe', 'Nhận Xe', 'Trả Xe', 'Tổng Tiền', 'Trạng Thái'].map(h => (
                    <th key={h} style={{ textAlign: 'left', paddingBottom: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', fontWeight: '700', paddingRight: '16px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id || b._id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px 12px 0', fontWeight: '600', color: '#fff' }}>
                      {b.car?.make} {b.car?.model}
                    </td>
                    <td style={{ padding: '12px 16px 12px 0', color: '#9CA3AF' }}>{formatDate(b.startDate)}</td>
                    <td style={{ padding: '12px 16px 12px 0', color: '#9CA3AF' }}>{formatDate(b.endDate)}</td>
                    <td style={{ padding: '12px 16px 12px 0', color: '#E8390E', fontWeight: '600' }}>{formatCurrency(b.totalPrice)}</td>
                    <td style={{ padding: '12px 0' }}><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </DashboardLayout>
  )
}