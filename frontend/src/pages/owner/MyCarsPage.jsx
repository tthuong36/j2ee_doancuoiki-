// ============================================================
// MyCarsPage.jsx
// Danh sách xe của chủ xe + nút sửa/xóa.
// ============================================================

import { useState, useEffect } from 'react'
import { Link }           from 'react-router-dom'
import toast              from 'react-hot-toast'
import DashboardLayout    from '../../components/layout/DashboardLayout'
import LoadingSpinner     from '../../components/common/LoadingSpinner'
import EmptyState         from '../../components/common/EmptyState'
import { getMyCars, deleteCar, updateCar } from '../../api/carsApi'
import { formatCurrency } from '../../utils/formatters'
import { OWNER_NAV }      from './OwnerDashboard'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'

export default function MyCarsPage() {
  const [cars, setCars]     = useState([])
  const [loading, setLoading] = useState(true)

  function loadCars() {
    getMyCars()
      .then(({ data }) => setCars(data))
      .catch(() => setCars([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadCars() }, [])

  async function handleDelete(id, name) {
    if (!window.confirm(`Bạn có chắc muốn xóa xe "${name}" không?`)) return
    try {
      await deleteCar(id)
      toast.success('Đã xóa xe thành công')
      setCars((prev) => prev.filter((c) => c._id !== id))
    } catch {
      toast.error('Xóa xe thất bại')
    }
  }

  async function toggleAvailable(car) {
    try {
      await updateCar(car._id, { available: !car.available })
      toast.success(`Đã cập nhật trạng thái xe`)
      setCars((prev) =>
        prev.map((c) => (c._id === car._id ? { ...c, available: !c.available } : c))
      )
    } catch {
      toast.error('Cập nhật thất bại')
    }
  }

  return (
    <DashboardLayout navItems={OWNER_NAV}>

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl tracking-wide">XE CỦA TÔI</h1>
          <p className="text-gray-400 text-sm mt-1">{cars.length} xe đang đăng ký</p>
        </div>
        <Link to="/owner/cars/add" className="btn-primary btn">
          + Thêm Xe Mới
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : cars.length === 0 ? (
        <EmptyState
          icon="🚗"
          title="Chưa có xe nào"
          message="Thêm xe đầu tiên để bắt đầu kiếm thu nhập"
          action={<Link to="/owner/cars/add" className="btn-primary btn btn-sm">Thêm Xe Ngay</Link>}
        />
      ) : (
        <div className="space-y-4">
          {cars.map((car) => (
            <div key={car._id} className="card p-5 flex gap-5 items-center">

              {/* Ảnh */}
              <img
                src={car.images?.[0] ?? PLACEHOLDER}
                alt={`${car.make} ${car.model}`}
                className="w-32 h-20 object-cover rounded-xl shrink-0"
                onError={(e) => { e.target.src = PLACEHOLDER }}
              />

              {/* Thông tin */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white">
                  {car.make} {car.model} {car.year}
                </h3>
                <p className="text-gray-400 text-sm mt-0.5">
                  📍 {car.location}  ·  🔑 {car.plate}
                </p>
                <p className="text-primary font-bold mt-1">
                  {formatCurrency(car.pricePerDay)} / ngày
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                {/* Toggle available */}
                <button
                  onClick={() => toggleAvailable(car)}
                  className={`btn btn-sm ${car.available ? 'btn-success' : 'btn-outline'}`}
                >
                  {car.available ? '✅ Còn Trống' : '🔴 Cho Thuê'}
                </button>

                <Link
                  to={`/owner/cars/${car._id}/edit`}
                  className="btn-outline btn btn-sm"
                >
                  ✏️ Sửa
                </Link>

                <button
                  onClick={() => handleDelete(car._id, `${car.make} ${car.model}`)}
                  className="btn-danger btn btn-sm"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
