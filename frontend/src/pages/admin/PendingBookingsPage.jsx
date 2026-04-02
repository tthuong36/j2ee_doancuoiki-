import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/common/StatusBadge'
import { ADMIN_BOOKING_STATUS_SUPPORTED, getAllBookingsForAdmin, updateBookingStatus } from '../../api/bookingsApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { ADMIN_NAV } from './AdminDashboard'

export default function PendingBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    getAllBookingsForAdmin()
      .then(({ data }) => {
        const pending = data.filter((item) => item.status === 'pending')
        setBookings(pending)
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpdateStatus(bookingId, status) {
    try {
      setUpdatingId(bookingId)
      await updateBookingStatus(bookingId, status)
      setBookings((prev) => prev.filter((item) => (item.id || item._id) !== bookingId))
      toast.success(status === 'confirmed' ? 'Đã xác nhận đơn đặt xe' : 'Đã từ chối đơn đặt xe')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Cập nhật trạng thái thất bại')
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <DashboardLayout navItems={ADMIN_NAV}>
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide">DUYỆT ĐƠN ĐẶT XE</h1>
        <p className="text-gray-400 text-sm mt-1">{bookings.length} đơn đang chờ duyệt</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="Không có đơn đặt xe chờ duyệt"
          message="Đơn mới từ người dùng sẽ xuất hiện tại đây"
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const bookingId = booking.id || booking._id
            return (
            <div key={bookingId} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-white">
                    {booking.car?.make} {booking.car?.model} {booking.car?.year}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Người đặt: {booking.user?.name || 'N/A'} - {booking.user?.email || 'N/A'}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
                <span>📅 {formatDate(booking.startDate)} → {formatDate(booking.endDate)}</span>
                <span>💰 {formatCurrency(booking.totalPrice)}</span>
                <span>🚗 {booking.car?.plate || 'N/A'}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateStatus(bookingId, 'confirmed')}
                  disabled={!ADMIN_BOOKING_STATUS_SUPPORTED || updatingId === bookingId}
                  className="btn-success btn"
                >
                  Xác Nhận
                </button>
                <button
                  onClick={() => handleUpdateStatus(bookingId, 'cancelled')}
                  disabled={!ADMIN_BOOKING_STATUS_SUPPORTED || updatingId === bookingId}
                  className="btn-danger btn"
                >
                  Từ Chối
                </button>
              </div>
              {!ADMIN_BOOKING_STATUS_SUPPORTED && (
                <p className="text-xs text-yellow-400 mt-3">
                  API duyệt booking cho admin chưa được backend Spring cung cấp.
                </p>
              )}
            </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
