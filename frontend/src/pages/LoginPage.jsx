// ============================================================
// LoginPage.jsx
// Trang đăng nhập.
// ============================================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/constants'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setLoading(true)
    try {
      const user = await login(form)
      toast.success('Đăng nhập thành công! 🎉')

      // Điều hướng về dashboard tương ứng với role
      if (user.role === ROLES.ADMIN) navigate('/admin')
      else if (user.role === ROLES.OWNER) navigate('/owner')
      else navigate('/dashboard')

    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-4xl tracking-widest text-white">
            D2<span className="text-primary">-</span>CAR
          </Link>
          <p className="text-gray-400 text-sm mt-2">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Form card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input"
                autoFocus
              />
            </div>

            <div>
              <label className="label">Mật Khẩu</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn w-full py-3 text-base mt-2"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
