import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ReviewSection from '../components/common/ReviewSection'
import { getCarById } from '../api/carsApi'
import { createBooking } from '../api/bookingsApi'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, calcDays } from '../utils/formatters'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80'

export default function CarDetailPage() {
  const { id }              = useParams()
  const navigate            = useNavigate()
  const { isAuthenticated } = useAuth()

  const [car, setCar]             = useState(null)
  const [loading, setLoading]     = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const [booking, setBooking]     = useState(false)

  useEffect(() => {
    getCarById(id)
      .then(({ data }) => setCar(data))
      .catch(() => toast.error('Không tìm thấy xe'))
      .finally(() => setLoading(false))
  }, [id])

  const days  = startDate && endDate ? calcDays(startDate, endDate) : 0
  const total = days > 0 ? days * (car?.pricePerDay ?? 0) : 0

  async function handleBooking() {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt xe')
      navigate('/login')
      return
    }
    if (!startDate || !endDate) { toast.error('Vui lòng chọn ngày nhận và trả xe'); return }
    if (days <= 0) { toast.error('Ngày trả xe phải sau ngày nhận xe'); return }

    setBooking(true)
    try {
      await createBooking({ carId: id, startDate, endDate })
      toast.success('Đặt xe thành công! Chờ xác nhận từ chủ xe 🎉')
      navigate('/dashboard/bookings')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Đặt xe thất bại')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <><Navbar /><LoadingSpinner /></>
  if (!car)    return <><Navbar /><div className="pt-20 text-center text-gray-400 py-20">Không tìm thấy xe</div></>

  const images = car.images?.length ? car.images : [PLACEHOLDER]

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto px-5 pt-24 pb-16">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          ← Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Trái: Ảnh + thông tin ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gallery */}
            <div className="card overflow-hidden">
              <img
                src={images[activeImg] || PLACEHOLDER}
                alt={`${car.make} ${car.model}`}
                className="w-full h-80 object-cover"
                onError={(e) => { e.target.src = PLACEHOLDER }}
              />
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-3 bg-dark-4">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        activeImg === i ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Thông tin xe */}
            <div className="card p-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                {car.make} {car.model} {car.year}
              </h1>
              <p className="text-gray-400 flex items-center gap-1 mb-6">
                📍 {car.location ?? '—'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: '🚗', label: 'Hãng Xe',    value: car.make },
                  { icon: '📅', label: 'Năm SX',     value: car.year },
                  { icon: '🔑', label: 'Biển Số',    value: car.plate },
                  { icon: '✅', label: 'Trạng Thái', value: car.available ? 'Còn trống' : 'Đã cho thuê' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-dark-3 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{icon} {label}</p>
                    <p className="text-white font-semibold text-sm">{value ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════
                PHẦN ĐÁNH GIÁ XE — thêm vào đây
            ══════════════════════════════════ */}
            <ReviewSection carId={car.id || car._id} />

          </div>

          {/* ── Phải: Booking card ── */}
          <div>
            <div className="card p-6 sticky top-20">
              <div className="mb-6">
                <span className="font-display text-4xl text-primary">
                  {formatCurrency(car.pricePerDay)}
                </span>
                <span className="text-gray-400 text-sm"> / ngày</span>
              </div>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="label">📅 Ngày Nhận Xe</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">📅 Ngày Trả Xe</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {days > 0 && (
                <div className="bg-dark-3 rounded-xl p-4 mb-5 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>{formatCurrency(car.pricePerDay)} × {days} ngày</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-2"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span>Tổng Cộng</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={booking || !car.available}
                className="btn-primary btn w-full py-3 text-base"
              >
                {booking ? 'Đang đặt xe...' : car.available ? '🚗 Đặt Xe Ngay' : 'Xe Đã Hết'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Miễn phí hủy trước 2 giờ nhận xe
              </p>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}