// ============================================================
// RegisterPage.jsx
// Trang đăng ký tài khoản mới.
// ============================================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/constants'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm] = useState({
    name:     '',
    email:    '',
    password: '',
    role:     ROLES.USER, // mặc định là người thuê
  })
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    if (form.password.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự')
      return
    }

    setLoading(true)
    try {
      const user = await register(form)
      toast.success('Đăng ký thành công! 🎉')

      if (user.role === ROLES.OWNER) navigate('/owner')
      else navigate('/dashboard')

    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Đăng ký thất bại, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-4xl tracking-widest text-white">
            D2<span className="text-primary">-</span>CAR
          </Link>
          <p className="text-gray-400 text-sm mt-2">Tạo tài khoản mới</p>
        </div>

        {/* Form card */}
        <div className="card p-8">

          {/* Role selector */}
          <div className="flex gap-2 p-1 bg-dark-3 rounded-lg mb-6">
            {[
              { value: ROLES.USER,  label: '🚗 Tôi muốn thuê xe' },
              { value: ROLES.OWNER, label: '🔑 Tôi muốn cho thuê' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: value }))}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  form.role === value
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Họ Và Tên</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="input"
                autoFocus
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input"
              />
            </div>

            <div>
              <label className="label">Mật Khẩu</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn w-full py-3 text-base mt-2"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
