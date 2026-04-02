// ============================================================
// MyBookingsPage.jsx
// Danh sách tất cả đơn đặt xe của người thuê.
// ============================================================

import { useState, useEffect } from 'react'
import { Link }           from 'react-router-dom'
import DashboardLayout    from '../../components/layout/DashboardLayout'
import LoadingSpinner     from '../../components/common/LoadingSpinner'
import EmptyState         from '../../components/common/EmptyState'
import StatusBadge        from '../../components/common/StatusBadge'
import { getMyBookings }  from '../../api/bookingsApi'
import { formatCurrency, formatDate } from '../../utils/formatters'

const NAV_ITEMS = [
  {
    label: 'Tổng Quan',
    items: [
      { to: '/dashboard',          icon: '📊', label: 'Tổng Quan'     },
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

const PLACEHOLDER = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'

export default function MyBookingsPage() {
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    getMyBookings()
      .then(({ data }) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  const TABS = [
    { key: 'all',       label: 'Tất Cả'       },
    { key: 'pending',   label: 'Chờ Xác Nhận' },
    { key: 'active',    label: 'Đang Thuê'    },
    { key: 'completed', label: 'Hoàn Thành'   },
  ]

  const filtered =
    activeTab === 'all' ? bookings : bookings.filter((b) => b.status === activeTab)

  return (
    <DashboardLayout navItems={NAV_ITEMS}>

      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide">CHUYẾN CỦA TÔI</h1>
        <p className="text-gray-400 text-sm mt-1">Theo dõi tất cả đơn đặt xe của bạn</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-3 rounded-xl mb-6 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === key
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="Không có chuyến nào"
          action={<Link to="/search" className="btn-primary btn btn-sm">Tìm Xe Ngay</Link>}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div key={booking._id} className="card p-5 flex gap-5 items-center">
              {/* Ảnh xe */}
              <img
                src={booking.car?.images?.[0] ?? PLACEHOLDER}
                alt=""
                className="w-24 h-16 object-cover rounded-xl shrink-0"
                onError={(e) => { e.target.src = PLACEHOLDER }}
              />

              {/* Thông tin */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">
                  {booking.car?.make} {booking.car?.model} {booking.car?.year}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  📅 {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                </p>
              </div>

              {/* Giá */}
              <div className="text-right shrink-0">
                <p className="font-bold text-primary">{formatCurrency(booking.totalPrice)}</p>
                <StatusBadge status={booking.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
