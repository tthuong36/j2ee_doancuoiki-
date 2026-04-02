// ============================================================
// EditCarPage.jsx
// Form sửa thông tin xe. Tải dữ liệu xe cũ rồi cho phép cập nhật.
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast             from 'react-hot-toast'
import DashboardLayout   from '../../components/layout/DashboardLayout'
import LoadingSpinner    from '../../components/common/LoadingSpinner'
import { getCarById, updateCarWithImages } from '../../api/carsApi'
import { OWNER_NAV }     from './OwnerDashboard'
import { CAR_BRANDS, CITIES } from '../../utils/constants'

export default function EditCarPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [form, setForm]       = useState(null)
  const [images, setImages]   = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  // Load dữ liệu xe hiện tại
  useEffect(() => {
    getCarById(id)
      .then(({ data }) => {
        setForm({
          make:        data.make        ?? '',
          model:       data.model       ?? '',
          year:        data.year        ?? 2022,
          plate:       data.plate       ?? '',
          pricePerDay: data.pricePerDay ?? '',
          location:    data.location    ?? '',
          available:   data.available   ?? true,
        })
        setPreviews(data.images ?? [])
      })
      .catch(() => toast.error('Không tìm thấy xe'))
      .finally(() => setLoading(false))
  }, [id])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleImages(e) {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    images.forEach((file) => fd.append('images', file))

    setSaving(true)
    try {
      await updateCarWithImages(id, fd)
      toast.success('Cập nhật xe thành công!')
      navigate('/owner/cars')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardLayout navItems={OWNER_NAV}><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout navItems={OWNER_NAV}>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-wide">SỬA THÔNG TIN XE</h1>
          <p className="text-gray-400 text-sm mt-1">Cập nhật thông tin xe của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-white">Thông Tin Xe</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Hãng Xe</label>
                <select name="make" value={form.make} onChange={handleChange} className="input">
                  <option value="">Chọn hãng</option>
                  {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Dòng Xe</label>
                <input name="model" value={form.model} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Năm SX</label>
                <input type="number" name="year" value={form.year} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Biển Số</label>
                <input name="plate" value={form.plate} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Giá / Ngày (VNĐ)</label>
                <input type="number" name="pricePerDay" value={form.pricePerDay} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Địa Điểm</label>
                <select name="location" value={form.location} onChange={handleChange} className="input">
                  <option value="">Chọn thành phố</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="available" checked={form.available} onChange={handleChange} className="accent-primary w-4 h-4" />
              <span className="text-sm text-white">Xe sẵn sàng cho thuê</span>
            </label>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-white">Ảnh Xe</h2>
            <input type="file" accept="image/*" multiple onChange={handleImages} className="input" />
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {previews.map((url, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-dark-3">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary btn px-8 py-3">
              {saving ? 'Đang lưu...' : '💾 Lưu Thay Đổi'}
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
