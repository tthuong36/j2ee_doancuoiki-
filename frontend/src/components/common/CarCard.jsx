// ============================================================
// CarCard.jsx
// Card hiển thị thông tin xe trong danh sách.
// Dùng ở HomePage và SearchPage.
// ============================================================

import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'

// Placeholder khi xe không có ảnh
const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80'

/**
 * @param {object} car - Dữ liệu xe từ API
 */
export default function CarCard({ car }) {
  const imageUrl = car.images?.[0] ?? PLACEHOLDER_IMG

  return (
    <Link
      to={`/cars/${car._id}`}
      className="card block overflow-hidden group hover:border-primary/40
                 hover:-translate-y-1 transition-all duration-250"
    >
      {/* ── Ảnh xe ── */}
      <div className="relative h-44 overflow-hidden bg-dark-3">
        <img
          src={imageUrl}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG }}
        />
        {/* Badge trạng thái */}
        {car.available === false && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Đã Cho Thuê
          </span>
        )}
      </div>

      {/* ── Thông tin xe ── */}
      <div className="p-4">
        {/* Tên xe */}
        <h3 className="font-semibold text-white truncate">
          {car.make} {car.model} {car.year}
        </h3>

        {/* Địa điểm */}
        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
          <span>📍</span> {car.location ?? '—'}
        </p>

        {/* Thông số nhanh */}
        <div className="flex gap-3 mt-3 text-xs text-gray-400">
          <span>🚗 {car.make}</span>
          <span>📅 {car.year}</span>
          <span>🔑 {car.plate}</span>
        </div>

        {/* Giá thuê */}
        <div className="mt-3 pt-3 border-t border-white/8 flex items-end justify-between">
          <div>
            <span className="text-primary font-bold text-lg">
              {formatCurrency(car.pricePerDay)}
            </span>
            <span className="text-gray-500 text-xs"> / ngày</span>
          </div>
          <span className="text-xs text-primary font-medium group-hover:underline">
            Xem chi tiết →
          </span>
        </div>
      </div>
    </Link>
  )
}
