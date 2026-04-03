import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/common/StatusBadge'
import { getAllBookingsForOwner, updateBookingStatusByOwner } from '../../api/bookingsApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { OWNER_NAV } from './OwnerDashboard'

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    getAllBookingsForOwner()
      .then(({ data }) => {
        const pending = (data || []).filter((item) => item.status === 'pending')
        setBookings(pending)
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpdateStatus(bookingId, status) {
    try {
      setUpdatingId(bookingId)
      await updateBookingStatusByOwner(bookingId, status)
      setBookings((prev) => prev.filter((item) => (item.id || item._id) !== bookingId))
      toast.success(status === 'confirmed' ? 'Da xac nhan don dat xe' : 'Da tu choi don dat xe')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Cap nhat trang thai that bai')
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <DashboardLayout navItems={OWNER_NAV}>
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide">DUYỆT ĐƠN ĐẶT XE</h1>
        <p className="text-gray-400 text-sm mt-1">{bookings.length} đơn đang chờ duyệt</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="Khong co don dat xe cho duyet"
          message="Don moi dat vao xe cua ban se hien thi tai day"
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
                      Nguoi dat: {booking.user?.name || 'N/A'} - {booking.user?.email || 'N/A'}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
                  <span>📅 {formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                  <span>💰 {formatCurrency(booking.totalPrice)}</span>
                  <span>🚗 {booking.car?.plate || 'N/A'}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(bookingId, 'confirmed')}
                    disabled={updatingId === bookingId}
                    className="btn-success btn"
                  >
                    Xac Nhan
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(bookingId, 'cancelled')}
                    disabled={updatingId === bookingId}
                    className="btn-danger btn"
                  >
                    Tu Choi
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
