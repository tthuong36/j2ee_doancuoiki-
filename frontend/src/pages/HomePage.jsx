// ============================================================
// HomePage.jsx
// Trang chủ: hero section, tìm kiếm nhanh, và danh sách xe nổi bật.
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar          from '../components/layout/Navbar'
import Footer          from '../components/layout/Footer'
import CarCard         from '../components/common/CarCard'
import LoadingSpinner  from '../components/common/LoadingSpinner'
import { getAllCars }  from '../api/carsApi'
import { CITIES }      from '../utils/constants'

export default function HomePage() {
  const navigate = useNavigate()

  const [cars, setCars]       = useState([])
  const [loading, setLoading] = useState(true)
  const [city, setCity]       = useState('')

  // Load 6 xe đầu tiên để hiển thị "xe nổi bật"
  useEffect(() => {
    getAllCars()
      .then(({ data }) => setCars(data.slice(0, 6)))
      .catch(() => setCars([]))
      .finally(() => setLoading(false))
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/search${city ? `?location=${encodeURIComponent(city)}` : ''}`)
  }

  return (
    <>
      <Navbar />

      <main>
        {/* ── HERO ── */}
        <section
          className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 pt-16"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,57,14,0.18) 0%, transparent 70%), #111318',
          }}
        >
          {/* Background overlay hình xe mờ */}
          <div
            className="absolute inset-0 opacity-[0.06] bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=80')" }}
          />

          {/* Tag line */}
          <span className="relative z-10 inline-block mb-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/40 bg-primary/10 text-primary">
            🚗 Nền tảng thuê xe #1 Việt Nam
          </span>

          {/* Tiêu đề lớn */}
          <h1 className="relative z-10 font-display text-6xl md:text-8xl leading-none tracking-wide mb-5">
            TỰ DO TRÊN<br />
            <span className="text-primary">TỪNG CON ĐƯỜNG</span>
          </h1>

          <p className="relative z-10 text-gray-400 text-lg max-w-lg mb-12 leading-relaxed">
            Hàng trăm xe chất lượng, thủ tục đơn giản, giá minh bạch.
            Lái xe đi bất cứ đâu bạn muốn.
          </p>

          {/* ── Search box ── */}
          <form
            onSubmit={handleSearch}
            className="relative z-10 w-full max-w-xl bg-dark-2 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-3"
          >
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input flex-1"
            >
              <option value="">📍 Chọn thành phố</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary btn px-8 whitespace-nowrap">
              🔍 Tìm Xe
            </button>
          </form>

          {/* Stats */}
          <div className="relative z-10 flex gap-12 mt-14">
            {[
              { num: '500+',  label: 'Xe Sẵn Có'        },
              { num: '10K+',  label: 'Chuyến Thành Công' },
              { num: '4.9★',  label: 'Đánh Giá Trung Bình'},
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-4xl text-primary">{num}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Xe nổi bật ── */}
        <section className="max-w-7xl mx-auto px-5 py-20">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-4xl tracking-wide">
              XE <span className="text-primary">NỔI BẬT</span>
            </h2>
            <button
              onClick={() => navigate('/search')}
              className="text-primary text-sm font-semibold hover:underline"
            >
              Xem tất cả →
            </button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cars.map((car) => (
                <CarCard key={car.id || car._id} car={car} />
              ))}
            </div>
          )}
        </section>

        {/* ── 3 bước đặt xe ── */}
        <section className="bg-dark-2 border-y border-white/8 py-20">
          <div className="max-w-7xl mx-auto px-5">
            <h2 className="font-display text-4xl tracking-wide text-center mb-12">
              3 BƯỚC <span className="text-primary">ĐƠN GIẢN</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Chọn Xe & Ngày',    desc: 'Duyệt hàng trăm xe, lọc theo nhu cầu và chọn thời gian phù hợp.' },
                { step: '2', title: 'Đặt & Thanh Toán',  desc: 'Điền thông tin, xác nhận đặt xe và nhận xác nhận ngay lập tức.' },
                { step: '3', title: 'Nhận Xe & Lên Đường', desc: 'Gặp chủ xe, kiểm tra xe, ký hợp đồng và tự do lái đi thôi!' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="card p-7 text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center font-display text-2xl text-primary mx-auto mb-5">
                    {step}
                  </div>
                  <h3 className="font-bold text-white mb-3">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
