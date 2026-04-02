// ============================================================
// SearchPage.jsx
// Trang tìm kiếm xe: danh sách + bộ lọc bên trái.
// ============================================================

import { useState, useEffect } from 'react'
import { useSearchParams }     from 'react-router-dom'
import Navbar         from '../components/layout/Navbar'
import Footer         from '../components/layout/Footer'
import CarCard        from '../components/common/CarCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState     from '../components/common/EmptyState'
import { getAllCars } from '../api/carsApi'
import { CITIES, CAR_BRANDS } from '../utils/constants'

export default function SearchPage() {
  const [searchParams] = useSearchParams()

  // Tất cả xe từ API
  const [allCars, setAllCars]   = useState([])
  const [loading, setLoading]   = useState(true)

  // Bộ lọc
  const [filters, setFilters] = useState({
    location:  searchParams.get('location') || '',
    brand:     '',
    maxPrice:  5000000,
    available: false,
  })

  // Load dữ liệu xe
  useEffect(() => {
    getAllCars()
      .then(({ data }) => setAllCars(data))
      .catch(() => setAllCars([]))
      .finally(() => setLoading(false))
  }, [])

  function handleFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  // Lọc xe theo filter hiện tại
  const filtered = allCars.filter((car) => {
    if (filters.location && !car.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.brand    && car.make !== filters.brand) return false
    if (car.pricePerDay  > filters.maxPrice) return false
    if (filters.available && !car.available) return false
    return true
  })

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-5 pt-24 pb-16">
        <h1 className="font-display text-4xl tracking-wide mb-8">
          TÌM <span className="text-primary">XE THUÊ</span>
        </h1>

        <div className="flex gap-6 items-start">

          {/* ── Bộ lọc (sidebar) ── */}
          <aside className="hidden lg:block w-64 shrink-0 card p-5 sticky top-20">
            <h2 className="font-bold text-white mb-5">Bộ Lọc</h2>

            {/* Lọc thành phố */}
            <div className="mb-5">
              <label className="label">Thành Phố</label>
              <select
                value={filters.location}
                onChange={(e) => handleFilter('location', e.target.value)}
                className="input"
              >
                <option value="">Tất cả</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Lọc hãng xe */}
            <div className="mb-5">
              <label className="label">Hãng Xe</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilter('brand', e.target.value)}
                className="input"
              >
                <option value="">Tất cả hãng</option>
                {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Lọc giá */}
            <div className="mb-5">
              <label className="label">
                Giá tối đa: {(filters.maxPrice / 1000).toFixed(0)}K / ngày
              </label>
              <input
                type="range"
                min={300000}
                max={5000000}
                step={100000}
                value={filters.maxPrice}
                onChange={(e) => handleFilter('maxPrice', Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>300K</span>
                <span>5,000K</span>
              </div>
            </div>

            {/* Chỉ hiện xe còn trống */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.available}
                onChange={(e) => handleFilter('available', e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-gray-300">Chỉ xe còn trống</span>
            </label>

            {/* Reset filter */}
            <button
              onClick={() => setFilters({ location: '', brand: '', maxPrice: 5000000, available: false })}
              className="btn-ghost btn w-full mt-5 text-xs"
            >
              Đặt Lại Bộ Lọc
            </button>
          </aside>

          {/* ── Danh sách xe ── */}
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-sm mb-5">
              Tìm thấy <span className="text-white font-semibold">{filtered.length}</span> xe
            </p>

            {loading ? (
              <LoadingSpinner />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="🚗"
                title="Không tìm thấy xe phù hợp"
                message="Thử thay đổi bộ lọc hoặc tìm kiếm ở thành phố khác"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((car) => (
                  <CarCard key={car._id} car={car} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
