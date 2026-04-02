// ============================================================
// AddCarPage.jsx
// Form thêm xe mới (owner). Upload ảnh qua multipart/form-data.
// ============================================================ 

import { useState }    from 'react'
import { useNavigate } from 'react-router-dom'
import toast           from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { createCar }   from '../../api/carsApi'
import { OWNER_NAV }   from './OwnerDashboard'
import { CAR_BRANDS, CITIES } from '../../utils/constants'

// Giá trị mặc định của form
const INITIAL_FORM = {
  make:         '',
  model:        '',
  year:         new Date().getFullYear(),
  plate:        '',
  pricePerDay:  '',
  location:     '',
  available:    true,
}

export default function AddCarPage() {
  const navigate  = useNavigate()
  const [form, setForm]       = useState(INITIAL_FORM)
  const [images, setImages]   = useState([])   // File[] từ input
  const [previews, setPreviews] = useState([]) // URL preview
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  // Tạo URL preview khi người dùng chọn ảnh
  function handleImages(e) {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Validate cơ bản
    if (!form.make || !form.model || !form.plate || !form.pricePerDay) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    // Build FormData vì cần upload ảnh
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    images.forEach((file) => fd.append('images', file))

    setLoading(true)
    try {
      await createCar(fd)
      toast.success('Thêm xe thành công! 🚗')
      navigate('/owner/cars')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Thêm xe thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout navItems={OWNER_NAV}>

      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-wide">THÊM XE MỚI</h1>
          <p className="text-gray-400 text-sm mt-1">Điền thông tin xe để bắt đầu cho thuê</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Thông tin cơ bản ── */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-white">Thông Tin Xe</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Hãng Xe *</label>
                <select name="make" value={form.make} onChange={handleChange} className="input" required>
                  <option value="">Chọn hãng</option>
                  {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Dòng Xe *</label>
                <input name="model" value={form.model} onChange={handleChange} placeholder="VD: Vios, CX-5, Xpander" className="input" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Năm Sản Xuất *</label>
                <input type="number" name="year" value={form.year} onChange={handleChange} min={2000} max={2026} className="input" required />
              </div>
              <div>
                <label className="label">Biển Số Xe *</label>
                <input name="plate" value={form.plate} onChange={handleChange} placeholder="VD: 51G-123.45" className="input" required />
              </div>
            </div>
          </div>

          {/* ── Giá & địa điểm ── */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-white">Giá & Địa Điểm</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Giá Thuê / Ngày (VNĐ) *</label>
                <input type="number" name="pricePerDay" value={form.pricePerDay} onChange={handleChange} placeholder="800000" min={100000} className="input" required />
              </div>
              <div>
                <label className="label">Địa Điểm</label>
                <select name="location" value={form.location} onChange={handleChange} className="input">
                  <option value="">Chọn thành phố</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Toggle available */}
            <label className="flex items-center gap-3 cursor-pointer p-4 bg-dark-3 rounded-xl">
              <input type="checkbox" name="available" checked={form.available} onChange={handleChange} className="accent-primary w-4 h-4" />
              <div>
                <p className="text-sm font-semibold text-white">Xe sẵn sàng cho thuê ngay</p>
                <p className="text-xs text-gray-400">Bỏ chọn nếu xe chưa sẵn sàng</p>
              </div>
            </label>
          </div>

          {/* ── Upload ảnh ── */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-white">Ảnh Xe</h2>
            <p className="text-gray-400 text-sm">Tải lên tối đa 6 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.</p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              className="input"
            />

            {/* Preview ảnh */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {previews.map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-dark-3">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Ảnh Chính
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary btn px-8 py-3">
              {loading ? 'Đang lưu...' : '🚗 Thêm Xe'}
            </button>
            <button type="button" onClick={() => navigate('/owner/cars')} className="btn-outline btn">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
