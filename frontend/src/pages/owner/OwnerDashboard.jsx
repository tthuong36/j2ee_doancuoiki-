// ============================================================
// OwnerDashboard.jsx
// Trang tổng quan của chủ xe.
// ============================================================

import { useState, useEffect } from 'react'
import { Link }           from 'react-router-dom'
import DashboardLayout    from '../../components/layout/DashboardLayout'
import LoadingSpinner     from '../../components/common/LoadingSpinner'
import { getMyCars }      from '../../api/carsApi'
import { formatCurrency } from '../../utils/formatters'

export const OWNER_NAV = [
  {
    label: 'Quản Lý',
    items: [
      { to: '/owner',          icon: '📊', label: 'Tổng Quan'      },
      { to: '/owner/cars',     icon: '🚗', label: 'Xe Của Tôi'     },
      { to: '/owner/cars/add', icon: '➕', label: 'Thêm Xe Mới'    },
    ],
  },
  {
    label: 'Tài Khoản',
    items: [
      { to: '/owner/profile', icon: '👤', label: 'Hồ Sơ'    },
      { to: '/search',        icon: '🔍', label: 'Xem Xe'   },
    ],
  },
]

const PLACEHOLDER = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'

export default function OwnerDashboard() {
  const [cars, setCars]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyCars()
      .then(({ data }) => setCars(data))
      .catch(() => setCars([]))
      .finally(() => setLoading(false))
  }, [])

  const totalRevenue = cars.reduce((sum, car) => sum + (car.pricePerDay ?? 0), 0)
  const availableCars = cars.filter((c) => c.available).length

  return (
    <DashboardLayout navItems={OWNER_NAV}>

      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide">TỔNG QUAN</h1>
        <p className="text-gray-400 text-sm mt-1">Quản lý xe và theo dõi hoạt động cho thuê</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Tổng Số Xe',    value: cars.length,             color: 'text-primary'      },
          { label: 'Xe Còn Trống',  value: availableCars,           color: 'text-emerald-400'  },
          { label: 'Đang Cho Thuê', value: cars.length - availableCars, color: 'text-yellow-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">{label}</p>
            <p className={`font-display text-3xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Danh sách xe */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">Xe Của Tôi</h2>
          <div className="flex gap-3">
            <Link to="/owner/cars/add" className="btn-primary btn btn-sm">+ Thêm Xe</Link>
            <Link to="/owner/cars"     className="btn-outline btn btn-sm">Xem Tất Cả</Link>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : cars.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3 opacity-30">🚗</p>
            <p className="mb-4">Bạn chưa đăng xe nào</p>
            <Link to="/owner/cars/add" className="btn-primary btn btn-sm inline-flex">Thêm Xe Đầu Tiên</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cars.slice(0, 4).map((car) => (
              <div key={car._id} className="flex gap-4 items-center p-4 bg-dark-3 rounded-xl">
                <img
                  src={car.images?.[0] ?? PLACEHOLDER}
                  alt=""
                  className="w-20 h-14 object-cover rounded-lg shrink-0"
                  onError={(e) => { e.target.src = PLACEHOLDER }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{car.make} {car.model}</p>
                  <p className="text-gray-400 text-xs">{car.location}</p>
                  <p className="text-primary font-bold text-sm mt-1">
                    {formatCurrency(car.pricePerDay)}/ngày
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                  car.available
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {car.available ? 'Trống' : 'Đã Thuê'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
