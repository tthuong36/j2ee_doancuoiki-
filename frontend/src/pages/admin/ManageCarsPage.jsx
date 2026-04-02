import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast           from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LoadingSpinner  from '../../components/common/LoadingSpinner'
import EmptyState      from '../../components/common/EmptyState'
import { getAllCars, deleteCar } from '../../api/carsApi'
import { formatCurrency } from '../../utils/formatters'
import { ADMIN_NAV }      from './AdminDashboard'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'

export default function ManageCarsPage() {
  const navigate = useNavigate()
  const [cars,    setCars]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    getAllCars()
      .then(({ data }) => setCars(data || []))
      .catch(() => setCars([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id, name) {
    if (!window.confirm(`Xóa xe "${name}"?`)) return
    try {
      await deleteCar(id)
      toast.success('Đã xóa xe')
      setCars(p => p.filter(c => (c.id || c._id) !== id))
    } catch {
      toast.error('Xóa thất bại')
    }
  }

  const filtered = cars.filter(c =>
    `${c.make} ${c.model} ${c.plate}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout navItems={ADMIN_NAV}>

      {/* ── Breadcrumb + Header ── */}
      <div style={{ marginBottom: '28px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '13px' }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8390E'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
            🏠 Trang Chủ
          </button>
          <span style={{ color: '#374151' }}>›</span>
          <button onClick={() => navigate('/admin')}
            style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8390E'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}>
            Admin
          </button>
          <span style={{ color: '#374151' }}>›</span>
          <span style={{ color: '#E8390E', fontWeight: '600' }}>Quản Lý Xe</span>
        </div>

        {/* Tiêu đề + Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>

          {/* Nút back + Tiêu đề */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => navigate(-1)}
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8390E'; e.currentTarget.style.color = '#E8390E' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#9CA3AF' }}
              title="Quay lại">
              ←
            </button>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '2rem', letterSpacing: '2px', color: '#fff', margin: 0 }}>
                QUẢN LÝ XE
              </h1>
              <p style={{ color: '#6B7280', fontSize: '13px', margin: 0, marginTop: '2px' }}>
                {cars.length} xe trong hệ thống
              </p>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Tìm theo tên, biển số..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)', color: '#F3F4F6', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', outline: 'none', width: '260px', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#E8390E'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng Xe',      value: cars.length,                              color: '#E8390E'  },
          { label: 'Còn Trống',    value: cars.filter(c => c.available).length,     color: '#34D399'  },
          { label: 'Đang Cho Thuê',value: cars.filter(c => !c.available).length,    color: '#FBBF24'  },
          { label: 'Kết Quả Lọc', value: filtered.length,                          color: '#60A5FA'  },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 16px', display: 'flex', flexDirection: 'column', minWidth: '100px' }}>
            <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{label}</span>
            <span style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '1.6rem', color, lineHeight: 1, marginTop: '2px' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🚗" title="Không có xe nào" message="Thử thay đổi từ khóa tìm kiếm" />
      ) : (
        <div style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Xe', 'Biển Số', 'Giá/Ngày', 'Địa Điểm', 'Trạng Thái', 'Hành Động'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', fontWeight: '700' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(car => (
                <tr key={car.id || car._id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Xe */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={car.images?.[0] ?? PLACEHOLDER}
                        alt=""
                        style={{ width: '52px', height: '36px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                        onError={e => { e.target.src = PLACEHOLDER }}
                      />
                      <div>
                        <p style={{ fontWeight: '600', color: '#fff', margin: 0, fontSize: '14px' }}>
                          {car.make} {car.model} {car.year}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Biển số */}
                  <td style={{ padding: '14px 16px', color: '#9CA3AF', fontFamily: 'monospace', fontSize: '13px' }}>
                    {car.plate}
                  </td>

                  {/* Giá */}
                  <td style={{ padding: '14px 16px', color: '#E8390E', fontWeight: '700' }}>
                    {formatCurrency(car.pricePerDay)}
                  </td>

                  {/* Địa điểm */}
                  <td style={{ padding: '14px 16px', color: '#9CA3AF' }}>
                    {car.location ?? '—'}
                  </td>

                  {/* Trạng thái */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px',
                      background: car.available ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                      color: car.available ? '#34D399' : '#FBBF24',
                    }}>
                      {car.available ? '✓ Còn Trống' : '⏳ Đang Thuê'}
                    </span>
                  </td>

                  {/* Hành động */}
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleDelete(car.id || car._id, `${car.make} ${car.model}`)}
                      style={{ padding: '6px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#F87171', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; e.currentTarget.style.color = '#F87171' }}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </DashboardLayout>
  )
}