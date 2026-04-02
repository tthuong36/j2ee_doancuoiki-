// ============================================================
// AdminDashboard.jsx
// Trang tổng quan admin với thống kê hệ thống.
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { getAllCars } from '../../api/carsApi'
import { getAllBookingsForAdmin } from '../../api/bookingsApi'
import { getPendingPosts } from '../../api/postsApi'

export const ADMIN_NAV = [
  {
    label: 'Quản Lý',
    items: [
      { to: '/admin', icon: '📊', label: 'Tổng Quan' },
      { to: '/admin/cars', icon: '🚗', label: 'Quản Lý Xe' },
      { to: '/admin/users', icon: '👥', label: 'Người Dùng' },
      { to: '/admin/bookings', icon: '🗓️', label: 'Duyệt Đặt Xe' },
      { to: '/admin/posts', icon: '📋', label: 'Duyệt Bài Đăng' },
    ],
  },
  {
    label: 'Tài Khoản',
    items: [
      { to: '/admin/profile', icon: '👤', label: 'Hồ Sơ' },
    ],
  },
]

export default function AdminDashboard() {
  const [cars, setCars] = useState([])
  const [pendingPosts, setPendingPosts] = useState([])
  const [pendingBookings, setPendingBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllCars(), getPendingPosts(), getAllBookingsForAdmin()])
      .then(([carsRes, postsRes, bookingsRes]) => {
        setCars(carsRes.data)
        setPendingPosts(postsRes.data)
        setPendingBookings(bookingsRes.data.filter((item) => item.status === 'pending'))
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout navItems={ADMIN_NAV}>

      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide">ADMIN DASHBOARD</h1>
        <p className="text-gray-400 text-sm mt-1">Tổng quan hệ thống D2-Car</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Tổng Xe', value: cars.length, color: 'text-primary' },
              { label: 'Xe Còn Trống', value: cars.filter((c) => c.available).length, color: 'text-emerald-400' },
              { label: 'Đơn Chờ Duyệt', value: pendingBookings.length, color: 'text-orange-400' },
              { label: 'Bài Chờ Duyệt', value: pendingPosts.length, color: 'text-yellow-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">{label}</p>
                <p className={`font-display text-3xl ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Pending bookings alert */}
          {pendingBookings.length > 0 && (
            <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-between">
              <p className="text-orange-300 text-sm font-semibold">
                ⚠️ Có {pendingBookings.length} đơn đặt xe đang chờ duyệt
              </p>
              <Link to="/admin/bookings" className="btn-warning btn btn-sm">
                Xem Đơn →
              </Link>
            </div>
          )}

          {/* Pending posts alert */}
          {pendingPosts.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between">
              <p className="text-yellow-400 text-sm font-semibold">
                ⚠️ Có {pendingPosts.length} bài đăng đang chờ duyệt
              </p>
              <Link to="/admin/posts" className="btn-warning btn btn-sm">
                Xem Ngay →
              </Link>
            </div>
          )}

          {/* Danh sách xe gần đây */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">Xe Mới Nhất</h2>
              <Link to="/admin/cars" className="text-primary text-sm hover:underline">Xem tất cả →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Xe', 'Biển Số', 'Địa Điểm', 'Giá/Ngày', 'Trạng Thái'].map((h) => (
                      <th key={h} className="text-left pb-3 text-xs uppercase tracking-wide text-gray-400 font-semibold pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cars.slice(0, 8).map((car) => (
                    <tr key={car.id || car._id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-3 pr-4 font-medium text-white">{car.make} {car.model} {car.year}</td>
                      <td className="py-3 pr-4 text-gray-400">{car.plate}</td>
                      <td className="py-3 pr-4 text-gray-400">{car.location ?? '—'}</td>
                      <td className="py-3 pr-4 text-primary font-semibold">
                        {(car.pricePerDay / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${car.available
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-yellow-500/15 text-yellow-400'
                          }`}>
                          {car.available ? 'Còn Trống' : 'Cho Thuê'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
